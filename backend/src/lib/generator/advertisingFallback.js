// Calendrier publicitaire à règles (fallback sans IA) : dérive des campagnes payantes
// des canaux marketing du plan, réparties sur 4 semaines, localisé FR / EN.

const FORMAT_BY_CHANNEL = {
  TikTok: { fr: 'Vidéo verticale', en: 'Vertical video' },
  YouTube: { fr: 'Vidéo pre-roll', en: 'Pre-roll video' },
  LinkedIn: { fr: 'Lead gen / sponsorisé', en: 'Lead gen / sponsored' },
  Content: { fr: 'Native ads', en: 'Native ads' },
  Paid: { fr: 'Search + Display', en: 'Search + Display' },
  Community: { fr: 'Post boosté', en: 'Boosted post' },
  Partnerships: { fr: 'Co-branded', en: 'Co-branded' },
  Social: { fr: 'Carrousel social', en: 'Social carousel' }
}

const OBJECTIVES = ['awareness', 'awareness', 'consideration', 'conversion']

const KPI_BY_OBJECTIVE = {
  awareness: { fr: 'CPM / portée', en: 'CPM / reach' },
  consideration: { fr: 'CTR / CPC', en: 'CTR / CPC' },
  conversion: { fr: 'CPL / CPA', en: 'CPL / CPA' }
}

export function generateAdvertisingFallback(plan, lang = 'fr') {
  const en = lang === 'en'
  const channels = (plan?.marketing?.channels || []).filter(c => (c.budget || 0) > 0)
  const list = channels.length ? channels : [{ name: 'Paid', budget: plan?.marketing?.totalBudget || 5000 }]
  const audience = plan?.market?.segment || plan?.product?.targetUser || (en ? 'your core audience' : 'votre audience cible')

  const campaigns = []
  let totalBudget = 0
  for (let week = 1; week <= 4; week++) {
    const channel = list[(week - 1) % list.length]
    const objective = OBJECTIVES[week - 1]
    // Budget hebdo ≈ budget du canal réparti sur 4 semaines
    const weekBudget = Math.max(50, Math.round((channel.budget || 1000) / 4))
    const fmt = (FORMAT_BY_CHANNEL[channel.name] || { fr: 'Publicité', en: 'Ad' })[en ? 'en' : 'fr']
    const kpi = KPI_BY_OBJECTIVE[objective][en ? 'en' : 'fr']
    campaigns.push({
      week,
      channel: channel.name,
      objective,
      format: fmt,
      audience: en ? `Targeting ${audience}` : `Ciblage ${audience}`,
      budget: weekBudget,
      kpi
    })
    totalBudget += weekBudget

    // Seconde campagne conversion en semaines 3-4 si un autre canal existe
    if (week >= 3 && list.length > 1) {
      const channel2 = list[week % list.length]
      const weekBudget2 = Math.max(50, Math.round((channel2.budget || 1000) / 6))
      const fmt2 = (FORMAT_BY_CHANNEL[channel2.name] || { fr: 'Publicité', en: 'Ad' })[en ? 'en' : 'fr']
      campaigns.push({
        week,
        channel: channel2.name,
        objective: 'conversion',
        format: fmt2,
        audience: en ? 'Retargeting engaged visitors' : 'Retargeting des visiteurs engagés',
        budget: weekBudget2,
        kpi: KPI_BY_OBJECTIVE.conversion[en ? 'en' : 'fr']
      })
      totalBudget += weekBudget2
    }
  }

  return { campaigns, totalBudget }
}
