export const translations = {
  fr: {
    app: {
      title: 'Product Launch Planner',
      subtitle: 'Générateur intelligent de plan de lancement SaaS',
      newPlan: 'Nouveau plan',
      export: 'Exporter'
    },
    steps: ['Produit', 'Marché', 'Ressources', 'Priorités'],
    nav: {
      previous: 'Précédent', next: 'Suivant', generate: 'Générer le plan', generating: 'Génération en cours…',
      generatingSteps: [
        'Analyse de votre produit et de votre marché…',
        'Construction de la roadmap et des sprints…',
        'Calcul de la stratégie marketing et des budgets…',
        'Finalisation des KPIs…'
      ]
    },
    product: {
      title: 'Informations produit',
      name: 'Nom du produit',
      namePh: 'ex : AI Note Taker',
      stage: 'Stade',
      stageOptions: { prelaunch: 'Pre-launch', mvp: 'MVP', growing: 'Growing' },
      category: 'Catégorie SaaS',
      categoryOptions: { pm: 'Project mgmt', analytics: 'Analytics', automation: 'Automation', hr: 'HR', finance: 'Finance', other: 'Autre' },
      pitch: 'Pitch court',
      pitchPh: 'Décris ton produit en 2-3 lignes…',
      usp: 'USP (proposition de valeur unique)',
      uspPh: 'Ce qui te différencie…',
      targetUser: 'Utilisateur cible',
      targetUserOptions: { freelancers: 'Freelancers', smb: 'PME', enterprise: 'Entreprise', niche: 'Niche' }
    },
    market: {
      title: 'Marché & audience',
      geography: 'Géographie',
      geographyOptions: { france: 'France', eu: 'UE', global: 'Global' },
      b2bVsB2c: 'B2B vs B2C',
      b2bVsB2cOptions: { b2b: 'B2B', b2c: 'B2C', hybrid: 'Hybride' },
      segment: 'Segment principal',
      segmentPh: 'ex : Équipes remote / Hybrid orgs',
      audienceSize: "Taille d'audience potentielle",
      audienceSizeOptions: { xs: '< 1k', s: '1k-10k', m: '10k-100k', l: '100k+' },
      competition: 'Concurrence',
      competitionOptions: { none: 'Aucune', low: 'Faible', moderate: 'Modérée', high: 'Forte' }
    },
    resources: {
      title: 'Timeline & ressources',
      timelineWeeks: 'Durée avant lancement',
      timelineOptions: { w4: '4 semaines', w8: '8 semaines', w12: '12 semaines', w26: '6 mois' },
      budgetEur: 'Budget marketing total',
      budgetOptions: { b2k: '2 000 €', b5k: '5 000 €', b10k: '10 000 €', b25k: '25 000 €', b50k: '50 000 €+' },
      teamSize: "Taille d'équipe",
      teamSizeOptions: { solo: 'Solo', small: '2-3', medium: '4-6', large: '7+' },
      rolesPresent: 'Rôles présents',
      roles: { product: 'Product', marketing: 'Marketing', dev: 'Dev', design: 'Design' }
    },
    priorities: {
      title: 'Priorités & contexte',
      focus: 'Priorité',
      focusOptions: { acquire: 'Acquérir des utilisateurs', retain: 'Retenir', monetize: 'Monétiser' },
      engagement: 'Engagement requis',
      engagementOptions: { minimal: 'Minimal (passif)', moderate: 'Modéré', high: 'Élevé (communauté)' },
      riskKnown: 'Risques connus',
      riskOptions: { none: 'Aucun', notready: 'Produit non prêt', pmf: 'Product-market fit incertain', budget: 'Budget limité' },
      successMetric: 'Métrique de succès',
      successOptions: { signups: '# Inscriptions', arr: 'ARR', retention: 'Rétention', community: 'Taille communauté' },
      rules: 'Règles de génération (optionnel)',
      rulesOptions: {
        marketingFirst: 'Priorise le marketing avant le dev',
        designFirst: 'Équipe orientée design',
        devFirst: 'Priorise le développement'
      },
      context: 'Autre chose à préciser ? (optionnel)',
      contextPh: 'Contraintes spécifiques, particularités du marché, éléments que le questionnaire ne couvre pas...'
    },
    gantt: {
      title: 'Gantt interactif',
      subtitle: 'Glisse une story vers un autre sprint pour la replanifier',
      dragHint: 'Astuce : fais glisser une carte vers une autre colonne pour changer son sprint.'
    },
    askChart: {
      title: 'Graphiques en langage naturel',
      subtitle: 'Pose une question sur ton plan, le graphique correspondant s\'affiche',
      placeholder: 'ex : montre-moi le budget par mois',
      ask: 'Générer',
      noData: 'Pas assez de données pour répondre à cette question — essaie une des suggestions.',
      suggestions: [
        'Budget par canal',
        'Effort par sprint',
        'Coût par sprint',
        'Cibles des KPI'
      ]
    },
    genTable: {
      title: 'Tableau généré par prompt',
      subtitle: 'Décris le tableau dont tu as besoin, il se construit automatiquement',
      placeholder: 'ex : tableau de suivi des influenceurs à contacter',
      generate: 'Générer le tableau',
      addRow: '+ Ajouter une ligne'
    },
    roadmapIssues: {
      title: 'Alertes roadmap',
      bottleneck: 'Goulot de capacité',
      'dependency-conflict': 'Conflit de dépendance',
      'same-sprint-dependency': 'Dépendance dans le même sprint',
      'missing-dependency': 'Dépendance introuvable'
    },
    outputs: {
      roadmap: 'Roadmap Agile',
      marketing: 'Stratégie Marketing',
      kpis: 'Dashboard KPI',
      persona: 'Persona',
      sprint: 'Sprint',
      weeks: 'semaines',
      effort: 'Effort',
      cost: 'Coût',
      dependsOn: 'Dépend de',
      risks: 'Risques',
      budget: 'Budget',
      goal: 'Objectif',
      cadence: 'Cadence',
      target: 'Cible',
      formula: 'Formule',
      totalBudget: 'Budget total',
      summary: 'Résumé',
      issueType: 'Type',
      storyPoints: 'Points d\'effort',
      assignee: 'Assigné à',
      estimatedCostEur: 'Coût estimé (EUR)',
      dependsOnCsv: 'Dépend de',
      abTest: 'Calculateur A/B test',
      abBaseline: 'Taux de conversion de base (%)',
      abMde: 'Amélioration minimale détectable (%)',
      abVisitors: 'Visiteurs/jour par variante',
      abSampleSize: 'Taille échantillon requise',
      abVariant: 'variante',
      abDuration: 'Durée estimée',
      days: 'jours',
      channel: 'Canal',
      name: 'Nom',
      unit: 'Unité',
      baseline: 'Référence',
      category: 'Poste',
      executiveSummary: 'Résumé exécutif',
      copySummary: 'Copier le résumé',
      summaryCopied: 'Copié !',
      assets: {
        post: 'Brief de post',
        email: 'Objet email',
        landing: 'Accroche landing'
      },
      financials: {
        title: 'Prévisionnel financier',
        subtitle: 'Estimation simplifiée à partir de votre budget',
        monthlyBurn: 'Dépense mensuelle',
        runway: 'Runway',
        months: 'mois',
        breakEven: 'Seuil de rentabilité',
        clients: 'clients payants',
        breakEvenNote: (users, revenue, arpu) => `≈ ${revenue.toLocaleString()} €/mois à ${arpu} €/client`,
        breakdown: 'Répartition du budget'
      },
      strategy: {
        title: 'Boîte à outils stratégique',
        subtitle: 'Analyse SWOT et positionnement',
        strengths: 'Forces',
        weaknesses: 'Faiblesses',
        opportunities: 'Opportunités',
        threats: 'Menaces',
        positioning: 'Positionnement concurrentiel'
      },
      rollover: {
        overdue: 'En retard',
        markDone: 'Marquer comme fait',
        markTodo: 'Rouvrir',
        moveToCurrent: 'Reporter au sprint courant',
        current: 'Sprint en cours',
        progress: 'complété'
      }
    },
    export: {
      title: 'Exporter le plan',
      json: 'Export JSON',
      csv: 'Export CSV',
      pdf: 'Export PDF',
      github: 'Export GitHub Issues',
      jira: 'Export Jira (CSV)',
      pptx: 'Export pitch deck (PPTX)',
      image: 'Export image (PNG)',
      close: 'Fermer'
    },
    errors: {
      generic: 'Une erreur est survenue. Réessaie.'
    }
  },
  en: {
    app: {
      title: 'Product Launch Planner',
      subtitle: 'Intelligent SaaS launch plan generator',
      newPlan: 'New plan',
      export: 'Export'
    },
    steps: ['Product', 'Market', 'Resources', 'Priorities'],
    nav: {
      previous: 'Previous', next: 'Next', generate: 'Generate plan', generating: 'Generating…',
      generatingSteps: [
        'Analyzing your product and market…',
        'Building the roadmap and sprints…',
        'Calculating marketing strategy and budgets…',
        'Finalizing KPIs…'
      ]
    },
    product: {
      title: 'Product information',
      name: 'Product name',
      namePh: 'e.g. AI Note Taker',
      stage: 'Stage',
      stageOptions: { prelaunch: 'Pre-launch', mvp: 'MVP', growing: 'Growing' },
      category: 'SaaS category',
      categoryOptions: { pm: 'Project mgmt', analytics: 'Analytics', automation: 'Automation', hr: 'HR', finance: 'Finance', other: 'Other' },
      pitch: 'Short pitch',
      pitchPh: 'Describe your product in 2-3 lines…',
      usp: 'USP (Unique Selling Point)',
      uspPh: 'What sets you apart…',
      targetUser: 'Target user',
      targetUserOptions: { freelancers: 'Freelancers', smb: 'SMB', enterprise: 'Enterprise', niche: 'Niche' }
    },
    market: {
      title: 'Market & audience',
      geography: 'Geography',
      geographyOptions: { france: 'France', eu: 'EU', global: 'Global' },
      b2bVsB2c: 'B2B vs B2C',
      b2bVsB2cOptions: { b2b: 'B2B', b2c: 'B2C', hybrid: 'Hybrid' },
      segment: 'Main segment',
      segmentPh: 'e.g. Remote teams / Hybrid orgs',
      audienceSize: 'Potential audience size',
      audienceSizeOptions: { xs: '< 1k', s: '1k-10k', m: '10k-100k', l: '100k+' },
      competition: 'Competition',
      competitionOptions: { none: 'None', low: 'Low', moderate: 'Moderate', high: 'High' }
    },
    resources: {
      title: 'Timeline & resources',
      timelineWeeks: 'Time until launch',
      timelineOptions: { w4: '4 weeks', w8: '8 weeks', w12: '12 weeks', w26: '6 months' },
      budgetEur: 'Total marketing budget',
      budgetOptions: { b2k: '€2,000', b5k: '€5,000', b10k: '€10,000', b25k: '€25,000', b50k: '€50,000+' },
      teamSize: 'Team size',
      teamSizeOptions: { solo: 'Solo', small: '2-3', medium: '4-6', large: '7+' },
      rolesPresent: 'Roles present',
      roles: { product: 'Product', marketing: 'Marketing', dev: 'Dev', design: 'Design' }
    },
    priorities: {
      title: 'Priorities & context',
      focus: 'Priority',
      focusOptions: { acquire: 'Acquire users', retain: 'Retain', monetize: 'Monetize' },
      engagement: 'Engagement required',
      engagementOptions: { minimal: 'Minimal (passive)', moderate: 'Moderate', high: 'High (community)' },
      riskKnown: 'Known risks',
      riskOptions: { none: 'None', notready: 'Product not ready', pmf: 'Market fit unclear', budget: 'Budget limits' },
      successMetric: 'Success metric',
      successOptions: { signups: '# Signups', arr: 'ARR', retention: 'Retention', community: 'Community size' },
      rules: 'Generation rules (optional)',
      rulesOptions: {
        marketingFirst: 'Prioritize marketing before dev',
        designFirst: 'Design-led team',
        devFirst: 'Prioritize development'
      },
      context: 'Anything else to add? (optional)',
      contextPh: "Specific constraints, market particularities, anything the questionnaire doesn't cover..."
    },
    gantt: {
      title: 'Interactive Gantt',
      subtitle: 'Drag a story to another sprint to reschedule it',
      dragHint: 'Tip: drag a card to another column to change its sprint.'
    },
    askChart: {
      title: 'Natural language charts',
      subtitle: 'Ask a question about your plan, the matching chart appears',
      placeholder: 'e.g. show me the budget by month',
      ask: 'Generate',
      noData: 'Not enough data to answer this — try one of the suggestions.',
      suggestions: [
        'Budget by channel',
        'Effort by sprint',
        'Cost by sprint',
        'KPI targets'
      ]
    },
    genTable: {
      title: 'Prompt-generated table',
      subtitle: 'Describe the table you need, it builds itself automatically',
      placeholder: 'e.g. tracking table for influencers to contact',
      generate: 'Generate table',
      addRow: '+ Add row'
    },
    roadmapIssues: {
      title: 'Roadmap alerts',
      bottleneck: 'Capacity bottleneck',
      'dependency-conflict': 'Dependency conflict',
      'same-sprint-dependency': 'Same-sprint dependency',
      'missing-dependency': 'Missing dependency'
    },
    outputs: {
      roadmap: 'Agile Roadmap',
      marketing: 'Marketing Strategy',
      kpis: 'KPI Dashboard',
      persona: 'Persona',
      sprint: 'Sprint',
      weeks: 'weeks',
      effort: 'Effort',
      cost: 'Cost',
      dependsOn: 'Depends on',
      risks: 'Risks',
      budget: 'Budget',
      goal: 'Goal',
      cadence: 'Cadence',
      target: 'Target',
      formula: 'Formula',
      totalBudget: 'Total budget',
      summary: 'Summary',
      issueType: 'Issue Type',
      storyPoints: 'Story Points',
      assignee: 'Assignee',
      estimatedCostEur: 'Estimated Cost (EUR)',
      dependsOnCsv: 'Depends On',
      abTest: 'A/B test calculator',
      abBaseline: 'Baseline conversion rate (%)',
      abMde: 'Minimum detectable effect (%)',
      abVisitors: 'Daily visitors per variant',
      abSampleSize: 'Required sample size',
      abVariant: 'variant',
      abDuration: 'Estimated duration',
      days: 'days',
      channel: 'Channel',
      name: 'Name',
      unit: 'Unit',
      baseline: 'Baseline',
      category: 'Category',
      executiveSummary: 'Executive summary',
      copySummary: 'Copy summary',
      summaryCopied: 'Copied!',
      assets: {
        post: 'Post brief',
        email: 'Email subject',
        landing: 'Landing tagline'
      },
      financials: {
        title: 'Financial forecast',
        subtitle: 'Simplified estimate based on your budget',
        monthlyBurn: 'Monthly burn',
        runway: 'Runway',
        months: 'months',
        breakEven: 'Break-even point',
        clients: 'paying customers',
        breakEvenNote: (users, revenue, arpu) => `≈ €${revenue.toLocaleString()}/month at €${arpu}/customer`,
        breakdown: 'Budget breakdown'
      },
      strategy: {
        title: 'Strategy toolkit',
        subtitle: 'SWOT analysis and positioning',
        strengths: 'Strengths',
        weaknesses: 'Weaknesses',
        opportunities: 'Opportunities',
        threats: 'Threats',
        positioning: 'Competitive positioning'
      },
      rollover: {
        overdue: 'Overdue',
        markDone: 'Mark as done',
        markTodo: 'Reopen',
        moveToCurrent: 'Move to current sprint',
        current: 'Current sprint',
        progress: 'complete'
      }
    },
    export: {
      title: 'Export plan',
      json: 'Export JSON',
      csv: 'Export CSV',
      pdf: 'Export PDF',
      github: 'Export GitHub Issues',
      jira: 'Export Jira (CSV)',
      pptx: 'Export pitch deck (PPTX)',
      image: 'Export image (PNG)',
      close: 'Close'
    },
    errors: {
      generic: 'Something went wrong. Try again.'
    }
  }
}

export function t(lang, path) {
  const parts = path.split('.')
  let node = translations[lang] || translations.fr
  for (const p of parts) node = node?.[p]
  return node ?? path
}
