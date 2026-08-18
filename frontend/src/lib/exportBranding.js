// Marque personnalisée sur les exports PDF/PPTX (Pro) — même pattern que personalSpace.js :
// purement local (localStorage), pas de table serveur dédiée. Contrairement à un "vrai"
// marque blanche qui supprimerait toute trace de VelocityLaunch, ici le logo de
// l'utilisateur vient s'ajouter en évidence (couverture/clôture du pitch deck, en-tête du
// PDF) tandis que le petit crédit "Généré avec VelocityLaunch" reste affiché partout —
// décision produit explicite, pas un oubli.
function key(userId) {
  return `plp_export_branding_${userId}`
}

export function getExportBranding(userId) {
  if (!userId) return { enabled: false, logo: null }
  try {
    const raw = localStorage.getItem(key(userId))
    if (raw) return JSON.parse(raw)
  } catch { /* clé corrompue, on retombe sur le défaut */ }
  return { enabled: false, logo: null }
}

export function saveExportBranding(userId, { enabled, logo }) {
  if (!userId) return
  localStorage.setItem(key(userId), JSON.stringify({ enabled, logo }))
}
