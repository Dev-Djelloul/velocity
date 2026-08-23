import { t } from './i18n'

// Choisit un sous-ensemble stable mais différent d'un plan à l'autre dans le pool de
// ressources RGPD (voir i18n.js, rgpd.resources) — sans ça, la section affiche
// systématiquement les 4 mêmes liens en tête de liste, plan après plan (retour
// utilisateur). Seedé par l'id du plan : stable pour CE plan (pas de re-tirage à chaque
// re-rendu), mais différent d'un plan à l'autre.
//
// Extrait de RgpdCard.jsx pour être réutilisé par les exports (CSV/PDF/Notion) : ces
// ressources ne sont PAS persistées dans plan.rgpd (calculées à l'affichage), donc sans ce
// partage les exports ne pouvaient tout simplement pas savoir lesquelles afficher.
function pickResources(pool, seed, count = 5) {
  const arr = [...pool]
  let h = 0
  const s = String(seed || '')
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  for (let i = arr.length - 1; i > 0; i--) {
    h = (h * 1103515245 + 12345) >>> 0
    const j = h % (i + 1)
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr.slice(0, count)
}

export function pickRgpdResources(lang, seed, count = 5) {
  return pickResources(t(lang, 'rgpd.resources'), seed, count)
}
