import { ImageResponse } from 'workers-og'

// Récupère un fichier de police (TTF/WOFF) directement depuis l'API CSS2 de Google Fonts —
// satori (moteur derrière workers-og) a besoin des octets bruts de la police, pas d'une
// URL @font-face, et ne connaît aucune police système puisqu'il tourne dans un Worker sans
// aucun accès disque. `text` restreint le sous-ensemble de glyphes chargés au strict
// nécessaire (accents français inclus) pour garder la requête légère.
async function loadGoogleFont(family, weight, text) {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&text=${encodeURIComponent(text)}`
  const cssRes = await fetch(cssUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' } })
  const css = await cssRes.text()
  const match = css.match(/src: url\(([^)]+)\) format\('(?:truetype|woff2?)'\)/)
  if (!match) throw new Error('font url not found')
  const fontRes = await fetch(match[1])
  return fontRes.arrayBuffer()
}

// Image de partage (LinkedIn/Twitter/Facebook) pour un plan — 1200x630 (ratio og:image
// standard). Générée à la volée (jamais stockée) : coût d'un aller-retour Google Fonts +
// rendu satori par requête, largement acceptable pour un lien partagé occasionnellement
// (pas un chemin chaud), et évite d'avoir à invalider un cache si le titre du plan change.
export async function generatePlanOgImage(plan) {
  const title = plan.product?.name || 'Plan de lancement'
  const classification = plan.classification || ''
  const pitch = (plan.product?.pitch || '').slice(0, 160)
  const text = `${title}${classification}${pitch}elocityLaunchGénéré avec`

  const [regular, bold] = await Promise.all([
    loadGoogleFont('Inter', 400, text),
    loadGoogleFont('Inter', 700, text)
  ])

  const html = `
    <div style="display:flex;flex-direction:column;justify-content:space-between;width:1200px;height:630px;padding:64px;background:linear-gradient(135deg, #141922 0%, #1a1f2e 60%, #1e2530 100%);font-family:'Inter';">
      <div style="display:flex;align-items:center;">
        <div style="display:flex;width:44px;height:44px;border-radius:10px;background:linear-gradient(135deg,#9184d9,#6366f1,#06b6d4);margin-right:16px;"></div>
        <div style="display:flex;font-size:26px;font-weight:700;">
          <span style="color:#ffffff;">elocity</span><span style="color:#9184d9;">Launch</span>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;">
        ${classification ? `<div style="display:flex;font-size:24px;font-weight:700;color:#9184d9;margin-bottom:16px;">${escapeHtml(classification)}</div>` : ''}
        <div style="display:flex;font-size:56px;font-weight:700;color:#ffffff;line-height:1.15;margin-bottom:20px;">${escapeHtml(title)}</div>
        ${pitch ? `<div style="display:flex;font-size:26px;color:#c2c3c9;line-height:1.4;">${escapeHtml(pitch)}</div>` : ''}
      </div>
      <div style="display:flex;font-size:20px;color:#8b8d97;">Généré avec VelocityLaunch</div>
    </div>`

  return new ImageResponse(html, {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Inter', data: regular, weight: 400, style: 'normal' },
      { name: 'Inter', data: bold, weight: 700, style: 'normal' }
    ]
  })
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
