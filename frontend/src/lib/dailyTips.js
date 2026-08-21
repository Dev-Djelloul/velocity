// Conseil du jour, dashboard : un tip lié au lancement produit/growth par jour, calculé
// localement (jour de l'année % longueur de la liste) — pas de backend, même index pour
// tous les utilisateurs le même jour, roule automatiquement le lendemain. Liste rédigée
// avec l'aide de l'IA (élargie sur demande explicite), couvrant positionnement, pricing,
// onboarding, rétention, acquisition, métriques, légal et organisation d'équipe.
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
  { fr: 'Le RGPD n\'est pas une formalité de fin de projet : intégrez-le dès la conception du parcours utilisateur.', en: 'GDPR isn\'t a last-minute formality: build it into the user journey from day one.' },
  { fr: 'Un produit qui résout un problème "vitamine" se vend mal ; visez l\'"analgésique" — la douleur urgente à faire disparaître.', en: 'A "vitamin" product sells poorly; aim for a "painkiller" — an urgent problem people need gone.' },
  { fr: 'Ne lancez jamais un produit un vendredi : vous perdez le week-end pour réagir aux premiers retours.', en: 'Never launch on a Friday: you lose the weekend to react to early feedback.' },
  { fr: 'Un onboarding en 3 étapes converti mieux qu\'un onboarding complet en 10 — quitte à cacher le reste derrière un menu "Avancé".', en: 'A 3-step onboarding converts better than a complete 10-step one — hide the rest behind an "Advanced" menu.' },
  { fr: 'Le taux de conversion d\'essai gratuit → payant est plus révélateur de la valeur perçue que le nombre d\'essais démarrés.', en: 'Free trial → paid conversion says more about perceived value than the number of trials started.' },
  { fr: 'Un canal d\'acquisition qui fonctionne à petite échelle ne scale pas toujours linéairement — testez avant de doubler le budget.', en: 'A channel that works at small scale doesn\'t always scale linearly — test before doubling the budget.' },
  { fr: 'La preuve sociale (logos clients, chiffres, avis) doit apparaître avant le formulaire d\'inscription, pas après.', en: 'Social proof (client logos, numbers, reviews) should appear before the signup form, not after.' },
  { fr: 'Un support client réactif au lancement génère plus de bouche-à-oreille qu\'une campagne publicitaire.', en: 'Responsive customer support at launch generates more word-of-mouth than an ad campaign.' },
  { fr: 'Segmentez vos utilisateurs dès le premier mois : "power users" et "utilisateurs occasionnels" n\'ont pas les mêmes besoins.', en: 'Segment users from month one: "power users" and "occasional users" need different things.' },
  { fr: 'Un produit B2B se vend par la démonstration de ROI, pas par la liste de fonctionnalités.', en: 'A B2B product sells through demonstrated ROI, not a feature list.' },
  { fr: 'Le coût d\'acquisition client (CAC) n\'a de sens que comparé à la valeur vie client (LTV) — jamais l\'un sans l\'autre.', en: 'Customer acquisition cost (CAC) only makes sense compared to lifetime value (LTV) — never one without the other.' },
  { fr: 'Un programme de parrainage lancé trop tôt (avant d\'avoir des clients satisfaits) ne produit que du bruit.', en: 'A referral program launched too early (before you have happy customers) just produces noise.' },
  { fr: 'La vitesse de chargement de votre page d\'accueil est un facteur de conversion aussi important que le message.', en: 'Your homepage load speed is as important a conversion factor as the message itself.' },
  { fr: 'Un lancement produit réussi se prépare en coulisses des semaines avant : presse, partenaires, communauté chauffée à blanc.', en: 'A successful launch is prepped behind the scenes weeks ahead: press, partners, a warmed-up community.' },
  { fr: 'Ne confondez pas trafic et intérêt : 1000 visiteurs curieux valent moins que 50 prospects qualifiés.', en: 'Don\'t confuse traffic with interest: 1000 curious visitors are worth less than 50 qualified prospects.' },
  { fr: 'Un pricing par palier (freemium, pro, entreprise) doit avoir une frontière évidente, pas une zone grise confuse.', en: 'Tiered pricing (freemium, pro, enterprise) needs an obvious boundary, not a confusing gray zone.' },
  { fr: 'Le meilleur canal de feedback post-lancement, c\'est un appel de 15 minutes, pas un formulaire NPS anonyme.', en: 'The best post-launch feedback channel is a 15-minute call, not an anonymous NPS survey.' },
  { fr: 'Une roadmap trimestrielle publique force la discipline de priorisation mieux qu\'un backlog interne infini.', en: 'A public quarterly roadmap forces prioritization discipline better than an endless internal backlog.' },
  { fr: 'Un churn élevé la première semaine signale souvent un problème d\'onboarding, pas un problème de produit.', en: 'High first-week churn often signals an onboarding problem, not a product problem.' },
  { fr: 'Le contenu éducatif (guides, webinaires) construit la confiance plus vite que les publicités pour un produit complexe.', en: 'Educational content (guides, webinars) builds trust faster than ads for a complex product.' },
  { fr: 'Fixez un budget marketing avant de choisir les canaux, pas l\'inverse — sinon vous dépensez sans limite claire.', en: 'Set a marketing budget before picking channels, not the other way around — otherwise spend has no clear ceiling.' },
  { fr: 'Un lancement en avant-première (beta fermée) permet de corriger les bugs critiques sans exposer votre réputation.', en: 'A closed-beta soft launch lets you fix critical bugs without exposing your reputation.' },
  { fr: 'La cohérence de marque (ton, visuel, message) compte plus au lancement que la perfection de chaque élément pris isolément.', en: 'Brand consistency (tone, visuals, message) matters more at launch than perfecting each element in isolation.' },
  { fr: 'Un tableau de bord financier prévisionnel doit inclure un scénario pessimiste, pas seulement l\'optimiste.', en: 'A financial forecast dashboard should include a pessimistic scenario, not just the optimistic one.' },
  { fr: 'Le premier mois après lancement, priorisez la correction de bugs bloquants sur l\'ajout de nouvelles fonctionnalités.', en: 'In the first month after launch, prioritize fixing blocking bugs over adding new features.' },
  { fr: 'Un persona utilisateur bien défini tient sur une page — s\'il en faut cinq, c\'est que le ciblage est encore trop flou.', en: 'A well-defined user persona fits on one page — if it needs five, your targeting is still too vague.' },
  { fr: 'La rétention se travaille dès le premier email de bienvenue : chaque point de contact façonne l\'habitude d\'usage.', en: 'Retention starts with the first welcome email: every touchpoint shapes the usage habit.' },
  { fr: 'Un benchmark concurrentiel qui ne débouche sur aucune décision produit est du temps perdu.', en: 'A competitive benchmark that leads to no product decision is wasted time.' },
  { fr: 'Le SEO d\'un produit récent met 6 à 12 mois à porter ses fruits — ne comptez pas dessus pour le lancement lui-même.', en: 'SEO for a new product takes 6 to 12 months to pay off — don\'t rely on it for the launch itself.' },
  { fr: 'Une FAQ bien construite réduit la charge du support autant qu\'un chatbot, pour une fraction du coût.', en: 'A well-built FAQ reduces support load as much as a chatbot, at a fraction of the cost.' },
  { fr: 'Un lancement international dès le jour 1 dilue l\'énergie — concentrez-vous d\'abord sur un marché où vous gagnez.', en: 'Launching internationally on day 1 dilutes your energy — win one market first.' },
  { fr: 'Le taux de complétion du questionnaire d\'onboarding est un signal précoce d\'adéquation produit-marché.', en: 'Onboarding questionnaire completion rate is an early signal of product-market fit.' },
  { fr: 'Un partenariat de distribution vaut plus qu\'une campagne publicitaire ponctuelle pour la croissance long terme.', en: 'A distribution partnership is worth more than a one-off ad campaign for long-term growth.' },
  { fr: 'La confidentialité des données doit être un argument de vente, pas seulement une contrainte légale à subir.', en: 'Data privacy should be a selling point, not just a legal constraint to endure.' },
  { fr: 'Un plan de lancement figé au jour J n\'a pas de valeur : la vraie valeur est dans les ajustements de la semaine 2.', en: 'A launch plan frozen on day zero has no value: the real value is in week-two adjustments.' }
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
