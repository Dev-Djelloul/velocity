// Fait correspondre un nom de canal (texte libre généré par l'IA, ex: "LinkedIn Ads",
// "Google Ads", "Content/Blog") à un vrai lien officiel connu — jamais un lien inventé par
// l'IA (risque d'hallucination sur un domaine précis), toujours une correspondance vers un
// domaine réel et stable maintenue ici. Correspondance par mot-clé, insensible à la casse ;
// à défaut de correspondance, on retombe sur une recherche Google du nom du canal — un lien
// qui fonctionne toujours, même pour un canal inattendu.
const KNOWN_CHANNELS = [
  { test: /linkedin/i, url: 'https://www.linkedin.com/business/marketing' },
  { test: /google\s*ads|sea\b|search\s*ads/i, url: 'https://ads.google.com' },
  { test: /seo\b/i, url: 'https://developers.google.com/search' },
  { test: /meta|facebook/i, url: 'https://www.facebook.com/business' },
  { test: /instagram/i, url: 'https://business.instagram.com' },
  { test: /tiktok/i, url: 'https://ads.tiktok.com' },
  { test: /twitter|\bx\s*ads\b/i, url: 'https://ads.x.com' },
  { test: /youtube/i, url: 'https://www.youtube.com/ads' },
  { test: /reddit/i, url: 'https://ads.reddit.com' },
  { test: /pinterest/i, url: 'https://ads.pinterest.com' },
  { test: /email|newsletter/i, url: 'https://mailchimp.com' },
  { test: /content|blog/i, url: 'https://contentmarketinginstitute.com' },
  { test: /product\s*hunt/i, url: 'https://www.producthunt.com' },
  { test: /affiliat/i, url: 'https://www.impact.com' },
  { test: /influenc/i, url: 'https://creatoriq.com' }
]

export function getChannelLink(channel) {
  if (!channel) return null
  const match = KNOWN_CHANNELS.find(c => c.test.test(channel))
  if (match) return match.url
  return `https://www.google.com/search?q=${encodeURIComponent(channel)}`
}
