// Calendrier éditorial à règles (fallback sans IA) : dérive un planning de contenus
// des canaux marketing du plan, réparti sur 4 semaines, localisé FR / EN.

const FORMAT_BY_CHANNEL = {
  TikTok: { fr: 'Vidéo courte', en: 'Short video' },
  YouTube: { fr: 'Tutoriel vidéo', en: 'Video tutorial' },
  LinkedIn: { fr: 'Post expert', en: 'Expert post' },
  Content: { fr: 'Article de blog', en: 'Blog article' },
  Paid: { fr: 'Créa publicitaire', en: 'Ad creative' },
  Community: { fr: 'Post communauté', en: 'Community post' },
  Partnerships: { fr: 'Co-publication', en: 'Co-published piece' },
  Social: { fr: 'Post social', en: 'Social post' }
}

export function generateEditorialFallback(plan, lang = 'fr') {
  const en = lang === 'en'
  const name = plan?.product?.name || (en ? 'the product' : 'le produit')
  const usp = plan?.product?.usp || (en ? 'your key benefit' : 'votre bénéfice clé')
  const channels = (plan?.marketing?.channels || []).map(c => c.name)
  const list = channels.length ? channels : ['Content', 'Social', 'LinkedIn']

  const themes = en
    ? [
        { title: `Introducing ${name}`, angle: 'Announce the product and the problem it solves', cta: 'Join the waitlist' },
        { title: `Why ${usp} matters`, angle: 'Educate on the core pain point', cta: 'Read the guide' },
        { title: 'Behind the scenes of the build', angle: 'Build-in-public transparency', cta: 'Follow the journey' },
        { title: 'Customer use case', angle: 'Show a concrete before/after', cta: 'Try it free' }
      ]
    : [
        { title: `${name} : ce que c'est`, angle: 'Annoncer le produit et le problème résolu', cta: "S'inscrire à la liste d'attente" },
        { title: `Pourquoi ${usp} change la donne`, angle: 'Éduquer sur le pain point principal', cta: 'Lire le guide' },
        { title: 'Les coulisses de la construction', angle: 'Transparence build-in-public', cta: 'Suivre le projet' },
        { title: "Cas d'usage client", angle: 'Montrer un avant/après concret', cta: 'Essayer gratuitement' }
      ]

  const items = []
  for (let week = 1; week <= 4; week++) {
    const channel = list[(week - 1) % list.length]
    const theme = themes[(week - 1) % themes.length]
    const fmt = (FORMAT_BY_CHANNEL[channel] || { fr: 'Publication', en: 'Post' })[en ? 'en' : 'fr']
    items.push({ week, channel, format: fmt, title: theme.title, angle: theme.angle, cta: theme.cta })

    // Un second contenu par semaine sur un autre canal, si disponible
    if (list.length > 1) {
      const channel2 = list[week % list.length]
      const theme2 = themes[week % themes.length]
      const fmt2 = (FORMAT_BY_CHANNEL[channel2] || { fr: 'Publication', en: 'Post' })[en ? 'en' : 'fr']
      items.push({ week, channel: channel2, format: fmt2, title: theme2.title, angle: theme2.angle, cta: theme2.cta })
    }
  }

  return { items }
}
