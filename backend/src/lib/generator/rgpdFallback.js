// Conformité RGPD à règles (fallback sans IA) : produit une évaluation plausible
// à partir du contexte produit / marché, localisée FR / EN. Aide, pas un avis juridique.

export function generateRgpdFallback(plan, lang = 'fr') {
  const en = lang === 'en'
  const m = plan?.market || {}
  const b2c = m.b2bVsB2c === 'b2c' || m.b2bVsB2c === 'd2c'
  const euScope = ['france', 'eu', 'global'].includes(m.geography) || !m.geography

  if (en) {
    return {
      applicability: euScope
        ? 'GDPR applies: you target or process data of individuals in the EU. Compliance is required before launch.'
        : 'GDPR likely applies as soon as you process any EU resident data — plan for it from day one.',
      checklist: [
        { item: 'Publish a clear privacy policy and terms of service', priority: 'high' },
        { item: 'Add a compliant cookie/consent banner (opt-in, granular)', priority: 'high' },
        { item: 'Collect only necessary data (data minimization)', priority: 'high' },
        { item: 'Define a legal basis for each processing activity', priority: 'high' },
        { item: 'Enable data access, export and deletion requests', priority: 'medium' },
        { item: 'Sign DPAs with your sub-processors (analytics, email, hosting)', priority: 'medium' },
        { item: b2c ? 'Set an age gate / parental consent if minors may sign up' : 'Document retention periods per data type', priority: 'medium' },
        { item: 'Prepare a breach notification process (72h)', priority: 'low' }
      ],
      register: [
        { data: 'Email, name', purpose: 'Account creation & login', basis: 'Contract' },
        { data: 'Usage & analytics data', purpose: 'Product improvement', basis: 'Legitimate interest / consent' },
        { data: 'Payment metadata', purpose: 'Billing', basis: 'Contract / legal obligation' },
        { data: 'Marketing contact', purpose: 'Newsletters & outreach', basis: 'Consent' }
      ],
      recommendations: [
        'Ship the privacy policy and consent banner before any public traffic',
        'Prefer EU-hosted or DPA-covered sub-processors',
        'Keep a simple processing register from day one — it scales badly if added late'
      ]
    }
  }

  return {
    applicability: euScope
      ? "Le RGPD s'applique : vous ciblez ou traitez des données de personnes situées dans l'UE. La conformité est requise avant le lancement."
      : "Le RGPD s'applique dès que vous traitez des données de résidents de l'UE — anticipez-le dès le départ.",
    checklist: [
      { item: 'Publier une politique de confidentialité et des CGU claires', priority: 'high' },
      { item: 'Ajouter un bandeau cookies/consentement conforme (opt-in, granulaire)', priority: 'high' },
      { item: 'Ne collecter que les données nécessaires (minimisation)', priority: 'high' },
      { item: 'Définir une base légale pour chaque traitement', priority: 'high' },
      { item: "Permettre l'accès, l'export et la suppression des données", priority: 'medium' },
      { item: 'Signer des DPA avec vos sous-traitants (analytics, emailing, hébergement)', priority: 'medium' },
      { item: b2c ? "Prévoir une vérification d'âge / consentement parental si des mineurs peuvent s'inscrire" : 'Documenter les durées de conservation par type de données', priority: 'medium' },
      { item: 'Préparer une procédure de notification de violation (72h)', priority: 'low' }
    ],
    register: [
      { data: 'Email, nom', purpose: 'Création de compte & connexion', basis: 'Contrat' },
      { data: "Données d'usage & analytics", purpose: 'Amélioration du produit', basis: 'Intérêt légitime / consentement' },
      { data: 'Métadonnées de paiement', purpose: 'Facturation', basis: 'Contrat / obligation légale' },
      { data: 'Contact marketing', purpose: 'Newsletters & prospection', basis: 'Consentement' }
    ],
    recommendations: [
      "Mettre en ligne la politique de confidentialité et le bandeau de consentement avant tout trafic public",
      "Privilégier des sous-traitants hébergés dans l'UE ou couverts par un DPA",
      "Tenir un registre de traitement simple dès le départ — l'ajouter tard coûte cher"
    ]
  }
}
