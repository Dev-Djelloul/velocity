// Conseil du jour, dashboard : un tip lié au lancement produit/growth par jour, calculé
// localement (jour de l'année % longueur de la liste) — pas de backend, même index pour
// tous les utilisateurs le même jour, roule automatiquement le lendemain.
const TIPS = [
  { fr: 'Validez votre proposition de valeur avec 5 vrais prospects avant d\'écrire une ligne de code.', en: 'Validate your value proposition with 5 real prospects before writing a single line of code.' },
  { fr: 'Un lancement réussi commence par un seul canal d\'acquisition maîtrisé, pas dix testés à moitié.', en: 'A successful launch starts with one acquisition channel mastered, not ten tried halfway.' },
  { fr: 'Fixez un objectif d\'activation (pas juste d\'inscription) avant de lancer vos campagnes.', en: 'Set an activation goal (not just a signup goal) before launching your campaigns.' },
  { fr: 'Interviewez vos 10 premiers clients perdus : ils vous diront ce que vos clients actuels taisent.', en: 'Interview your first 10 lost customers: they\'ll tell you what your current customers won\'t.' },
  { fr: 'Un pricing trop bas au lancement est plus dur à corriger qu\'un pricing trop élevé.', en: 'Underpricing at launch is harder to fix later than overpricing.' },
  { fr: 'Votre roadmap doit survivre au premier retour utilisateur négatif sans être jetée à la poubelle.', en: 'Your roadmap should survive the first bad user feedback without being thrown out entirely.' },
  { fr: 'Mesurez le temps jusqu\'à la première valeur perçue ("aha moment") : c\'est le vrai KPI d\'onboarding.', en: 'Measure time-to-first-value (the "aha moment"): that\'s the real onboarding KPI.' },
  { fr: 'Un post-mortem de lancement vaut plus que dix réunions de préparation.', en: 'A launch post-mortem is worth more than ten planning meetings.' },
  { fr: 'La rétention à J30 prédit mieux votre succès que le nombre d\'inscrits au lancement.', en: 'Day-30 retention predicts success better than launch-day signups.' },
  { fr: 'Priorisez les fonctionnalités qui réduisent le churn avant celles qui séduisent de nouveaux prospects.', en: 'Prioritize features that reduce churn before ones that woo new prospects.' },
  { fr: 'Un budget marketing concentré sur 2 canaux bat un budget saupoudré sur 6.', en: 'A marketing budget focused on 2 channels beats one spread across 6.' },
  { fr: 'Publiez votre roadmap publique : ça rassure les early adopters et filtre les mauvais clients.', en: 'Publish a public roadmap: it reassures early adopters and filters out bad-fit customers.' },
  { fr: 'Le meilleur moment pour collecter des témoignages clients, c\'est juste après leur premier succès avec le produit.', en: 'The best time to collect testimonials is right after a customer\'s first success with the product.' },
  { fr: 'Un plan de lancement sans date de revue à J+30 n\'est qu\'un vœu pieux.', en: 'A launch plan without a day-30 review date is just wishful thinking.' },
  { fr: 'Testez votre message de vente sur quelqu\'un qui ne connaît rien à votre secteur : s\'il comprend, c\'est bon.', en: 'Test your sales pitch on someone outside your industry: if they get it, you\'re good.' },
  { fr: 'La documentation produit est un canal d\'acquisition sous-estimé — soignez-la dès le MVP.', en: 'Product documentation is an underrated acquisition channel — polish it from the MVP stage.' },
  { fr: 'Un tableau de bord de KPIs consulté une fois par mois ne sert à rien : visez l\'hebdomadaire.', en: 'A KPI dashboard checked once a month is useless — aim for weekly.' },
  { fr: 'Vos 100 premiers clients doivent être traités comme des partenaires, pas comme des numéros.', en: 'Your first 100 customers should be treated as partners, not as numbers.' },
  { fr: 'Une landing page qui convertit à 2% avec du trafic qualifié bat une page à 5% avec du trafic froid.', en: 'A landing page converting at 2% with qualified traffic beats one at 5% with cold traffic.' },
  { fr: 'Le RGPD n\'est pas une formalité de fin de projet : intégrez-le dès la conception du parcours utilisateur.', en: 'GDPR isn\'t a last-minute formality: build it into the user journey from day one.' }
]

function dayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date - start
  return Math.floor(diff / 86400000)
}

export function getDailyTip(lang) {
  const index = dayOfYear(new Date()) % TIPS.length
  const tip = TIPS[index]
  return tip[lang] || tip.fr
}
