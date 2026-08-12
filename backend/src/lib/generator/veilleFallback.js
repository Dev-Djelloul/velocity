// Veille à règles (fallback sans IA) : produit une veille 360° plausible à partir
// du contexte produit / marché, localisée FR / EN.

export function generateVeilleFallback(plan, lang = 'fr') {
  const p = plan?.product || {}
  const m = plan?.market || {}
  const name = p.name || (lang === 'en' ? 'your product' : 'votre produit')
  const segment = m.segment || (lang === 'en' ? 'your segment' : 'votre segment')
  const en = lang === 'en'

  if (en) {
    return {
      competitors: [
        { name: `Established ${segment} leaders`, positioning: 'Broad, recognized incumbents with strong distribution', watch: 'Pricing changes, new feature launches, positioning shifts' },
        { name: 'Fast-growing challengers', positioning: 'Newer, well-funded players moving quickly', watch: 'Funding rounds, hiring surges, aggressive marketing' },
        { name: 'Adjacent / horizontal tools', positioning: 'Generalist products expanding into your niche', watch: 'Roadmap announcements that overlap your USP' }
      ],
      trends: [
        `Increasing demand for focused solutions in ${segment}`,
        'AI-assisted workflows becoming a baseline expectation',
        'Buyers favoring fast time-to-value and transparent pricing'
      ],
      signals: [
        'A competitor raising a new funding round',
        'A major platform shipping a native feature that overlaps yours',
        'A regulatory or compliance change affecting your market',
        'A sudden spike in search interest around your problem space'
      ],
      opportunities: [
        `Own a sharp positioning around ${p.usp || 'your differentiation'}`,
        'Capture users underserved by heavier incumbents',
        'Build in public to earn early trust and feedback'
      ],
      threats: [
        'Incumbents bundling a "good enough" version of your feature',
        'Rising acquisition costs on saturated channels'
      ],
      sources: [
        `Google Alerts on "${name}" and key competitors`,
        'Product Hunt & Hacker News for your category',
        'Competitor changelogs and pricing pages',
        `Reddit / niche communities around ${segment}`,
        'Industry newsletters and analyst briefs'
      ]
    }
  }

  return {
    competitors: [
      { name: `Leaders établis du ${segment}`, positioning: 'Acteurs reconnus, forte distribution', watch: 'Changements de prix, lancements de fonctionnalités, repositionnements' },
      { name: 'Challengers en forte croissance', positioning: 'Nouveaux entrants bien financés et rapides', watch: 'Levées de fonds, vagues de recrutement, marketing agressif' },
      { name: 'Outils adjacents / horizontaux', positioning: 'Produits généralistes qui empiètent sur votre niche', watch: 'Annonces de roadmap recoupant votre USP' }
    ],
    trends: [
      `Demande croissante de solutions focalisées sur le ${segment}`,
      "Les workflows assistés par IA deviennent un standard attendu",
      "Les acheteurs privilégient un time-to-value rapide et des prix transparents"
    ],
    signals: [
      "Un concurrent qui annonce une levée de fonds",
      "Une grande plateforme qui sort une fonctionnalité native recoupant la vôtre",
      "Un changement réglementaire ou de conformité touchant votre marché",
      "Un pic soudain d'intérêt de recherche autour de votre problème"
    ],
    opportunities: [
      `Imposer un positionnement net autour de ${p.usp || 'votre différenciation'}`,
      'Capter les utilisateurs mal servis par les acteurs plus lourds',
      "Construire en public pour gagner confiance et retours tôt"
    ],
    threats: [
      'Un acteur établi qui intègre une version « suffisante » de votre fonctionnalité',
      "Hausse des coûts d'acquisition sur des canaux saturés"
    ],
    sources: [
      `Google Alerts sur « ${name} » et les concurrents clés`,
      'Product Hunt & Hacker News pour votre catégorie',
      'Changelogs et pages de prix des concurrents',
      `Reddit / communautés de niche autour du ${segment}`,
      'Newsletters sectorielles et notes d\'analystes'
    ]
  }
}
