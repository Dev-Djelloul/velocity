// Benchmarks à règles (fallback sans IA) : produit des repères sectoriels plausibles
// à partir du contexte produit / marché / KPIs, localisés FR / EN.

export function generateBenchmarksFallback(plan, lang = 'fr') {
  const m = plan?.market || {}
  const b2b = m.b2bVsB2c === 'b2b' || m.b2bVsB2c === 'b2g'
  const en = lang === 'en'

  const metrics = en
    ? [
        { metric: 'Landing → signup conversion', industry: b2b ? '2–5%' : '5–12%', yours: 'Estimate vs your funnel', verdict: 'onpar' },
        { metric: 'Trial → paid conversion', industry: b2b ? '10–25%' : '2–8%', yours: 'Depends on activation', verdict: 'onpar' },
        { metric: 'Monthly churn', industry: b2b ? '1–3%' : '4–8%', yours: 'Target under the range', verdict: 'onpar' },
        { metric: 'CAC payback', industry: b2b ? '12–18 months' : '3–6 months', yours: 'Watch with your budget', verdict: 'onpar' },
        { metric: 'Activation rate (first value)', industry: '20–40%', yours: 'Drive with onboarding', verdict: 'onpar' }
      ]
    : [
        { metric: 'Conversion landing → inscription', industry: b2b ? '2–5%' : '5–12%', yours: 'À estimer vs votre funnel', verdict: 'onpar' },
        { metric: 'Conversion essai → payant', industry: b2b ? '10–25%' : '2–8%', yours: "Dépend de l'activation", verdict: 'onpar' },
        { metric: 'Churn mensuel', industry: b2b ? '1–3%' : '4–8%', yours: 'Cible sous la fourchette', verdict: 'onpar' },
        { metric: 'Retour sur CAC', industry: b2b ? '12–18 mois' : '3–6 mois', yours: 'À surveiller avec votre budget', verdict: 'onpar' },
        { metric: 'Taux d\'activation (1ʳᵉ valeur)', industry: '20–40%', yours: "À pousser via l'onboarding", verdict: 'onpar' }
      ]

  const channels = en
    ? [
        { channel: 'SEO / Content', benchmark: '1–3% visit → signup', note: 'Compounds slowly; start early' },
        { channel: 'Paid ads', benchmark: 'CPC €0.5–3, CTR 1–3%', note: 'Watch CAC vs LTV closely' },
        { channel: b2b ? 'LinkedIn' : 'Social', benchmark: b2b ? '0.4–1% CTR' : '0.5–2% engagement', note: 'Best for warm audiences' }
      ]
    : [
        { channel: 'SEO / Contenu', benchmark: '1–3% visite → inscription', note: 'Effet cumulatif lent ; commencer tôt' },
        { channel: 'Publicité payante', benchmark: 'CPC 0,5–3 €, CTR 1–3%', note: 'Surveiller le CAC vs LTV de près' },
        { channel: b2b ? 'LinkedIn' : 'Réseaux sociaux', benchmark: b2b ? 'CTR 0,4–1%' : 'Engagement 0,5–2%', note: 'Idéal pour audiences chaudes' }
      ]

  const takeaway = en
    ? 'Your targets look plausible for the category. Focus on activation and CAC payback — these are where early plans most often drift from benchmarks.'
    : "Vos cibles semblent plausibles pour la catégorie. Concentrez-vous sur l'activation et le retour sur CAC — c'est là que les plans dérivent le plus souvent des benchmarks."

  const sources = [
    { name: 'SaaS Capital', url: 'https://www.saas-capital.com' },
    { name: 'OpenView', url: 'https://openviewpartners.com' },
    { name: 'ProfitWell (Paddle)', url: 'https://www.paddle.com/profitwell' }
  ]

  return { metrics, channels, takeaway, sources }
}
