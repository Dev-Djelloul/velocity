// Heuristique locale : transforme une phrase en config de mini-tableau (colonnes + lignes de départ).
function normalize(str) {
  return (str || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

const TEMPLATES = [
  {
    match: /influenceur|influencer|kol|creator/,
    columns: ['Nom', 'Plateforme', 'Followers', 'Statut', 'Contact'],
    rows: [
      ['', 'Instagram', '', 'À contacter', ''],
      ['', 'TikTok', '', 'À contacter', ''],
      ['', 'YouTube', '', 'À contacter', '']
    ]
  },
  {
    match: /concurrent|competitor/,
    columns: ['Nom', 'Positionnement', 'Prix', 'Forces', 'Faiblesses'],
    rows: [['', '', '', '', ''], ['', '', '', '', '']]
  },
  {
    match: /contact|lead|prospect/,
    columns: ['Nom', 'Entreprise', 'Email', 'Statut', 'Prochaine action'],
    rows: [['', '', '', 'Nouveau', ''], ['', '', '', 'Nouveau', '']]
  },
  {
    match: /tache|task|todo|action/,
    columns: ['Tâche', 'Responsable', 'Échéance', 'Statut'],
    rows: [['', '', '', 'À faire'], ['', '', '', 'À faire'], ['', '', '', 'À faire']]
  },
  {
    match: /partenaire|partnership/,
    columns: ['Nom', 'Type', 'Contact', 'Statut'],
    rows: [['', '', '', 'À contacter'], ['', '', '', 'À contacter']]
  }
]

export function generateTableFromPrompt(prompt) {
  const q = normalize(prompt)
  const template = TEMPLATES.find(tpl => tpl.match.test(q))
  if (template) {
    return { title: prompt, columns: template.columns, rows: template.rows.map(r => [...r]) }
  }
  return {
    title: prompt,
    columns: ['Nom', 'Statut', 'Notes'],
    rows: [['', '', ''], ['', '', ''], ['', '', '']]
  }
}
