// Extraction de texte depuis un document importé (PDF/DOCX/XLSX/PPTX), 100% côté client —
// jamais envoyé au backend en binaire : seul le texte extrait part vers le Worker, comme le
// champ `context` déjà existant. Voir NEXT_FEATURES.md / décision d'architecture : le backend
// est un Cloudflare Worker (runtime edge), les libs de parsing (mammoth/xlsx/pdfjs-dist)
// reposent sur des API Node incompatibles avec Workers.
//
// Chaque extracteur charge sa lib en import() dynamique, uniquement à l'usage : le bundle
// principal est déjà volumineux (~950KB), pas de raison de l'alourdir pour tout le monde alors
// que cette fonctionnalité ne concerne qu'une fraction des utilisateurs du questionnaire.

export const MAX_FILE_BYTES = 10 * 1024 * 1024 // 10 Mo
export const MAX_TEXT_CHARS = 18000 // ~contexte IA raisonnable, voir buildUserPrompt côté backend

// En dessous de ce nombre de caractères, une page PDF est considérée "sans texte exploitable"
// et bascule sur l'OCR (voir extractPdf) — 0 strict raterait les pages scannées contenant
// malgré tout un numéro de page ou un en-tête sélectionnable (texte natif résiduel), qui ne
// suffit pas à couvrir le contenu réel de la page.
const OCR_FALLBACK_THRESHOLD = 20

const TRUNCATION_NOTE = '\n\n[texte tronqué — document plus long que la limite prise en compte]'

const EXTENSION_TYPES = {
  pdf: 'pdf',
  docx: 'docx',
  xlsx: 'xlsx',
  xlsm: 'xlsx',
  pptx: 'pptx',
  jpg: 'image',
  jpeg: 'image',
  png: 'image',
  webp: 'image'
}

const MIME_TYPES = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.ms-excel.sheet.macroEnabled.12': 'xlsx',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/webp': 'image'
}

// 'fr' / 'en' (langue de l'app, voir lib/i18n.js) -> code de données d'entraînement
// Tesseract. Les deux packs sont chargés ensemble (langue de l'app + anglais) : un business
// plan scanné mélange souvent du texte anglais (jargon produit) même dans une app en
// français, et l'inverse est également vrai.
function tesseractLangs(lang) {
  return lang === 'fr' ? 'fra+eng' : 'eng+fra'
}

// OCR d'une image (Blob/canvas) via Tesseract.js — chargé en import() dynamique comme les
// autres extracteurs (voir en-tête de fichier), le worker + les données d'entraînement
// (quelques Mo par langue) ne sont téléchargés qu'à l'usage réel de l'OCR, jamais pour un
// import de PDF/DOCX/XLSX/PPTX classique déjà pourvu de texte natif.
async function runOcr(image, lang, onProgress) {
  const { createWorker } = await import('tesseract.js')
  const worker = await createWorker(tesseractLangs(lang), 1, {
    logger: onProgress ? (m) => onProgress(m) : undefined
  })
  try {
    const { data } = await worker.recognize(image)
    return data.text || ''
  } finally {
    await worker.terminate()
  }
}

export function detectFileType(file) {
  const ext = file.name.split('.').pop()?.toLowerCase()
  return MIME_TYPES[file.type] || EXTENSION_TYPES[ext] || null
}

function truncate(text) {
  const trimmed = text.trim()
  if (trimmed.length <= MAX_TEXT_CHARS) return { text: trimmed, truncated: false }
  return { text: trimmed.slice(0, MAX_TEXT_CHARS) + TRUNCATION_NOTE, truncated: true }
}

// Rendu d'une page PDF en image (canvas -> Blob PNG) pour l'OCR — un scan de business plan
// est presque toujours une page entière sans aucune couche de texte, jamais un mélange
// texte/image sur la même page à séparer plus finement.
async function renderPageToBlob(page) {
  // scale 2 : au-delà de la résolution d'affichage, Tesseract lit nettement mieux un texte
  // scanné à 150-200dpi effectifs qu'au rendu 1x (~72dpi) pensé pour l'écran.
  const viewport = page.getViewport({ scale: 2 })
  const canvas = document.createElement('canvas')
  canvas.width = viewport.width
  canvas.height = viewport.height
  const ctx = canvas.getContext('2d')
  await page.render({ canvasContext: ctx, viewport }).promise
  return new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
}

// lang ('fr'/'en', voir tesseractLangs) et onProgress sont ignorés tant qu'aucune page n'a
// besoin d'OCR (documents PDF "normaux", texte déjà sélectionnable) — le coût de l'OCR
// (téléchargement du worker + données d'entraînement, plusieurs secondes par page) ne
// s'applique qu'aux pages réellement scannées.
async function extractPdf(file, lang, onProgress) {
  const pdfjsLib = await import('pdfjs-dist')
  const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

  const buffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise

  const pageTexts = []
  let ocrPageCount = 0
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items.map(item => item.str).join(' ').trim()

    if (pageText.length >= OCR_FALLBACK_THRESHOLD) {
      pageTexts.push(pageText)
      continue
    }

    // Page sans texte natif exploitable — probablement une page scannée : bascule sur l'OCR.
    onProgress?.({ status: 'ocr-page', page: i, total: pdf.numPages })
    const blob = await renderPageToBlob(page)
    const ocrText = (await runOcr(blob, lang)).trim()
    if (ocrText) { pageTexts.push(ocrText); ocrPageCount++ }
  }

  return { text: pageTexts.join('\n\n'), pageOrSlideCount: pdf.numPages, ocrPageCount }
}

// Photo/scan d'une seule page (JPG/PNG/WebP) — entièrement OCR, pas de couche de texte à
// tenter d'extraire au préalable contrairement à un PDF.
async function extractImage(file, lang, onProgress) {
  onProgress?.({ status: 'ocr-page', page: 1, total: 1 })
  const text = (await runOcr(file, lang)).trim()
  return { text, pageOrSlideCount: 1, ocrPageCount: text ? 1 : 0 }
}

async function extractDocx(file) {
  const mammoth = await import('mammoth')
  const buffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer: buffer })
  return { text: result.value, pageOrSlideCount: null }
}

async function extractXlsx(file) {
  const XLSX = await import('xlsx')
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })

  const sheetTexts = workbook.SheetNames.map(name => {
    const csv = XLSX.utils.sheet_to_csv(workbook.Sheets[name])
    return csv.trim() ? `## ${name}\n${csv.trim()}` : null
  }).filter(Boolean)

  return { text: sheetTexts.join('\n\n'), pageOrSlideCount: workbook.SheetNames.length }
}

async function extractPptx(file) {
  const JSZip = (await import('jszip')).default
  const buffer = await file.arrayBuffer()
  const zip = await JSZip.loadAsync(buffer)

  const slideFiles = Object.keys(zip.files)
    .filter(name => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((a, b) => {
      const numA = parseInt(a.match(/slide(\d+)\.xml/)[1], 10)
      const numB = parseInt(b.match(/slide(\d+)\.xml/)[1], 10)
      return numA - numB
    })

  const parser = new DOMParser()
  const slideTexts = []
  for (const [i, name] of slideFiles.entries()) {
    const xml = await zip.files[name].async('text')
    const doc = parser.parseFromString(xml, 'application/xml')
    const textNodes = [...doc.getElementsByTagName('a:t')]
    const slideText = textNodes.map(n => n.textContent).join(' ').trim()
    if (slideText) slideTexts.push(`## Slide ${i + 1}\n${slideText}`)
  }

  return { text: slideTexts.join('\n\n'), pageOrSlideCount: slideFiles.length }
}

const EXTRACTORS = {
  pdf: extractPdf,
  docx: extractDocx,
  xlsx: extractXlsx,
  pptx: extractPptx,
  image: extractImage
}

// lang : langue de l'app ('fr'/'en'), utilisée pour l'OCR uniquement (voir tesseractLangs) —
// sans effet sur les documents avec texte natif. onProgress(status) : voir runOcr/extractPdf,
// permet à l'appelant d'afficher "Page 2/5 en cours d'analyse (OCR)…" plutôt qu'un simple
// spinner indéterminé pendant les quelques secondes que prend chaque page scannée.
// Retourne { text, truncated, pageOrSlideCount, ocrPageCount } ou lève une Error avec un
// message destiné à être affiché tel quel (clé i18n résolue par l'appelant selon error.code).
export async function extractText(file, lang = 'fr', onProgress) {
  if (file.size > MAX_FILE_BYTES) {
    const err = new Error('file too large')
    err.code = 'file-too-large'
    throw err
  }

  const type = detectFileType(file)
  if (!type || !EXTRACTORS[type]) {
    const err = new Error('unsupported format')
    err.code = 'unsupported-format'
    throw err
  }

  let raw
  try {
    raw = await EXTRACTORS[type](file, lang, onProgress)
  } catch (e) {
    const err = new Error('extraction failed')
    err.code = 'extraction-failed'
    throw err
  }

  if (!raw.text || !raw.text.trim()) {
    const err = new Error('empty text')
    err.code = type === 'pdf' || type === 'image' ? 'empty-text-scanned' : 'empty-text'
    throw err
  }

  const { text, truncated } = truncate(raw.text)
  return { text, truncated, pageOrSlideCount: raw.pageOrSlideCount, ocrPageCount: raw.ocrPageCount || 0 }
}
