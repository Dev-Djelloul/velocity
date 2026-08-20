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

const TRUNCATION_NOTE = '\n\n[texte tronqué — document plus long que la limite prise en compte]'

const EXTENSION_TYPES = {
  pdf: 'pdf',
  docx: 'docx',
  xlsx: 'xlsx',
  xlsm: 'xlsx',
  pptx: 'pptx'
}

const MIME_TYPES = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.ms-excel.sheet.macroEnabled.12': 'xlsx',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx'
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

async function extractPdf(file) {
  const pdfjsLib = await import('pdfjs-dist')
  const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

  const buffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise

  const pageTexts = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items.map(item => item.str).join(' ')
    if (pageText.trim()) pageTexts.push(pageText.trim())
  }

  return { text: pageTexts.join('\n\n'), pageOrSlideCount: pdf.numPages }
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
  pptx: extractPptx
}

// Retourne { text, truncated, pageOrSlideCount } ou lève une Error avec un message destiné à
// être affiché tel quel (clé i18n résolue par l'appelant selon error.code).
export async function extractText(file) {
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
    raw = await EXTRACTORS[type](file)
  } catch (e) {
    const err = new Error('extraction failed')
    err.code = 'extraction-failed'
    throw err
  }

  if (!raw.text || !raw.text.trim()) {
    const err = new Error('empty text')
    err.code = 'empty-text'
    throw err
  }

  const { text, truncated } = truncate(raw.text)
  return { text, truncated, pageOrSlideCount: raw.pageOrSlideCount }
}
