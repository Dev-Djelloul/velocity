export const translations = {
  fr: {
    app: {
      title: 'Product Launch Planner',
      subtitle: 'Générateur intelligent de plan de lancement SaaS',
      newPlan: 'Nouveau plan',
      export: 'Exporter',
      save: 'Enregistrer',
      saved: 'Enregistré',
      coverImageTitle: 'Image de couverture du plan',
      coverImageEdit: "Changer l'image de couverture",
      coverImageAdd: 'Ajouter une couverture',
      coverImageChange: 'Modifier',
      coverTabGallery: 'Galerie',
      coverTabUpload: 'Charger',
      coverTabPexels: 'Pexels',
      coverTabLink: 'Lien',
      coverUploadCta: 'Importer une image',
      coverPexelsPlaceholder: 'Rechercher une photo…',
      coverPexelsSearch: 'Rechercher',
      coverPexelsEmpty: 'Aucun résultat pour cette recherche.',
      coverPexelsError: 'Recherche indisponible pour le moment.',
      coverPexelsAttribution: 'Photos via',
      coverLinkSubmit: 'Utiliser ce lien',
      coverRemove: 'Supprimer la couverture',
      pageBgTitle: 'Fond de page du plan',
      pageBgAdd: 'Choisir un fond de page',
      pageBgChange: 'Changer le fond de page',
      pageBgRemove: 'Supprimer le fond de page',
      pageBgBlurOn: 'Flou activé',
      pageBgBlurOff: 'Flou désactivé',
      readOnlyBanner: "Vous consultez ce plan en lecture seule — vous ne pouvez pas modifier le travail de quelqu'un d'autre.",
      readOnlyDuplicate: 'Dupliquer pour le modifier',
      unsavedChangesTitle: 'Changements non enregistrés',
      unsavedChangesBody: 'Tu as des modifications non enregistrées sur ce plan. Si tu continues sans les enregistrer, elles seront perdues.',
      discardChanges: 'Continuer sans enregistrer',
      saveAndContinue: 'Enregistrer et continuer',
      ok: 'OK',
      pendingChangesTitle: (count) => count > 1 ? `${count} modifications en attente` : '1 modification en attente',
      discardPendingChanges: 'Annuler les modifications'
    },
    steps: ['Produit', 'Marché', 'Ressources', 'Priorités'],
    nav: {
      previous: 'Précédent', next: 'Suivant', generate: 'Générer le plan', generating: 'Génération en cours…',
      continueLater: 'Continuer plus tard', draftSaved: '✓ Sauvegardé', myDrafts: 'Mes brouillons',
      draftNamePrefix: 'Brouillon', draftUntitled: 'Sans titre',
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
      nameHelp: 'Le nom de marque ou de produit tel qu\'il apparaîtra dans le plan généré.',
      stage: 'Stade',
      stageOptions: { idea: 'Idée / concept', prelaunch: 'Pre-launch', mvp: 'MVP', beta: 'Beta privée', growing: 'Growing', scaleup: 'Scale-up' },
      stageGlossary: {
        idea: "Encore au stade d'idée, rien n'est construit.",
        prelaunch: "Produit en cours de développement, pas encore public.",
        mvp: "Minimum Viable Product — version minimale testable par de vrais utilisateurs.",
        beta: "Version testée par un groupe restreint avant le lancement public.",
        growing: "Lancé, avec une croissance d'utilisateurs en cours.",
        scaleup: "Traction confirmée, phase de mise à l'échelle."
      },
      category: 'Catégorie SaaS',
      categoryOptions: { pm: 'Project mgmt', analytics: 'Analytics', automation: 'Automation', hr: 'HR', finance: 'Finance', saas: 'SaaS B2B', marketplace: 'Marketplace', mobile: 'App mobile', ecommerce: 'E-commerce', fintech: 'Fintech', edtech: 'EdTech', healthtech: 'HealthTech', devtools: 'Dev tools', ai: 'IA / ML', media: 'Contenu / Média', other: 'Autre' },
      categoryGlossary: {
        pm: 'Project management — outils de gestion de projet et de tâches.',
        analytics: 'Suivi et analyse de données (tableaux de bord, reporting...).',
        automation: "Automatisation de tâches ou de processus métier.",
        hr: 'Human Resources — ressources humaines (recrutement, paie, RH...).',
        finance: 'Comptabilité, facturation, gestion financière.',
        saas: 'Software as a Service vendu à d\'autres entreprises (B2B).',
        marketplace: 'Plateforme qui met en relation deux types d\'utilisateurs (acheteurs/vendeurs).',
        mobile: 'Application principalement pensée pour smartphone.',
        ecommerce: 'Vente de produits en ligne.',
        fintech: 'Technologie financière (paiement, banque, investissement...).',
        edtech: 'Education Technology — technologie appliquée à l\'apprentissage.',
        healthtech: 'Health Technology — technologie appliquée à la santé.',
        devtools: 'Outils destinés aux développeurs.',
        ai: 'Intelligence artificielle / Machine Learning.',
        media: 'Contenu éditorial, streaming, ou média en général.',
        other: 'Aucune des catégories ci-dessus ne correspond.'
      },
      pitch: 'Pitch court',
      pitchPh: 'Décris ton produit en 2-3 lignes…',
      pitchHelp: 'Un résumé en 2-3 phrases : ce que fait ton produit, pour qui, et le problème qu\'il résout.',
      usp: 'USP (proposition de valeur unique)',
      uspPh: 'Ce qui te différencie…',
      uspHelp: 'Unique Selling Proposition — ce qui te différencie clairement de la concurrence (une fonctionnalité, un prix, une audience...).',
      targetUser: 'Utilisateur cible',
      targetUserOptions: { freelancers: 'Freelancers', smb: 'PME', enterprise: 'Entreprise', niche: 'Niche', developers: 'Développeurs', startups: 'Startups', creators: 'Créateurs', consumers: 'Grand public' },
      targetUserGlossary: {
        freelancers: 'Travailleurs indépendants.',
        smb: 'PME — Petite ou Moyenne Entreprise (moins de 250 salariés).',
        enterprise: 'Grande entreprise, souvent avec des cycles de vente longs.',
        niche: 'Public restreint et très spécifique.',
        developers: 'Profils techniques (devs, DevOps...).',
        startups: 'Jeunes entreprises en phase de croissance rapide.',
        creators: 'Créateurs de contenu (influenceurs, YouTubers...).',
        consumers: 'Grand public, utilisateurs particuliers.'
      }
    },
    market: {
      title: 'Marché & audience',
      marketStatHelp: 'Modèle commercial (B2B/B2C) et zone géographique visés par ce lancement.',
      geography: 'Géographie',
      geographyOptions: { france: 'France', eu: 'UE', na: 'Amérique du Nord', latam: 'Amérique latine', apac: 'Asie-Pacifique', mena: 'MENA', africa: 'Afrique', global: 'Global' },
      geographyGlossary: {
        france: 'Marché français uniquement.',
        eu: 'Union européenne — l\'ensemble des 27 pays membres.',
        na: 'Amérique du Nord — États-Unis et Canada principalement.',
        latam: 'Amérique latine — Mexique, Brésil, Amérique centrale et du Sud.',
        apac: 'Asia-Pacific — Asie et région Pacifique (Chine, Inde, Japon, Australie...).',
        mena: 'Middle East & North Africa — Moyen-Orient et Afrique du Nord.',
        africa: 'Continent africain (hors Afrique du Nord si MENA est utilisé séparément).',
        global: 'Aucune région ciblée en priorité, marché mondial.'
      },
      b2bVsB2c: 'B2B vs B2C',
      b2bVsB2cOptions: { b2b: 'B2B', b2c: 'B2C', hybrid: 'Hybride', b2b2c: 'B2B2C', b2g: 'B2G (secteur public)', d2c: 'D2C' },
      b2bVsB2cGlossary: {
        b2b: 'Business to Business — tu vends à d\'autres entreprises.',
        b2c: 'Business to Consumer — tu vends directement aux particuliers.',
        hybrid: 'Un mix de B2B et B2C.',
        b2b2c: 'Business to Business to Consumer — tu vends via des entreprises qui touchent ensuite le grand public.',
        b2g: 'Business to Government — tu vends à des administrations ou au secteur public.',
        d2c: 'Direct to Consumer — vente directe au consommateur, sans intermédiaire.'
      },
      segment: 'Segment principal',
      segmentPh: 'ex : Équipes remote / Hybrid orgs',
      segmentHelp: 'Le profil précis de client que tu vises : secteur, taille d\'entreprise, usage ou métier concerné.',
      audienceSize: "Taille d'audience potentielle",
      audienceSizeOptions: { xs: '< 1k', s: '1k-10k', m: '10k-100k', l: '100k+', xl: '1M+' },
      audienceSizeHelp: 'Estimation du nombre total de personnes ou d\'entreprises qui pourraient être intéressées par ton produit.',
      competition: 'Concurrence',
      competitionOptions: { none: 'Aucune', low: 'Faible', moderate: 'Modérée', high: 'Forte', emerging: 'Marché naissant', saturated: 'Saturé (red ocean)' },
      competitionGlossary: {
        none: 'Aucun concurrent identifié sur ce marché.',
        low: 'Quelques concurrents, marché encore ouvert.',
        moderate: 'Plusieurs concurrents établis, marché disputé mais accessible.',
        high: 'Beaucoup de concurrents, marché difficile à percer.',
        emerging: 'Marché récent, encore en formation.',
        saturated: '« Red ocean » — marché mature où la concurrence est féroce et les marges sous pression, par opposition à un « blue ocean » (marché neuf, sans concurrence directe).'
      }
    },
    resources: {
      title: 'Timeline & ressources',
      classificationHelp: 'Phase stratégique principale de ce plan, déduite de la priorité et des risques identifiés.',
      timelineWeeks: 'Durée avant lancement',
      timelineOptions: { w2: '2 semaines', w4: '4 semaines', w8: '8 semaines', w12: '12 semaines', w16: '16 semaines', w26: '6 mois', w36: '9 mois', w52: '12 mois' },
      timelineWeeksHelp: 'Le délai que tu vises entre aujourd\'hui et le lancement public — il détermine le rythme des sprints du plan.',
      launchWindowHelp: 'Date de démarrage du plan et date de lancement effective visée, avec la durée entre les deux.',
      scheduleProgressHelp: 'Où on en est aujourd\'hui entre la date de début et la date de lancement — un repère calendaire, pas l\'avancement réel des tâches.',
      daysLeftHelp: 'Jours restants avant la date de lancement visée.',
      daysLeft: (n) => `J-${n}`,
      daysLeftToday: 'Lancement aujourd\'hui',
      daysLeftOverdue: (n) => `Lancement dépassé de ${n} j`,
      totalBudget: 'Budget total du lancement',
      totalBudgetOptions: { b500: '500 €', b1k: '1 000 €', b2k: '2 000 €', b5k: '5 000 €', b10k: '10 000 €', b25k: '25 000 €', b50k: '50 000 €', b100k: '100 000 €+' },
      totalBudgetHelp: 'L\'enveloppe globale du lancement, tous postes confondus (développement, marketing, opérations). Sert de base au prévisionnel financier. Distinct du budget marketing ci-dessous, qui n\'en est qu\'une partie.',
      budgetEur: 'Budget marketing',
      budgetOptions: { b500: '500 €', b1k: '1 000 €', b2k: '2 000 €', b5k: '5 000 €', b10k: '10 000 €', b25k: '25 000 €', b50k: '50 000 €', b100k: '100 000 €+' },
      budgetEurHelp: 'La part de ton budget total consacrée spécifiquement au marketing jusqu\'au lancement (hors salaires et développement produit) — sert à répartir les dépenses par canal.',
      teamSize: "Taille d'équipe",
      teamSizeOptions: { solo: 'Solo', small: '2-3', medium: '4-6', large: '7+', xlarge: '10-20', xxlarge: '20+' },
      teamSizeHelp: 'Le nombre de personnes qui travaillent activement sur le projet aujourd\'hui.',
      rolesPresent: 'Rôles présents',
      rolesPresentHelp: 'Les compétences déjà présentes dans ton équipe — coche tout ce qui s\'applique.',
      roles: { product: 'Product', marketing: 'Marketing', dev: 'Dev', design: 'Design', data: 'Data', growth: 'Growth', sales: 'Sales', support: 'Support', ops: 'Ops' }
    },
    priorities: {
      title: 'Priorités & contexte',
      focus: 'Priorité',
      focusOptions: { acquire: 'Acquérir des utilisateurs', retain: 'Retenir', monetize: 'Monétiser', fundraise: 'Lever des fonds', pmf: 'Atteindre le product-market fit', churn: 'Réduire le churn', international: "S'internationaliser" },
      focusGlossary: {
        acquire: 'Faire grossir le nombre d\'utilisateurs ou de clients.',
        retain: 'Garder les utilisateurs existants actifs sur la durée.',
        monetize: 'Générer ou augmenter les revenus.',
        fundraise: 'Préparer ou réussir une levée de fonds auprès d\'investisseurs.',
        pmf: 'Product-Market Fit — le moment où ton produit répond enfin à un vrai besoin de marché, validé par la demande.',
        churn: 'Réduire le taux de résiliation / d\'abandon des clients.',
        international: 'Étendre le produit à de nouveaux pays ou marchés.'
      },
      engagement: 'Engagement requis',
      engagementOptions: { minimal: 'Minimal (passif)', moderate: 'Modéré', high: 'Élevé (communauté)', community: 'Communauté active', whiteglove: 'Accompagnement premium' },
      engagementHelp: 'Le niveau d\'implication que tu attends de tes utilisateurs au quotidien : simple usage passif ou véritable communauté active.',
      riskKnown: 'Risques connus',
      riskOptions: { none: 'Aucun', notready: 'Produit non prêt', pmf: 'Product-market fit incertain', budget: 'Budget limité', regulatory: 'Réglementaire / conformité', techdebt: 'Dette technique', platform: 'Dépendance à une plateforme', timing: 'Timing marché', hiring: 'Recrutement' },
      riskGlossary: {
        none: 'Aucun risque majeur identifié pour l\'instant.',
        notready: 'Le produit n\'est pas encore assez abouti pour être lancé.',
        pmf: 'Product-Market Fit incertain — le produit n\'a pas encore prouvé qu\'il répond à un vrai besoin.',
        budget: 'Le budget disponible pourrait ne pas suffire.',
        regulatory: 'Contraintes légales, réglementaires ou de conformité (RGPD, licences...).',
        techdebt: 'Dette technique — du code ou une architecture à refaire qui ralentit le développement.',
        platform: 'Dépendance forte à une plateforme tierce (app store, API, réseau social...).',
        timing: 'Risque de mauvais timing sur le marché (trop tôt ou trop tard).',
        hiring: 'Difficulté à recruter les bons profils à temps.'
      },
      successMetric: 'Métrique de succès',
      successOptions: { signups: '# Inscriptions', arr: 'ARR', retention: 'Rétention', community: 'Taille communauté', mrr: 'MRR', nps: 'NPS', ltv: 'LTV', conversion: 'Taux de conversion', activeUsers: 'DAU/MAU' },
      successGlossary: {
        signups: "Nombre d'inscriptions — nouveaux comptes créés.",
        arr: 'Annual Recurring Revenue — revenu récurrent annuel généré par les abonnements.',
        retention: 'Part des utilisateurs qui restent actifs dans le temps.',
        community: 'Taille de la communauté (membres, followers, abonnés...).',
        mrr: 'Monthly Recurring Revenue — revenu récurrent mensuel généré par les abonnements.',
        nps: 'Net Promoter Score — indicateur de satisfaction et de recommandation (de -100 à 100).',
        ltv: 'Lifetime Value — revenu total généré par un client sur toute sa durée de vie.',
        conversion: 'Taux de conversion — part des visiteurs qui deviennent clients.',
        activeUsers: 'DAU/MAU — utilisateurs actifs quotidiens / mensuels (Daily/Monthly Active Users).'
      },
      rules: 'Règles de génération (optionnel)',
      rulesOptions: {
        marketingFirst: 'Priorise le marketing avant le dev',
        designFirst: 'Équipe orientée design',
        devFirst: 'Priorise le développement',
        mobileFirst: 'Priorité mobile',
        dataDriven: 'Approche data-driven',
        salesLed: 'Sales-led',
        plg: 'Product-led growth',
        complianceFirst: "Conformité d'abord"
      },
      rulesGlossary: {
        marketingFirst: 'Le plan met l\'accent sur les actions marketing avant les tâches de développement.',
        designFirst: 'Le plan priorise le travail de design et d\'expérience utilisateur.',
        devFirst: 'Le plan priorise les tâches de développement produit.',
        mobileFirst: 'Le plan conçoit d\'abord pour mobile avant le desktop.',
        dataDriven: 'Data-driven — les décisions s\'appuient sur des données et métriques plutôt que sur l\'intuition.',
        salesLed: 'Sales-led — la croissance passe d\'abord par une équipe commerciale plutôt que par le produit seul.',
        plg: 'Product-Led Growth — le produit lui-même (essai gratuit, usage) est le principal moteur d\'acquisition.',
        complianceFirst: 'Le plan traite en priorité les sujets légaux et de conformité (RGPD, réglementation...).'
      },
      context: 'Autre chose à préciser ? (optionnel)',
      contextPh: 'Contraintes spécifiques, particularités du marché, éléments que le questionnaire ne couvre pas...',
      contextHelp: 'Tout ce qui n\'est pas couvert par les questions précédentes : contraintes légales, partenariats déjà en place, particularités locales...',
      contextDocument: 'Importer un document (optionnel)',
      contextDocumentHelp: 'Business plan, notes, deck existant... Le texte est extrait automatiquement et ajouté au contexte envoyé à l\'IA. Tu peux le relire et le corriger avant de générer le plan. Formats acceptés : PDF, Word (.docx), Excel (.xlsx), PowerPoint (.pptx), photo/scan (JPG, PNG, WebP), 10 Mo max. Une page ou une photo sans texte sélectionnable (document scanné) passe automatiquement par une reconnaissance de caractères (OCR).',
      contextDocumentButton: 'Importer un document',
      contextDocumentAccepted: 'PDF, Word, Excel, PowerPoint, photo/scan · 10 Mo max',
      contextDocumentReading: 'Lecture du fichier…',
      contextDocumentOcrProgress: (page, total) => total > 1 ? `Analyse OCR — page ${page}/${total}…` : 'Analyse OCR de l\'image…',
      contextDocumentOcrUsed: 'Une partie du texte vient d\'une reconnaissance de caractères (OCR) sur des pages scannées — relis-le avant de générer le plan, l\'OCR n\'est jamais parfait.',
      contextDocumentRemove: 'Retirer',
      contextDocumentReplace: 'Remplacer',
      contextDocumentTruncated: 'Le document est long : seul le début a été conservé.',
      contextDocumentErrorTooLarge: 'Fichier trop volumineux (10 Mo maximum).',
      contextDocumentErrorFormat: 'Format non pris en charge. Utilise un PDF, Word, Excel, PowerPoint ou une photo/scan (JPG, PNG, WebP).',
      contextDocumentErrorEmpty: 'Aucun texte trouvé dans ce fichier (protégé par mot de passe, ou vide).',
      contextDocumentErrorScanned: 'La reconnaissance de caractères (OCR) n\'a rien pu lire dans ce document — essaie un scan de meilleure qualité, ou colle le contenu directement ci-dessus.',
      contextDocumentErrorGeneric: 'Impossible de lire ce fichier. Réessaie ou colle le contenu directement ci-dessus.'
    },
    gantt: {
      title: 'Gantt interactif',
      subtitle: 'Vue d\'ensemble par responsable — glisse une barre vers une autre colonne pour la replanifier',
      dragHint: 'Astuce : fais glisser une barre vers une autre colonne de sprint pour la replanifier. Clique dessus pour voir le détail.',
      expand: 'Voir le détail',
      collapse: 'Réduire',
      errors: {
        pastSprint: 'Impossible de replanifier avant le sprint en cours.',
        beforeDependency: 'Cette story dépend de {dep} — elle ne peut pas être planifiée avant.',
        afterDependent: '{dep} dépend de cette story — elle ne peut pas être planifiée après.'
      }
    },
    genTable: {
      title: 'Analyse IA du plan',
      subtitle: 'Décrivez ce que vous voulez voir en une phrase : un tableau se construit à partir des données réelles de votre plan, avec un graphique en plus si la comparaison s\'y prête',
      placeholder: 'ex : liste des stories par sprint avec leur effort',
      generate: 'Générer',
      generating: 'Génération…',
      addRow: '+ Ajouter une ligne',
      removeRow: 'Supprimer la ligne',
      removeColumn: 'Supprimer la colonne',
      exportCsv: 'Exporter en CSV',
      suggestionsTitle: 'Vous ne savez pas quoi taper ? Essayez :',
      suggestions: [
        'Budget marketing par canal',
        'Effort par sprint',
        'Cibles des KPI avec leur formule',
        'Répartition du budget (produit / marketing / ops)',
        'Tableau de suivi des influenceurs à contacter',
        'Checklist de lancement par semaine'
      ],
      empty: 'Aucun résultat pour le moment. Décrivez ce que vous voulez comparer, suivre ou lister ci-dessus — ou partez d\'une suggestion.',
      autoChartNote: 'Graphique généré automatiquement à partir des deux colonnes du tableau'
    },
    backlog: {
      title: 'Backlog',
      subtitle: (done, total) => `${done}/${total} stories terminées, tous sprints confondus`,
      searchPlaceholder: 'Rechercher une story...',
      filterAll: 'Tous les statuts',
      filterTodo: 'À faire',
      filterInProgress: 'En cours',
      filterDone: 'Terminé',
      filterAllAssignees: 'Tous les responsables',
      empty: 'Aucune story ne correspond à ces filtres.'
    },
    burndown: {
      title: 'Burndown chart',
      subtitle: 'Effort restant (points) vs temps — ligne idéale en pointillés, réel en trait plein',
      allSprints: 'Tous les sprints',
      ideal: 'Idéal',
      actual: 'Réel',
      onTrack: 'Dans les temps',
      behind: 'En retard',
      start: 'Début',
      finish: 'Fin',
      today: 'Aujourd\'hui',
      remaining: 'Reste à faire',
      gap: 'Écart vs idéal',
      daysLeft: (n) => `${n} jour${n > 1 ? 's' : ''} restant${n > 1 ? 's' : ''}`,
      ahead: (n) => `${n} pt${n > 1 ? 's' : ''} d'avance`,
      late: (n) => `${n} pt${n > 1 ? 's' : ''} de retard`
    },
    dashboardBi: {
      title: 'Dashboard',
      subtitle: 'Vue d\'ensemble croisée du plan — budget, charge, vélocité et KPIs',
      budgetByChannel: 'Budget par canal',
      workloadByRole: 'Charge par responsable',
      velocityBySprint: 'Vélocité par sprint',
      kpiTargets: 'Objectifs KPIs',
      kpiTargetsHint: 'D\'après le suivi post-lancement',
      costSplit: 'Répartition des coûts',
      overallProgress: 'Avancement global',
      storyCount: (n) => n === 1 ? '1 story' : `${n} stories`,
      total: 'Total',
      totalEffort: 'Effort total',
      monthlyBurn: 'Burn mensuel',
      schedulePace: 'Rythme vs calendrier',
      paceStories: 'Stories',
      paceCalendar: 'Calendrier',
      pointsDone: 'terminés',
      statusDone: 'Terminé',
      statusInProgress: 'En cours',
      statusTodo: 'Pas commencé',
      statusOverdue: 'En retard',
      overallProgressHelp: 'Avancement des stories par effort (points), pas par nombre : terminé compte plein, en cours compte à moitié. Le détail par couleur distingue terminé, en cours, pas commencé et en retard (sprint déjà censé être fini).',
      schedulePaceCardHelp: 'Compare l\'avancement réel des stories au temps déjà écoulé entre la date de début et la date de lancement — pour voir si le plan avance plus vite ou plus lentement que prévu.',
      costSplitHelp: 'Répartition du budget de lancement par poste de dépense (développement, design, infra, opérations, légal, réserve), avec le budget marketing ajouté à part — il ne fait pas partie du budget de lancement, il s\'y ajoute.',
      budgetByChannelHelp: 'Répartition du budget marketing (séparé du budget de lancement) par canal d\'acquisition.',
      workloadByRoleHelp: 'Points d\'effort par membre de l\'équipe réel. Le travail sans assignation nominative est réparti à parts égales entre tous les membres, faute de mieux.',
      velocityBySprintHelp: 'Un segment coloré par responsable dans chaque barre de sprint (mêmes couleurs que "Charge par responsable"), avec un voile sombre sur la part encore non terminée.',
      kpiTargetsCardHelp: 'Dernière valeur mesurée pour chaque KPI, comparée à son objectif — alimenté par les données saisies dans le Suivi post-lancement.'
    },
    sidebar: {
      title: 'Sommaire du plan',
      persona: 'Persona',
      collapse: 'Réduire le panneau',
      expand: 'Déplier le panneau',
      createPlan: 'Créer un nouveau plan',
      groups: {
        synthese: 'Synthèse',
        market: 'Marché & stratégie',
        execution: 'Roadmap & exécution',
        gtm: 'Go-to-market',
        performance: 'Performance & finances',
        compliance: 'Conformité',
        aitools: 'Outils IA',
        postlaunch: 'Suivi post-lancement'
      }
    },
    rgpd: {
      title: 'Conformité RGPD',
      subtitle: 'Une évaluation de conformité générée par IA, avec checklist actionnable',
      empty: 'Générez une évaluation RGPD adaptée à votre produit : applicabilité, checklist de conformité, ébauche de registre de traitement et recommandations.',
      generate: 'Évaluer la conformité',
      regenerate: 'Régénérer',
      generating: 'Analyse...',
      checklist: 'Checklist de conformité',
      priority: { high: 'Haute', medium: 'Moyenne', low: 'Basse' },
      register: 'Registre de traitement (ébauche)',
      data: 'Données',
      purpose: 'Finalité',
      basis: 'Base légale',
      recommendations: 'Recommandations',
      disclaimer: "Cette évaluation est une aide à la conformité générée automatiquement, pas un avis juridique. Faites valider par un juriste avant le lancement.",
      byAi: 'Évaluation générée par IA',
      byRules: 'Évaluation générée localement (moteur à règles)',
      officialResources: 'Ressources officielles',
      officialResourcesSubtitle: 'Sources faisant autorité, pour aller vérifier par vous-même',
      // Pool élargi (10 ressources réelles) plutôt qu'une liste fixe de 4 toujours
      // identique : RgpdCard.jsx en tire un sous-ensemble différent selon le plan (retour
      // utilisateur — "c'était à peu près toujours les mêmes liens").
      resources: [
        { label: 'CNIL — Autorité française de protection des données', url: 'https://www.cnil.fr/fr' },
        { label: 'Texte officiel du RGPD (Règlement UE 2016/679)', url: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX%3A32016R0679' },
        { label: 'CNIL — Guide RGPD du développeur', url: 'https://www.cnil.fr/fr/development-web-et-mobile-les-bonnes-pratiques' },
        { label: 'CNIL — Registre des activités de traitement', url: 'https://www.cnil.fr/fr/RGDP-le-registre-des-activites-de-traitement' },
        { label: 'CNIL — Analyse d\'impact (AIPD)', url: 'https://www.cnil.fr/fr/PIA-privacy-impact-assessment-fr' },
        { label: 'CNIL — Les droits pour maîtriser vos données', url: 'https://www.cnil.fr/fr/les-droits-pour-maitriser-vos-donnees-personnelles' },
        { label: 'Comité européen de la protection des données (EDPB)', url: 'https://www.edpb.europa.eu/edpb_fr' },
        { label: 'Commission européenne — Protection des données', url: 'https://commission.europa.eu/law/law-topic/data-protection_fr' },
        { label: 'IAPP — Association internationale des pros de la vie privée', url: 'https://iapp.org' },
        { label: 'ANSSI — Sécurité des systèmes d\'information', url: 'https://www.ssi.gouv.fr' }
      ]
    },
    advertising: {
      title: 'Calendrier publicitaire',
      subtitle: 'Un plan média payant généré par IA, réparti par canal et par objectif',
      empty: 'Générez un calendrier publicitaire sur 4 semaines : campagnes par canal avec objectif, format, audience, budget et KPI attendu.',
      generate: 'Générer le plan média',
      regenerate: 'Régénérer',
      generating: 'Génération...',
      week: 'Semaine',
      totalBudget: 'Budget média total',
      objective: { awareness: 'Notoriété', consideration: 'Considération', conversion: 'Conversion' },
      exportCsv: 'Exporter en CSV',
      byAi: 'Plan média généré par IA',
      byRules: 'Plan média généré localement (moteur à règles)'
    },
    editorial: {
      title: 'Calendrier éditorial',
      subtitle: 'Un planning de contenus prêt à exécuter, généré par IA à partir de vos canaux',
      empty: 'Générez un calendrier éditorial sur 4 semaines : contenus par semaine et par canal, avec format, titre, angle et appel à l\'action.',
      generate: 'Générer le calendrier',
      regenerate: 'Régénérer',
      generating: 'Génération...',
      week: 'Semaine',
      cta: 'CTA',
      exportCsv: 'Exporter en CSV',
      byAi: 'Calendrier généré par IA',
      byRules: 'Calendrier généré localement (moteur à règles)'
    },
    gtm: {
      title: 'Calendrier de contenu & publicité',
      subtitle: 'Contenu organique et campagnes payantes, semaine par semaine, générés par IA',
      scopeNote: 'Ce calendrier détaille l\'exécution concrète (quoi publier, sur quel format, pour quelle audience) de la répartition budgétaire définie dans Stratégie marketing — les mêmes canaux y apparaissent volontairement, à un niveau tactique plutôt que financier.',
      generateAll: 'Générer le calendrier complet',
      generating: 'Génération...',
      empty: 'Générez le calendrier de contenu et de publicité : ce qui sort chaque semaine, sur quel canal, et ce que vous y investissez en média payant.',
      week: 'Semaine',
      content: 'Contenu organique',
      paid: 'Campagnes payantes',
      contentEmpty: 'Aucun contenu éditorial généré',
      paidEmpty: 'Aucune campagne média générée',
      regenerateContent: 'Régénérer le contenu',
      regeneratePaid: 'Régénérer les campagnes',
      exportContentCsv: 'Exporter le contenu (CSV)',
      exportPaidCsv: 'Exporter le brief de campagnes (CSV)',
      exportPaidCsvHint: 'Un pense-bête à garder sous la main pendant la création manuelle de vos campagnes (ou à transmettre à qui les crée pour vous) — noms suggérés, dates et budgets déjà calculés. Pas un fichier d\'import automatique.',
      exportGoogleAds: 'Exporter pour Google Ads Editor',
      exportGoogleAdsHint: 'Fichier au format d\'import CSV de Google Ads Editor (campagnes créées en pause — à vérifier et activer vous-même). Ne contient que les campagnes dont le canal mentionne "Google".',
      exportHintBoth: 'Deux exports, deux usages : le brief CSV est votre antisèche pour créer les campagnes vous-même (ou les confier à quelqu\'un) — noms, dates et budgets déjà calculés, prêts à copier-coller. Sur Google Ads en particulier ? Prenez plutôt "Exporter pour Google Ads Editor" : ce fichier-là s\'importe directement dans l\'outil et crée les campagnes pour vous, en pause, prêtes à vérifier puis activer.',
      totalPaidBudget: 'Budget média total',
      budgetDrift: (liveBudget) => `Le budget simulé dans « Stratégie Marketing » a changé (${liveBudget.toLocaleString()} €) — régénère pour l'appliquer ici.`,
      channelLink: 'Lien plateforme'
    },
    benchmarks: {
      title: 'Benchmarks',
      subtitle: 'Situez vos cibles face aux normes du secteur, générées par IA',
      empty: 'Générez des benchmarks sectoriels pour valider vos KPIs et votre budget : conversion, CAC, churn, activation, repères par canal et synthèse actionnable.',
      generate: 'Générer les benchmarks',
      regenerate: 'Régénérer',
      generating: 'Génération...',
      metric: 'Métrique',
      industry: 'Secteur',
      yours: 'Votre plan',
      verdictLabel: 'Verdict',
      verdict: { below: 'Sous la norme', onpar: 'Dans la norme', above: 'Au-dessus' },
      channels: 'Repères par canal',
      sources: 'Pour aller plus loin',
      byAi: 'Benchmarks générés par IA',
      byRules: 'Benchmarks générés localement (moteur à règles)'
    },
    veille: {
      title: 'Veille IA',
      subtitle: 'Une veille concurrentielle et marché générée par IA pour garder une longueur d\'avance',
      empty: 'Générez une veille 360° adaptée à votre produit et votre marché : concurrents à surveiller, tendances, signaux, opportunités, menaces et sources à suivre.',
      generate: 'Générer la veille',
      regenerate: 'Régénérer',
      generating: 'Génération...',
      competitors: 'Concurrents à surveiller',
      watchLabel: 'À surveiller',
      trends: 'Tendances du marché',
      signals: 'Signaux à guetter',
      opportunities: 'Opportunités',
      threats: 'Menaces',
      sources: 'Sources & mots-clés à suivre',
      byAi: 'Veille générée par IA',
      byRules: 'Veille générée localement (moteur à règles)'
    },
    copilot: {
      title: 'Nova',
      subtitle: 'Discutez avec votre plan en langage naturel : "réduis le budget marketing de 20%", "ajoute un persona B2C"...',
      openButton: 'Nova',
      placeholder: 'Ex : réduis le budget marketing de 20%...',
      send: 'Envoyer',
      thinking: 'Nova réfléchit...',
      empty: 'Posez une question ou demandez une modification, Nova se charge de tout le reste !',
      error: 'Nova est indisponible pour le moment. Réessayez dans un instant.',
      changesApplied: 'changement(s) appliqué(s) au plan — pensez à cliquer sur "Enregistrer" pour les conserver',
      noChanges: 'Aucune modification appliquée.',
      close: 'Fermer Nova',
      minimize: 'Réduire',
      expand: 'Agrandir',
      shrink: 'Rétrécir',
      newConversation: 'Nouvelle conversation',
      copyReply: 'Copier la réponse',
      copied: 'Copié !',
      inputHint: '↵ Envoyer · Maj+↵ Nouvelle ligne · ⌘K Ouvrir/fermer · Échap Fermer',
      openTooltip: 'Ouvrir Nova (⌘K)',
      suggestions: [
        'Réduis le budget marketing de 20%',
        'Ajoute un persona B2C',
        'Résume les principaux risques',
        'Propose une story prioritaire'
      ],
      greeting: { morning: 'Bonjour', afternoon: 'Bon après-midi', evening: 'Bonsoir' },
      historySearchPlaceholder: 'Rechercher une conversation…',
      historyEmpty: 'Aucune conversation enregistrée pour ce plan.',
      historyToday: "Aujourd'hui",
      historyWeek: '7 derniers jours',
      historyOlder: 'Plus ancien',
      historyDelete: 'Supprimer cette conversation'
    },
    agents: {
      title: 'Agents IA',
      subtitle: 'Des actions IA asynchrones qui tournent en tâche de fond, indépendamment de cette page : vous lancez, vous pouvez fermer l\'onglet, le résultat vous attend dans le journal ci-dessous',
      briefLabel: 'Rédiger un brief d\'exécution',
      briefDesc: 'Choisissez une story et l\'agent rédige un brief prêt à exécuter : étapes concrètes, ressources nécessaires, risques à anticiper.',
      kpiLabel: 'Recalculer les KPIs',
      kpiDesc: 'L\'agent réévalue vos cibles KPI à partir de l\'avancement réel de la roadmap (stories terminées, temps écoulé) — utile après quelques sprints, pour ne pas piloter sur des cibles figées au jour 1.',
      riskLabel: 'Analyser les risques du plan',
      riskDesc: 'L\'agent identifie 3 à 5 risques prioritaires spécifiques à votre produit et votre marché, avec une mitigation concrète pour chacun.',
      budgetLabel: 'Optimiser le budget marketing',
      budgetDesc: 'L\'agent revoit la répartition actuelle de votre budget par canal et propose des mouvements argumentés (augmenter, réduire, maintenir).',
      rescheduleLabel: 'Auto-scheduling dynamique',
      rescheduleDesc: 'L\'agent recalcule le planning des sprints à partir de l\'avancement réel et des dépendances bloquées, et propose des déplacements de stories.',
      prioritizeLabel: 'Priorisation par signaux externes',
      prioritizeDesc: 'L\'agent note les stories du backlog par urgence à partir de signaux marché externes (concurrence, tendances, demande utilisateurs).',
      selectStory: 'Choisir une story...',
      run: 'Lancer',
      apply: 'Appliquer',
      applied: 'Appliqué',
      logTitle: 'Journal d\'activité',
      logEmpty: 'Aucune action lancée pour le moment.',
      deleteTask: 'Supprimer cette génération',
      type: {
        story_brief: 'Brief d\'exécution',
        recalc_kpis: 'Recalcul des KPIs',
        risk_analysis: 'Analyse des risques',
        budget_optimization: 'Optimisation budgétaire',
        dynamic_reschedule: 'Auto-scheduling dynamique',
        external_signal_prioritization: 'Priorisation par signaux externes'
      },
      status: {
        queued: 'En attente',
        running: 'En cours',
        done: 'Terminé',
        error: 'Erreur'
      },
      severity: { high: 'Critique', medium: 'Modéré', low: 'Mineur' },
      direction: { increase: 'Augmenter', decrease: 'Réduire', maintain: 'Maintenir' },
      signal: { market_trend: 'Tendance marché', competitor_move: 'Mouvement concurrent', user_demand: 'Demande utilisateurs', regulatory: 'Réglementation' }
    },
    tracking: {
      title: 'Suivi post-lancement',
      subtitle: (kpiName) => `Prévisionnel vs réel sur "${kpiName}"`,
      actualValue: 'Valeur réelle',
      notePh: 'Note (optionnel) — ex : campagne payante lancée',
      addSnapshot: 'Ajouter',
      target: 'Cible',
      actual: 'Réel',
      onTrack: 'Dans les objectifs',
      behind: 'En dessous',
      empty: 'Ajoute ta première mesure réelle pour voir la tendance, la projection d\'atteinte d\'objectif et l\'écart avec le prévisionnel.',
      launchLabel: 'Lancement:',
      editLaunchDate: 'Modifier la date de lancement',
      notLaunchedYet: (date) => `Lancement prévu le ${date}.`,
      daysUntilLaunch: (n) => `Le suivi s'activera dans ${n} jour${n > 1 ? 's' : ''}. Tu peux corriger la date ci-dessus si besoin.`,
      currentValue: 'Valeur actuelle',
      ofTargetPct: (pct) => `${pct}% de l'objectif`,
      trend: 'Tendance',
      perWeek: '/ semaine',
      projection: 'Projection',
      projectionReached: 'Objectif atteint',
      projectionOn: (date) => `Atteint vers le ${date}`,
      projectionNone: 'Rythme insuffisant pour atteindre l\'objectif',
      projectionNoTarget: 'Pas d\'objectif chiffré',
      needMorePoints: 'Ajoute 2 mesures pour voir la tendance',
      daysSinceLaunch: 'Jours depuis le lancement',
      noHistoryYet: 'Aucune mesure',
      selectKpi: 'KPI suivi',
      viewHistory: (n) => `Voir l'historique (${n})`,
      hideHistory: 'Masquer l\'historique',
      quickAddLabel: 'Ajouter une mesure'
    },
    whatif: {
      title: 'Simulateur budget & timeline',
      subtitle: 'Ajuste le budget et la durée pour voir l\'impact en direct sur tes finances, ta roadmap et ton marketing — sans rien modifier au plan initial',
      budgetLabel: 'Budget',
      timelineLabel: 'Durée',
      currentPlan: 'Plan actuel',
      simulated: 'Simulation',
      burnLabel: 'Burn/mois',
      runwayLabel: 'Runway',
      breakEvenLabel: 'Seuil (clients)',
      sprintsLabel: 'Sprints',
      channelsTitle: 'Répartition marketing simulée',
      weeksUnit: 'semaines',
      vsCurrent: 'vs plan actuel'
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
      persona: {
        painPoints: 'Points de douleur',
        goals: 'Objectifs',
        channel: 'Canal préféré',
        trigger: 'Déclencheur d\'achat'
      },
      sprint: 'Sprint',
      duration: 'Durée',
      estimatedCost: 'Coût estimé',
      weeks: 'semaines',
      timelineMismatch: (roadmapWeeks, targetWeeks) => `Cette roadmap dure ${roadmapWeeks} semaines, mais le délai visé dans Budget & Délai est de ${targetWeeks} semaines — reconstruis la roadmap pour les aligner, ou ignore ce message si l'écart est voulu.`,
      roadmapSubtitle: 'Plan d\'exécution par sprints',
      prepStartLabel: 'Début des sprints :',
      editPrepStartDate: 'Modifier la date de début des sprints',
      projectedLaunchLabel: 'Lancement visé :',
      prepStartHint: 'Date à laquelle le Sprint 1 démarre — change-la si le travail a réellement commencé avant ou après aujourd\'hui. La roadmap, le Gantt, le burndown et le calendrier se recalculent à partir d\'elle.',
      projectedLaunchHint: 'Cette date + la durée totale des sprints ci-dessous. Le slider "Délai" de la carte Budget & Délai ne fait que déplacer cette date cible affichée — il ne change PAS la durée réelle des sprints (ça exigerait de les reconstruire, avec perte du travail déjà fait). Pour que la roadmap corresponde vraiment au nouveau délai, il faut la reconstruire : il n\'existe pas de méthode qui étende une roadmap déjà planifiée sans repartir de zéro.',
      kpiSubtitle: 'Métriques principales de succès',
      kpiPrimaryBadge: 'KPI principal',
      kpiViewCards: 'Cartes',
      kpiViewTable: 'Tableau',
      kpiTableName: 'KPI',
      kpiTableTarget: 'Cible',
      kpiTableFormula: 'Formule',
      kpiTableFrequency: 'Fréquence',
      marketingChannelsTitle: 'Canaux de marketing',
      marketingBudgetLabel: 'Budget marketing',
      marketingBudgetCapHint: (max) => `Plafonné au budget total du lancement (${max})`,
      budgetTimeline: {
        title: 'Budget & Délai',
        subtitle: 'Source unique du budget total et du délai visé — pilote le prévisionnel financier, le budget marketing et la carte d\'identité du plan',
        budgetLabel: 'Budget total du lancement',
        timelineLabel: 'Délai visé jusqu\'au lancement',
        weeks: (n) => n === 1 ? '1 semaine' : `${n} semaines`,
        hint: 'La roadmap (nombre de sprints, stories déjà planifiées) ne change pas automatiquement avec le délai — seule la date de lancement cible se met à jour, pour ne jamais écraser silencieusement le travail déjà fait sur la roadmap.',
        regenerateButton: 'Reconstruire la roadmap à partir du délai actuel',
        regenerateConfirmTitle: 'Reconstruire la roadmap ?',
        regenerateConfirmBody: 'Ça remplace entièrement les sprints et stories actuels par une nouvelle roadmap basée sur le délai en cours. Tout ce qui a déjà été généré ou modifié sur la roadmap (déplacements de stories, statuts, éditions manuelles) sera perdu — cette action ne peut pas être annulée une fois enregistrée.',
        regenerateCancel: 'Annuler',
        regenerateConfirm: 'Reconstruire quand même'
      },
      allocatedLabel: 'Alloué aux canaux actifs',
      enableChannel: 'Activer ce canal',
      disableChannel: 'Désactiver ce canal',
      viewAssets: 'Voir les contenus prêts à l\'emploi',
      executiveSummaryTitle: 'Résumé exécutif',
      strategyLabel: 'Stratégie',
      marketingScopeNote: 'Cette carte définit la répartition budgétaire par canal (combien et où) — le détail d\'exécution semaine par semaine (quoi publier, sur quel format) se trouve dans le Calendrier de contenu & publicité, qui reprend volontairement les mêmes canaux à un niveau tactique.',
      risksLabel: 'Risques',
      budgetAvailable: (amount) => `Budget disponible : ${amount}`,
      effort: 'Effort',
      cost: 'Coût',
      dependsOn: 'Dépend de',
      risks: 'Risques',
      budget: 'Budget',
      goal: 'Objectif',
      assets: {
        post: 'Post',
        email: 'Objet email',
        landing: 'Accroche landing'
      },
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
      abSubtitle: 'Calcule combien de visiteurs et de temps il te faut avant de pouvoir te fier au résultat d\'un test A/B',
      abBaselineHint: 'Le taux de conversion actuel de la variante que tu testes (ex : 3 signups sur 100 visiteurs = 3%)',
      abMdeHint: 'Le plus petit écart entre les deux variantes que tu veux pouvoir détecter (ex : 20% = passer de 3% à 3,6%)',
      abVisitorsHint: 'Le trafic quotidien envoyé sur chaque variante testée — n\'influence que la durée estimée ci-dessous, jamais la taille d\'échantillon requise (elle ne dépend que du taux de base et de l\'écart minimal détectable)',
      abResultCaption: 'Avec ces hypothèses, il te faut ce volume par variante avant de pouvoir affirmer que l\'écart de conversion entre A et B n\'est pas dû au hasard',
      channel: 'Canal',
      name: 'Nom',
      unit: 'Unité',
      baseline: 'Référence',
      category: 'Poste',
      executiveSummary: 'Résumé exécutif',
      copySummary: 'Copier le résumé',
      summaryCopied: 'Copié !',
      planReadyTitle: 'Ton plan de lancement est prêt !',
      planReadySubtitle: (dateTime) => `Généré à l'instant, ${dateTime}.`,
      planLoadedTitle: 'On reprend où tu t\'es arrêté ?',
      planLoadedSubtitle: (dateTime) => `Ce plan a été généré ${dateTime}. Chaque évolution est enregistrée dans l'historique →`,
      historyPanelTitle: 'Historique',
      historyExpand: 'Ouvrir l\'historique',
      historyCollapse: 'Réduire l\'historique',
      historyClear: 'Vider l\'historique',
      historyClearConfirmTitle: 'Supprimer tout l\'historique ?',
      historyClearConfirmBody: 'Cette action efface définitivement le journal des modifications de ce plan. Le plan lui-même n\'est pas touché — seul l\'historique disparaît, et c\'est irréversible.',
      historyClearCancel: 'Annuler',
      historyClearConfirm: 'Oui, tout supprimer',
      assets: {
        post: 'Brief de post',
        email: 'Objet email',
        landing: 'Accroche landing'
      },
      financials: {
        title: 'Prévisionnel financier',
        subtitle: 'Estimation simplifiée à partir de votre budget total',
        monthlyBurn: 'Dépense mensuelle',
        runway: 'Runway',
        months: 'mois',
        breakEven: 'Seuil de rentabilité',
        clients: 'clients payants',
        breakEvenNote: (users, revenue, arpu) => `≈ ${revenue.toLocaleString()} €/mois à ${arpu} €/client`,
        arpuLabel: 'Pourquoi cet ARPU :',
        breakdown: 'Répartition du budget',
        runwayChartTitle: 'Trajectoire du budget',
        runwayChartSubtitle: 'Budget restant mois par mois, au rythme de dépense actuel',
        runwayDepleted: 'Budget épuisé',
        bridgeTitle: 'Coût vs revenu nécessaire',
        bridgeSubtitle: 'Ce qu\'il vous en coûte par mois, face à ce qu\'il faut générer pour atteindre l\'équilibre',
        bridgeCost: 'Dépense mensuelle',
        bridgeRevenue: 'Revenu requis'
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
        status: { todo: 'À faire', inProgress: 'En cours', done: 'Terminé' },
        moveToCurrent: 'Reporter au sprint courant',
        current: 'Sprint en cours',
        progress: 'complété'
      }
    },
    notifCenter: {
      title: 'Notifications',
      empty: 'Aucune notification pour le moment.',
      markAllRead: 'Tout marquer comme lu',
      deleteAll: 'Tout supprimer',
      confirmDeleteAll: 'Supprimer définitivement toutes les notifications ?'
    },
    cookieBanner: {
      title: 'Avant de lancer votre prochain plan...',
      body: "On garde ça aussi minimaliste qu'une bonne roadmap : de quoi vous reconnaître, retenir vos préférences et sauvegarder vos brouillons. Rien qui traîne, rien qui espionne — et vous décidez pour le reste.",
      essentialTitle: 'Essentiels',
      essentialBody: 'Toujours actifs',
      preferencesTitle: 'Préférences',
      preferencesBody: 'Optionnel',
      analyticsTitle: 'Statistiques',
      analyticsBody: 'Optionnel',
      marketingTitle: 'Marketing',
      marketingBody: 'Optionnel',
      acceptAll: 'Tout accepter',
      savePrefs: 'Enregistrer mes choix',
      learnMore: 'En savoir plus',
      continueWithoutAgreeing: 'Continuer sans accepter',
      settingsTitle: 'Paramètres',
      settingsBody: "Chaque catégorie correspond à un usage précis. Préférences mémorise votre thème, votre langue et vos réglages d'affichage d'une visite à l'autre. Statistiques active Cloudflare Web Analytics pour mesurer la fréquentation du site. Marketing active Meta Pixel et LinkedIn Insight Tag pour mesurer l'efficacité de nos campagnes publicitaires. Activez uniquement ce que vous souhaitez : aucune catégorie optionnelle ne se déclenche sans votre accord.",
      collapse: 'Réduire',
      reopen: 'Cookies & vie privée'
    },
    collab: {
      presenceTitle: 'Personnes ayant ce plan ouvert en ce moment',
      viewing: (n) => n === 1 ? '1 autre personne ici' : `${n} autres personnes ici`,
      onlineSuffix: 'est connecté·e',
      moreOnline: (n) => `+${n} autre${n > 1 ? 's' : ''}`,
      toastMultiple: (n) => `a modifié ${n} éléments de la roadmap`
    },
    export: {
      title: 'Exporter le plan',
      json: 'Export JSON',
      csv: 'Export CSV',
      pdf: 'Export PDF',
      pptx: 'Export pitch deck (PPTX)',
      image: 'Export image (PNG)',
      complianceReport: 'Rapport investisseurs',
      complianceNoFinancials: "Aucune donnée financière générée pour ce plan pour l'instant.",
      complianceNoRgpd: "Aucune analyse RGPD générée pour ce plan pour l'instant — lancez-la depuis la section RGPD avant d'exporter ce rapport pour qu'il soit complet.",
      complianceDisclaimer: "Document généré automatiquement à titre indicatif, à faire valider par un conseil juridique et financier avant transmission à des investisseurs ou partenaires.",
      integrations: 'Intégrations',
      notion: 'Exporter vers Notion',
      notionExporting: 'Export vers Notion...',
      notionConnecting: 'Connexion à Notion...',
      notionOpen: 'Ouvrir la page Notion →',
      notionNoParent: "Aucune page partagée avec l'intégration. Dans Notion, partage une page avec VelocityLaunch puis réessaie.",
      notionSignIn: 'Connecte-toi pour exporter vers Notion.',
      notionCancelled: 'Connexion Notion annulée.',
      notionUnavailable: "Export Notion indisponible pour le moment.",
      notionSync: 'Synchroniser vers Notion',
      notionSyncing: 'Synchronisation...',
      notionPartial: (n) => `Synchronisé, mais ${n} story(ies) n'ont pas pu être mises à jour. Réessaie.`,
      jira: 'Exporter vers Jira',
      jiraExporting: 'Export vers Jira...',
      jiraConnecting: 'Connexion à Jira...',
      jiraSite: 'Site Jira',
      jiraProject: 'Projet',
      jiraConfirm: 'Créer les tickets',
      jiraOpen: 'Ouvrir le board Jira →',
      jiraDone: (created, updated) => `${created} ticket(s) créé(s)${updated ? `, ${updated} mis à jour` : ''}.`,
      jiraSignIn: 'Connecte-toi pour exporter vers Jira.',
      jiraCancelled: 'Connexion Jira annulée.',
      jiraNoProjects: 'Aucun projet Jira accessible. Vérifie tes droits sur un projet.',
      jiraUnavailable: 'Export Jira indisponible pour le moment.',
      jiraReconnect: 'Reconnecter Jira (nouveaux droits)',
      linear: 'Exporter vers Linear',
      linearExporting: 'Export vers Linear...',
      linearApiKey: 'Clé API personnelle Linear',
      linearApiKeyHelp: 'Crée une clé dans Linear (Settings > Security & access) et colle-la ici.',
      linearApiKeyLink: 'Créer une clé API →',
      linearConnect: 'Connecter',
      linearInvalidKey: 'Clé API invalide ou révoquée.',
      linearTeam: 'Équipe Linear',
      linearConfirm: 'Créer les tickets',
      linearOpen: 'Ouvrir Linear →',
      linearDone: (created, updated) => `${created} ticket(s) créé(s)${updated ? `, ${updated} mis à jour` : ''}.`,
      linearSignIn: 'Connecte-toi pour exporter vers Linear.',
      linearNoTeams: 'Aucune équipe Linear accessible avec cette clé.',
      linearUnavailable: 'Export Linear indisponible pour le moment.',
      linearReconnect: 'Reconnecter Linear (nouvelle clé)',
      gcal: 'Exporter vers Google Calendar',
      gcalExporting: 'Export vers Google Calendar...',
      gcalConnecting: 'Connexion à Google Calendar...',
      gcalCalendar: 'Calendrier',
      gcalConfirm: 'Créer les événements',
      gcalOpen: 'Ouvrir Google Calendar →',
      gcalDone: (created, updated) => `${created} événement(s) créé(s)${updated ? `, ${updated} mis à jour` : ''}.`,
      gcalSignIn: 'Connecte-toi pour exporter vers Google Calendar.',
      gcalCancelled: 'Connexion Google Calendar annulée.',
      gcalNoCalendars: 'Aucun calendrier accessible en écriture sur ce compte Google.',
      gcalUnavailable: 'Export Google Calendar indisponible pour le moment.',
      gcalReconnect: 'Reconnecter Google Calendar (nouveaux droits)',
      github: 'Synchroniser vers GitHub',
      githubSyncing: 'Synchronisation vers GitHub...',
      githubConnecting: 'Connexion à GitHub...',
      githubRepo: 'Dépôt',
      githubConfirm: 'Créer les issues',
      githubOpen: 'Ouvrir les issues GitHub →',
      githubDone: (created, updated) => `${created} issue(s) créée(s)${updated ? `, ${updated} mise(s) à jour` : ''}.`,
      githubSignIn: 'Connecte-toi pour synchroniser vers GitHub.',
      githubCancelled: 'Connexion GitHub annulée.',
      githubNoRepos: 'Aucun dépôt accessible avec les droits de création d\'issues.',
      githubUnavailable: 'Synchronisation GitHub indisponible pour le moment.',
      githubReconnect: 'Reconnecter GitHub',
      close: 'Fermer'
    },
    errors: {
      generic: 'Une erreur est survenue. Réessaie.'
    },
    modals: {
      pricing: {
        title: 'Tarification',
        intro: 'Commence gratuitement, passe en Pro quand tu en as besoin — sans engagement, annulable à tout moment.'
      },
      changelog: {
        title: 'Changelog',
        entries: [
          {
            date: '23 août 2026',
            title: 'Santé du portefeuille simplifiée : pénalité fixe plafonnée, plus de proportionnalité',
            items: [
              'Retire la pénalité proportionnelle au nombre de plans (jugée trop difficile à suivre) : chaque échéance urgente coûte maintenant 10 pts fixes (plafonné à -30 au total), chaque échéance proche 4 pts fixes (plafonné à -15) — plus simple à vérifier soi-même',
              'Retire la ligne "Aucune échéance urgente" qui faisait doublon, en apparence contradictoire, avec la phrase de détail juste en dessous (qui parle, elle, des échéances "urgentes" ET "proches") — une seule phrase de détail désormais',
              'Corrige les puces blanches parasites à gauche des points de couleur dans la liste "Par plan" (puce par défaut du navigateur sur les `<li>`, jamais désactivée)'
            ]
          },
          {
            date: '23 août 2026',
            title: 'Avatars sur les notifications, popup calendrier corrigée à gauche, points restants',
            items: [
              'Centre de notifications et fil d\'activité du Dashboard : petit avatar à gauche de chaque ligne — initiales colorées quand un nom est repérable, avatar de Nova pour les notifications système (génération IA)',
              'Corrige la popup d\'un jour du calendrier qui n\'était pas scrollable côté gauche de la grille (rognée par l\'overflow de la carte de widget) — rendue désormais hors de la carte, comme les menus contextuels et infobulles déjà corrigés',
              '"Prochaines échéances" : affiche maintenant les points restants pour CHAQUE fin de sprint (auparavant seulement si non nul), avec "Tout est fait ✓" quand le sprint est bouclé'
            ]
          },
          {
            date: '23 août 2026',
            title: 'Jauge de Santé du portefeuille segmentée par plan, indice d\'info-bulle',
            items: [
              'La jauge elle-même se divise maintenant en un segment coloré par plan (vert/orange/rouge selon son niveau) au lieu d\'un seul arc pour le score agrégé — on voit d\'un coup d\'œil, sans survoler, quel(s) plan(s) plombent le portefeuille',
              'Chaque segment de la jauge a sa propre info-bulle native au survol (nom du plan + détail du calcul), en plus de celle déjà présente sur la liste "Par plan"',
              'Ajoute une petite icône "?" à côté de "Par plan" : seul indice qu\'une info-bulle existe au survol, invisible jusque-là'
            ]
          },
          {
            date: '23 août 2026',
            title: 'Clarté sur Santé du portefeuille, alignement du bouton Suivant, corrections diverses',
            items: [
              'Santé du portefeuille : la phrase de détail reformulée en vraies phrases ("62% des stories sont terminées. 2 échéances proches (-10 pts).") plutôt qu\'un format compact peu explicite ("62% terminé · -10 pts (2 bientôt)")',
              'Santé du portefeuille : chaque ligne "Par plan" affiche désormais au survol le détail du calcul propre à CE plan, pas seulement le score agrégé de la carte',
              'Repère de couleur du sprint dans le popover du calendrier : passé de vertical à horizontal (retour utilisateur)',
              'Formulaire de création de plan : corrige le bouton "Suivant" qui retombait sur sa propre ligne au lieu de rester aligné avec Précédent/Continuer plus tard/Mes brouillons sur les largeurs d\'écran intermédiaires',
              'Corrige à nouveau le chevauchement du widget "Historique des plans" en taille Petit : le titre tronque maintenant sur une seule ligne au lieu de repasser à la ligne et de chevaucher le premier élément de la liste'
            ]
          },
          {
            date: '23 août 2026',
            title: 'Santé du portefeuille par plan, points restants sur les échéances, calendrier par sprint',
            items: [
              'Santé du portefeuille (tailles Moyen/Grand) : ajoute une ventilation "Par plan" — chaque plan avec son propre score et son niveau, triés du moins bon au meilleur, pour repérer d\'un coup d\'œil lequel tire la moyenne vers le bas plutôt qu\'un seul score agrégé',
              'Prochaines échéances : les fins de sprint affichent maintenant les points restants (stories pas encore terminées) directement dans la liste',
              'Calendrier du Dashboard : les sprints actifs affichent une ligne colorée continue (une couleur par sprint) sur toute leur durée, plutôt qu\'une même teinte uniforme pour tous les sprints — deux sprints qui se chevauchent restent maintenant distinguables d\'un coup d\'œil',
              'Corrige le débordement de texte du widget "Historique des plans" en taille Petit'
            ]
          },
          {
            date: '23 août 2026',
            title: 'Streak avec record + paliers, légende détaillée sur les 3 nouveaux widgets',
            items: [
              'Streak : garde maintenant le record du plus long streak jamais atteint (dérivé du même historique de plans, sans stockage séparé), affiché à côté du streak en cours',
              'Streak : paliers visuels — flamme dégradée dès 7 jours ("En feu 🔥"), flamme dorée dès 30 jours ("Imparable ⚡"), badge visible même en taille Petit',
              'Santé du portefeuille, Streak et Météo business affichent désormais une légende complète (seuils, paliers, méthode de calcul exacte) en taille Moyen/Grand — plus besoin de deviner ce que représente le chiffre affiché'
            ]
          },
          {
            date: '23 août 2026',
            title: 'Santé du portefeuille : pénalité d\'échéance proportionnelle au nombre de plans',
            items: [
              'La pénalité retirée pour une échéance urgente/proche était un forfait fixe (-12/-4 pts par échéance), identique qu\'on ait 1 seul plan en cours ou un portefeuille de 10 — 2 échéances urgentes suffisaient à écraser un score autrement excellent',
              'Devient proportionnelle au nombre de plans (échéances / plans, plafonné), avec un budget de points max par catégorie plutôt qu\'un montant fixe : 1 urgence sur 1 plan reste sévèrement pénalisée, la même urgence sur 10 plans beaucoup moins',
              'Le détail affiché dans la carte reflète maintenant les points réellement retirés, pas le forfait fixe d\'avant'
            ]
          },
          {
            date: '23 août 2026',
            title: 'Météo business avec une vraie tendance, Streak basé sur l\'activité réelle',
            items: [
              'Météo business : jusqu\'ici un simple re-habillage visuel de la Santé du portefeuille (même score, juste une icône différente) — compare désormais le score à celui d\'il y a 7 jours (historique local) pour afficher une vraie tendance ("En amélioration +12 pts", "En recul -8 pts"...)',
              'Streak : ne compte plus juste le fait d\'avoir ouvert le Dashboard, mais un vrai jour d\'activité (plan créé, sauvegardé ou modifié) — dérivé des horodatages des plans, donc identique quel que soit l\'appareil utilisé, contrairement à l\'ancien compteur local',
              'Les trois widgets (Santé du portefeuille, Streak, Météo business) affichent maintenant une ligne "comment c\'est calculé" directement dans leur carte'
            ]
          },
          {
            date: '23 août 2026',
            title: 'Dashboard en thème clair sans photo de fond, bibliothèque de widgets élargie',
            items: [
              'Dashboard, thème clair : la photo de fond assombrie est remplacée par un dégradé uni clair légèrement bleuté (tons violet/bleu/cyan très pâles) — elle jurait avec un thème clair quel que soit le niveau d\'assombrissement essayé. Le titre d\'accueil et le bouton "+" widgets retrouvent une couleur adaptée à un fond clair plutôt que le blanc forcé pensé pour la photo',
              'Bibliothèque de widgets : panneau et champ "Chercher des widgets" élargis — le texte du champ dépassait encore légèrement du cadre'
            ]
          },
          {
            date: '23 août 2026',
            title: 'Bibliothèque de widgets en verre dépoli, texte blanc sur Budget cumulé et Mon compte',
            items: [
              'Bibliothèque de widgets : aspect verre dépoli (fond translucide + flou) sur tout le panneau, cartes et barre latérale comprises, plutôt qu\'un fond plein opaque',
              'Corrige le champ "Chercher des widgets" dont le texte débordait légèrement du cadre',
              'Tuile "Budget cumulé" (espace d\'équipe) : "Détails en cliquant" repassé en blanc, illisible en thème clair (c\'est un bouton, qui n\'héritait pas de la couleur blanche du reste de la tuile)',
              'Mon compte, thème clair : "Membre Pro" et sa description redevenus lisibles sur la photo de fond (texte sombre par défaut, quasiment invisible sur l\'encart quasi transparent)'
            ]
          },
          {
            date: '23 août 2026',
            title: 'Bibliothèque de widgets : panneau ancré en bas façon macOS, badge "Nouveautés" et infobulles corrigés',
            items: [
              'Le panneau de la bibliothèque de widgets ("+") ne flotte plus au centre de l\'écran : il glisse depuis le bas et reste ancré au bord inférieur, coins arrondis en haut seulement — comme le centre de widgets macOS',
              'Badge "Nouveautés" repensé : déplacé au-dessus du bouton Ajouter/Ajouté (colonne dédiée) au lieu d\'être accolé au titre, qui se retrouvait écrasé à 1-2 caractères et le badge finissait par chevaucher le bouton',
              'Infobulles au survol (aperçus de plans des cartes d\'espace, galerie publique) : rognées par le cadre arrondi de leur widget dès qu\'elles apparaissaient près d\'un bord — rendues maintenant hors de la carte (comme le menu "Taille"), elles ne sont plus jamais coupées'
            ]
          },
          {
            date: '23 août 2026',
            title: 'Corrections UX : bouton Nova, badge "Actuel", centre de notifications, liens dans les exports',
            items: [
              'Bouton "Demander à Nova" (widget résumé de la semaine) : passe en bordure et texte dégradé violet-bleu-cyan, comme les autres boutons de génération IA',
              'Badge "Actuel" sur la carte d\'espace personnel/équipe : texte repassé en blanc (illisible sur le dégradé dans certains cas)',
              'Centre de notifications : panneau élargi (340px → 400px) et bulle de confirmation de suppression élargie (220px → 260px) — le bouton "Supprimer" et le texte de "Tout marquer comme lu" débordaient du cadre',
              'Benchmarks : espace ajouté entre le titre "Pour aller plus loin" et les cartes de lien, qui étaient visuellement collés',
              'Exports (CSV, PDF, Notion) : les liens web (sources Veille, sources Benchmarks, ressources officielles RGPD, plateformes du calendrier de contenu/publicité) étaient soit tronqués à leur seul libellé, soit absents de la section — les URLs apparaissent maintenant partout, cliquables en PDF et Notion'
            ]
          },
          {
            date: '23 août 2026',
            title: 'Bibliothèque de widgets façon macOS sur le Dashboard',
            items: [
              'Nouveau bouton "+" à côté de "Créer un plan" : ouvre une bibliothèque de widgets (recherche, catégories, ajout/retrait en un clic) inspirée du centre de widgets macOS — jusqu\'ici la grille du Dashboard ne permettait que de réordonner et redimensionner les widgets déjà affichés, jamais d\'en retirer ou d\'en ajouter',
              'Calendrier et "Reprendre" restent toujours affichés ; tous les autres widgets (échéances, activité, résumé Nova, historique, galerie...) peuvent être retirés puis ré-ajoutés à tout moment sans perdre leur position',
              'Trois nouveaux widgets à ajouter depuis la bibliothèque : "Santé du portefeuille" (jauge d\'avancement global), "Streak" (jours d\'activité consécutifs) et "Météo business" (dynamique récente en un coup d\'œil) — masqués par défaut'
            ]
          },
          {
            date: '23 août 2026',
            title: 'Cartes de lien avec favicon sur Veille, Benchmarks, RGPD et le calendrier GTM',
            items: [
              'Ces quatre sections générées par IA ne pointaient vers aucun vrai lien externe (RGPD réutilisait une liste statique de 4 liens strictement identique à chaque plan) — remplacé par de vraies cartes de lien (favicon + titre + domaine) vers des sites réels, différentes à chaque génération',
              'RGPD : le pool de ressources officielles passe de 4 à 10 (CNIL, EDPB, EUR-Lex, IAPP, ANSSI...), dont 5 sont tirées différemment selon le plan',
              'Veille : le champ "sources" devient de vrais liens cliquables plutôt que de simples étiquettes de texte',
              'Benchmarks : nouvelle section "Pour aller plus loin" avec 3 à 5 références sectorielles réelles',
              'Calendrier GTM (éditorial + publicitaire) : le nom du canal (LinkedIn, Google Ads, TikTok Ads...) devient un lien cliquable vers la plateforme officielle'
            ]
          },
          {
            date: '23 août 2026',
            title: 'Dashboard en widgets déplaçables et redimensionnables façon macOS',
            items: [
              'Le Dashboard principal passe entièrement en widgets indépendants — calendrier, prochaines échéances, activité récente, résumé Nova, "Reprendre", une carte par espace (personnel + équipes), "Créer une équipe", "Voir tout l\'historique" et "Galerie publique" : glisser-déposer pour réordonner, clic droit → Petit/Moyen/Grand pour redimensionner — même interaction que le centre de notifications ou le bureau macOS. Disposition mémorisée par utilisateur, qui s\'adapte automatiquement si le nombre d\'équipes change.',
              'Corrige le glisser-déposer qui échouait parfois entre deux widgets de tailles très différentes',
              '"Bonjour X" repositionné tout en haut de la page, avant les widgets, réécrit en un seul message continu (nom, aperçu du jour, rappel du plan Pro/Gratuit, encouragement) plutôt que plusieurs phrases séparées'
            ]
          },
          {
            date: '23 août 2026',
            title: 'Dashboard : fil d\'activité, résumé Nova, carte "Reprendre" en verre dépoli',
            items: [
              'Nouveaux widgets en haut du Dashboard : "Activité récente" (5 derniers événements tous espaces confondus) et "Résumé de la semaine" généré par Nova sur demande (Pro), à partir de statistiques déjà agrégées (jamais les plans complets)',
              'Carte "Reprendre" (dernier plan touché) recentrée dans l\'espace resté libre entre les cartes d\'espace et le calendrier, sous forme de carré en verre dépoli',
              'Calendrier du Dashboard en mode clair : voile blanc remonté à 88% d\'opacité (les chiffres devenaient illisibles depuis l\'assombrissement du fond de page)',
              '"Mes plans" : titre agrandi, les 4 actions (Charger/Partager/Dupliquer/Supprimer) alignées sur une grille de largeur identique',
              'Bandeau "On reprend où tu t\'es arrêté ?" : fond dégradé retiré, ne reste que la bordure et un titre en texte dégradé, lisible nativement dans les deux thèmes'
            ]
          },
          {
            date: '23 août 2026',
            title: 'Vraies cases à cocher PDF, export HTML du rapport financier, icônes des exports',
            items: [
              'Rapport investisseurs (PDF) : la checklist RGPD utilise désormais de vraies cases à cocher interactives (cochables dans Acrobat/Preview), plus des symboles qui s\'affichaient en carré vide selon le lecteur PDF',
              'Rapport financier (Word) : titre et sous-titre nettement réduits (ils utilisaient le style par défaut de Word, démesuré)',
              'Nouvel export HTML du rapport financier : page autonome au rendu proche de l\'app (halos dégradés, cartes en verre dépoli, graphiques identiques)',
              'Icônes ajoutées sur tous les boutons d\'export, du rapport financier et de la fenêtre d\'export générale du plan (PDF, Word, HTML, PPTX, CSV, JSON, PNG, RGPD)'
            ]
          },
          {
            date: '23 août 2026',
            title: 'Rapport financier : export PDF/Word, graphique amélioré ; notifications et Gantt affinés',
            items: [
              'Rapport financier par plan : export dédié en PDF et en Word (synthèse des budgets, KPIs, trésorerie mois par mois, répartition des coûts, pont coûts/revenus), avec la marque personnalisée déjà configurable',
              'Montant total du plan mis en avant visuellement dans le rapport financier',
              'Projection de trésorerie : mois nommés en toutes lettres, axe des montants et légende ajoutés pour un rendu plus lisible',
              'Notifications de collaboration sur la roadmap : détail de chaque story modifiée avec son identifiant, en plus du statut/sprint/assignation/effort',
              'Gantt interactif : le popup de détail d\'une story ne se superpose plus aux barres des autres métiers'
            ]
          },
          {
            date: '23 août 2026',
            title: 'Dashboard : calendrier des sprints, avancement global interactif, rapport financier par plan',
            items: [
              'Le calendrier du tableau de bord met en évidence tous les sprints actifs (tous plans confondus), pas seulement leur date de fin — cliquer un jour ouvre le détail (plans, sprints, stories) avec accès direct au plan',
              '"Prochaines échéances" affiche la date exacte de chaque échéance, un badge coloré selon l\'urgence, et redirige directement vers le plan au clic',
              'Avancement global (dashboard du plan) en double anneau SVG interactif : une part par story sur la couronne extérieure, le % agrégé sur l\'anneau intérieur, info-bulle au survol de chaque part',
              '"Charge par responsable" et les barres de "Vélocité par sprint" reflètent les vrais membres de l\'équipe (assignation nominative depuis le Backlog), plus des rôles génériques',
              'Nouveau rapport financier par plan, façon feuille investisseurs, ouvert depuis "Budget cumulé" en espace d\'équipe',
              'Titre du plan renommable directement depuis la carte d\'identité'
            ]
          },
          {
            date: '22 août 2026',
            title: 'Carte "Budget & Délai" : source unique pour le budget total et le délai de lancement',
            items: [
              'Nouvelle carte dans l\'onglet Go-to-market avec deux sliders — budget total du lancement et délai visé — qui pilotent le prévisionnel financier, le plafond du budget marketing et la carte d\'identité du plan',
              'Le budget marketing ne peut plus dépasser le budget total : il se rabaisse automatiquement si le total redescend en dessous',
              'Le délai déplace la date de lancement cible partout où elle est affichée, sans reconstruire la roadmap déjà planifiée (sprints, statuts, déplacements de stories) pour ne jamais écraser du travail déjà fait',
              'Nouveau bouton "Reconstruire la roadmap à partir du délai actuel" pour ceux qui veulent repartir sur de nouvelles bases — avertissement explicite avant confirmation : ça remplace entièrement sprints, stories, statuts et déplacements déjà en place'
            ]
          },
          {
            date: '22 août 2026',
            title: 'Bandeau de conseils IA et calendrier sur le dashboard',
            items: [
              'Le "Conseil du jour" est désormais généré par IA côté serveur (thèmes tech : positionnement, pricing, onboarding, rétention, acquisition, légal, organisation d\'équipe), renouvelé toutes les 15 minutes, affiché en bandeau défilant pleine largeur sous le header',
              'Nouveau widget calendrier mensuel façon Apple Calendar : jour courant repéré, points sous les dates de lancement de tes plans, navigation mois précédent/suivant',
              'La carte "Prochaines échéances" passe sous le calendrier plutôt qu\'à côté'
            ]
          },
          {
            date: '22 août 2026',
            title: 'Conseil du jour et prochaines échéances sur le dashboard',
            items: [
              'Nouvelle carte "Conseil du jour" : un conseil lié au lancement produit/growth, différent chaque jour, calculé localement (aucune donnée envoyée)',
              'Nouvelle carte "Prochaines échéances" : liste les dates de lancement à venir sur l\'ensemble de tes plans, triées par proximité'
            ]
          },
          {
            date: '22 août 2026',
            title: 'Personas et Finances ajoutés à la comparaison de versions',
            items: [
              'La bibliothèque de versions "avant/après" détecte désormais aussi les changements de personas (ajoutés, retirés, champs modifiés) et de finances (dépenses mensuelles, trésorerie, ARPU, seuil de rentabilité, répartition des coûts)'
            ]
          },
          {
            date: '22 août 2026',
            title: 'OCR pour les documents scannés du questionnaire',
            items: [
              'L\'import de document (questionnaire) accepte désormais aussi les photos/scans (JPG, PNG, WebP), et détecte automatiquement les pages PDF sans texte sélectionnable — jusqu\'ici silencieusement ignorées ("aucun texte trouvé")',
              'Reconnaissance de caractères (OCR) déclenchée uniquement sur les pages/images qui en ont besoin, 100% dans le navigateur (rien n\'est envoyé à un service tiers) — indicateur de progression "page X/Y" pendant l\'analyse, et rappel de relire le texte extrait avant de générer le plan'
            ]
          },
          {
            date: '22 août 2026',
            title: 'Photos Pexels dans le sélecteur de couverture',
            items: [
              'Nouvel onglet "Pexels" dans le choix de couverture de plan : recherche par mot-clé, résultats en grille, sélection directe — même principe que Notion avec Unsplash',
              'Recherche effectuée côté serveur (clé API jamais exposée au navigateur), attribution du photographe visible au survol de chaque photo'
            ]
          },
          {
            date: '21 août 2026',
            title: 'Nova gère de vraies conversations multiples, façon Cloudflare AI',
            items: [
              'Nova ne se limitait qu\'à un seul fil de discussion par plan, écrasé à chaque nouvelle conversation — passe désormais par un véritable historique multi-fils, sauvegardé côté serveur à chaque échange',
              'Nouveau panneau déroulant (clic sur le titre du fil courant) : recherche, fils groupés par récence (Aujourd\'hui / 7 derniers jours / Plus ancien), suppression individuelle, "+ Nouvelle conversation"',
              'Écran d\'accueil de Nova repensé : salutation selon l\'heure, orbe lumineux en dégradé de marque sur une trame de points, au lieu d\'un simple texte'
            ]
          },
          {
            date: '21 août 2026',
            title: 'Bibliothèque de versions "avant/après"',
            items: [
              'Chaque enregistrement d\'un plan crée désormais un instantané complet, conservé et consultable à tout moment (jusqu\'à 20 versions par plan)',
              'Nouvelle page de comparaison (bouton "Comparer les versions" dans le panneau Historique du plan) : choisissez deux versions, avant/après, pour voir ce qui a changé — roadmap (stories ajoutées, retirées, déplacées, statut), KPIs, budget marketing, classification et résumé exécutif'
            ]
          },
          {
            date: '21 août 2026',
            title: 'La catégorie "Préférences" de la bannière cookies pilote vraiment quelque chose',
            items: [
              'Le thème, la langue, le fuseau horaire et les réglages d\'accessibilité (taille de police, contraste, format de date, devise) ne sont désormais mémorisés d\'une visite à l\'autre que si "Préférences" est acceptée dans la bannière cookies — sans ce consentement, ils repartent sur leurs valeurs par défaut à chaque nouvelle visite au lieu d\'être enregistrés silencieusement comme avant',
              'Refuser explicitement "Préférences" efface immédiatement ce qui était déjà enregistré ; l\'accepter sauvegarde aussitôt les réglages en cours, sans attendre d\'y retoucher'
            ]
          },
          {
            date: '21 août 2026',
            title: 'Application installable (PWA)',
            items: [
              'VelocityLaunch peut désormais s\'installer comme une vraie application, depuis le navigateur (icône "Installer" dans la barre d\'adresse sur desktop, "Ajouter à l\'écran d\'accueil" sur mobile) — plein écran sans barre de navigateur, icône dédiée, chargement quasi instantané au réouvertures grâce au cache local des fichiers de l\'application',
              'Les appels au serveur (connexion, plans, Copilote IA...) ne sont jamais mis en cache : seuls les fichiers de l\'application elle-même le sont, les données restent toujours à jour'
            ]
          },
          {
            date: '21 août 2026',
            title: 'Sommaire mobile repensé et panneau Nova plein écran sur iOS',
            items: [
              'Sommaire mobile du plan repensé : la grille d\'icônes nues (peu lisible, flèches précédent/suivant peu pratiques) laisse place à une seule barre sticky en haut d\'écran — grands boutons précédent/suivant + section active, qui ouvre au tap le sommaire complet (liste groupée avec libellés) en feuille modale glissant depuis le bas',
              'Bannière de consentement cookies restreinte à la page d\'accueil uniquement : elle ne s\'affiche plus dans le dashboard, les espaces, le questionnaire, Mon compte ou les autres pages de l\'application',
              'Correction du chevauchement visuel entre la bulle du copilote Nova et la pastille cookies repliée en bas d\'écran sur mobile',
              'Panneau du copilote Nova passé en plein écran sur mobile, avec ses dimensions recalées en continu sur le viewport visuel réel : corrige l\'écrasement de la fenêtre par le clavier virtuel sur iOS Safari'
            ]
          },
          {
            date: '21 août 2026',
            title: 'Bannière de cookies RGPD (avec vrai consentement par catégorie) et verre dépoli généralisé',
            items: [
              'Bannière de consentement cookies (RGPD) : bandeau translucide en bas de page, 4 catégories réelles (Essentiels, Préférences, Statistiques, Marketing), réouvrable à tout moment pour revenir sur son choix',
              'Statistiques et Marketing sont vraiment branchés : Cloudflare Web Analytics, Meta Pixel et LinkedIn Insight Tag ne se chargent que si la catégorie correspondante est acceptée, jamais avant',
              'Écran de chargement plein écran (symbole VelocityLaunch animé) au premier chargement de l\'app, le temps que la session soit vérifiée',
              'Effet de verre dépoli (glassmorphism) étendu à toutes les cartes du tableau de bord, de l\'espace personnel/équipe et des pages Mon compte, Paramètres, Intégrations et Notifications, en mode clair comme en mode sombre',
              'Aperçus visuels des plans (au lieu d\'un simple compteur) et phrase de synthèse sur les cartes d\'espace de la page d\'accueil'
            ]
          },
          {
            date: '21 août 2026',
            title: 'Collaboration temps réel, centre de notifications et refonte de la connexion',
            items: [
              'Collaboration en temps réel sur la roadmap et le backlog : fusion automatique des éditions concurrentes (CRDT), présence de qui a le plan ouvert, notification immédiate de ce qui vient de changer',
              'Deux nouveaux agents IA asynchrones : auto-scheduling dynamique de la roadmap et priorisation du backlog par signaux externes',
              'Rapport de conformité exportable pour investisseurs (synthèse RGPD + financier en un document PDF)',
              'Centre de notifications persistant (cloche du header) pour agents IA, mentions et collaboration : contenu détaillé, fuseau horaire corrigé, clic pour naviguer directement vers la section concernée',
              'Présence d\'équipe visible dans le tableau de bord (un avatar par membre, anneau dégradé et lueur verte pour qui est connecté) et le menu de bascule d\'espace',
              'Page de connexion refondue en plein écran (nav et footer masqués, mention légale ajoutée), et vrai lien "Mot de passe oublié ?" toujours visible au lieu de n\'apparaître qu\'après avoir commencé à taper un mot de passe'
            ]
          },
          {
            date: '20 août 2026',
            title: 'Budget total, import de document et corrections de fond',
            items: [
              'Budget total du lancement, distinct du budget marketing : le prévisionnel financier se base désormais sur l\'enveloppe globale (dev + marketing + ops) plutôt que de réutiliser silencieusement le seul budget marketing comme s\'il s\'agissait du total',
              'Import de document dans le questionnaire (PDF, Word, Excel, PowerPoint) : le texte est extrait dans le navigateur et ajouté au contexte envoyé à l\'IA, dans un champ relu et modifiable avant génération',
              'Correction du chargement de brouillon : le formulaire ne se mettait pas à jour si un brouillon était chargé depuis la page questionnaire elle-même ; chaque sauvegarde créait en plus un nouveau brouillon au lieu de mettre à jour celui en cours, et un renommage manuel était écrasé à la sauvegarde suivante',
              'Bouton discret pour annuler les modifications en attente sur un plan, en plus du bouton "Enregistrer"',
              'Correction d\'un bug d\'accessibilité qui forçait une taille minimale de 44x44px sur de nombreux petits boutons-icônes dans toute l\'application (tags, suivi post-lancement, sidebar, copilote...), les faisant apparaître disproportionnés',
              'Dégradé de marque appliqué aux titres des glossaires d\'aide du questionnaire'
            ]
          },
          {
            date: '19 août 2026',
            title: 'Nouvelle identité visuelle de la page d\'accueil et de "Comment ça marche"',
            items: [
              'Refonte complète de la landing page à partir de la charte visuelle générée avec Ploy (palette lavande/indigo/cyan sur fond quasi noir, typographies Source Serif 4 pour les titres et IBM Plex Sans pour le corps de texte)',
              'Nouveau hero avec visuel de chemin lumineux à travers les montagnes, badge "Lancez plus vite que jamais" en bleu nuit et police technique, extrait de commande façon terminal, et 3 boutons d\'action tenant sur une seule ligne en FR comme en EN',
              'Nouvelle page "Comment ça marche" entièrement reconstruite : hero, 4 bénéfices illustrés, 3 étapes détaillées avec captures produit, aperçu de l\'expérience, bandeau témoignages et FAQ, avec les visuels du kit produit Ploy',
              'Section "Une carte de contrôle pour votre lancement" et "Aperçu du produit" restaurées comme deux blocs distincts avec leurs propres visuels',
              'Lien FAQ ajouté à la navigation (visible hors connexion), correction du renvoi vers la mauvaise page depuis "Comment ça marche"',
              'Boutons de connexion Google / Apple / Slack redessinés (padding, bordures, badge "Dernière utilisation" en cyan) au lieu d\'être collés aux bords'
            ]
          },
          {
            date: '19 août 2026',
            title: 'Galerie 100% privée, Copilote Nova et navigation compte réorganisée',
            items: [
              'Galerie repensée : suppression de l\'ancienne galerie publique (plus aucun plan consultable sans compte), nouvelle galerie 100% privée avec opt-in explicite par plan ("Ajouter à la galerie" dans l\'aperçu du plan), favoris triés en premier, menu contextuel clic droit (ouvrir/favori/renommer/partager/dupliquer/retirer/supprimer), aperçu image en bandeau plein cadre',
              'Copilote IA rebaptisé "Nova" : fenêtre agrandie, en-tête compact, avatar dédié, suggestions rapides cliquables, nouvelle conversation, copie d\'une réponse, indicateur de frappe animé, titre en dégradé et bordure violet/bleu/cyan encadrant toute la fenêtre',
              'Navigation compte réorganisée : "Notifications" devient sa propre page, nouvelle page "Intégrations" (icônes de marque, badges de statut colorés), Paramètres recentré sur les préférences pures, "Envie de collaborer ?" déplacée dans Mon compte, "Mes plans"/"Ma galerie" ajoutées comme cartes dans l\'espace personnel, menu du sélecteur d\'espace repensé',
              'Cohérence visuelle : pages élargies (960px), aperçu image ajouté à toutes les listes de plans, renommage inline des plans et brouillons via modale dédiée, anneau en dégradé violet/bleu/cyan sur tous les avatars, badge "Démo" sur les plans d\'exemple',
              'Corrections : perte du plan démo après connexion Google/Apple/Slack, menu contextuel de la galerie insensible au clic, page Galerie devenue inaccessible'
            ]
          },
          {
            date: '18 août 2026',
            title: 'Intégration Jira, notifications par email et Paramètres enrichis',
            items: [
              'Intégration Jira complète (OAuth) : création automatique d\'Epics par phase et de Stories liées, story points, priorité, dates, assigné, sync incrémental sans doublon, deep-links vers les tickets depuis le Backlog',
              'Export Notion enrichi : roadmap et calendriers en bases de données Notion natives (au lieu de simples listes), dates réelles pour les vues Calendrier/Chronologie, image de couverture et icône de marque',
              'Notifications par email (via Resend) : un email à chaque génération IA terminée (veille, benchmarks, calendriers, RGPD, tableau IA, agents de backlog) avec un aperçu concret du résultat — vraie table pour le tableau IA, plusieurs items datés pour les calendriers — et rappel automatique pour les plans inactifs depuis 14 jours',
              'Page Paramètres enrichie : taille de police et contraste renforcé, format de date (JJ/MM ou MM/JJ), devise d\'affichage (€/$/£), export RGPD de toutes les données et suppression de compte, panneau récapitulatif des intégrations connectées (Notion/Jira) avec déconnexion',
              'Export pitch deck (PPTX) repensé : présentation en 9 diapositives (couverture, problème, solution, marché, roadmap, go-to-market, KPIs, finances, clôture), logo et wordmark de marque, images de contexte, mise en page sans chevauchement',
              'Badge "Membre Pro" sur Mon compte : icône couronne dégradée à la place du texte plat',
              'Modal d\'export recentré (ne chevauche plus le header) et boutons aux couleurs du dégradé de marque',
              'Sommaire du plan réorganisé en 8 groupes thématiques repliables suivant le cycle de vie du lancement',
              'Footer entièrement centré et réharmonisé en mobile/tablette (jusqu\'à l\'iPad Pro), les 3 colonnes de liens restant côte à côte'
            ]
          },
          {
            date: '15 août 2026',
            title: 'Espaces d\'équipe, tarification Pro et page Paramètres',
            items: [
              'Transfert d\'un plan entre l\'espace personnel et une équipe (ou entre deux équipes), directement depuis Mon compte',
              'Nouvelle grille tarifaire à 3 offres (Gratuit / Pro / Entreprise) avec bascule mensuel-annuel, remplaçant l\'ancienne modal Pro unique — Entreprise redirige vers le formulaire de contact plutôt qu\'un faux prix',
              'Limites d\'espaces d\'équipe par plan (1 en Gratuit, 5 en Pro, illimité en Entreprise), appliquées côté interface et côté serveur via un webhook Clerk qui supprime toute organisation créée en trop',
              'Export PPTX et intégrations Notion / Jira / GitHub réservés au plan Pro (badge PRO + vérification serveur)',
              'Historique multi-espaces et notifications de commentaires d\'équipe réservés au plan Pro ; le gratuit garde un historique scopé à l\'espace actif',
              'Nouvelle page Paramètres regroupant thème, langue, fuseau horaire (appliqué aux dates affichées), réduction des animations, et accès aux appareils actifs / sécurité du compte',
              'Bouton "Tout effacer" sur les notifications de Mon compte',
              'Correction des boutons de la modal "limite de plans gratuits atteinte" : chacun mène désormais au bon endroit (paiement Pro ou liste des plans) au lieu de renvoyer tous les deux au même endroit',
              'Nouvelle police de titres (IBM Plex Sans), en complément d\'Inter pour le texte courant'
            ]
          },
          {
            date: '14 août 2026',
            title: 'Modèles de plan par secteur',
            items: [
              'Le secteur du produit (déjà renseigné au questionnaire) influence désormais la génération du plan sur 10 secteurs : e-commerce, SaaS B2B, marketplace, app mobile, fintech, healthtech, dev tools, IA/ML, contenu/média, edtech',
              'Mix de canaux marketing adapté au secteur (ex : Paid + Social pour l\'e-commerce, LinkedIn + Content pour le SaaS B2B)',
              'KPI sectoriel additionnel quand pertinent (MRR pour le SaaS, GMV pour une marketplace, rétention J7 pour le mobile...)',
              'Risque spécifique ajouté à l\'analyse SWOT pour les secteurs à enjeux distincts (réglementation fintech, conformité santé, démarrage à froid des marketplaces...)'
            ]
          },
          {
            date: '14 août 2026',
            title: 'Refonte visuelle complète : KPI, finances, RGPD, outils IA, suivi post-lancement',
            items: [
              'Dashboard KPI repensé : toutes les cartes au même niveau, vue Cartes/Tableau, une couleur par KPI, calculateur A/B test sorti en carte dédiée avec explications',
              'Benchmarks : lignes du tableau teintées selon leur verdict, cartes canaux recolorées et réaménagées pour la lisibilité',
              'Prévisionnel financier : graphique de trajectoire du budget jusqu\'à épuisement, pont visuel coût vs revenu requis pour l\'équilibre',
              'Conformité RGPD : bloc de ressources officielles (CNIL, texte du RGPD, EDPB), barre de progression sur la checklist',
              'Outils IA repensés en profondeur : agent passé de 2 à 4 capacités réelles (ajout analyse des risques et optimisation budgétaire), graphique en langage naturel et tableau généré par prompt fusionnés en un seul outil IA fiable avec suggestions et graphique automatique',
              'Suivi post-lancement : verdict de projection mis en avant, sélecteur de KPI simplifié, historique replié',
              'Scénarios what-if remplacés par un simulateur budget/durée en direct (curseurs, impact sur la roadmap et le budget marketing par canal)',
              'Sommaire latéral : poignée de repli discrète centrée sur la bordure, plus besoin de remonter en haut de page',
              'Fond noir harmonisé et couleurs par catégorie sur l\'ensemble des cartes du plan'
            ]
          },
          {
            date: '14 août 2026',
            title: 'Sync Notion & Jira enrichie, calendrier GTM unifié, refonte visuelle',
            items: [
              'Statut tri-état des stories (à faire / en cours / terminé) partagé entre Roadmap, Backlog, Gantt, Calendrier, et synchronisé vers Jira et Notion',
              'Sync Notion par story dans une base dédiée, déclenchée depuis le Backlog',
              'Gantt refondu en swim-lanes par responsable, Burndown chart avec dates réelles et marqueur "Aujourd\'hui"',
              'Calendrier d\'exécution enrichi (marqueur de lancement, statuts colorés, export .ics) et remonté en tête de la section Roadmap & exécution',
              'Calendrier éditorial et calendrier publicitaire fusionnés en un calendrier de contenu & publicité unique, semaine par semaine',
              'Budgets marketing par canal repensés : barre d\'allocation visuelle, couleurs par canal, contenus prêts à l\'emploi repliables',
              'Sommaire latéral du plan avec suivi actif de la section en cours de lecture (scroll-spy) et titres de section aérés entre chaque grand groupe',
              'Cartes de présentation et résumé exécutif en fond noir profond pour faire ressortir le texte en dégradé, vignettes recolorées selon leur nature'
            ]
          },
          {
            date: '12 août 2026',
            title: 'Suite analytique complète, agents IA et formulaire enrichi',
            items: [
              'Nouveaux modules du plan : backlog priorisé, Gantt interactif, burndown chart, calendrier, dashboard BI et panneau de navigation latéral',
              'Agents IA asynchrones (brief de story, recalcul de KPIs) via Cloudflare Queues',
              'Suivi post-lancement avec scénarios what-if',
              'Persona, sprints, marketing, KPIs et prévisions financières enrichis, plus des tableaux générés par IA',
              'Formulaire retravaillé : bien plus de choix par catégorie sur les 4 phases, câblés au moteur de génération',
              'Bouton "Voir une démo" accessible depuis le header, démos instantanées',
              "Corrections : section Agents IA de nouveau visible, chargement d'un autre plan réparé, header compacté"
            ]
          },
          {
            date: '2 août 2026',
            title: 'Progression en temps réel et internationalisation complète',
            items: [
              'Barre de progression organique pendant la génération du plan, bouton conservé à l\'écran',
              'Bannière de bienvenue animée sur la page du plan, différente selon génération ou rechargement',
              'Dashboard KPI repensé avec mise en avant du KPI principal',
              'Traduction anglaise complète des modales du footer, des brouillons et des plans sauvegardés',
              'Modale de confirmation dédiée pour la suppression des plans, pattern léger pour les brouillons',
              'Corrections : chargement de brouillon réparé, formulaire vide sur "Nouveau plan", remontée en haut de page',
              'Header et hero retravaillés : bouton d\'accueil, titre agrandi, alignement à gauche cohérent avec le reste du site'
            ]
          },
          {
            date: '31 juillet 2026',
            title: 'Nouvelle identité visuelle',
            items: [
              'Wordmark et logo authentiques, cohérents sur tout le site',
              'Nouveau header et hero avec le design system VelocityLaunch',
              'Page "Comment ça marche" dédiée avec galerie et FAQ',
              "Sections claires de la page d'accueil basculées en thème violet",
              "Nettoyage complet des icônes emoji au profit d'icônes vectorielles"
            ]
          },
          {
            date: '28 juillet 2026',
            title: 'Refonte UX/UI et accessibilité',
            items: [
              "Refonte complète de la page d'accueil (hero, features, témoignages, FAQ)",
              "Traduction anglaise complète de l'interface",
              'Contraste renforcé pour la conformité WCAG',
              'Contenu des plans générés localisé selon la langue choisie'
            ]
          },
          {
            date: 'Lancement initial',
            title: 'VelocityLaunch MVP',
            items: [
              'Questionnaire produit / marché / ressources / priorités',
              'Génération automatique de roadmap par sprints',
              'Stratégie marketing et KPIs personnalisés',
              'Export PDF et CSV, partage par lien',
              'Déploiement sur Cloudflare Workers'
            ]
          }
        ]
      },
      features: {
        title: 'Fonctionnalités',
        intro: "Tout ce qui existe réellement dans VelocityLaunch aujourd'hui, par thème — voir la Roadmap pour ce qui s'en vient.",
        groups: [
          {
            label: 'Génération IA',
            items: [
              "Questionnaire guidé multi-phases avec import de document (PDF, Word, Excel, PowerPoint, photo/scan) comme contexte IA, avec OCR automatique sur les pages scannées",
              "Génération IA avec filet de sécurité (moteur à règles local si l'IA échoue)",
              'Copilote IA conversationnel (Nova) pour éditer le plan en langage naturel, avec historique multi-conversations (recherche, groupé par récence)'
            ]
          },
          {
            label: 'Roadmap & exécution',
            items: [
              'Roadmap Agile, sprints, backlog priorisé, Gantt interactif en swim-lanes, burndown à dates réelles',
              'Collaboration en temps réel sur la roadmap et le backlog (fusion automatique des éditions concurrentes, présence de qui a le plan ouvert)',
              "Agents IA asynchrones (brief d'exécution, recalcul KPIs, analyse des risques, optimisation budgétaire, auto-scheduling dynamique, priorisation par signaux externes)",
              'Bibliothèque de versions "avant/après" : un instantané complet du plan à chaque enregistrement, comparable à tout moment (roadmap, personas, finances, budget, KPIs, résumé exécutif)'
            ]
          },
          {
            label: 'Marketing & finance',
            items: [
              'Budget marketing et budget total du lancement distincts, prévisionnel financier associé',
              'Carte "Budget & Délai" : budget total et délai de lancement éditables, source unique qui pilote le prévisionnel financier, le plafond du budget marketing et la carte d\'identité du plan, avec reconstruction possible de la roadmap depuis le nouveau délai',
              'Stratégie marketing, KPIs personnalisés, dashboard BI et tableaux générés par IA',
              'Veille, benchmarks, calendriers éditorial/pub et conformité RGPD générés à la demande, avec veille hebdomadaire automatique et de vraies cartes de lien vers des sources externes (favicon inclus), différentes à chaque plan',
              'Suivi post-lancement & simulateur budget/timeline en direct',
              'Rapport financier par plan façon feuille investisseurs (depuis "Budget cumulé" en espace d\'équipe) : budgets clés en en-tête, burn/runway, seuil de rentabilité avec justification ARPU, répartition des coûts par poste, export dédié en PDF, Word et HTML',
              'Rapport investisseurs (export PDF du plan complet) : checklist RGPD avec de vraies cases à cocher interactives (cochables dans Acrobat/Preview), pas de simples symboles'
            ]
          },
          {
            label: 'Équipe & notifications',
            items: [
              "Espaces d'équipe (Clerk Organizations), commentaires avec @mentions, fil d'activité par plan, tags transversaux",
              'Centre de notifications persistant (cloche du header) pour agents IA, mentions et collaboration, avec contenu détaillé et navigation directe vers la section concernée',
              "Présence d'équipe en temps réel : qui a un plan de l'équipe ouvert en ce moment, visible dans le tableau de bord (carte Membres) et le menu de bascule d'espace",
              'Tableau de bord en widgets déplaçables et redimensionnables façon macOS (glisser-déposer, clic droit → Petit/Moyen/Grand, disposition mémorisée), avec une bibliothèque de widgets ("+") pour en ajouter/retirer (recherche, catégories) — calendrier, activité, résumé Nova (Pro), historique, galerie, et trois nouveaux widgets d\'aperçu (santé du portefeuille, streak, météo business) : calendrier mettant en évidence tous les sprints actifs (tous plans confondus) avec détail cliquable par jour, prochaines échéances enrichies (date exacte, urgence en couleur, accès direct au plan), carte "Reprendre" vers le dernier plan touché, fil d\'activité récente et résumé hebdomadaire cross-plans généré par Nova (Pro), bandeau défilant de conseils générés par IA',
              'Dashboard du plan : avancement global en double anneau interactif (terminé/en cours/en retard/pas commencé, survol par story), rythme réel vs calendrier, charge par membre réel de l\'équipe'
            ]
          },
          {
            label: 'Intégrations & automatisation',
            items: [
              'Intégrations Notion, Jira, GitHub, Linear et Google Calendar',
              "Notifications email (Resend) et Slack : génération terminée, rappel d'inactivité, résumé hebdomadaire",
              'Webhooks sortants (Zapier-compatible), modèles de plan par duplication, galerie publique opt-in'
            ]
          },
          {
            label: 'Export & partage',
            items: [
              "Export PDF, PPTX (pitch deck personnalisable), CSV, PNG, JSON, rapport de conformité investisseurs (RGPD + financier), partage par lien ou image Open Graph"
            ]
          },
          {
            label: 'Compte & accès',
            items: [
              'Tarification à 3 offres (Gratuit / Pro / Entreprise), abonnement Stripe',
              'Recherche globale (⌘K), FR / EN',
              'Bannière de consentement cookies RGPD avec 4 catégories réelles, connectée à Cloudflare Web Analytics, Meta Pixel et LinkedIn Insight Tag',
              'Application installable (PWA) : icône sur l\'écran d\'accueil, ouverture en plein écran sans barre de navigateur'
            ]
          }
        ]
      },
      roadmap: {
        title: 'Roadmap',
        intro: "Un aperçu honnête de ce qui existe déjà et de ce qui s'en vient. Cette roadmap évolue avec les retours des premiers utilisateurs.",
        columns: [
          {
            label: 'Disponible',
            items: [
              'Questionnaire guidé multi-phases avec import de document (PDF, Word, Excel, PowerPoint, photo/scan) comme contexte IA, avec OCR automatique sur les pages scannées',
              'Génération IA avec filet de sécurité (moteur à règles local si l\'IA échoue)',
              'Copilote IA conversationnel (Nova) pour éditer le plan en langage naturel, avec historique multi-conversations (recherche, groupé par récence)',
              'Roadmap Agile, sprints, backlog priorisé, Gantt interactif en swim-lanes, burndown à dates réelles',
              'Collaboration en temps réel sur la roadmap et le backlog (fusion automatique des éditions concurrentes, présence de qui a le plan ouvert)',
              'Budget marketing et budget total du lancement distincts, prévisionnel financier associé',
              'Stratégie marketing, KPIs personnalisés, dashboard BI et tableaux générés par IA',
              'Veille, benchmarks, calendriers éditorial/pub et conformité RGPD générés à la demande, avec veille hebdomadaire automatique et de vraies cartes de lien vers des sources externes (favicon inclus), différentes à chaque plan',
              'Suivi post-lancement & simulateur budget/timeline en direct',
              'Agents IA asynchrones (brief d\'exécution, recalcul KPIs, analyse des risques, optimisation budgétaire, auto-scheduling dynamique, priorisation par signaux externes)',
              'Espaces d\'équipe (Clerk Organizations), commentaires avec @mentions, fil d\'activité par plan, tags transversaux',
              'Centre de notifications persistant (cloche du header) pour agents IA, mentions et collaboration, avec contenu détaillé et navigation directe vers la section concernée',
              'Présence d\'équipe en temps réel : qui a un plan de l\'équipe ouvert en ce moment, visible dans le tableau de bord (carte Membres) et le menu de bascule d\'espace',
              'Tarification à 3 offres (Gratuit / Pro / Entreprise), abonnement Stripe',
              'Intégrations Notion, Jira, GitHub, Linear et Google Calendar',
              'Notifications email (Resend) et Slack : génération terminée, rappel d\'inactivité, résumé hebdomadaire',
              'Webhooks sortants (Zapier-compatible), modèles de plan par duplication, galerie publique opt-in',
              'Export PDF, PPTX (pitch deck personnalisable), CSV, PNG, JSON, rapport de conformité investisseurs (RGPD + financier), partage par lien ou image Open Graph',
              'Recherche globale (⌘K), FR / EN',
              'Bannière de consentement cookies RGPD avec 4 catégories réelles, connectée à Cloudflare Web Analytics, Meta Pixel et LinkedIn Insight Tag',
              'Application installable (PWA) : icône sur l\'écran d\'accueil, ouverture en plein écran sans barre de navigateur, premier chargement quasi instantané depuis le cache',
              'Bibliothèque de versions "avant/après" : un instantané complet du plan à chaque enregistrement, comparable à tout moment (roadmap, personas, finances, budget, KPIs, résumé exécutif)',
              'Dashboard : bandeau défilant de conseils générés par IA (renouvelés toutes les 15 min), calendrier du mois avec échéances de lancement, prochaines échéances tous plans confondus',
              'Carte "Budget & Délai" (Go-to-market) : budget total et délai de lancement éditables, pilotent le prévisionnel financier, le plafond du budget marketing et la carte d\'identité du plan, avec reconstruction possible de la roadmap depuis le nouveau délai'
            ]
          },
          {
            label: 'En cours',
            items: []
          },
          {
            label: 'Envisagé',
            items: [
              'API publique pour générer un plan par programmation (clé API, palier Entreprise)'
            ]
          }
        ]
      },
      about: {
        title: 'À propos',
        authorHeading: 'digitalblueskye',
        authorText: 'VelocityLaunch est conçu et développé par digitalblueskye, maker indépendant. Le principe est simple : construire des outils qui font gagner du temps, sans jargon inutile ni fonctionnalités superflues.',
        blogPrefix: "Retrouvez d'autres réflexions sur le produit et le développement sur",
        blogLink: 'le blog',
        missionHeading: 'Notre mission',
        missionText: "Trop de lancements produit s'enlisent dans des heures de planning avant même la première ligne de code. VelocityLaunch existe pour inverser ça : transformer une idée en roadmap, stratégie marketing et KPIs actionnables en quelques minutes, pas en plusieurs jours.",
        valuesHeading: 'Ce qui compte pour nous',
        valueSpeedLabel: 'Rapidité :',
        valueSpeedText: 'un plan complet en 5 minutes, pas une usine à gaz',
        valueClarityLabel: 'Clarté :',
        valueClarityText: 'pas de jargon, des résultats directement exploitables',
        valuePrivacyLabel: 'Confidentialité :',
        valuePrivacyText: 'vos données vous appartiennent, par défaut en local'
      },
      careers: {
        title: 'Nous rejoindre',
        noPositionHeading: 'Pas de poste ouvert pour le moment',
        noPositionText: "VelocityLaunch est aujourd'hui un projet indépendant. Il n'y a pas de fiche de poste à pourvoir actuellement.",
        curiousHeading: 'Mais toujours curieux',
        curiousText: "Si vous êtes développeur·se, designer ou growth marketer et que ce type de projet vous parle, n'hésitez pas à vous manifester. Les bonnes rencontres ont rarement lieu au bon moment.",
        contactBtn: 'Nous contacter'
      },
      contact: {
        title: 'Contact',
        intro: 'Une question, une idée, un bug à signaler ? Ce formulaire envoie directement le message, sans ouvrir votre client mail.',
        name: 'Nom',
        email: 'Email',
        message: 'Message',
        sending: 'Envoi…',
        send: 'Envoyer',
        successMsg: 'Message envoyé, merci ! Réponse sous peu.',
        errorPrefix: "L'envoi a échoué. Écrivez-nous directement à"
      },
      privacy: {
        title: 'Politique de confidentialité',
        updated: 'Dernière mise à jour : 22 août 2026. VelocityLaunch accorde une attention particulière à la confidentialité de vos données.',
        dataHeading: 'Données collectées',
        dataText: "Les réponses que vous saisissez dans le questionnaire (informations produit, marché, ressources, documents importés) servent à générer votre plan de lancement. Sans compte, ces données restent uniquement dans le localStorage de votre navigateur. Avec un compte (connexion requise pour sauvegarder un plan, collaborer en équipe ou utiliser Nova), vos plans sont aussi stockés sur nos serveurs (base de données Cloudflare D1) pour rester accessibles d'un appareil à l'autre — jusqu'à 20 versions par plan sont conservées pour la bibliothèque de versions \"avant/après\".",
        accountHeading: 'Compte et authentification',
        accountText: "La création de compte et la connexion sont gérées par Clerk, notre prestataire d'authentification : email, nom, photo de profil éventuelle. Les espaces d'équipe reposent sur les organisations Clerk — les membres d'une équipe voient les plans partagés dans cet espace, jamais vos plans personnels.",
        aiHeading: 'Traitement par intelligence artificielle',
        aiText: "La génération de plan, le copilote Nova et les mini-outils IA (tableaux, veille, benchmarks...) envoient le contenu pertinent de votre questionnaire ou de votre plan à un prestataire IA tiers (OpenRouter, qui route vers des modèles comme Claude ou GPT) pour produire la réponse — uniquement le texte nécessaire à la demande en cours, jamais l'ensemble de votre historique. L'OCR des documents scannés, lui, s'exécute entièrement dans votre navigateur : aucune image ni page scannée n'est envoyée à un tiers.",
        integrationsHeading: 'Intégrations tierces (optionnelles)',
        integrationsText: "Si vous connectez explicitement Notion, Jira, GitHub, Linear ou Google Calendar depuis les réglages d'intégrations, un jeton d'accès OAuth est stocké côté serveur pour synchroniser les données que vous choisissez d'exporter. Rien n'est connecté par défaut, et vous pouvez déconnecter chaque intégration à tout moment.",
        paymentHeading: 'Paiement',
        paymentText: "L'abonnement Pro est traité par Stripe. Nous ne stockons jamais votre numéro de carte : Stripe nous transmet uniquement la confirmation de paiement et un identifiant client.",
        usageHeading: 'Utilisation des données',
        usageText: "Nous n'utilisons jamais le contenu de vos plans à des fins publicitaires ou de revente. Voir la politique de cookies pour le détail des outils de mesure d'audience (Cloudflare Web Analytics) et marketing (Meta Pixel, LinkedIn Insight Tag, Google Ads), tous optionnels et gated par votre consentement.",
        rightsHeading: 'Vos droits (RGPD)',
        rightAccessLabel: 'Accès :',
        rightAccessText: 'vous pouvez consulter toutes les données que vous avez générées, localement et sur nos serveurs si vous avez un compte',
        rightDeleteLabel: 'Suppression :',
        rightDeleteText: 'vider votre localStorage supprime vos données locales ; supprimer un plan ou votre compte supprime aussi ses données côté serveur (y compris ses versions et conversations Nova associées)',
        rightPortabilityLabel: 'Portabilité :',
        rightPortabilityText: 'export possible à tout moment en PDF, PPTX, CSV, PNG ou JSON',
        rightOppositionLabel: 'Opposition :',
        rightOppositionText: 'écrivez-nous pour toute demande spécifique',
        contactHeading: 'Contact',
        contactText: 'Pour toute question relative à vos données :',
        note: 'Ce document est fourni à titre indicatif pour un projet en beta. Il ne remplace pas un avis juridique et sera précisé avant toute mise en production commerciale.'
      },
      terms: {
        title: "Conditions d'utilisation",
        updated: 'Dernière mise à jour : 22 août 2026. En utilisant VelocityLaunch, vous acceptez les conditions suivantes.',
        serviceHeading: 'Le service',
        serviceText: 'VelocityLaunch génère des recommandations (roadmap, stratégie marketing, KPIs) à partir des réponses que vous fournissez. Ces recommandations sont des points de départ, pas des conseils professionnels garantis : à vous de les adapter à votre contexte réel.',
        usageHeading: 'Utilisation acceptable',
        usageItem1: 'Le service est fourni "tel quel", sans garantie de résultat commercial',
        usageItem2: 'Vous restez propriétaire du contenu de vos plans',
        usageItem3: "Toute tentative d'abus, de scraping massif ou d'attaque du service est interdite",
        aiHeading: 'Contenu généré par IA',
        aiText: "Les roadmaps, stratégies, KPIs, tableaux et autres contenus générés par l'IA (y compris via le copilote Nova) peuvent contenir des erreurs, approximations ou informations obsolètes. Vérifiez toujours les recommandations avant de les utiliser pour une décision réelle (budget, embauche, engagement contractuel) — VelocityLaunch ne remplace pas un conseil professionnel.",
        teamHeading: 'Espaces d\'équipe',
        teamText: "Un plan créé dans un espace d'équipe est visible et modifiable par tous les membres de cet espace ; le rôle Admin peut inviter, retirer des membres et supprimer l'espace. En quittant une équipe ou en étant retiré, vous perdez l'accès aux plans qui y sont partagés — ils restent disponibles pour les membres restants.",
        subscriptionHeading: 'Abonnement et facturation',
        subscriptionText: "L'offre Pro est un abonnement récurrent facturé via Stripe, résiliable à tout moment depuis votre compte — la résiliation prend effet à la fin de la période déjà payée, sans remboursement au prorata. L'offre Entreprise est négociée directement avec nous.",
        availabilityHeading: 'Disponibilité',
        availabilityText: "VelocityLaunch est en phase beta : le service, y compris les fonctionnalités Pro, peut évoluer et certaines fonctionnalités peuvent être ajustées sans préavis pendant cette phase.",
        terminationHeading: 'Résiliation et suppression de compte',
        terminationText: "Vous pouvez supprimer votre compte à tout moment depuis les réglages — cela supprime définitivement vos plans, versions et conversations Nova stockés côté serveur. Nous pouvons suspendre un compte en cas d'abus manifeste du service (voir Utilisation acceptable ci-dessus).",
        contactHeading: 'Contact',
        contactText: 'Pour toute question sur ces conditions :',
        note: 'Ce document est fourni à titre indicatif pour un projet en beta. Il ne remplace pas un avis juridique et sera précisé avant toute mise en production commerciale.'
      },
      cookies: {
        title: 'Politique de cookies',
        intro: 'VelocityLaunch propose 4 catégories de cookies et de stockage, activables indépendamment depuis la bannière de consentement affichée à votre première visite. Rien au-delà des Essentiels ne se déclenche sans votre accord explicite.',
        storageHeading: 'Essentiels',
        storageText: "Votre thème, vos brouillons et vos plans générés sont conservés dans le localStorage de votre navigateur pour que le service fonctionne. Ce stockage n'est pas un cookie tiers : il reste sur votre appareil et n'est jamais transmis sans action de votre part. Toujours actif, non désactivable.",
        preferencesHeading: 'Préférences',
        preferencesText: "Mémorise votre langue, votre thème, votre fuseau horaire et vos réglages d'affichage (taille de police, contraste, format de date, devise) d'une visite à l'autre. Sans ce consentement, ces réglages repartent sur leurs valeurs par défaut à chaque nouvelle visite.",
        analyticsHeading: 'Statistiques',
        analyticsText: "Cloudflare Web Analytics mesure la fréquentation du site (pages visitées, provenance) sans cookie de tracking individuel et sans empreinte numérique. Aucune donnée personnelle issue de vos plans n'y est associée.",
        marketingHeading: 'Marketing',
        marketingText: "Meta Pixel, LinkedIn Insight Tag et Google Ads mesurent l'efficacité de nos campagnes publicitaires (clics, conversions). Ces outils ne sont chargés que si vous acceptez explicitement cette catégorie.",
        manageHeading: 'Gérer vos cookies',
        manageText: 'Vous pouvez revenir sur votre choix à tout moment depuis les réglages de cookies de l\'application (icône dédiée dans le pied de page / la barre de navigation), ou bloquer les cookies au niveau de votre navigateur — sans impact sur le fonctionnement du générateur de plan.',
        note: 'Ce document est fourni à titre indicatif pour un projet en beta. Il ne remplace pas un avis juridique et sera précisé avant toute mise en production commerciale.'
      },
      security: {
        title: 'Sécurité et Confidentialité',
        protectHeading: 'Protégez vos données',
        protectText: 'Chez VelocityLaunch, la sécurité de vos données est notre priorité absolue. Nous mettons en place les meilleures pratiques pour protéger vos informations.',
        encryptionHeading: 'Chiffrement End-to-End',
        encryptionText: 'Toutes les données transmises entre votre navigateur et nos serveurs sont chiffrées en utilisant le protocole HTTPS avec TLS 1.2 ou supérieur. Vos plans ne peuvent être interceptés.',
        gdprHeading: 'Conformité RGPD',
        gdprText: "VelocityLaunch est entièrement conforme au Règlement Général sur la Protection des Données (RGPD) de l'UE.",
        gdprAccessLabel: "Droit d'accès:",
        gdprAccessText: 'Vous pouvez accéder à tous vos données générées',
        gdprForgetLabel: "Droit à l'oubli:",
        gdprForgetText: 'Vous pouvez demander la suppression complète de vos données',
        gdprPortabilityLabel: 'Portabilité:',
        gdprPortabilityText: 'Vous pouvez exporter vos plans à tout moment',
        gdprTransparencyLabel: 'Transparence:',
        gdprTransparencyText: 'Nous vous informons exactement de comment vos données sont utilisées',
        storageHeading: 'Stockage Local',
        storageText: 'Par défaut, vos plans sont stockés localement dans votre navigateur (localStorage). Nous ne conservons aucune donnée sur nos serveurs sans votre consentement explicite.',
        trackingHeading: 'Pas de Tracking Invasif',
        trackingText: 'Nous utilisons Cloudflare Web Analytics pour comprendre l\'utilisation globale du service, sans cookie de tracking individuel. Nous ne trackons pas les données personnelles ou le contenu de vos plans.',
        infraHeading: "Sécurité de l'Infrastructure",
        infraItem1: 'Hébergement sur Cloudflare Workers avec sauvegardes automatiques',
        infraItem2: 'Audit de sécurité régulier par des experts externes',
        infraItem3: "Prévention des attaques DDoS et injection SQL",
        infraItem4: 'Certificats SSL/TLS à jour et validés',
        sharingHeading: 'Partage Sécurisé',
        sharingIntro: 'Lorsque vous partagez un plan via lien privé:',
        sharingItem1: 'Un ID unique et non devinable est généré',
        sharingItem2: 'Le lien expire automatiquement après 30 jours',
        sharingItem3: 'Seuls ceux ayant le lien peuvent accéder',
        sharingItem4: 'Les liens sont lecture seule',
        questionsHeading: 'Questions?',
        questionsText: 'Pour toute question concernant votre confidentialité, contactez-nous à',
        badge: 'Nous nous engageons à protéger votre vie privée'
      }
    },
    drafts: {
      title: 'Mes brouillons',
      subtitle: 'Continuez vos réponses là où vous les aviez laissées',
      emptyText: 'Aucun brouillon sauvegardé. Créez-en un pour continuer plus tard!',
      close: 'Fermer',
      updatedAtPrefix: 'Modifié le',
      load: 'Charger',
      rename: 'Renommer',
      delete: 'Supprimer',
      confirmDelete: 'Confirmer ?'
    },
    tags: {
      add: 'tag',
      addPlaceholder: 'Nouveau tag...',
      remove: 'Retirer ce tag',
      filterAll: 'Tous'
    },
    gallery: {
      title: 'Ma galerie',
      subtitle: 'Les plans que vous avez choisi d’y épingler, pour les retrouver d’un coup d’œil.',
      loading: 'Chargement...',
      empty: "Aucun plan dans votre galerie pour l'instant. Ouvrez un plan et cliquez sur \"Ajouter à la galerie\" pour l'épingler ici.",
      favorite: 'Favori',
      favoriteAdd: 'Ajouter aux favoris',
      favoriteRemove: 'Retirer des favoris',
      addToGallery: 'Ajouter à la galerie',
      removeFromGallery: 'Retirer de la galerie',
      inGallery: 'Dans la galerie',
      open: 'Ouvrir',
      linkCopied: 'Lien copié !',
      duplicated: 'Plan dupliqué'
    },
    plans: {
      title: 'Mes plans',
      emptyTitle: 'Historique des plans',
      emptyText: "Vous n'avez pas encore généré de plan. Commencez par en créer un !",
      intro: 'Gérez vos plans générés et partagez-les avec votre équipe',
      searchPlaceholder: 'Rechercher un plan...',
      noSearchResults: 'Aucun plan ne correspond à votre recherche.',
      clearFilters: 'Effacer les filtres',
      untitled: 'Plan sans titre',
      createdAtPrefix: 'Créé le',
      load: 'Charger',
      share: 'Partager',
      duplicate: 'Dupliquer',
      delete: 'Supprimer',
      shareLinkHeading: 'Lien de partage',
      copy: 'Copier',
      copied: 'Copié',
      shareExpiry: 'Ce lien expire dans 30 jours',
      deleteConfirmTitle: 'Supprimer ce plan ?',
      deleteConfirmSuffix: 'sera définitivement supprimé. Cette action est irréversible.',
      deleteFailedTitle: 'Suppression impossible',
      deleteFailed: 'La suppression a échoué (droits insuffisants sur ce plan d\'équipe, ou plan déjà supprimé ailleurs) — le plan a été restauré.',
      cancel: 'Annuler',
      defaultPlanName: 'Ce plan',
      deleteDraftConfirmTitle: 'Supprimer ce brouillon ?',
      deleteDraftConfirmSuffix: 'sera définitivement supprimé. Cette action est irréversible.',
      defaultDraftName: 'Ce brouillon',
      move: 'Déplacer',
      moveTitle: 'Déplacer ce plan',
      moveBody: "Choisissez l'espace de destination :",
      movePersonal: 'Personnel',
      moveNoTargets: "Aucun autre espace disponible pour l'instant.",
      moveForbidden: "Seul un admin de l'équipe peut déplacer un plan hors de cet espace."
    },
    footer: {
      tagline: 'Générateur intelligent de plan de lancement pour startups',
      product: 'Produit',
      features: 'Fonctionnalités',
      pricing: 'Tarification',
      changelog: 'Changelog',
      roadmap: 'Roadmap',
      company: 'Entreprise',
      about: 'À propos',
      blog: 'Blog',
      careers: 'Nous rejoindre',
      contact: 'Contact',
      legal: 'Légal',
      privacy: 'Confidentialité',
      terms: 'Conditions',
      cookies: 'Cookies',
      security: 'Sécurité',
      rightsReserved: 'Tous droits réservés.',
      madeWith: 'Construit avec 🧡 pour les makers et founders'
    },
    calendar: {
      title: 'Calendrier',
      subtitle: 'Vue calendrier de la roadmap et du marketing, actualisée automatiquement à chaque déplacement',
      prevMonth: 'Mois précédent',
      nextMonth: 'Mois suivant',
      today: "Aujourd'hui",
      autoSyncHint: 'Ce calendrier se recalcule automatiquement dès qu\'une story est déplacée dans le Gantt ou la roadmap.',
      exportIcs: 'Exporter (.ics)',
      launchEventTitle: (name) => `🚀 Lancement de ${name || 'votre produit'}`,
      launchBadge: 'Lancement',
      dayDetailEmpty: 'Rien de prévu ce jour-là.',
      close: 'Fermer',
      story: 'Story',
      marketingItem: 'Marketing'
    },
    auth: {
      getStarted: 'Commencer',
      signIn: 'Se connecter',
      signOut: 'Se déconnecter',
      myAccount: 'Mon compte',
      plansGate: 'Connecte-toi pour accéder à tes plans et brouillons.',
      demoModeNotice: 'Mode démo — aucune clé Clerk configurée, la connexion est simulée en local.',
      backToHome: 'Retour',
      signUpTitle: 'Créez votre compte',
      signUpSubtitle: 'Générez votre premier plan de lancement en 5 minutes.',
      signInTitle: 'Content de vous revoir',
      signInSubtitle: 'Connectez-vous pour retrouver vos plans.',
      switchToSignIn: 'Déjà un compte ? Se connecter',
      switchToSignUp: "Pas encore de compte ? S'inscrire",
      continueWith: 'Continuer avec',
      byContinuing: 'En continuant, vous acceptez nos',
      ourFem: 'notre',
      and: 'et notre',
      forgotLink: 'Mot de passe oublié ?',
      forgotTitle: 'Réinitialiser le mot de passe',
      forgotSubtitle: 'Indiquez votre adresse e-mail : nous vous envoyons un code pour réinitialiser votre mot de passe.',
      forgotCodeSent: (email) => `Un code a été envoyé à ${email}. Saisissez-le ci-dessous avec votre nouveau mot de passe.`,
      emailPlaceholder: 'Adresse e-mail',
      codePlaceholder: 'Code reçu par e-mail',
      newPasswordPlaceholder: 'Nouveau mot de passe',
      sendCode: 'Envoyer le code',
      sending: 'Envoi...',
      resetPassword: 'Réinitialiser',
      forgotError: "Une erreur est survenue. Vérifiez les informations saisies et réessayez.",
      forgotNeeds2fa: 'Une vérification supplémentaire est requise sur ce compte — connectez-vous normalement pour la compléter.',
      backToSignIn: 'Retour à la connexion'
    },
    dashboard: {
      greeting: (name) => `Bonjour ${name}`,
      greetingGeneric: 'Bonjour',
      subtitle: 'Voici un aperçu de tes espaces',
      // Message d'accueil unique (nom + aperçu du jour + rappel du plan + encouragement),
      // demandé textuellement ainsi plutôt qu'en plusieurs phrases séparées.
      greetingCombined: (name, planLabel) => `Bonjour ${name}, voici un aperçu du jour.\nTu es sur le plan ${planLabel}, alors n'hésite pas à travailler et à créer la start-up de tes rêves ! 🚀`,
      // Découpées en deux pour pouvoir mettre le prénom seul en dégradé (voir DashboardHome.jsx) —
      // "Bonjour" reste en blanc/ombré comme le reste du texte, posé directement sur la photo de fond.
      greetingPrefix: 'Bonjour',
      greetingCombinedRest: (planLabel) => `, voici un aperçu du jour.\nTu es sur le plan ${planLabel}, alors n'hésite pas à travailler et à créer la start-up de tes rêves ! 🚀`,
      greetingCombinedGeneric: (planLabel) => `Bonjour, voici un aperçu du jour.\nTu es sur le plan ${planLabel}, alors n'hésite pas à travailler et à créer la start-up de tes rêves ! 🚀`,
      planLabelPro: 'Pro',
      planLabelFree: 'Gratuit',
      planStatusProEmpty: 'Plan Pro activé 🚀 — tu as tout ce qu\'il faut sous la main, il ne manque plus qu\'un premier plan à lancer.',
      planStatusProActive: 'Plan Pro activé 🚀 — reprends là où tu t\'es arrêté sur tes plans en cours, personnels ou en équipe.',
      planStatusFreeEmpty: 'Plan Gratuit actif ✨ — largement de quoi démarrer, lance ton tout premier plan.',
      planStatusFreeActive: 'Plan Gratuit actif ✨ — tes plans en cours n\'attendent que toi pour avancer.',
      createPlan: 'Créer un nouveau plan',
      resumeLabel: 'Reprendre',
      widgetSizeLabel: 'Taille',
      widgetSize: { small: 'Petit', medium: 'Moyen', large: 'Grand' },
      widgetRemove: 'Retirer le widget',
      addWidgets: 'Ajouter des widgets',
      widgetLibrary: {
        title: 'Widgets',
        searchPlaceholder: 'Chercher des widgets',
        allWidgets: 'Tous les widgets',
        categories: { essentials: 'Essentiels', organisation: 'Organisation', insights: 'Nouveautés' },
        added: 'Ajouté',
        add: 'Ajouter',
        remove: 'Retirer',
        alwaysShown: 'Toujours affiché',
        proOnly: 'Pro',
        empty: 'Aucun widget ne correspond à ta recherche.',
        done: 'Terminé'
      },
      widgetCatalog: {
        calendar: { title: 'Calendrier', desc: 'Vue mensuelle de tes échéances et dates de lancement.' },
        resume: { title: 'Reprendre', desc: 'Reviens directement sur le dernier plan touché.' },
        deadlines: { title: 'Prochaines échéances', desc: 'Liste des dates de lancement et sprints à venir.' },
        activity: { title: 'Activité récente', desc: 'Dernières actions sur tes plans, tous espaces confondus.' },
        nova: { title: 'Résumé Nova', desc: 'Un résumé de la semaine généré par l\'IA.' },
        history: { title: 'Historique des plans', desc: 'Tes plans les plus récents, un clic pour les rouvrir.' },
        gallery: { title: 'Galerie publique', desc: 'Mosaïque des couvertures de tes plans partagés.' },
        portfolioHealth: { title: 'Santé du portefeuille', desc: 'Jauge d\'avancement global de tes plans en cours.' },
        streak: { title: 'Streak', desc: 'Jours consécutifs avec au moins un plan créé ou modifié.' },
        businessWeather: { title: 'Météo business', desc: 'Santé du portefeuille comparée à il y a 7 jours.' }
      },
      portfolioHealthTitle: 'Santé du portefeuille',
      portfolioHealthLevel: { good: 'Au beau fixe', medium: 'À surveiller', low: 'Attention requise' },
      portfolioHealthExplain: 'Score = % de stories terminées, moins 10 pts par échéance urgente (max -30) et 4 pts par échéance proche (max -15).',
      portfolioHealthDetail: (doneRatio, urgentCount, soonCount, urgentPenalty, soonPenalty) => {
        const parts = [`${doneRatio}% des stories sont terminées.`]
        if (urgentPenalty > 0) parts.push(`${urgentCount} échéance${urgentCount > 1 ? 's' : ''} urgente${urgentCount > 1 ? 's' : ''} (-${urgentPenalty} pts).`)
        if (soonPenalty > 0) parts.push(`${soonCount} échéance${soonCount > 1 ? 's' : ''} proche${soonCount > 1 ? 's' : ''} (-${soonPenalty} pts).`)
        return parts.join(' ')
      },
      portfolioHealthLegend: {
        good: '≥ 70% — Au beau fixe',
        medium: '40-69% — À surveiller',
        low: '< 40% — Attention requise'
      },
      portfolioHealthByPlan: 'Par plan',
      portfolioHealthHoverHint: 'Survole un plan (ou un segment de la jauge) pour voir le détail de son calcul',
      streakTitle: 'Streak',
      streakDays: (n) => n === 1 ? '1 jour' : `${n} jours`,
      streakSubtitle: "d'activité consécutifs",
      streakExplain: 'Un jour compte dès qu\'un plan a été créé, sauvegardé ou modifié — pas juste ouvert l\'app. Basé sur les dates des plans (serveur) : identique sur tous tes appareils.',
      streakEmpty: 'Crée ou modifie un plan pour démarrer ton streak.',
      streakBest: (n) => `Record : ${n === 1 ? '1 jour' : `${n} jours`}`,
      streakTierLabel: { none: '', warm: '', hot: 'En feu 🔥', blazing: 'Imparable ⚡️' },
      streakTierLegend: {
        none: '0 jour — aucune activité récente',
        warm: '1-6 jours',
        hot: '7-29 jours — en feu 🔥',
        blazing: '30 jours et plus — imparable ⚡️'
      },
      businessWeatherTitle: 'Météo business',
      businessWeatherExplain: 'Reprend le score de Santé du portefeuille et le compare à celui d\'il y a environ 7 jours (mesuré sur cet appareil).',
      businessWeatherTrend: {
        up: (n) => `En amélioration (+${n} pts vs il y a 7 j)`,
        down: (n) => `En recul (${n} pts vs il y a 7 j)`,
        flat: 'Stable vs il y a 7 jours',
        none: 'Pas encore assez d\'historique'
      },
      businessWeatherLevel: {
        good_up: 'Grand soleil', good_flat: 'Grand soleil', good_down: 'Éclaircies',
        medium_up: 'Ça se dégage', medium_flat: 'Quelques nuages', medium_down: 'Nuages qui s\'épaississent',
        low_up: 'Éclaircie après l\'orage', low_flat: 'Ciel orageux', low_down: 'Tempête qui s\'intensifie'
      },
      businessWeatherLegendLevel: 'Niveau : même score que Santé du portefeuille (Au beau fixe / À surveiller / Attention requise).',
      businessWeatherLegendTrend: 'Tendance : ↑ amélioration (+5 pts ou plus) · stable · ↓ recul (-5 pts ou plus), vs il y a 7 jours.',
      activityTitle: 'Activité récente',
      activityEmpty: 'Rien à signaler pour le moment.',
      novaSummaryTitle: 'Résumé de la semaine',
      novaSummaryIntro: "Nova peut résumer où en sont tes plans cette semaine — stories terminées, échéances à venir, points d'attention.",
      novaSummaryError: "Le résumé n'a pas pu être généré, réessaie dans un instant.",
      novaSummaryCta: 'Demander à Nova',
      novaSummaryRegenerate: 'Régénérer',
      novaSummaryLoading: 'Nova réfléchit…',
      current: 'Actuel',
      openSpace: 'Ouvrir',
      planCount: (n) => `${n} plan${n > 1 ? 's' : ''}`,
      planSummaryTeam: (n) => n === 0
        ? "Aucun plan pour l'instant — le champ est libre pour la première fusée 🚀"
        : n === 1
          ? "1 plan en chantier dans cette équipe — un bon début !"
          : `${n} plans en chantier dans cette équipe — ça carbure 🚀`,
      planSummaryPersonal: (n) => n === 0
        ? 'Aucun plan pour le moment — à toi de lancer le premier.'
        : n === 1
          ? '1 plan personnel en cours — bien lancé.'
          : `${n} plans personnels en cours — de quoi voir grand.`,
      createTeam: 'Créer une équipe',
      createTeamDesc: 'Un espace partagé avec ton équipe',
      viewHistory: 'Voir tout l\'historique des plans',
      viewGallery: 'Galerie publique',
      historyEmpty: 'Aucun plan pour le moment.',
      galleryEmpty: 'Aucune couverture pour le moment.',
      tipTitle: 'Conseil du jour',
      tipLoading: 'Chargement du conseil du jour…',
      deadlinesTitle: 'Prochaines échéances',
      deadlinesEmpty: 'Aucune date de lancement à venir sur tes plans.',
      deadlinesUntitled: 'Sans titre',
      deadlinesToday: 'Aujourd\'hui',
      deadlinesTomorrow: 'Demain',
      deadlinesInDays: (n) => `Dans ${n} jours`,
      deadlinesKindLaunch: 'Lancement',
      deadlinesKindSprint: (n) => `Fin du sprint ${n}`,
      deadlinesPointsLeft: (n) => `${n} pt${n > 1 ? 's' : ''} restant${n > 1 ? 's' : ''}`,
      deadlinesPointsDone: 'Tout est fait ✓',
      calendarWeekdays: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
      calendarPrev: 'Mois précédent',
      calendarNext: 'Mois suivant',
      calendarToday: 'Aujourd\'hui',
      calendarLegendLaunch: 'Lancement',
      calendarLegendSprint: 'Fin de sprint',
      calendarLegendActiveSprint: 'Sprint en cours',
      calendarSprintLabel: (n) => `Sprint ${n}`,
      calendarMoreStories: (n) => `+ ${n} autre${n > 1 ? 's' : ''}`
    },
    planFinancialReport: {
      title: (name) => `Rapport financier — ${name}`,
      grandTotal: 'Budget total (lancement + marketing)',
      launchBudget: 'Budget de lancement',
      marketingBudget: 'Budget marketing',
      cashProjection: 'Projection de trésorerie',
      cashProjectionSubtitle: 'Trésorerie restante mois par mois, au rythme de dépense actuel',
      costBreakdownSubtitle: 'Part de chaque poste dans la dépense mensuelle',
      monthShort: (n) => `Mois ${n}`,
      cashLegendRemaining: 'Trésorerie restante',
      cashLegendBurn: (amount) => `Dépense mensuelle : ${amount}`,
      exportPdf: 'Exporter en PDF',
      exportDocx: 'Exporter en Word',
      exportHtml: 'Exporter en HTML',
      exporting: 'Génération…'
    },
    planVersions: {
      back: 'Retour au plan',
      title: 'Bibliothèque de versions',
      cardDesc: 'Un instantané complet à chaque enregistrement — comparez deux versions pour voir ce qui a changé',
      pickerBody: 'Choisissez le plan dont vous voulez comparer les versions.',
      loading: 'Chargement…',
      none: 'Aucune version enregistrée pour ce plan pour le moment.',
      onlyOne: 'Une seule version enregistrée pour l\'instant — repassez après un nouvel "Enregistrer" pour comparer.',
      fromLabel: 'Avant',
      toLabel: 'Après',
      classification: 'Classification',
      marketingBudget: 'Budget marketing',
      roadmap: 'Roadmap',
      kpis: 'KPIs',
      personas: 'Personas',
      financials: 'Finances',
      executiveSummary: 'Résumé exécutif',
      noChange: 'Aucun changement entre ces deux versions.',
      compareLink: 'Comparer les versions'
    },
    team: {
      personalSpace: 'Personnel',
      switcherTitle: 'Espace',
      myTeams: 'Mes équipes',
      createTeam: 'Créer une équipe',
      createTeamTitle: 'Créer une équipe',
      createTeamBody: 'Les plans créés dans cet espace seront visibles par tous les membres de l\'équipe.',
      createTeamNamePlaceholder: 'Nom de l\'équipe',
      createTeamConfirm: 'Créer',
      createTeamCancel: 'Annuler',
      roleAdmin: 'Admin',
      roleMember: 'Membre',
      membersTitle: 'Membres',
      noTeamActive: 'Tu es dans ton espace personnel — sélectionne ou crée une équipe pour voir ses membres.',
      mockNotice: 'Équipe simulée en mode démo (aucune clé Clerk configurée) — les invitations réelles ne sont pas disponibles ici.',
      limitReachedFree: (limit) => `Le plan gratuit est limité à ${limit} espace d'équipe. Passe en Pro pour en créer jusqu'à 5, ou contacte-nous pour un nombre illimité en Entreprise.`,
      limitReachedPro: (limit) => `Ton plan Pro est limité à ${limit} espaces d'équipe. Contacte-nous pour passer en Entreprise et débloquer un nombre illimité d'espaces.`
    },
    account: {
      title: 'Mon compte',
      subtitle: 'Gère ton profil, tes plans et ton abonnement',
      backToApp: "Retour à l'app",
      creditsTitle: 'Génération de plans',
      creditsFree: (used, limit) => `${used} / ${limit} plans gratuits utilisés`,
      creditsProTitle: 'Membre Pro',
      creditsProSubtitle: 'Générations et exports illimités, débloqués sur ton compte.',
      creditsExhausted: 'Tu as utilisé tes 3 plans gratuits.',
      limitModalTitle: 'Limite de plans gratuits atteinte',
      limitModalBody: 'Tu as utilisé tes 3 plans gratuits. Passe en Pro pour générer des plans illimités, ou supprime un plan existant depuis ton compte si tu veux simplement faire de la place — attention, supprimer un plan ne te redonne pas de crédit.',
      limitModalManage: 'Voir mes plans',
      upgradeCta: 'Passer en Pro',
      upgradeTitle: 'Choisis ton offre',
      upgradeBody: 'Passe en Pro pour des générations illimitées et des équipes sans limite, ou contacte-nous pour une offre Entreprise sur mesure.',
      upgradeNote: 'Le paiement Stripe sera activé dès que la clé sera configurée côté serveur.',
      upgradeError: "Impossible de contacter Stripe pour l'instant. Réessaie dans un instant.",
      upgradeLoading: 'Redirection vers Stripe…',
      upgradeConfirm: 'Continuer vers le paiement',
      avatarChangeCta: 'Changer d\'avatar',
      avatarTitle: 'Choisis ton avatar',
      avatarUpload: 'Importer une photo',
      securityTitle: 'Sécurité & connexion',
      securityBody: 'Mot de passe, double authentification, appareils connectés et suppression de compte.',
      securityCta: 'Gérer la sécurité',
      plansSectionTitle: 'Historique de tous les plans',
      draftsSectionTitle: 'Mes brouillons',
      noPlans: 'Aucun plan généré pour le moment.',
      noDrafts: 'Aucun brouillon sauvegardé.',
      memberSince: 'Membre depuis',
      demoBadge: 'Compte démo',
      notificationsProNote: 'Les notifications de commentaires d\'équipe sont réservées au plan Pro.',
      plansFreeNote: 'Historique limité à l\'espace actif. Passe en Pro pour voir tous tes espaces regroupés.',
      clearNotifications: 'Tout effacer',
      clearNotificationsConfirmTitle: 'Effacer toutes les notifications ?',
      clearNotificationsConfirmBody: 'Elles disparaîtront de cette liste (les commentaires restent visibles sur leurs plans). Action irréversible.'
    },
    settings: {
      title: 'Paramètres',
      backToApp: "Retour à l'app",
      appearanceTitle: 'Apparence',
      themeLabel: 'Thème',
      themeDark: 'Sombre',
      themeLight: 'Clair',
      languageTitle: 'Langue',
      languageBody: "Langue de l'interface et des plans générés.",
      timezoneTitle: 'Fuseau horaire',
      timezoneBody: 'Utilisé pour afficher les dates (historique, notifications, exports).',
      timezoneAuto: 'Automatique (fuseau de cet appareil)',
      accessibilityTitle: 'Accessibilité',
      reduceMotionLabel: 'Réduire les animations',
      reduceMotionBody: 'Désactive les transitions et animations décoratives dans toute l\'application.',
      fontSizeLabel: 'Taille de police',
      fontSizeBody: "Ajuste la taille du texte dans toute l'application.",
      fontSizeNormal: 'Normal',
      fontSizeLarge: 'Grand',
      fontSizeXLarge: 'Très grand',
      highContrastLabel: 'Contraste renforcé',
      highContrastBody: 'Accentue le contraste du texte secondaire et des bordures pour une meilleure lisibilité.',
      formatsTitle: 'Formats',
      dateFormatLabel: 'Format de date',
      dateFormatBody: "Ordre jour/mois utilisé pour les dates numériques (calendriers, exports).",
      dateFormatAuto: 'Automatique (selon la langue)',
      dateFormatDMY: 'JJ/MM/AAAA',
      dateFormatMDY: 'MM/JJ/AAAA',
      currencyLabel: 'Devise',
      currencyBody: "Change le symbole affiché sur les montants (pas de conversion de taux de change).",
      integrationsTitle: 'Intégrations connectées',
      integrationsBody: 'Comptes tiers liés à VelocityLaunch pour les exports.',
      integrationsLoading: 'Vérification...',
      integrationsConnected: (detail) => `Connecté${detail ? ` — ${detail}` : ''}`,
      integrationsNotConnected: 'Non connecté',
      integrationsConnectedBadge: 'Connecté',
      integrationsNotConnectedBadge: 'Non connecté',
      integrationsDisconnect: 'Déconnecter',
      privacyTitle: 'Confidentialité & données',
      exportDataLabel: 'Exporter toutes mes données',
      exportDataBody: 'Télécharge un fichier JSON avec tes plans, brouillons et préférences.',
      exportDataCta: 'Exporter (JSON)',
      deleteAccountLabel: 'Supprimer mon compte',
      deleteAccountBody: 'Action définitive : supprime ton compte et toutes les données associées.',
      deleteAccountCta: 'Supprimer le compte',
      deleteAccountConfirm: 'Confirmer la suppression',
      deleteAccountCancel: 'Annuler',
      notificationsTitle: 'Notifications par email',
      notificationsBody: (email) => `Envoyées à ${email}.`,
      notifAgentDoneLabel: 'Génération IA terminée',
      notifAgentDoneBody: "Un email à chaque génération IA (veille, benchmarks, calendriers, RGPD, tableau IA, agents de backlog...).",
      notifInactiveLabel: 'Rappel plan inactif',
      notifInactiveBody: 'Un email si un plan reste sans activité depuis plus de 14 jours.',
      notifSlackLabel: 'Notifications Slack',
      notifSlackBody: 'Même déclencheurs, envoyés dans un canal Slack via un Incoming Webhook (créé de ton côté, aucune app à installer).',
      notifSlackDocsLink: 'Créer un webhook →',
      notifSlackSave: 'Enregistrer',
      notifSlackSaved: 'Enregistré ✓',
      notifVeilleAutoLabel: 'Veille IA automatique',
      notifVeilleAutoBody: "Régénère chaque lundi la veille des plans qui en ont déjà une, et te prévient uniquement si du contenu nouveau apparaît.",
      notifMentionsLabel: '@mentions dans les commentaires',
      notifMentionsBody: "Te prévient quand un membre d'équipe te mentionne (@toi) dans un commentaire sur un plan partagé.",
      notifWeeklyDigestLabel: 'Résumé hebdomadaire',
      notifWeeklyDigestBody: "Chaque lundi, un résumé de l'activité de la semaine (stories terminées, avancement, commentaires) pour tes plans actifs — envoyé uniquement s'il y a du mouvement.",
      webhooksTitle: 'Webhooks sortants',
      webhooksBody: "Branche n'importe quel outil externe (Zapier, Make, ton propre backend...) sur les événements de tes plans. Chaque livraison est signée en HMAC-SHA256 (header X-VelocityLaunch-Signature) pour que tu puisses vérifier son authenticité.",
      webhookEventGeneration: 'Génération IA terminée',
      webhookEventStory: 'Story marquée terminée',
      webhookAdd: 'Ajouter le webhook',
      webhookDelete: 'Supprimer',
      webhookError: "Impossible de créer le webhook. Vérifie l'URL (doit être en https) et qu'au moins un événement est coché.",
      webhookSecretTitle: 'Secret de signature — à copier maintenant',
      webhookSecretBody: 'Ce secret ne sera plus jamais affiché. Utilise-le pour vérifier la signature HMAC-SHA256 de chaque livraison.',
      webhookSecretDismiss: "J'ai copié le secret",
      brandingTitle: 'Marque personnalisée sur les exports',
      brandingBody: "Ajoute ton logo à côté du crédit VelocityLaunch sur la couverture et la clôture du pitch deck (PPTX), et en tête du PDF. Le crédit \"Généré avec VelocityLaunch\" reste toujours affiché — ce n'est pas un marque blanche complet.",
      brandingUpgrade: 'Passer Pro pour activer',
      brandingUpload: 'Importer un logo',
      brandingChange: 'Changer le logo',
      brandingRemove: 'Supprimer',
      brandingEnableLabel: 'Afficher mon logo sur les exports',
      brandingEnableBody: 'Désactive sans supprimer le logo importé.'
    }
  },
  en: {
    app: {
      title: 'Product Launch Planner',
      subtitle: 'Intelligent SaaS launch plan generator',
      newPlan: 'New plan',
      export: 'Export',
      save: 'Save',
      saved: 'Saved',
      coverImageTitle: 'Plan cover image',
      coverImageEdit: 'Change cover image',
      coverImageAdd: 'Add cover',
      coverImageChange: 'Change cover',
      coverTabGallery: 'Gallery',
      coverTabUpload: 'Upload',
      coverTabPexels: 'Pexels',
      coverTabLink: 'Link',
      coverUploadCta: 'Upload an image',
      coverPexelsPlaceholder: 'Search a photo…',
      coverPexelsSearch: 'Search',
      coverPexelsEmpty: 'No results for this search.',
      coverPexelsError: 'Search unavailable right now.',
      coverPexelsAttribution: 'Photos via',
      coverLinkSubmit: 'Use this link',
      coverRemove: 'Remove cover',
      pageBgTitle: 'Plan page background',
      pageBgAdd: 'Choose a page background',
      pageBgChange: 'Change page background',
      pageBgRemove: 'Remove page background',
      pageBgBlurOn: 'Blur on',
      pageBgBlurOff: 'Blur off',
      readOnlyBanner: "You're viewing this plan in read-only mode — you can't edit someone else's work.",
      readOnlyDuplicate: 'Duplicate to edit',
      unsavedChangesTitle: 'Unsaved changes',
      unsavedChangesBody: 'This plan has unsaved changes. If you continue without saving, they will be lost.',
      discardChanges: 'Continue without saving',
      saveAndContinue: 'Save and continue',
      ok: 'OK',
      pendingChangesTitle: (count) => count > 1 ? `${count} pending changes` : '1 pending change',
      discardPendingChanges: 'Discard changes'
    },
    steps: ['Product', 'Market', 'Resources', 'Priorities'],
    nav: {
      previous: 'Previous', next: 'Next', generate: 'Generate plan', generating: 'Generating…',
      continueLater: 'Continue later', draftSaved: '✓ Saved', myDrafts: 'My drafts',
      draftNamePrefix: 'Draft', draftUntitled: 'Untitled',
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
      nameHelp: 'The brand or product name as it will appear in the generated plan.',
      stage: 'Stage',
      stageOptions: { idea: 'Idea / concept', prelaunch: 'Pre-launch', mvp: 'MVP', beta: 'Private beta', growing: 'Growing', scaleup: 'Scale-up' },
      stageGlossary: {
        idea: 'Still an idea, nothing has been built yet.',
        prelaunch: 'Product is being built, not yet public.',
        mvp: 'Minimum Viable Product — the smallest version testable by real users.',
        beta: 'Tested by a small group before the public launch.',
        growing: 'Launched, with an ongoing user growth phase.',
        scaleup: 'Confirmed traction, scaling phase.'
      },
      category: 'SaaS category',
      categoryOptions: { pm: 'Project mgmt', analytics: 'Analytics', automation: 'Automation', hr: 'HR', finance: 'Finance', saas: 'B2B SaaS', marketplace: 'Marketplace', mobile: 'Mobile app', ecommerce: 'E-commerce', fintech: 'Fintech', edtech: 'EdTech', healthtech: 'HealthTech', devtools: 'Dev tools', ai: 'AI / ML', media: 'Content / Media', other: 'Other' },
      categoryGlossary: {
        pm: 'Project management — tools for managing projects and tasks.',
        analytics: 'Data tracking and analysis (dashboards, reporting...).',
        automation: 'Automating tasks or business processes.',
        hr: 'Human Resources (hiring, payroll, HR management...).',
        finance: 'Accounting, invoicing, financial management.',
        saas: 'Software as a Service sold to other businesses (B2B).',
        marketplace: 'A platform connecting two types of users (buyers/sellers).',
        mobile: 'An app primarily built for smartphones.',
        ecommerce: 'Selling products online.',
        fintech: 'Financial technology (payments, banking, investing...).',
        edtech: 'Education Technology — technology applied to learning.',
        healthtech: 'Health Technology — technology applied to healthcare.',
        devtools: 'Tools built for developers.',
        ai: 'Artificial Intelligence / Machine Learning.',
        media: 'Editorial content, streaming, or media in general.',
        other: 'None of the above categories fit.'
      },
      pitch: 'Short pitch',
      pitchPh: 'Describe your product in 2-3 lines…',
      pitchHelp: 'A 2-3 sentence summary: what your product does, who it\'s for, and the problem it solves.',
      usp: 'USP (Unique Selling Point)',
      uspPh: 'What sets you apart…',
      uspHelp: 'Unique Selling Proposition — what clearly sets you apart from competitors (a feature, a price, an audience...).',
      targetUser: 'Target user',
      targetUserOptions: { freelancers: 'Freelancers', smb: 'SMB', enterprise: 'Enterprise', niche: 'Niche', developers: 'Developers', startups: 'Startups', creators: 'Creators', consumers: 'Consumers' },
      targetUserGlossary: {
        freelancers: 'Independent workers.',
        smb: 'SMB — Small or Medium-sized Business (under ~250 employees).',
        enterprise: 'Large company, often with long sales cycles.',
        niche: 'A narrow, very specific audience.',
        developers: 'Technical profiles (devs, DevOps...).',
        startups: 'Young companies in a fast-growth phase.',
        creators: 'Content creators (influencers, YouTubers...).',
        consumers: 'General public, individual users.'
      }
    },
    market: {
      title: 'Market & audience',
      marketStatHelp: 'Business model (B2B/B2C) and geographic zone targeted by this launch.',
      geography: 'Geography',
      geographyOptions: { france: 'France', eu: 'EU', na: 'North America', latam: 'Latin America', apac: 'Asia-Pacific', mena: 'MENA', africa: 'Africa', global: 'Global' },
      geographyGlossary: {
        france: 'French market only.',
        eu: 'European Union — all 27 member states.',
        na: 'North America — mainly the US and Canada.',
        latam: 'Latin America — Mexico, Brazil, Central and South America.',
        apac: 'Asia-Pacific — Asia and the Pacific region (China, India, Japan, Australia...).',
        mena: 'Middle East & North Africa.',
        africa: 'The African continent (excluding North Africa if MENA is used separately).',
        global: 'No priority region, worldwide market.'
      },
      b2bVsB2c: 'B2B vs B2C',
      b2bVsB2cOptions: { b2b: 'B2B', b2c: 'B2C', hybrid: 'Hybrid', b2b2c: 'B2B2C', b2g: 'B2G (public sector)', d2c: 'D2C' },
      b2bVsB2cGlossary: {
        b2b: 'Business to Business — you sell to other companies.',
        b2c: 'Business to Consumer — you sell directly to individuals.',
        hybrid: 'A mix of B2B and B2C.',
        b2b2c: 'Business to Business to Consumer — you sell through companies that reach the general public.',
        b2g: 'Business to Government — you sell to public administrations or the public sector.',
        d2c: 'Direct to Consumer — direct sales to the consumer, no middleman.'
      },
      segment: 'Main segment',
      segmentPh: 'e.g. Remote teams / Hybrid orgs',
      segmentHelp: 'The precise customer profile you\'re targeting: industry, company size, use case or role.',
      audienceSize: 'Potential audience size',
      audienceSizeOptions: { xs: '< 1k', s: '1k-10k', m: '10k-100k', l: '100k+', xl: '1M+' },
      audienceSizeHelp: 'Estimated total number of people or businesses who could be interested in your product.',
      competition: 'Competition',
      competitionOptions: { none: 'None', low: 'Low', moderate: 'Moderate', high: 'High', emerging: 'Emerging market', saturated: 'Saturated (red ocean)' },
      competitionGlossary: {
        none: 'No competitors identified in this market.',
        low: 'A few competitors, market still open.',
        moderate: 'Several established competitors, contested but accessible market.',
        high: 'Many competitors, hard market to break into.',
        emerging: 'Recent market, still forming.',
        saturated: '"Red ocean" — a mature market with fierce competition and squeezed margins, as opposed to a "blue ocean" (a new market with no direct competition).'
      }
    },
    resources: {
      title: 'Timeline & resources',
      classificationHelp: 'This plan\'s main strategic phase, derived from the chosen priority and identified risks.',
      timelineWeeks: 'Time until launch',
      timelineOptions: { w2: '2 weeks', w4: '4 weeks', w8: '8 weeks', w12: '12 weeks', w16: '16 weeks', w26: '6 months', w36: '9 months', w52: '12 months' },
      timelineWeeksHelp: 'The delay you\'re aiming for between today and the public launch — it sets the pace of the plan\'s sprints.',
      launchWindowHelp: 'The plan\'s start date and the targeted effective launch date, with the duration between them.',
      scheduleProgressHelp: 'Where things stand today between the start date and the launch date — a calendar marker, not actual task progress.',
      daysLeftHelp: 'Days remaining until the targeted launch date.',
      daysLeft: (n) => `${n} days left`,
      daysLeftToday: 'Launching today',
      daysLeftOverdue: (n) => `${n} days past launch`,
      totalBudget: 'Total launch budget',
      totalBudgetOptions: { b500: '€500', b1k: '€1,000', b2k: '€2,000', b5k: '€5,000', b10k: '€10,000', b25k: '€25,000', b50k: '€50,000', b100k: '€100,000+' },
      totalBudgetHelp: 'The overall launch envelope, covering everything (development, marketing, operations). Used as the basis for the financial forecast. Distinct from the marketing budget below, which is only part of it.',
      budgetEur: 'Marketing budget',
      budgetOptions: { b500: '€500', b1k: '€1,000', b2k: '€2,000', b5k: '€5,000', b10k: '€10,000', b25k: '€25,000', b50k: '€50,000', b100k: '€100,000+' },
      budgetEurHelp: 'The share of your total budget specifically spent on marketing until launch (excluding salaries and product development) — used to split spend by channel.',
      teamSize: 'Team size',
      teamSizeOptions: { solo: 'Solo', small: '2-3', medium: '4-6', large: '7+', xlarge: '10-20', xxlarge: '20+' },
      teamSizeHelp: 'The number of people actively working on the project today.',
      rolesPresent: 'Roles present',
      rolesPresentHelp: 'The skills already present in your team — check everything that applies.',
      roles: { product: 'Product', marketing: 'Marketing', dev: 'Dev', design: 'Design', data: 'Data', growth: 'Growth', sales: 'Sales', support: 'Support', ops: 'Ops' }
    },
    priorities: {
      title: 'Priorities & context',
      focus: 'Priority',
      focusOptions: { acquire: 'Acquire users', retain: 'Retain', monetize: 'Monetize', fundraise: 'Raise funds', pmf: 'Reach product-market fit', churn: 'Reduce churn', international: 'Go international' },
      focusGlossary: {
        acquire: 'Grow the number of users or customers.',
        retain: 'Keep existing users active over time.',
        monetize: 'Generate or increase revenue.',
        fundraise: 'Prepare for or close a funding round with investors.',
        pmf: 'Product-Market Fit — the point where your product finally meets a real market need, validated by demand.',
        churn: 'Reduce the customer cancellation / drop-off rate.',
        international: 'Expand the product to new countries or markets.'
      },
      engagement: 'Engagement required',
      engagementOptions: { minimal: 'Minimal (passive)', moderate: 'Moderate', high: 'High (community)', community: 'Active community', whiteglove: 'White-glove support' },
      engagementHelp: 'How involved you expect your users to be day to day: simple passive use vs. an actual active community.',
      riskKnown: 'Known risks',
      riskOptions: { none: 'None', notready: 'Product not ready', pmf: 'Market fit unclear', budget: 'Budget limits', regulatory: 'Regulatory / compliance', techdebt: 'Technical debt', platform: 'Platform dependency', timing: 'Market timing', hiring: 'Hiring' },
      riskGlossary: {
        none: 'No major risk identified for now.',
        notready: 'The product isn\'t polished enough to launch yet.',
        pmf: 'Product-Market Fit unclear — the product hasn\'t yet proven it meets a real need.',
        budget: 'Available budget may not be enough.',
        regulatory: 'Legal, regulatory, or compliance constraints (GDPR, licenses...).',
        techdebt: 'Technical debt — code or architecture that needs rework and slows development down.',
        platform: 'Heavy dependency on a third-party platform (app store, API, social network...).',
        timing: 'Risk of bad market timing (too early or too late).',
        hiring: 'Difficulty hiring the right people in time.'
      },
      successMetric: 'Success metric',
      successOptions: { signups: '# Signups', arr: 'ARR', retention: 'Retention', community: 'Community size', mrr: 'MRR', nps: 'NPS', ltv: 'LTV', conversion: 'Conversion rate', activeUsers: 'DAU/MAU' },
      successGlossary: {
        signups: 'Number of signups — new accounts created.',
        arr: 'Annual Recurring Revenue — yearly recurring revenue from subscriptions.',
        retention: 'Share of users who stay active over time.',
        community: 'Size of your community (members, followers, subscribers...).',
        mrr: 'Monthly Recurring Revenue — monthly recurring revenue from subscriptions.',
        nps: 'Net Promoter Score — satisfaction and referral indicator (from -100 to 100).',
        ltv: 'Lifetime Value — total revenue generated by a customer over their whole relationship with you.',
        conversion: 'Conversion rate — share of visitors who become customers.',
        activeUsers: 'DAU/MAU — Daily/Monthly Active Users.'
      },
      rules: 'Generation rules (optional)',
      rulesOptions: {
        marketingFirst: 'Prioritize marketing before dev',
        designFirst: 'Design-led team',
        devFirst: 'Prioritize development',
        mobileFirst: 'Mobile-first',
        dataDriven: 'Data-driven approach',
        salesLed: 'Sales-led',
        plg: 'Product-led growth',
        complianceFirst: 'Compliance-first'
      },
      rulesGlossary: {
        marketingFirst: 'The plan emphasizes marketing actions before development tasks.',
        designFirst: 'The plan prioritizes design and user experience work.',
        devFirst: 'The plan prioritizes product development tasks.',
        mobileFirst: 'The plan is designed for mobile before desktop.',
        dataDriven: 'Data-driven — decisions rely on data and metrics rather than intuition.',
        salesLed: 'Sales-led — growth is driven primarily by a sales team rather than the product alone.',
        plg: 'Product-Led Growth — the product itself (free trial, usage) is the main acquisition driver.',
        complianceFirst: 'The plan addresses legal and compliance topics first (GDPR, regulation...).'
      },
      context: 'Anything else to add? (optional)',
      contextPh: "Specific constraints, market particularities, anything the questionnaire doesn't cover...",
      contextHelp: "Anything the previous questions don't cover: legal constraints, existing partnerships, local particularities...",
      contextDocument: 'Import a document (optional)',
      contextDocumentHelp: "Business plan, notes, existing deck... The text is extracted automatically and added to the context sent to the AI. You can review and edit it before generating the plan. Accepted formats: PDF, Word (.docx), Excel (.xlsx), PowerPoint (.pptx), photo/scan (JPG, PNG, WebP), 10 MB max. A page or photo with no selectable text (scanned document) automatically goes through optical character recognition (OCR).",
      contextDocumentButton: 'Import a document',
      contextDocumentAccepted: 'PDF, Word, Excel, PowerPoint, photo/scan · 10 MB max',
      contextDocumentReading: 'Reading the file…',
      contextDocumentOcrProgress: (page, total) => total > 1 ? `Running OCR — page ${page}/${total}…` : 'Running OCR on the image…',
      contextDocumentOcrUsed: 'Part of this text comes from optical character recognition (OCR) on scanned pages — review it before generating the plan, OCR is never perfect.',
      contextDocumentRemove: 'Remove',
      contextDocumentReplace: 'Replace',
      contextDocumentTruncated: 'This document is long: only the beginning was kept.',
      contextDocumentErrorTooLarge: 'File too large (10 MB maximum).',
      contextDocumentErrorFormat: 'Unsupported format. Use a PDF, Word, Excel, PowerPoint file, or a photo/scan (JPG, PNG, WebP).',
      contextDocumentErrorEmpty: 'No text found in this file (password-protected, or empty).',
      contextDocumentErrorScanned: 'Optical character recognition (OCR) could not read anything in this document — try a higher-quality scan, or paste the content directly above.',
      contextDocumentErrorGeneric: 'Could not read this file. Try again or paste the content directly above.'
    },
    gantt: {
      title: 'Interactive Gantt',
      subtitle: 'Overview by assignee — drag a bar to another column to reschedule it',
      dragHint: 'Tip: drag a bar to another sprint column to reschedule it. Click it to see the detail.',
      expand: 'View detail',
      collapse: 'Collapse',
      errors: {
        pastSprint: 'Cannot reschedule before the current sprint.',
        beforeDependency: 'This story depends on {dep} — it cannot be scheduled before it.',
        afterDependent: '{dep} depends on this story — it cannot be scheduled after it.'
      }
    },
    genTable: {
      title: 'AI plan analysis',
      subtitle: 'Describe what you want to see in one sentence: a table builds itself from your plan\'s real data, plus a chart on top when the comparison lends itself to one',
      placeholder: 'e.g. list of stories per sprint with their effort',
      generate: 'Generate',
      generating: 'Generating…',
      addRow: '+ Add row',
      removeRow: 'Remove row',
      removeColumn: 'Remove column',
      exportCsv: 'Export as CSV',
      suggestionsTitle: 'Not sure what to type? Try:',
      suggestions: [
        'Marketing budget by channel',
        'Effort per sprint',
        'KPI targets with their formula',
        'Budget split (product / marketing / ops)',
        'Tracking table for influencers to contact',
        'Launch checklist by week'
      ],
      empty: 'No result yet. Describe what you want to compare, track or list above — or start from a suggestion.',
      autoChartNote: 'Chart generated automatically from the table\'s two columns'
    },
    backlog: {
      title: 'Backlog',
      subtitle: (done, total) => `${done}/${total} stories done, across all sprints`,
      searchPlaceholder: 'Search a story...',
      filterAll: 'All statuses',
      filterTodo: 'To do',
      filterInProgress: 'In progress',
      filterDone: 'Done',
      filterAllAssignees: 'All assignees',
      empty: 'No story matches these filters.'
    },
    burndown: {
      title: 'Burndown chart',
      subtitle: 'Remaining effort (points) vs time — dashed ideal line, solid actual line',
      allSprints: 'All sprints',
      ideal: 'Ideal',
      actual: 'Actual',
      onTrack: 'On track',
      behind: 'Behind',
      start: 'Start',
      finish: 'Finish',
      today: 'Today',
      remaining: 'Remaining',
      gap: 'Gap vs ideal',
      daysLeft: (n) => `${n} day${n > 1 ? 's' : ''} left`,
      ahead: (n) => `${n} pt${n > 1 ? 's' : ''} ahead`,
      late: (n) => `${n} pt${n > 1 ? 's' : ''} behind`
    },
    dashboardBi: {
      title: 'Dashboard',
      subtitle: 'Cross-cutting overview of the plan — budget, workload, velocity and KPIs',
      budgetByChannel: 'Budget by channel',
      workloadByRole: 'Workload by role',
      velocityBySprint: 'Velocity by sprint',
      kpiTargets: 'KPI targets',
      kpiTargetsHint: 'From post-launch tracking',
      costSplit: 'Cost split',
      overallProgress: 'Overall progress',
      storyCount: (n) => n === 1 ? '1 story' : `${n} stories`,
      total: 'Total',
      totalEffort: 'Total effort',
      monthlyBurn: 'Monthly burn',
      schedulePace: 'Pace vs schedule',
      paceStories: 'Stories',
      paceCalendar: 'Calendar',
      pointsDone: 'done',
      statusDone: 'Done',
      statusInProgress: 'In progress',
      statusTodo: 'Not started',
      statusOverdue: 'Overdue',
      overallProgressHelp: 'Story progress by effort (points), not by count: done counts in full, in progress counts as half. The color breakdown distinguishes done, in progress, not started and overdue (sprint already meant to be over).',
      schedulePaceCardHelp: 'Compares actual story progress to the time already elapsed between the start date and the launch date — to see if the plan is moving faster or slower than planned.',
      costSplitHelp: 'Launch budget breakdown by spending category (development, design, infra, operations, legal, reserve), with the marketing budget added separately — it\'s not part of the launch budget, it\'s added on top of it.',
      budgetByChannelHelp: 'Marketing budget (separate from the launch budget) broken down by acquisition channel.',
      workloadByRoleHelp: 'Effort points per real team member. Work without a named assignment is split evenly across all members, for lack of a better signal.',
      velocityBySprintHelp: 'One colored segment per responsible person in each sprint bar (same colors as "Workload by role"), with a dark overlay over the portion not yet done.',
      kpiTargetsCardHelp: 'Latest measured value for each KPI, compared to its target — fed by the data entered in post-launch tracking.'
    },
    sidebar: {
      title: 'Plan overview',
      persona: 'Persona',
      collapse: 'Collapse panel',
      expand: 'Expand panel',
      createPlan: 'Create a new plan',
      groups: {
        synthese: 'Overview',
        market: 'Market & strategy',
        execution: 'Roadmap & delivery',
        gtm: 'Go-to-market',
        performance: 'Performance & finance',
        compliance: 'Compliance',
        aitools: 'AI tools',
        postlaunch: 'Post-launch tracking'
      }
    },
    rgpd: {
      title: 'GDPR compliance',
      subtitle: 'An AI-generated compliance assessment with an actionable checklist',
      empty: 'Generate a GDPR assessment tailored to your product: applicability, compliance checklist, draft processing register and recommendations.',
      generate: 'Assess compliance',
      regenerate: 'Regenerate',
      generating: 'Analyzing...',
      checklist: 'Compliance checklist',
      priority: { high: 'High', medium: 'Medium', low: 'Low' },
      register: 'Processing register (draft)',
      data: 'Data',
      purpose: 'Purpose',
      basis: 'Legal basis',
      recommendations: 'Recommendations',
      disclaimer: 'This assessment is automated compliance guidance, not legal advice. Have it reviewed by a lawyer before launch.',
      byAi: 'Assessment generated by AI',
      byRules: 'Assessment generated locally (rules engine)',
      officialResources: 'Official resources',
      officialResourcesSubtitle: 'Authoritative sources, to go verify for yourself',
      resources: [
        { label: 'Official GDPR text (EU Regulation 2016/679)', url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32016R0679' },
        { label: 'European Data Protection Board (EDPB)', url: 'https://www.edpb.europa.eu/' },
        { label: 'GDPR.eu — Plain-English compliance guide', url: 'https://gdpr.eu/' },
        { label: 'CNIL — Developer\'s guide to GDPR (France)', url: 'https://www.cnil.fr/fr/development-web-et-mobile-les-bonnes-pratiques' },
        { label: 'ICO (UK) — Guide to the UK GDPR', url: 'https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/' },
        { label: 'IAPP — International Association of Privacy Professionals', url: 'https://iapp.org' },
        { label: 'European Commission — Data protection', url: 'https://commission.europa.eu/law/law-topic/data-protection_en' },
        { label: 'OWASP — Data protection best practices', url: 'https://owasp.org' },
        { label: 'NIST — Privacy Framework', url: 'https://www.nist.gov/privacy-framework' },
        { label: 'Data Protection Commission (Ireland)', url: 'https://www.dataprotection.ie' }
      ]
    },
    advertising: {
      title: 'Advertising calendar',
      subtitle: 'An AI-generated paid-media plan, split by channel and objective',
      empty: 'Generate a 4-week advertising calendar: campaigns per channel with objective, format, audience, budget and expected KPI.',
      generate: 'Generate media plan',
      regenerate: 'Regenerate',
      generating: 'Generating...',
      week: 'Week',
      totalBudget: 'Total media budget',
      objective: { awareness: 'Awareness', consideration: 'Consideration', conversion: 'Conversion' },
      exportCsv: 'Export to CSV',
      byAi: 'Media plan generated by AI',
      byRules: 'Media plan generated locally (rules engine)'
    },
    editorial: {
      title: 'Editorial calendar',
      subtitle: 'A ready-to-execute content plan, AI-generated from your channels',
      empty: 'Generate a 4-week editorial calendar: content per week and per channel, with format, title, angle and call-to-action.',
      generate: 'Generate calendar',
      regenerate: 'Regenerate',
      generating: 'Generating...',
      week: 'Week',
      cta: 'CTA',
      exportCsv: 'Export to CSV',
      byAi: 'Calendar generated by AI',
      byRules: 'Calendar generated locally (rules engine)'
    },
    gtm: {
      title: 'Content & advertising calendar',
      subtitle: 'Organic content and paid campaigns, week by week, AI-generated',
      scopeNote: 'This calendar details the concrete execution (what to publish, in which format, for which audience) of the budget allocation set in Marketing strategy — the same channels appear here deliberately, at a tactical rather than financial level.',
      generateAll: 'Generate full calendar',
      generating: 'Generating...',
      empty: 'Generate the content and advertising calendar: what goes out each week, on which channel, and what you spend on paid media.',
      week: 'Week',
      content: 'Organic content',
      paid: 'Paid campaigns',
      contentEmpty: 'No editorial content generated yet',
      paidEmpty: 'No media campaign generated yet',
      regenerateContent: 'Regenerate content',
      regeneratePaid: 'Regenerate campaigns',
      exportContentCsv: 'Export content (CSV)',
      exportPaidCsv: 'Export campaign brief (CSV)',
      exportPaidCsvHint: 'A cheat sheet to keep handy while manually creating your campaigns (or to hand off to whoever creates them for you) — suggested names, dates and budgets already worked out. Not an automatic import file.',
      exportGoogleAds: 'Export for Google Ads Editor',
      exportGoogleAdsHint: 'File in Google Ads Editor\'s CSV import format (campaigns created paused — review and enable them yourself). Only includes campaigns whose channel mentions "Google".',
      exportHintBoth: 'Two exports, two jobs: the campaign brief CSV is your cheat sheet for building campaigns yourself (or handing them off) — names, dates and budgets already worked out, ready to copy-paste. Running on Google Ads specifically? Grab "Export for Google Ads Editor" instead — that file imports straight into the tool and builds the campaigns for you, paused and ready to review before you flip them on.',
      totalPaidBudget: 'Total media budget',
      budgetDrift: (liveBudget) => `The simulated budget in "Marketing Strategy" has changed (${liveBudget.toLocaleString()} €) — regenerate to apply it here.`,
      channelLink: 'Platform link'
    },
    benchmarks: {
      title: 'Benchmarks',
      subtitle: 'See how your targets compare to industry norms, generated by AI',
      empty: 'Generate industry benchmarks to validate your KPIs and budget: conversion, CAC, churn, activation, per-channel references and an actionable takeaway.',
      generate: 'Generate benchmarks',
      regenerate: 'Regenerate',
      generating: 'Generating...',
      metric: 'Metric',
      industry: 'Industry',
      yours: 'Your plan',
      verdictLabel: 'Verdict',
      verdict: { below: 'Below norm', onpar: 'On par', above: 'Above' },
      channels: 'Per-channel references',
      sources: 'Go further',
      byAi: 'Benchmarks generated by AI',
      byRules: 'Benchmarks generated locally (rules engine)'
    },
    veille: {
      title: 'AI Watch',
      subtitle: 'AI-generated competitive & market intelligence to stay one step ahead',
      empty: 'Generate a 360° watch tailored to your product and market: competitors to track, trends, signals, opportunities, threats and sources to follow.',
      generate: 'Generate watch',
      regenerate: 'Regenerate',
      generating: 'Generating...',
      competitors: 'Competitors to watch',
      watchLabel: 'Watch for',
      trends: 'Market trends',
      signals: 'Signals to watch',
      opportunities: 'Opportunities',
      threats: 'Threats',
      sources: 'Sources & keywords to follow',
      byAi: 'Watch generated by AI',
      byRules: 'Watch generated locally (rules engine)'
    },
    copilot: {
      title: 'Nova',
      subtitle: 'Chat with your plan in natural language: "cut marketing budget by 20%", "add a B2C persona"...',
      openButton: 'Nova',
      placeholder: 'e.g. cut marketing budget by 20%...',
      send: 'Send',
      thinking: 'Nova is thinking...',
      empty: 'Ask a question or request a change — Nova takes care of the rest!',
      error: 'Nova is unavailable right now. Please try again shortly.',
      changesApplied: 'change(s) applied to the plan — remember to click "Save" to keep them',
      noChanges: 'No changes applied.',
      close: 'Close Nova',
      minimize: 'Minimize',
      expand: 'Expand',
      shrink: 'Shrink',
      newConversation: 'New conversation',
      copyReply: 'Copy reply',
      copied: 'Copied!',
      inputHint: '↵ Send · Shift+↵ New line · ⌘K Open/close · Esc Close',
      openTooltip: 'Open Nova (⌘K)',
      suggestions: [
        'Cut marketing budget by 20%',
        'Add a B2C persona',
        'Summarize the main risks',
        'Suggest a priority story'
      ],
      greeting: { morning: 'Good morning', afternoon: 'Good afternoon', evening: 'Good evening' },
      historySearchPlaceholder: 'Search a conversation…',
      historyEmpty: 'No saved conversation for this plan.',
      historyToday: 'Today',
      historyWeek: 'Past 7 days',
      historyOlder: 'Older',
      historyDelete: 'Delete this conversation'
    },
    agents: {
      title: 'AI Agents',
      subtitle: 'Asynchronous AI actions running in the background, independent of this page: trigger one, close the tab if you want, the result waits in the log below',
      briefLabel: 'Write an execution brief',
      briefDesc: 'Pick a story and the agent writes a ready-to-execute brief: concrete steps, resources needed, risks to anticipate.',
      kpiLabel: 'Recalculate KPIs',
      kpiDesc: 'The agent re-evaluates your KPI targets from actual roadmap progress (stories done, time elapsed) — useful after a few sprints, so you\'re not steering by day-1 targets.',
      riskLabel: 'Analyze plan risks',
      riskDesc: 'The agent identifies 3 to 5 priority risks specific to your product and market, each with a concrete mitigation.',
      budgetLabel: 'Optimize marketing budget',
      budgetDesc: 'The agent reviews your current per-channel budget split and proposes justified moves (increase, decrease, maintain).',
      rescheduleLabel: 'Dynamic auto-scheduling',
      rescheduleDesc: 'The agent recalculates the sprint schedule from real progress and blocked dependencies, and proposes story moves.',
      prioritizeLabel: 'External signal prioritization',
      prioritizeDesc: 'The agent scores backlog stories by urgency using external market signals (competition, trends, user demand).',
      selectStory: 'Choose a story...',
      run: 'Run',
      apply: 'Apply',
      applied: 'Applied',
      logTitle: 'Activity log',
      logEmpty: 'No action triggered yet.',
      deleteTask: 'Delete this generation',
      type: {
        story_brief: 'Execution brief',
        recalc_kpis: 'KPI recalculation',
        risk_analysis: 'Risk analysis',
        budget_optimization: 'Budget optimization',
        dynamic_reschedule: 'Dynamic auto-scheduling',
        external_signal_prioritization: 'External signal prioritization'
      },
      status: {
        queued: 'Queued',
        running: 'Running',
        done: 'Done',
        error: 'Error'
      },
      severity: { high: 'Critical', medium: 'Moderate', low: 'Minor' },
      direction: { increase: 'Increase', decrease: 'Decrease', maintain: 'Maintain' },
      signal: { market_trend: 'Market trend', competitor_move: 'Competitor move', user_demand: 'User demand', regulatory: 'Regulatory' }
    },
    tracking: {
      title: 'Post-launch tracking',
      subtitle: (kpiName) => `Target vs actual on "${kpiName}"`,
      actualValue: 'Actual value',
      notePh: 'Note (optional) — e.g. paid campaign launched',
      addSnapshot: 'Add',
      target: 'Target',
      actual: 'Actual',
      onTrack: 'On target',
      behind: 'Below target',
      empty: 'Add your first real measurement to see the trend, the projected target date, and the gap vs plan.',
      launchLabel: 'Launch:',
      editLaunchDate: 'Edit launch date',
      notLaunchedYet: (date) => `Launch planned for ${date}.`,
      daysUntilLaunch: (n) => `Tracking unlocks in ${n} day${n > 1 ? 's' : ''}. You can correct the date above if needed.`,
      currentValue: 'Current value',
      ofTargetPct: (pct) => `${pct}% of target`,
      trend: 'Trend',
      perWeek: '/ week',
      projection: 'Projection',
      projectionReached: 'Target reached',
      projectionOn: (date) => `Reached around ${date}`,
      projectionNone: 'Current pace won\'t reach the target',
      projectionNoTarget: 'No numeric target',
      needMorePoints: 'Add 2 data points to see the trend',
      daysSinceLaunch: 'Days since launch',
      noHistoryYet: 'No data yet',
      selectKpi: 'Tracked KPI',
      viewHistory: (n) => `View history (${n})`,
      hideHistory: 'Hide history',
      quickAddLabel: 'Add a measurement'
    },
    whatif: {
      title: 'Budget & timeline simulator',
      subtitle: 'Adjust budget and duration to see the live impact on your finances, roadmap and marketing — without changing the original plan',
      budgetLabel: 'Budget',
      timelineLabel: 'Duration',
      currentPlan: 'Current plan',
      simulated: 'Simulation',
      burnLabel: 'Burn/month',
      runwayLabel: 'Runway',
      breakEvenLabel: 'Break-even (users)',
      sprintsLabel: 'Sprints',
      channelsTitle: 'Simulated marketing split',
      weeksUnit: 'weeks',
      vsCurrent: 'vs current plan'
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
      persona: {
        painPoints: 'Pain points',
        goals: 'Goals',
        channel: 'Preferred channel',
        trigger: 'Buying trigger'
      },
      sprint: 'Sprint',
      duration: 'Duration',
      estimatedCost: 'Estimated cost',
      weeks: 'weeks',
      timelineMismatch: (roadmapWeeks, targetWeeks) => `This roadmap runs ${roadmapWeeks} weeks, but the target timeline in Budget & Timeline is ${targetWeeks} weeks — rebuild the roadmap to align them, or ignore this if the gap is intentional.`,
      roadmapSubtitle: 'Sprint execution plan',
      prepStartLabel: 'Sprints start:',
      editPrepStartDate: 'Edit sprints start date',
      projectedLaunchLabel: 'Projected launch:',
      prepStartHint: 'Date Sprint 1 begins — change it if work actually started before or after today. The roadmap, Gantt, burndown and calendar all recalculate from it.',
      projectedLaunchHint: 'This date + the total sprint duration below. The "Timeline" slider on the Budget & Timeline card only moves this displayed target date — it does NOT change the actual sprint duration (that requires rebuilding them, losing already-planned work). For the roadmap to actually match the new timeline, it has to be rebuilt: there is no way to extend an already-planned roadmap without starting over.',
      kpiSubtitle: 'Key success metrics',
      kpiPrimaryBadge: 'Primary KPI',
      kpiViewCards: 'Cards',
      kpiViewTable: 'Table',
      kpiTableName: 'KPI',
      kpiTableTarget: 'Target',
      kpiTableFormula: 'Formula',
      kpiTableFrequency: 'Frequency',
      marketingChannelsTitle: 'Marketing channels',
      marketingBudgetLabel: 'Marketing budget',
      marketingBudgetCapHint: (max) => `Capped at the total launch budget (${max})`,
      budgetTimeline: {
        title: 'Budget & Timeline',
        subtitle: 'Single source for the total budget and target timeline — drives the financial forecast, the marketing budget and the plan\'s identity card',
        budgetLabel: 'Total launch budget',
        timelineLabel: 'Target time to launch',
        weeks: (n) => n === 1 ? '1 week' : `${n} weeks`,
        hint: 'The roadmap (sprint count, already-planned stories) does not change automatically with the timeline — only the target launch date updates, so existing roadmap work is never silently overwritten.',
        regenerateButton: 'Rebuild the roadmap from the current timeline',
        regenerateConfirmTitle: 'Rebuild the roadmap?',
        regenerateConfirmBody: 'This entirely replaces the current sprints and stories with a new roadmap based on the current timeline. Everything already generated or edited on the roadmap (story moves, statuses, manual edits) will be lost — this cannot be undone once saved.',
        regenerateCancel: 'Cancel',
        regenerateConfirm: 'Rebuild anyway'
      },
      allocatedLabel: 'Allocated to active channels',
      enableChannel: 'Enable this channel',
      disableChannel: 'Disable this channel',
      viewAssets: 'View ready-to-use content',
      executiveSummaryTitle: 'Executive summary',
      strategyLabel: 'Strategy',
      marketingScopeNote: 'This card sets the budget allocation per channel (how much and where) — the week-by-week execution detail (what to publish, in which format) lives in the Content & advertising calendar, which deliberately reuses the same channels at a tactical level.',
      risksLabel: 'Risks',
      budgetAvailable: (amount) => `Available budget: ${amount}`,
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
      abSubtitle: 'Work out how many visitors and how much time you need before trusting an A/B test result',
      abBaselineHint: 'The current conversion rate of the variant you\'re testing (e.g. 3 signups per 100 visitors = 3%)',
      abMdeHint: 'The smallest gap between the two variants you want to be able to detect (e.g. 20% = going from 3% to 3.6%)',
      abVisitorsHint: 'The daily traffic sent to each tested variant — only affects the estimated duration below, never the required sample size (which depends only on the baseline rate and the minimum detectable effect)',
      abResultCaption: 'With these assumptions, this is the volume you need per variant before you can say the conversion gap between A and B isn\'t due to chance',
      channel: 'Channel',
      name: 'Name',
      unit: 'Unit',
      baseline: 'Baseline',
      category: 'Category',
      executiveSummary: 'Executive summary',
      copySummary: 'Copy summary',
      summaryCopied: 'Copied!',
      planReadyTitle: 'Your launch plan is ready!',
      planReadySubtitle: (dateTime) => `Generated just now, ${dateTime}.`,
      planLoadedTitle: 'Ready to pick back up?',
      planLoadedSubtitle: (dateTime) => `This plan was generated ${dateTime}. Every change is logged in the history →`,
      historyPanelTitle: 'History',
      historyExpand: 'Open history',
      historyCollapse: 'Collapse history',
      historyClear: 'Clear history',
      historyClearConfirmTitle: 'Delete the entire history?',
      historyClearConfirmBody: 'This permanently erases the change log for this plan. The plan itself is untouched — only the history disappears, and this can\'t be undone.',
      historyClearCancel: 'Cancel',
      historyClearConfirm: 'Yes, delete everything',
      assets: {
        post: 'Post brief',
        email: 'Email subject',
        landing: 'Landing tagline'
      },
      financials: {
        title: 'Financial forecast',
        subtitle: 'Simplified estimate based on your total budget',
        monthlyBurn: 'Monthly burn',
        runway: 'Runway',
        months: 'months',
        breakEven: 'Break-even point',
        clients: 'paying customers',
        breakEvenNote: (users, revenue, arpu) => `≈ €${revenue.toLocaleString()}/month at €${arpu}/customer`,
        arpuLabel: 'Why this ARPU:',
        breakdown: 'Budget breakdown',
        runwayChartTitle: 'Budget trajectory',
        runwayChartSubtitle: 'Remaining budget month by month, at the current burn rate',
        runwayDepleted: 'Budget depleted',
        bridgeTitle: 'Cost vs. required revenue',
        bridgeSubtitle: 'What it costs you per month, versus what you need to generate to break even',
        bridgeCost: 'Monthly burn',
        bridgeRevenue: 'Required revenue'
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
        status: { todo: 'To do', inProgress: 'In progress', done: 'Done' },
        moveToCurrent: 'Move to current sprint',
        current: 'Current sprint',
        progress: 'complete'
      }
    },
    notifCenter: {
      title: 'Notifications',
      empty: 'No notifications yet.',
      markAllRead: 'Mark all as read',
      deleteAll: 'Delete all',
      confirmDeleteAll: 'Permanently delete all notifications?'
    },
    cookieBanner: {
      title: 'Before you launch your next plan...',
      body: "We keep this as lean as a good roadmap: enough to recognize you, remember your preferences, and save your drafts. Nothing lingering, nothing snooping — you call the rest.",
      essentialTitle: 'Essential',
      essentialBody: 'Always on',
      preferencesTitle: 'Preferences',
      preferencesBody: 'Optional',
      analyticsTitle: 'Statistics',
      analyticsBody: 'Optional',
      marketingTitle: 'Marketing',
      marketingBody: 'Optional',
      acceptAll: 'Accept all',
      savePrefs: 'Save my choices',
      learnMore: 'Learn more',
      continueWithoutAgreeing: 'Continue without agreeing',
      settingsTitle: 'Settings',
      settingsBody: "Each category serves a specific purpose. Preferences remembers your theme, language and display settings across visits. Statistics enables Cloudflare Web Analytics to measure site traffic. Marketing enables Meta Pixel and LinkedIn Insight Tag to measure our ad campaign performance. Turn on only what you want: no optional category runs without your consent.",
      collapse: 'Collapse',
      reopen: 'Cookies & privacy'
    },
    collab: {
      presenceTitle: 'People with this plan open right now',
      viewing: (n) => n === 1 ? '1 other person here' : `${n} other people here`,
      onlineSuffix: 'is online',
      moreOnline: (n) => `+${n} more`,
      toastMultiple: (n) => `edited ${n} roadmap items`
    },
    export: {
      title: 'Export plan',
      json: 'Export JSON',
      csv: 'Export CSV',
      pdf: 'Export PDF',
      pptx: 'Export pitch deck (PPTX)',
      image: 'Export image (PNG)',
      complianceReport: 'Investor report',
      complianceNoFinancials: 'No financial data generated for this plan yet.',
      complianceNoRgpd: 'No GDPR analysis generated for this plan yet — run it from the GDPR section before exporting this report so it is complete.',
      complianceDisclaimer: 'This document is generated automatically for guidance only — have it reviewed by legal and financial counsel before sharing it with investors or partners.',
      integrations: 'Integrations',
      notion: 'Export to Notion',
      notionExporting: 'Exporting to Notion...',
      notionConnecting: 'Connecting to Notion...',
      notionOpen: 'Open Notion page →',
      notionNoParent: 'No page shared with the integration. In Notion, share a page with VelocityLaunch and try again.',
      notionSignIn: 'Sign in to export to Notion.',
      notionCancelled: 'Notion connection cancelled.',
      notionUnavailable: 'Notion export is unavailable right now.',
      notionSync: 'Sync to Notion',
      notionSyncing: 'Syncing...',
      notionPartial: (n) => `Synced, but ${n} stor${n === 1 ? 'y' : 'ies'} couldn't be updated. Try again.`,
      jira: 'Export to Jira',
      jiraExporting: 'Exporting to Jira...',
      jiraConnecting: 'Connecting to Jira...',
      jiraSite: 'Jira site',
      jiraProject: 'Project',
      jiraConfirm: 'Create tickets',
      jiraOpen: 'Open Jira board →',
      jiraDone: (created, updated) => `${created} ticket(s) created${updated ? `, ${updated} updated` : ''}.`,
      jiraSignIn: 'Sign in to export to Jira.',
      jiraCancelled: 'Jira connection cancelled.',
      jiraNoProjects: 'No accessible Jira project. Check your permissions on a project.',
      jiraUnavailable: 'Jira export is unavailable right now.',
      jiraReconnect: 'Reconnect Jira (new permissions)',
      linear: 'Export to Linear',
      linearExporting: 'Exporting to Linear...',
      linearApiKey: 'Linear personal API key',
      linearApiKeyHelp: 'Create a key in Linear (Settings > Security & access) and paste it here.',
      linearApiKeyLink: 'Create an API key →',
      linearConnect: 'Connect',
      linearInvalidKey: 'Invalid or revoked API key.',
      linearTeam: 'Linear team',
      linearConfirm: 'Create tickets',
      linearOpen: 'Open Linear →',
      linearDone: (created, updated) => `${created} ticket(s) created${updated ? `, ${updated} updated` : ''}.`,
      linearSignIn: 'Sign in to export to Linear.',
      linearNoTeams: 'No accessible Linear team with this key.',
      linearUnavailable: 'Linear export is unavailable right now.',
      linearReconnect: 'Reconnect Linear (new key)',
      gcal: 'Export to Google Calendar',
      gcalExporting: 'Exporting to Google Calendar...',
      gcalConnecting: 'Connecting to Google Calendar...',
      gcalCalendar: 'Calendar',
      gcalConfirm: 'Create events',
      gcalOpen: 'Open Google Calendar →',
      gcalDone: (created, updated) => `${created} event(s) created${updated ? `, ${updated} updated` : ''}.`,
      gcalSignIn: 'Sign in to export to Google Calendar.',
      gcalCancelled: 'Google Calendar connection cancelled.',
      gcalNoCalendars: 'No writable calendar on this Google account.',
      gcalUnavailable: 'Google Calendar export is unavailable right now.',
      gcalReconnect: 'Reconnect Google Calendar (new permissions)',
      github: 'Sync to GitHub',
      githubSyncing: 'Syncing to GitHub...',
      githubConnecting: 'Connecting to GitHub...',
      githubRepo: 'Repository',
      githubConfirm: 'Create issues',
      githubOpen: 'Open GitHub issues →',
      githubDone: (created, updated) => `${created} issue(s) created${updated ? `, ${updated} updated` : ''}.`,
      githubSignIn: 'Sign in to sync to GitHub.',
      githubCancelled: 'GitHub connection cancelled.',
      githubNoRepos: 'No accessible repository with issue-creation permissions.',
      githubUnavailable: 'GitHub sync is unavailable right now.',
      githubReconnect: 'Reconnect GitHub',
      close: 'Close'
    },
    errors: {
      generic: 'Something went wrong. Try again.'
    },
    modals: {
      pricing: {
        title: 'Pricing',
        intro: 'Start for free, upgrade to Pro whenever you need — no commitment, cancel anytime.'
      },
      changelog: {
        title: 'Changelog',
        entries: [
          {
            date: 'August 23, 2026',
            title: 'Portfolio health simplified: flat capped penalty, no more proportionality',
            items: [
              'Removed the penalty scaled to your number of plans (found too hard to follow): each urgent deadline now costs a flat 10 pts (capped at -30 total), each upcoming deadline a flat 4 pts (capped at -15) — easier to verify by hand',
              'Removed the "No urgent deadlines" line, which duplicated and seemingly contradicted the detail sentence right below it (which covers both "urgent" AND "upcoming" deadlines) — a single detail sentence now',
              'Fixed stray white bullets to the left of the colored dots in the "By plan" list (default browser bullet on `<li>` elements, never disabled)'
            ]
          },
          {
            date: 'August 23, 2026',
            title: 'Avatars on notifications, fixed left-side calendar popup, remaining points',
            items: [
              'Notification center and Dashboard activity feed: small avatar on the left of each row — colored initials when a name is found, Nova\'s avatar for system notifications (AI generation)',
              'Fixed the calendar day popup not being scrollable on the left side of the grid (clipped by the widget card\'s overflow) — now rendered outside the card, like the context menus and tooltips already fixed',
              '"Upcoming deadlines": now shows remaining points for EVERY sprint end (previously only when non-zero), with "All done ✓" when the sprint is wrapped up'
            ]
          },
          {
            date: 'August 23, 2026',
            title: 'Portfolio health gauge split by plan, tooltip discoverability hint',
            items: [
              'The gauge itself now splits into one colored segment per plan (green/orange/red by level) instead of a single arc for the aggregated score — spot at a glance, without hovering, which plan(s) are dragging the portfolio down',
              'Each gauge segment has its own native tooltip on hover (plan name + calculation detail), in addition to the one already on the "By plan" list',
              'Added a small "?" icon next to "By plan": the only hint that a tooltip exists on hover, invisible until now'
            ]
          },
          {
            date: 'August 23, 2026',
            title: 'Clarity on Portfolio health, Next button alignment, misc fixes',
            items: [
              'Portfolio health: the detail sentence reworded into real sentences ("62% of stories are done. 2 deadlines coming up (-10 pts).") instead of a compact, not-very-explicit format ("62% done · -10 pts (2 soon)")',
              'Portfolio health: each "By plan" row now shows that specific plan\'s own calculation breakdown on hover, not just the card\'s aggregated score',
              'Sprint color marker in the calendar popover: switched from vertical to horizontal (user feedback)',
              'Plan creation form: fixed the "Next" button dropping to its own line instead of staying aligned with Previous/Save for later/My drafts at intermediate screen widths',
              'Fixed the "Plan history" widget overlap at Small size again: the title now truncates to one line instead of wrapping and overlapping the first list item'
            ]
          },
          {
            date: 'August 23, 2026',
            title: 'Portfolio health by plan, remaining points on deadlines, calendar by sprint',
            items: [
              'Portfolio health (Medium/Large sizes): adds a "By plan" breakdown — each plan with its own score and level, sorted worst to best, to spot which one is dragging the average down instead of a single aggregated score',
              'Upcoming deadlines: sprint-end entries now show remaining points (stories not yet done) right in the list',
              'Dashboard calendar: active sprints now show a continuous colored line (one color per sprint) across their full span, instead of the same flat tint for every sprint — two overlapping sprints stay distinguishable at a glance',
              'Fixed text overflow on the "Plan history" widget at Small size'
            ]
          },
          {
            date: 'August 23, 2026',
            title: 'Streak with a record + tiers, detailed legend on the 3 new widgets',
            items: [
              'Streak: now keeps the longest streak ever reached (derived from the same plan history, no separate storage), shown next to the current streak',
              'Streak: visual tiers — gradient flame from 7 days ("On fire 🔥"), gold flame from 30 days ("Unstoppable ⚡"), badge visible even at Small size',
              'Portfolio health, Streak, and Business weather now show a full legend (thresholds, tiers, exact calculation method) at Medium/Large size — no more guessing what the number represents'
            ]
          },
          {
            date: 'August 23, 2026',
            title: 'Portfolio health: deadline penalty now scales with your number of plans',
            items: [
              'The points removed for an urgent/upcoming deadline used to be a flat amount (-12/-4 pts per deadline), the same whether you had 1 plan in progress or a 10-plan portfolio — 2 urgent deadlines were enough to crush an otherwise excellent score',
              'Now scales with your number of plans (deadlines / plans, capped), with a max point budget per category instead of a flat amount per deadline: 1 urgent deadline on 1 plan still hits hard, the same urgency across 10 plans much less so',
              'The detail shown in the card now reflects the points actually removed, not the old flat amount'
            ]
          },
          {
            date: 'August 23, 2026',
            title: 'Business weather gets a real trend, Streak based on actual activity',
            items: [
              'Business weather: used to be a plain re-skin of Portfolio health (same score, just a different icon) — now compares the score to 7 days ago (local history) to show a real trend ("Improving +12 pts", "Declining -8 pts"...)',
              'Streak: no longer counts just opening the Dashboard, but a real day of activity (plan created, saved, or edited) — derived from plan timestamps, so it\'s the same regardless of device, unlike the old local counter',
              'All three widgets (Portfolio health, Streak, Business weather) now show a "how it\'s calculated" line right in their card'
            ]
          },
          {
            date: 'August 23, 2026',
            title: 'Dashboard light theme without background photo, wider widget library',
            items: [
              'Dashboard, light theme: the darkened background photo is replaced with a plain light gradient with a soft blue tint (very pale purple/blue/cyan) — it clashed with a light theme no matter how much it was darkened. The greeting title and the "+" widgets button now use colors suited to a light background instead of the white forced for the photo',
              'Widget library: panel and "Search widgets" field widened — the field\'s text was still slightly overflowing its frame'
            ]
          },
          {
            date: 'August 23, 2026',
            title: 'Frosted-glass widget library, white text on Combined budget and My account',
            items: [
              'Widget library: frosted-glass look (translucent background + blur) across the whole panel, including cards and sidebar, instead of a flat opaque background',
              'Fixed the "Search widgets" field whose text slightly overflowed its frame',
              '"Combined budget" tile (team space): "Click for details" back to white, unreadable in light theme (it\'s a button, which wasn\'t inheriting the white color the rest of the tile gets)',
              'My account, light theme: "Pro member" and its description are readable again over the background photo (default dark text was nearly invisible on the near-transparent panel)'
            ]
          },
          {
            date: 'August 23, 2026',
            title: 'Widget library: bottom-docked panel like macOS, fixed "New" badge and tooltips',
            items: [
              'The widget library panel ("+") no longer floats centered on screen: it slides up from the bottom and stays docked to the bottom edge, rounded corners on top only — like the macOS widget gallery',
              '"New" badge redesigned: moved above the Add/Added button (its own column) instead of sitting next to the title, which used to get crushed down to 1-2 characters with the badge eventually overlapping the button',
              'Hover tooltips (plan previews on space cards, public gallery): were clipped by their widget\'s rounded frame whenever they appeared near an edge — now rendered outside the card (like the "Size" menu), so they\'re never cut off again'
            ]
          },
          {
            date: 'August 23, 2026',
            title: 'UX fixes: Nova button, "Current" badge, notification center, links in exports',
            items: [
              '"Ask Nova" button (weekly summary widget): now has a gradient border and gradient text, matching other AI generation buttons',
              '"Current" badge on personal/team space cards: text back to white (unreadable against the gradient in some cases)',
              'Notification center: panel widened (340px → 400px) and the delete-confirmation bubble widened (220px → 260px) — the "Delete" button and "Mark all as read" text were overflowing the frame',
              'Benchmarks: added spacing between the "Go further" title and the link cards, which were visually stuck together',
              'Exports (CSV, PDF, Notion): web links (Market Watch sources, Benchmarks sources, official GDPR resources, content/advertising calendar platforms) were either trimmed to their label only or missing from the section entirely — URLs now show up everywhere, clickable in PDF and Notion'
            ]
          },
          {
            date: 'August 23, 2026',
            title: 'macOS-style widget library on the Dashboard',
            items: [
              'New "+" button next to "Create a plan": opens a widget library (search, categories, one-click add/remove) inspired by the macOS widget gallery — until now the Dashboard grid only let you reorder and resize widgets already shown, never add or remove them',
              'Calendar and "Resume" stay always shown; every other widget (deadlines, activity, Nova summary, history, gallery...) can be removed and re-added anytime without losing its position',
              'Three new widgets available from the library: "Portfolio health" (overall progress gauge), "Streak" (consecutive active days) and "Business weather" (recent momentum at a glance) — hidden by default'
            ]
          },
          {
            date: 'August 23, 2026',
            title: 'Favicon link cards on Market Watch, Benchmarks, GDPR and the GTM calendar',
            items: [
              'These four AI-generated sections never linked to any real external site (GDPR reused a static list of 4 links, strictly identical on every plan) — replaced with real link cards (favicon + title + domain) to real websites, different on every generation',
              'GDPR: the official resource pool grows from 4 to 10 (CNIL, EDPB, EUR-Lex, IAPP, ANSSI...), 5 of which are drawn differently per plan',
              'Market watch: the "sources" field becomes real clickable links instead of plain text tags',
              'Benchmarks: new "Go further" section with 3 to 5 real industry references',
              'GTM calendar (editorial + advertising): the channel name (LinkedIn, Google Ads, TikTok Ads...) becomes a clickable link to the official platform'
            ]
          },
          {
            date: 'August 23, 2026',
            title: 'Dashboard as movable, resizable macOS-style widgets',
            items: [
              'The main Dashboard moves entirely to independent widgets — calendar, upcoming deadlines, recent activity, Nova summary, "Resume", one card per space (personal + teams), "Create a team", "View full history" and "Public gallery": drag and drop to reorder, right-click → Small/Medium/Large to resize — the same interaction as the macOS notification center or desktop. Layout saved per user, adapting automatically as the number of teams changes.',
              'Fixed drag-and-drop occasionally failing between two widgets of very different sizes',
              '"Hi X" moved to the very top of the page, before the widgets, rewritten as a single continuous message (name, day overview, Pro/Free plan reminder, encouragement) instead of several separate lines'
            ]
          },
          {
            date: 'August 23, 2026',
            title: 'Dashboard: activity feed, Nova summary, glass "Resume" card',
            items: [
              'New widgets at the top of the Dashboard: "Recent activity" (last 5 events across all spaces) and an on-demand "Weekly summary" generated by Nova (Pro), from already-aggregated stats (never full plans)',
              'The "Resume" card (last-touched plan) moved into the free space between the space cards and the calendar, as a frosted-glass square',
              'Dashboard calendar in light mode: white overlay raised to 88% opacity (numbers had become unreadable since the page background was darkened)',
              '"My plans": larger title, the 4 actions (Load/Share/Duplicate/Delete) aligned on an equal-width grid',
              '"Picking up where you left off?" banner: solid gradient background removed, leaving only the border and a gradient-text title, natively readable in both themes'
            ]
          },
          {
            date: 'August 23, 2026',
            title: 'Real PDF checkboxes, financial report HTML export, export icons',
            items: [
              'Investor report (PDF): the GDPR checklist now uses real interactive checkboxes (checkable in Acrobat/Preview), instead of symbols that showed as an empty square depending on the PDF reader',
              'Financial report (Word): title and subtitle sized way down (they used Word\'s oversized default heading style)',
              'New HTML export for the financial report: a standalone page closely matching the app\'s look (gradient glows, glass cards, identical charts)',
              'Icons added to every export button, on the financial report and the plan\'s general export window (PDF, Word, HTML, PPTX, CSV, JSON, PNG, GDPR)'
            ]
          },
          {
            date: 'August 23, 2026',
            title: 'Financial report: PDF/Word export, improved chart; refined notifications and Gantt',
            items: [
              'Per-plan financial report: dedicated PDF and Word export (budget summary, KPIs, month-by-month cash runway, cost breakdown, cost/revenue bridge), honoring the existing custom branding',
              'The plan\'s total budget is now visually highlighted in the financial report',
              'Cash projection chart: months spelled out, an amount axis and a legend added for a clearer, more professional read',
              'Roadmap collaboration notifications: each changed story\'s detail now includes its ID, in addition to status/sprint/assignee/effort',
              'Interactive Gantt: a story\'s detail popup no longer overlaps other roles\' bars'
            ]
          },
          {
            date: 'August 23, 2026',
            title: 'Dashboard: sprint calendar, interactive overall progress, per-plan financial report',
            items: [
              'The dashboard calendar now highlights every active sprint (across all plans), not just its end date — clicking a day opens the detail (plans, sprints, stories) with direct access to the plan',
              '"Upcoming deadlines" shows the exact date for each deadline, a color-coded urgency badge, and links directly to the plan on click',
              'Overall progress (plan dashboard) is now an interactive SVG double ring: one wedge per story on the outer ring, the aggregate % on the inner ring, hover tooltip per wedge',
              '"Workload by role" and the "Velocity by sprint" bars now reflect real team members (named assignment from the Backlog) instead of generic roles',
              'New per-plan financial report in investor-sheet style, opened from "Combined budget" in team spaces',
              'Plan title is now renamable directly from the identity card'
            ]
          },
          {
            date: 'August 22, 2026',
            title: '"Budget & Timeline" card: single source for total budget and launch timeline',
            items: [
              'New card in the Go-to-market tab with two sliders — total launch budget and target timeline — that now drive the financial forecast, the marketing budget cap and the plan\'s identity card',
              'The marketing budget can no longer exceed the total budget: it automatically scales down if the total drops below it',
              'The timeline moves the target launch date everywhere it\'s shown, without rebuilding the already-planned roadmap (sprints, statuses, story moves) so existing work is never overwritten',
              'New "Rebuild the roadmap from the current timeline" button for a fresh start — explicit warning before confirmation: this entirely replaces existing sprints, stories, statuses and story moves'
            ]
          },
          {
            date: 'August 22, 2026',
            title: 'AI tip ticker and calendar on the dashboard',
            items: [
              '"Tip of the day" is now AI-generated server-side (tech themes: positioning, pricing, onboarding, retention, acquisition, legal, team org), refreshed every 15 minutes, shown as a full-width scrolling ticker below the header',
              'New monthly calendar widget, Apple Calendar-style: current day highlighted, dots under your plans\' launch dates, previous/next month navigation',
              'The "Upcoming deadlines" card now sits below the calendar instead of beside it'
            ]
          },
          {
            date: 'August 22, 2026',
            title: 'Tip of the day and upcoming deadlines on the dashboard',
            items: [
              'New "Tip of the day" card: a product-launch/growth tip, different every day, computed locally (no data sent)',
              'New "Upcoming deadlines" card: lists upcoming launch dates across all your plans, sorted by proximity'
            ]
          },
          {
            date: 'August 22, 2026',
            title: 'Personas and Financials added to version comparison',
            items: [
              'The "before/after" version library now also detects changes to personas (added, removed, edited fields) and financials (monthly burn, runway, ARPU, break-even, cost breakdown)'
            ]
          },
          {
            date: 'August 22, 2026',
            title: 'OCR for scanned documents in the questionnaire',
            items: [
              'Document import (questionnaire) now also accepts photos/scans (JPG, PNG, WebP), and automatically detects PDF pages with no selectable text — until now silently ignored ("no text found")',
              'Optical character recognition (OCR) only runs on the pages/images that need it, 100% in the browser (nothing sent to a third-party service) — a "page X/Y" progress indicator during analysis, and a reminder to review the extracted text before generating the plan'
            ]
          },
          {
            date: 'August 22, 2026',
            title: 'Pexels photos in the cover picker',
            items: [
              'New "Pexels" tab in the plan cover picker: keyword search, grid results, one-click select — same idea as Notion with Unsplash',
              'Search runs server-side (API key never exposed to the browser), photographer credit shown on hover over each photo'
            ]
          },
          {
            date: 'August 21, 2026',
            title: 'Nova now handles real multiple conversations, Cloudflare-AI style',
            items: [
              'Nova used to keep a single thread per plan, overwritten by every new conversation — now backed by a real multi-thread history, saved server-side on every exchange',
              'New dropdown panel (click the current thread\'s title): search, threads grouped by recency (Today / Past 7 days / Older), per-thread delete, "+ New conversation"',
              'Redesigned Nova home screen: time-of-day greeting, a glowing brand-gradient orb over a dotted backdrop, instead of plain text'
            ]
          },
          {
            date: 'August 21, 2026',
            title: '"Before/after" version library',
            items: [
              'Every plan save now creates a full snapshot, kept and viewable at any time (up to 20 versions per plan)',
              'New comparison page ("Compare versions" button in the plan\'s History panel): pick two versions, before/after, to see what changed — roadmap (added, removed, moved stories, status), KPIs, marketing budget, classification and executive summary'
            ]
          },
          {
            date: 'August 21, 2026',
            title: 'The cookie banner\'s "Preferences" category now actually does something',
            items: [
              'Theme, language, timezone and accessibility settings (font size, contrast, date format, currency) are now only remembered across visits if "Preferences" is accepted in the cookie banner — without that consent, they reset to their defaults on every new visit instead of being silently saved as before',
              'Explicitly declining "Preferences" immediately clears whatever was already saved; accepting it saves the current settings right away, without waiting for you to touch anything'
            ]
          },
          {
            date: 'August 21, 2026',
            title: 'Installable app (PWA)',
            items: [
              'VelocityLaunch can now be installed as a real app, straight from the browser (an "Install" icon in the desktop address bar, "Add to Home Screen" on mobile) — full-screen with no browser chrome, a dedicated icon, and near-instant reloads thanks to the app files being cached locally',
              'Server calls (sign-in, plans, the Nova copilot...) are never cached: only the app\'s own files are, so your data always stays current'
            ]
          },
          {
            date: 'August 21, 2026',
            title: 'Redesigned mobile section nav and full-screen Nova panel on iOS',
            items: [
              'Redesigned the mobile plan navigator: the bare icon grid (hard to read, fiddly previous/next arrows) is replaced by a single sticky top bar — big previous/next buttons plus the active section, which opens the full section list (grouped, with labels) in a bottom sheet on tap',
              'Cookie consent banner restricted to the landing page only: it no longer shows up on the dashboard, spaces, questionnaire, Account, or any other app page',
              'Fixed a visual overlap between the Nova copilot bubble and the collapsed cookie pill at the bottom of the screen on mobile',
              'Nova\'s copilot panel is now full-screen on mobile, with its size continuously tracked against the real visual viewport: fixes the window being squashed by the on-screen keyboard on iOS Safari'
            ]
          },
          {
            date: 'August 21, 2026',
            title: 'GDPR cookie banner (with real per-category consent) and dashboard-wide glassmorphism',
            items: [
              'Cookie consent banner (GDPR): translucent bottom bar, 4 real categories (Essential, Preferences, Statistics, Marketing), reopenable any time to change your mind',
              'Statistics and Marketing are actually wired up: Cloudflare Web Analytics, Meta Pixel and LinkedIn Insight Tag only load if their category is accepted, never before',
              'Full-screen loading screen (animated VelocityLaunch mark) on first app load, while the session is being verified',
              'Glassmorphism extended to every card on the dashboard, personal/team space, and the Account, Settings, Integrations and Notifications pages, in both light and dark mode',
              'Visual plan previews (instead of a plain counter) and a summary sentence on the dashboard space cards'
            ]
          },
          {
            date: 'August 21, 2026',
            title: 'Real-time collaboration, notification center and sign-in redesign',
            items: [
              'Real-time collaboration on the roadmap and backlog: concurrent edits merge automatically (CRDT), presence shows who has the plan open, instant notification of what just changed',
              'Two new asynchronous AI agents: dynamic roadmap auto-scheduling and backlog prioritization from external signals',
              'Exportable compliance report for investors (GDPR + financial summary in one PDF)',
              'Persistent notification center (header bell) for AI agents, mentions and collaboration: detailed content, fixed timezone display, click to navigate straight to the relevant section',
              'Team presence visible in the dashboard (one avatar per member, gradient ring and green glow for whoever is online) and the space switcher menu',
              'Sign-in page redesigned full-screen (site nav and footer hidden, legal notice added), and a real "Forgot password?" link that\'s always visible instead of only appearing after you start typing a password'
            ]
          },
          {
            date: 'August 20, 2026',
            title: 'Total budget, document import and core fixes',
            items: [
              'Total launch budget, distinct from the marketing budget: the financial forecast now uses the overall envelope (dev + marketing + ops) instead of silently reusing the marketing budget alone as if it were the total',
              'Document import in the questionnaire (PDF, Word, Excel, PowerPoint): text is extracted in the browser and added to the context sent to the AI, in a field you can review and edit before generating',
              'Fixed draft loading: the form wasn\'t updating when a draft was loaded from the questionnaire page itself; every save was also creating a new draft instead of updating the current one, and a manual rename was overwritten on the next save',
              'Discreet button to discard pending changes on a plan, next to the "Save" button',
              'Fixed an accessibility bug that forced a 44x44px minimum size on many small icon buttons throughout the app (tags, post-launch tracking, sidebar, copilot...), making them look oversized',
              'Brand gradient applied to the questionnaire\'s help glossary titles'
            ]
          },
          {
            date: 'August 19, 2026',
            title: 'New visual identity for the homepage and "How it works"',
            items: [
              'Full landing page redesign based on the visual brand kit generated with Ploy (lavender/indigo/cyan palette on a near-black background, Source Serif 4 for headings, IBM Plex Sans for body text)',
              'New hero with a glowing path-through-mountains visual, a "Launch faster than ever" badge in midnight blue with a technical font, a terminal-style command line, and 3 CTA buttons that stay on one line in both FR and EN',
              'New "How it works" page fully rebuilt: hero, 4 illustrated benefits, 3 detailed steps with product screenshots, experience overview, testimonial banner and FAQ, using the Ploy product asset kit',
              '"A control card for your launch" and "Product preview" restored as two distinct sections, each with its own visual',
              'FAQ link added to the navigation (visible when signed out), fixed a bug where it navigated to the wrong page from "How it works"',
              'Google / Apple / Slack sign-in buttons redesigned (padding, borders, cyan "Last used" badge) instead of touching the edges'
            ]
          },
          {
            date: 'August 19, 2026',
            title: '100% private gallery, Nova Copilot and reorganized account navigation',
            items: [
              'Reworked gallery: removed the old public gallery (no plan viewable without an account), new 100% private gallery with explicit opt-in per plan ("Add to gallery" in the plan preview), favorites sorted first, right-click context menu (open/favorite/rename/share/duplicate/remove/delete), full-bleed banner image preview',
              'AI Copilot renamed "Nova": larger window, compact header, dedicated avatar, clickable quick suggestions, new conversation, copy a reply, animated typing indicator, gradient title and a violet/blue/cyan gradient border around the whole window',
              'Reorganized account navigation: "Notifications" becomes its own page, new "Integrations" page (brand icons, colored status badges), Settings refocused on pure preferences, "Want to collaborate?" moved into My Account, "My Plans"/"My Gallery" added as cards in the personal workspace, redesigned workspace switcher menu',
              'Visual consistency: pages widened (960px), image preview added to every plan list, inline renaming for plans and drafts via a dedicated modal, violet/blue/cyan gradient ring on all profile avatars, "Demo" badge on sample plans',
              'Bug fixes: demo plan lost after signing in via Google/Apple/Slack, gallery context menu unresponsive to clicks, Gallery page became unreachable'
            ]
          },
          {
            date: 'August 18, 2026',
            title: 'Jira integration, email notifications and richer Settings',
            items: [
              'Full Jira integration (OAuth): auto-creates Epics per phase and linked Stories, story points, priority, dates, assignee, no-duplicate incremental sync, deep-links to tickets from the Backlog',
              'Richer Notion export: roadmap and calendars as native Notion databases (instead of plain lists), real dates for Calendar/Timeline views, cover image and brand icon',
              'Email notifications (via Resend): an email on every finished AI generation (market watch, benchmarks, calendars, GDPR, AI table, backlog agents) with a real preview of the result — an actual table for the AI table, several dated items for calendars — plus an automatic reminder for plans inactive for 14 days',
              'Richer Settings page: font size and high contrast, date format (DD/MM or MM/DD), display currency (€/$/£), GDPR export of all data and account deletion, a connected-integrations panel (Notion/Jira) with disconnect',
              'Reworked pitch deck (PPTX) export: a 9-slide presentation (cover, problem, solution, market, roadmap, go-to-market, KPIs, finances, closing), brand logo and wordmark, contextual images, overlap-free layout',
              '"Pro member" badge on My account: gradient crown icon instead of plain text',
              'Export modal recentered (no longer overlaps the header) and buttons in the brand gradient',
              'Plan sidebar reorganized into 8 collapsible thematic groups following the launch lifecycle',
              'Footer fully centered and reworked on mobile/tablet (up to iPad Pro), the 3 link columns staying side by side'
            ]
          },
          {
            date: 'August 15, 2026',
            title: 'Team spaces, Pro pricing and Settings page',
            items: [
              'Move a plan between your personal space and a team (or between two teams), right from My account',
              'New 3-tier pricing grid (Free / Pro / Enterprise) with a monthly/yearly toggle, replacing the old single Pro modal — Enterprise now routes to the contact form instead of a made-up price',
              'Per-plan team space limits (1 on Free, 5 on Pro, unlimited on Enterprise), enforced both in the UI and server-side via a Clerk webhook that deletes any organization created past the limit',
              'PPTX export and Notion / Jira / GitHub integrations restricted to Pro (PRO badge + server-side check)',
              'Cross-space history and team comment notifications restricted to Pro; Free keeps a history scoped to the active space',
              'New Settings page bringing together theme, language, timezone (now applied to displayed dates), reduced motion, and access to active devices / account security',
              '"Clear all" button on My account notifications',
              'Fixed the "free plan limit reached" modal buttons: each now goes to the right place (Pro checkout or plan list) instead of both landing on the same spot',
              'New heading font (IBM Plex Sans), paired with Inter for body text'
            ]
          },
          {
            date: 'August 14, 2026',
            title: 'Sector-specific plan templates',
            items: [
              'The product\'s sector (already captured in the questionnaire) now shapes plan generation across 10 sectors: e-commerce, B2B SaaS, marketplace, mobile app, fintech, healthtech, dev tools, AI/ML, content/media, edtech',
              'Marketing channel mix tailored to the sector (e.g. Paid + Social for e-commerce, LinkedIn + Content for B2B SaaS)',
              'Extra sector-specific KPI when relevant (MRR for SaaS, GMV for a marketplace, D7 retention for mobile...)',
              'Sector-specific risk added to the SWOT analysis for sectors with distinct stakes (fintech regulation, health data compliance, marketplace cold-start...)'
            ]
          },
          {
            date: 'August 14, 2026',
            title: 'Full visual overhaul: KPIs, finances, GDPR, AI tools, post-launch tracking',
            items: [
              'KPI dashboard redesigned: all cards on equal footing, Cards/Table view, one color per KPI, A/B test calculator pulled out into its own explained card',
              'Benchmarks: table rows tinted by verdict, channel cards recolored and rearranged for readability',
              'Financial forecast: budget trajectory chart down to depletion, visual bridge between monthly cost and revenue needed to break even',
              'GDPR compliance: official resources block (CNIL, GDPR text, EDPB), progress bar on the checklist',
              'AI tools rebuilt from the ground up: agent went from 2 to 4 real capabilities (added risk analysis and budget optimization), natural-language chart and prompt-generated table merged into one reliable AI tool with suggestions and an automatic chart',
              'Post-launch tracking: projection verdict brought front and center, simplified KPI picker, collapsible history',
              'What-if scenarios replaced by a live budget/duration simulator (sliders, impact on the roadmap and per-channel marketing budget)',
              'Plan sidebar: discreet collapse handle centered on the edge, no more scrolling to the top to find it',
              'Consistent black background and per-category colors across all plan cards'
            ]
          },
          {
            date: 'August 14, 2026',
            title: 'Richer Notion & Jira sync, unified GTM calendar, visual refresh',
            items: [
              'Tri-state story status (to do / in progress / done) shared across Roadmap, Backlog, Gantt, Calendar, and synced to Jira and Notion',
              'Per-story Notion sync into a dedicated database, triggered from the Backlog',
              'Gantt redesigned as responsibility swim-lanes, burndown chart with real dates and a "Today" marker',
              'Execution calendar enriched (launch marker, colored statuses, .ics export) and moved to the top of the Roadmap & execution section',
              'Editorial and advertising calendars merged into a single content & advertising calendar, week by week',
              'Marketing budgets per channel redesigned: visual allocation bar, per-channel colors, collapsible ready-to-use content',
              'Plan sidebar now tracks the section you\'re reading (scroll-spy) with breathing room between section titles',
              'Plan header and executive summary cards on a deep black background to make the gradient text pop, badges recolored by type'
            ]
          },
          {
            date: 'August 12, 2026',
            title: 'Full analytics suite, AI agents and richer questionnaire',
            items: [
              'New plan modules: prioritized backlog, interactive Gantt, burndown chart, calendar, BI dashboard and side navigation panel',
              'Asynchronous AI agents (story brief, KPI recalculation) via Cloudflare Queues',
              'Post-launch tracking with what-if scenarios',
              'Enriched persona, sprints, marketing, KPIs and financial forecasts, plus AI-generated tables',
              'Reworked questionnaire: many more choices per category across the 4 phases, wired into the generation engine',
              '"Watch a demo" button available from the header, instant demos',
              'Fixes: AI Agents section visible again, loading another plan repaired, compacted header'
            ]
          },
          {
            date: 'August 2, 2026',
            title: 'Real-time progress and full internationalization',
            items: [
              'Organic progress bar during plan generation, button stays visible on screen',
              'Animated welcome banner on the plan page, different wording for generation vs. reload',
              'Redesigned KPI dashboard highlighting the primary metric',
              'Full English translation of footer modals, drafts and saved plans',
              'Dedicated confirmation modal for deleting saved plans, lightweight pattern for drafts',
              'Fixes: draft loading, empty form on "New plan", scroll to top everywhere',
              'Reworked header and hero: home button, larger title, left alignment consistent with the rest of the site'
            ]
          },
          {
            date: 'July 31, 2026',
            title: 'New visual identity',
            items: [
              'Authentic wordmark and logo, consistent across the site',
              'New header and hero with the VelocityLaunch design system',
              'Dedicated "How it works" page with gallery and FAQ',
              'Clear homepage sections switched to purple theme',
              'Complete cleanup of emoji icons in favor of vector icons'
            ]
          },
          {
            date: 'July 28, 2026',
            title: 'UX/UI redesign and accessibility',
            items: [
              'Complete homepage redesign (hero, features, testimonials, FAQ)',
              'Full English translation of the interface',
              'Enhanced contrast for WCAG compliance',
              'Generated plan content localized based on selected language'
            ]
          },
          {
            date: 'Initial launch',
            title: 'VelocityLaunch MVP',
            items: [
              'Product / market / resources / priorities questionnaire',
              'Automatic sprint-based roadmap generation',
              'Custom marketing strategy and KPIs',
              'PDF and CSV export, link sharing',
              'Deployed on Cloudflare Workers'
            ]
          }
        ]
      },
      features: {
        title: 'Features',
        intro: "Everything that genuinely exists in VelocityLaunch today, by theme — see the Roadmap for what's coming next.",
        groups: [
          {
            label: 'AI generation',
            items: [
              'Guided multi-phase questionnaire with document import (PDF, Word, Excel, PowerPoint, photo/scan) as AI context, with automatic OCR on scanned pages',
              'AI generation with a safety net (local rules engine if the AI call fails)',
              'Conversational AI copilot (Nova) to edit the plan in natural language, with multi-conversation history (search, grouped by recency)'
            ]
          },
          {
            label: 'Roadmap & execution',
            items: [
              'Agile roadmap, sprints, prioritized backlog, interactive swim-lane Gantt, real-date burndown',
              'Real-time collaboration on the roadmap and backlog (concurrent edits merge automatically, presence shows who has the plan open)',
              'Asynchronous AI agents (execution brief, KPI recalculation, risk analysis, budget optimization, dynamic auto-scheduling, external signal prioritization)',
              '"Before/after" version library: a full snapshot of the plan on every save, comparable at any time (roadmap, personas, financials, budget, KPIs, executive summary)'
            ]
          },
          {
            label: 'Marketing & finance',
            items: [
              'Distinct marketing budget and total launch budget, with an associated financial forecast',
              '"Budget & Timeline" card: editable total budget and launch timeline, single source driving the financial forecast, the marketing budget cap and the plan\'s identity card, with an option to rebuild the roadmap from the new timeline',
              'Marketing strategy, custom KPIs, BI dashboard and AI-generated tables',
              'On-demand AI-generated market watch, benchmarks, editorial/ad calendars and GDPR compliance, with automatic weekly market watch and real link cards to external sources (favicon included), different for every plan',
              'Post-launch tracking & live budget/timeline simulator',
              'Per-plan financial report in investor-sheet style (from "Combined budget" in team spaces): key budgets up top, burn/runway, break-even with ARPU rationale, cost breakdown by category, dedicated PDF, Word and HTML export',
              'Investor report (full-plan PDF export): GDPR checklist with real interactive checkboxes (checkable in Acrobat/Preview), not plain symbols'
            ]
          },
          {
            label: 'Team & notifications',
            items: [
              'Team spaces (Clerk Organizations), comments with @mentions, per-plan activity feed, cross-cutting tags',
              'Persistent notification center (header bell) for AI agents, mentions and collaboration, with detailed content and direct navigation to the relevant section',
              'Real-time team presence: who has a team plan open right now, shown in the dashboard (Members card) and the space switcher menu',
              'Dashboard as movable, resizable macOS-style widgets (drag and drop, right-click → Small/Medium/Large, saved layout), with a widget library ("+") to add/remove them (search, categories) — calendar, activity, Nova summary (Pro), history, gallery, plus three new at-a-glance widgets (portfolio health, streak, business weather): calendar highlighting every active sprint across all plans with a clickable day detail, richer upcoming deadlines (exact date, color-coded urgency, direct link to the plan), "Resume" card to the last-touched plan, recent-activity feed, cross-plan weekly summary generated by Nova (Pro), scrolling AI-generated tip ticker',
              'Plan dashboard: overall progress as an interactive double ring (done/in progress/overdue/not started, hover per story), real pace vs schedule, workload by real team member'
            ]
          },
          {
            label: 'Integrations & automation',
            items: [
              'Notion, Jira, GitHub, Linear and Google Calendar integrations',
              'Email (Resend) and Slack notifications: generation done, inactivity reminder, weekly digest',
              'Outbound webhooks (Zapier-compatible), plan templates via duplication, opt-in public gallery'
            ]
          },
          {
            label: 'Export & sharing',
            items: [
              'PDF, PPTX (customizable pitch deck), CSV, PNG, JSON export, investor compliance report (GDPR + financials), link sharing or dedicated Open Graph image'
            ]
          },
          {
            label: 'Account & access',
            items: [
              '3-tier pricing (Free / Pro / Enterprise), Stripe subscription',
              'Global search (⌘K), FR / EN',
              'GDPR cookie consent banner with 4 real categories, wired to Cloudflare Web Analytics, Meta Pixel and LinkedIn Insight Tag',
              'Installable app (PWA): home screen icon, full-screen launch with no browser chrome'
            ]
          }
        ]
      },
      roadmap: {
        title: 'Roadmap',
        intro: "An honest look at what already exists and what's coming next. This roadmap evolves with feedback from early users.",
        columns: [
          {
            label: 'Available',
            items: [
              'Guided multi-phase questionnaire with document import (PDF, Word, Excel, PowerPoint, photo/scan) as AI context, with automatic OCR on scanned pages',
              'AI generation with a safety net (local rules engine if the AI call fails)',
              'Conversational AI copilot (Nova) to edit the plan in natural language, with multi-conversation history (search, grouped by recency)',
              'Agile roadmap, sprints, prioritized backlog, interactive swim-lane Gantt, real-date burndown',
              'Real-time collaboration on the roadmap and backlog (concurrent edits merge automatically, presence shows who has the plan open)',
              'Distinct marketing budget and total launch budget, with an associated financial forecast',
              'Marketing strategy, custom KPIs, BI dashboard and AI-generated tables',
              'On-demand AI-generated market watch, benchmarks, editorial/ad calendars and GDPR compliance, with automatic weekly market watch and real link cards to external sources (favicon included), different for every plan',
              'Post-launch tracking & live budget/timeline simulator',
              'Asynchronous AI agents (execution brief, KPI recalculation, risk analysis, budget optimization, dynamic auto-scheduling, external signal prioritization)',
              'Team spaces (Clerk Organizations), comments with @mentions, per-plan activity feed, cross-cutting tags',
              'Persistent notification center (header bell) for AI agents, mentions and collaboration, with detailed content and direct navigation to the relevant section',
              'Real-time team presence: who has a team plan open right now, shown in the dashboard (Members card) and the space switcher menu',
              '3-tier pricing (Free / Pro / Enterprise), Stripe subscription',
              'Notion, Jira, GitHub, Linear and Google Calendar integrations',
              'Email (Resend) and Slack notifications: generation done, inactivity reminder, weekly digest',
              'Outbound webhooks (Zapier-compatible), plan templates via duplication, opt-in public gallery',
              'PDF, PPTX (customizable pitch deck), CSV, PNG, JSON export, investor compliance report (GDPR + financials), link sharing or dedicated Open Graph image',
              'Global search (⌘K), FR / EN',
              'GDPR cookie consent banner with 4 real categories, wired to Cloudflare Web Analytics, Meta Pixel and LinkedIn Insight Tag',
              'Installable app (PWA): home screen icon, full-screen launch with no browser chrome, near-instant first load from cache',
              '"Before/after" version library: a full snapshot of the plan on every save, comparable at any time (roadmap, personas, financials, budget, KPIs, executive summary)',
              'Dashboard: scrolling AI-generated tip ticker (refreshed every 15 min), monthly calendar with launch deadlines, upcoming deadlines across all plans',
              '"Budget & Timeline" card (Go-to-market): editable total budget and launch timeline, driving the financial forecast, the marketing budget cap and the plan\'s identity card, with an option to rebuild the roadmap from the new timeline'
            ]
          },
          {
            label: 'In progress',
            items: []
          },
          {
            label: 'Considered',
            items: [
              'Public API to generate a plan programmatically (API key, Enterprise tier)'
            ]
          }
        ]
      },
      about: {
        title: 'About',
        authorHeading: 'digitalblueskye',
        authorText: 'VelocityLaunch is designed and built by digitalblueskye, an independent maker. The principle is simple: build tools that save time, with no unnecessary jargon or superfluous features.',
        blogPrefix: 'Find more thoughts on product and development on',
        blogLink: 'the blog',
        missionHeading: 'Our mission',
        missionText: "Too many product launches get bogged down in hours of planning before a single line of code is written. VelocityLaunch exists to flip that: turn an idea into an actionable roadmap, marketing strategy and KPIs in minutes, not days.",
        valuesHeading: 'What matters to us',
        valueSpeedLabel: 'Speed:',
        valueSpeedText: 'a complete plan in 5 minutes, not a giant machine',
        valueClarityLabel: 'Clarity:',
        valueClarityText: 'no jargon, directly actionable results',
        valuePrivacyLabel: 'Privacy:',
        valuePrivacyText: 'your data belongs to you, local by default'
      },
      careers: {
        title: 'Careers',
        noPositionHeading: 'No open positions right now',
        noPositionText: 'VelocityLaunch is currently an independent project. There are no open roles at the moment.',
        curiousHeading: 'Still curious',
        curiousText: "If you're a developer, designer or growth marketer and this kind of project speaks to you, don't hesitate to reach out. Good encounters rarely happen at the right time.",
        contactBtn: 'Contact us'
      },
      contact: {
        title: 'Contact',
        intro: "A question, an idea, a bug to report? This form sends the message directly, without opening your mail client.",
        name: 'Name',
        email: 'Email',
        message: 'Message',
        sending: 'Sending…',
        send: 'Send',
        successMsg: 'Message sent, thank you! Reply coming soon.',
        errorPrefix: 'Sending failed. Write to us directly at'
      },
      privacy: {
        title: 'Privacy Policy',
        updated: 'Last updated: August 22, 2026. VelocityLaunch pays close attention to the privacy of your data.',
        dataHeading: 'Data collected',
        dataText: "The answers you enter in the questionnaire (product, market, resources, imported documents) are used to generate your launch plan. Without an account, this data stays only in your browser's localStorage. With an account (required to save a plan, collaborate as a team, or use Nova), your plans are also stored on our servers (Cloudflare D1 database) so they stay accessible across devices — up to 20 versions per plan are kept for the \"before/after\" version library.",
        accountHeading: 'Account and authentication',
        accountText: 'Account creation and sign-in are handled by Clerk, our authentication provider: email, name, optional profile photo. Team spaces rely on Clerk organizations — team members see plans shared in that space, never your personal plans.',
        aiHeading: 'AI processing',
        aiText: "Plan generation, the Nova copilot, and the AI mini-tools (tables, market watch, benchmarks...) send the relevant content of your questionnaire or plan to a third-party AI provider (OpenRouter, which routes to models like Claude or GPT) to produce the response — only the text needed for the current request, never your full history. OCR of scanned documents, on the other hand, runs entirely in your browser: no image or scanned page is ever sent to a third party.",
        integrationsHeading: 'Third-party integrations (optional)',
        integrationsText: "If you explicitly connect Notion, Jira, GitHub, Linear or Google Calendar from the integrations settings, an OAuth access token is stored server-side to sync the data you choose to export. Nothing is connected by default, and you can disconnect any integration at any time.",
        paymentHeading: 'Payment',
        paymentText: "The Pro subscription is processed by Stripe. We never store your card number: Stripe only sends us payment confirmation and a customer ID.",
        usageHeading: 'Data usage',
        usageText: 'We never use the content of your plans for advertising or resale purposes. See the cookie policy for details on our audience measurement (Cloudflare Web Analytics) and marketing (Meta Pixel, LinkedIn Insight Tag, Google Ads) tools, all optional and gated by your consent.',
        rightsHeading: 'Your rights (GDPR)',
        rightAccessLabel: 'Access:',
        rightAccessText: 'you can view all the data you have generated, locally and on our servers if you have an account',
        rightDeleteLabel: 'Deletion:',
        rightDeleteText: 'clearing your localStorage deletes your local data; deleting a plan or your account also deletes its server-side data (including its versions and associated Nova conversations)',
        rightPortabilityLabel: 'Portability:',
        rightPortabilityText: 'export possible at any time in PDF, PPTX, CSV, PNG or JSON',
        rightOppositionLabel: 'Objection:',
        rightOppositionText: 'write to us for any specific request',
        contactHeading: 'Contact',
        contactText: 'For any question about your data:',
        note: 'This document is provided for guidance for a beta project. It does not replace legal advice and will be refined before any commercial production release.'
      },
      terms: {
        title: 'Terms of Use',
        updated: 'Last updated: August 22, 2026. By using VelocityLaunch, you accept the following terms.',
        serviceHeading: 'The service',
        serviceText: 'VelocityLaunch generates recommendations (roadmap, marketing strategy, KPIs) from the answers you provide. These recommendations are a starting point, not guaranteed professional advice: it is up to you to adapt them to your actual context.',
        usageHeading: 'Acceptable use',
        usageItem1: 'The service is provided "as is", with no guarantee of commercial results',
        usageItem2: 'You remain the owner of your plans\' content',
        usageItem3: 'Any attempt at abuse, mass scraping or attacking the service is prohibited',
        aiHeading: 'AI-generated content',
        aiText: "Roadmaps, strategies, KPIs, tables and other content generated by AI (including via the Nova copilot) may contain errors, approximations or outdated information. Always verify recommendations before acting on them for a real decision (budget, hiring, contractual commitment) — VelocityLaunch does not replace professional advice.",
        teamHeading: 'Team spaces',
        teamText: "A plan created in a team space is visible and editable by every member of that space; the Admin role can invite, remove members, and delete the space. Leaving a team or being removed means losing access to plans shared there — they remain available to the remaining members.",
        subscriptionHeading: 'Subscription and billing',
        subscriptionText: 'The Pro plan is a recurring subscription billed via Stripe, cancellable at any time from your account — cancellation takes effect at the end of the already-paid period, with no prorated refund. The Enterprise plan is negotiated directly with us.',
        availabilityHeading: 'Availability',
        availabilityText: 'VelocityLaunch is in beta: the service, including Pro features, may evolve and some features may be adjusted without notice during this phase.',
        terminationHeading: 'Termination and account deletion',
        terminationText: "You can delete your account at any time from settings — this permanently deletes your plans, versions and Nova conversations stored server-side. We may suspend an account in case of clear abuse of the service (see Acceptable use above).",
        contactHeading: 'Contact',
        contactText: 'For any question about these terms:',
        note: 'This document is provided for guidance for a beta project. It does not replace legal advice and will be refined before any commercial production release.'
      },
      cookies: {
        title: 'Cookie Policy',
        intro: 'VelocityLaunch offers 4 categories of cookies and storage, each toggled independently from the consent banner shown on your first visit. Nothing beyond Essentials runs without your explicit consent.',
        storageHeading: 'Essentials',
        storageText: "Your theme, drafts and generated plans are kept in your browser's localStorage so the service works. This storage is not a third-party cookie: it stays on your device and is never transmitted without action on your part. Always active, cannot be disabled.",
        preferencesHeading: 'Preferences',
        preferencesText: 'Remembers your language, theme, timezone and display settings (font size, contrast, date format, currency) from one visit to the next. Without this consent, these settings reset to defaults on every new visit.',
        analyticsHeading: 'Statistics',
        analyticsText: 'Cloudflare Web Analytics measures site traffic (pages visited, origin) without individual tracking cookies or a browser fingerprint. No personal data from your plans is associated with it.',
        marketingHeading: 'Marketing',
        marketingText: 'Meta Pixel, LinkedIn Insight Tag and Google Ads measure the effectiveness of our ad campaigns (clicks, conversions). These tools only load if you explicitly accept this category.',
        manageHeading: 'Managing your cookies',
        manageText: 'You can change your choice at any time from the app\'s cookie settings (dedicated icon in the footer / navigation bar), or block cookies at the browser level — with no impact on how the plan generator works.',
        note: 'This document is provided for guidance for a beta project. It does not replace legal advice and will be refined before any commercial production release.'
      },
      security: {
        title: 'Security and Privacy',
        protectHeading: 'Protecting your data',
        protectText: 'At VelocityLaunch, the security of your data is our top priority. We put best practices in place to protect your information.',
        encryptionHeading: 'End-to-End Encryption',
        encryptionText: 'All data transmitted between your browser and our servers is encrypted using the HTTPS protocol with TLS 1.2 or higher. Your plans cannot be intercepted.',
        gdprHeading: 'GDPR Compliance',
        gdprText: "VelocityLaunch is fully compliant with the EU's General Data Protection Regulation (GDPR).",
        gdprAccessLabel: 'Right of access:',
        gdprAccessText: 'You can access all the data you have generated',
        gdprForgetLabel: 'Right to be forgotten:',
        gdprForgetText: 'You can request complete deletion of your data',
        gdprPortabilityLabel: 'Portability:',
        gdprPortabilityText: 'You can export your plans at any time',
        gdprTransparencyLabel: 'Transparency:',
        gdprTransparencyText: 'We inform you exactly how your data is used',
        storageHeading: 'Local Storage',
        storageText: 'By default, your plans are stored locally in your browser (localStorage). We keep no data on our servers without your explicit consent.',
        trackingHeading: 'No Invasive Tracking',
        trackingText: 'We use Cloudflare Web Analytics to understand overall service usage, without individual tracking cookies. We do not track personal data or the content of your plans.',
        infraHeading: 'Infrastructure Security',
        infraItem1: 'Hosted on Cloudflare Workers with automatic backups',
        infraItem2: 'Regular security audits by external experts',
        infraItem3: 'DDoS attack and SQL injection prevention',
        infraItem4: 'Up-to-date and validated SSL/TLS certificates',
        sharingHeading: 'Secure Sharing',
        sharingIntro: 'When you share a plan via a private link:',
        sharingItem1: 'A unique, unguessable ID is generated',
        sharingItem2: 'The link automatically expires after 30 days',
        sharingItem3: 'Only those with the link can access it',
        sharingItem4: 'Links are read-only',
        questionsHeading: 'Questions?',
        questionsText: 'For any question regarding your privacy, contact us at',
        badge: 'We are committed to protecting your privacy'
      }
    },
    drafts: {
      title: 'My drafts',
      subtitle: 'Continue your answers where you left them',
      emptyText: 'No saved drafts. Create one to continue later!',
      close: 'Close',
      updatedAtPrefix: 'Updated on',
      load: 'Load',
      rename: 'Rename',
      delete: 'Delete',
      confirmDelete: 'Confirm?'
    },
    tags: {
      add: 'tag',
      addPlaceholder: 'New tag...',
      remove: 'Remove this tag',
      filterAll: 'All'
    },
    gallery: {
      title: 'My gallery',
      subtitle: 'The plans you\'ve chosen to pin here, to find at a glance.',
      loading: 'Loading...',
      empty: 'No plans in your gallery yet. Open a plan and click "Add to gallery" to pin it here.',
      favorite: 'Favorite',
      favoriteAdd: 'Add to favorites',
      favoriteRemove: 'Remove from favorites',
      addToGallery: 'Add to gallery',
      removeFromGallery: 'Remove from gallery',
      inGallery: 'In gallery',
      open: 'Open',
      linkCopied: 'Link copied!',
      duplicated: 'Plan duplicated'
    },
    plans: {
      title: 'My plans',
      emptyTitle: 'Plan history',
      emptyText: "You haven't generated a plan yet. Start by creating one!",
      intro: 'Manage your generated plans and share them with your team',
      searchPlaceholder: 'Search a plan...',
      noSearchResults: 'No plan matches your search.',
      clearFilters: 'Clear filters',
      untitled: 'Untitled plan',
      createdAtPrefix: 'Created on',
      load: 'Load',
      share: 'Share',
      duplicate: 'Duplicate',
      delete: 'Delete',
      shareLinkHeading: 'Share link',
      copy: 'Copy',
      copied: 'Copied',
      shareExpiry: 'This link expires in 30 days',
      deleteConfirmTitle: 'Delete this plan?',
      deleteConfirmSuffix: 'will be permanently deleted. This action cannot be undone.',
      deleteFailedTitle: 'Deletion failed',
      deleteFailed: 'Deletion failed (insufficient rights on this team plan, or it was already deleted elsewhere) — the plan has been restored.',
      cancel: 'Cancel',
      defaultPlanName: 'This plan',
      deleteDraftConfirmTitle: 'Delete this draft?',
      deleteDraftConfirmSuffix: 'will be permanently deleted. This action cannot be undone.',
      defaultDraftName: 'This draft',
      move: 'Move',
      moveTitle: 'Move this plan',
      moveBody: 'Choose the destination space:',
      movePersonal: 'Personal',
      moveNoTargets: 'No other space available yet.',
      moveForbidden: 'Only a team admin can move a plan out of this space.'
    },
    footer: {
      tagline: 'Intelligent SaaS launch plan generator',
      product: 'Product',
      features: 'Features',
      pricing: 'Pricing',
      changelog: 'Changelog',
      roadmap: 'Roadmap',
      company: 'Company',
      about: 'About',
      blog: 'Blog',
      careers: 'Careers',
      contact: 'Contact',
      legal: 'Legal',
      privacy: 'Privacy',
      terms: 'Terms',
      cookies: 'Cookies',
      security: 'Security',
      rightsReserved: 'All rights reserved.',
      madeWith: 'Built with 🧡 for makers and founders'
    },
    calendar: {
      title: 'Calendar',
      subtitle: 'Calendar view of the roadmap and marketing plan, automatically refreshed on every move',
      prevMonth: 'Previous month',
      nextMonth: 'Next month',
      today: 'Today',
      autoSyncHint: 'This calendar recalculates automatically whenever a story is moved in the Gantt or roadmap.',
      exportIcs: 'Export (.ics)',
      launchEventTitle: (name) => `🚀 Launch of ${name || 'your product'}`,
      launchBadge: 'Launch',
      dayDetailEmpty: 'Nothing planned this day.',
      close: 'Close',
      story: 'Story',
      marketingItem: 'Marketing'
    },
    auth: {
      getStarted: 'Get Started',
      signIn: 'Sign in',
      signOut: 'Sign out',
      myAccount: 'My account',
      plansGate: 'Sign in to access your plans and drafts.',
      demoModeNotice: 'Demo mode — no Clerk key configured, sign-in is simulated locally.',
      backToHome: 'Back',
      signUpTitle: 'Create your account',
      signUpSubtitle: 'Generate your first launch plan in 5 minutes.',
      signInTitle: 'Welcome back',
      signInSubtitle: 'Sign in to find your plans.',
      switchToSignIn: 'Already have an account? Sign in',
      switchToSignUp: 'No account yet? Sign up',
      continueWith: 'Continue with',
      byContinuing: 'By continuing, you agree to our',
      ourFem: '',
      and: 'and our',
      forgotLink: 'Forgot password?',
      forgotTitle: 'Reset your password',
      forgotSubtitle: "Enter your email address and we'll send you a code to reset your password.",
      forgotCodeSent: (email) => `A code was sent to ${email}. Enter it below along with your new password.`,
      emailPlaceholder: 'Email address',
      codePlaceholder: 'Code from your email',
      newPasswordPlaceholder: 'New password',
      sendCode: 'Send code',
      sending: 'Sending...',
      resetPassword: 'Reset password',
      forgotError: 'Something went wrong. Check the details you entered and try again.',
      forgotNeeds2fa: 'This account needs extra verification — sign in normally to complete it.',
      backToSignIn: 'Back to sign in'
    },
    dashboard: {
      greeting: (name) => `Hi ${name}`,
      greetingGeneric: 'Hi there',
      subtitle: 'Here\'s an overview of your spaces',
      greetingCombined: (name, planLabel) => `Hi ${name}, here's a look at your day.\nYou're on the ${planLabel} plan, so don't hold back — go build the startup of your dreams! 🚀`,
      greetingPrefix: 'Hi',
      greetingCombinedRest: (planLabel) => `, here's a look at your day.\nYou're on the ${planLabel} plan, so don't hold back — go build the startup of your dreams! 🚀`,
      greetingCombinedGeneric: (planLabel) => `Hi there, here's a look at your day.\nYou're on the ${planLabel} plan, so don't hold back — go build the startup of your dreams! 🚀`,
      planLabelPro: 'Pro',
      planLabelFree: 'Free',
      widgetSizeLabel: 'Size',
      widgetSize: { small: 'Small', medium: 'Medium', large: 'Large' },
      widgetRemove: 'Remove widget',
      addWidgets: 'Add widgets',
      widgetLibrary: {
        title: 'Widgets',
        searchPlaceholder: 'Search widgets',
        allWidgets: 'All widgets',
        categories: { essentials: 'Essentials', organisation: 'Organisation', insights: 'New' },
        added: 'Added',
        add: 'Add',
        remove: 'Remove',
        alwaysShown: 'Always shown',
        proOnly: 'Pro',
        empty: 'No widget matches your search.',
        done: 'Done'
      },
      widgetCatalog: {
        calendar: { title: 'Calendar', desc: 'Monthly view of your deadlines and launch dates.' },
        resume: { title: 'Resume', desc: 'Jump straight back into your last opened plan.' },
        deadlines: { title: 'Upcoming deadlines', desc: 'List of upcoming launch dates and sprints.' },
        activity: { title: 'Recent activity', desc: 'Latest actions on your plans, across all spaces.' },
        nova: { title: 'Nova summary', desc: 'An AI-generated summary of your week.' },
        history: { title: 'Plan history', desc: 'Your most recent plans, one click to reopen.' },
        gallery: { title: 'Public gallery', desc: 'A mosaic of your shared plan covers.' },
        portfolioHealth: { title: 'Portfolio health', desc: 'Overall progress gauge for your active plans.' },
        streak: { title: 'Streak', desc: 'Consecutive days with at least one plan created or edited.' },
        businessWeather: { title: 'Business weather', desc: 'Portfolio health compared to 7 days ago.' }
      },
      portfolioHealthTitle: 'Portfolio health',
      portfolioHealthLevel: { good: 'Smooth sailing', medium: 'Worth watching', low: 'Needs attention' },
      portfolioHealthExplain: 'Score = % of stories done, minus 10 pts per urgent deadline (max -30) and 4 pts per upcoming deadline (max -15).',
      portfolioHealthDetail: (doneRatio, urgentCount, soonCount, urgentPenalty, soonPenalty) => {
        const parts = [`${doneRatio}% of stories are done.`]
        if (urgentPenalty > 0) parts.push(`${urgentCount} urgent deadline${urgentCount > 1 ? 's' : ''} (-${urgentPenalty} pts).`)
        if (soonPenalty > 0) parts.push(`${soonCount} deadline${soonCount > 1 ? 's' : ''} coming up (-${soonPenalty} pts).`)
        return parts.join(' ')
      },
      portfolioHealthLegend: {
        good: '≥ 70% — Smooth sailing',
        medium: '40-69% — Worth watching',
        low: '< 40% — Needs attention'
      },
      portfolioHealthByPlan: 'By plan',
      portfolioHealthHoverHint: 'Hover a plan (or a gauge segment) to see its calculation detail',
      streakTitle: 'Streak',
      streakDays: (n) => n === 1 ? '1 day' : `${n} days`,
      streakSubtitle: 'consecutive active days',
      streakExplain: 'A day counts once a plan has been created, saved, or edited — not just opening the app. Based on plan dates (server-side): the same across all your devices.',
      streakEmpty: 'Create or edit a plan to start your streak.',
      streakBest: (n) => `Best: ${n === 1 ? '1 day' : `${n} days`}`,
      streakTierLabel: { none: '', warm: '', hot: 'On fire 🔥', blazing: 'Unstoppable ⚡️' },
      streakTierLegend: {
        none: '0 days — no recent activity',
        warm: '1-6 days',
        hot: '7-29 days — on fire 🔥',
        blazing: '30+ days — unstoppable ⚡️'
      },
      businessWeatherTitle: 'Business weather',
      businessWeatherExplain: 'Reuses the Portfolio health score and compares it to about 7 days ago (measured on this device).',
      businessWeatherTrend: {
        up: (n) => `Improving (+${n} pts vs 7 days ago)`,
        down: (n) => `Declining (${n} pts vs 7 days ago)`,
        flat: 'Stable vs 7 days ago',
        none: 'Not enough history yet'
      },
      businessWeatherLevel: {
        good_up: 'Clear skies', good_flat: 'Clear skies', good_down: 'Sunny spells',
        medium_up: 'Clearing up', medium_flat: 'A few clouds', medium_down: 'Clouds gathering',
        low_up: 'Clearing after the storm', low_flat: 'Stormy', low_down: 'Storm intensifying'
      },
      businessWeatherLegendLevel: 'Level: same score as Portfolio health (Smooth sailing / Worth watching / Needs attention).',
      businessWeatherLegendTrend: 'Trend: ↑ improving (+5 pts or more) · stable · ↓ declining (-5 pts or more), vs 7 days ago.',
      planStatusProEmpty: 'Pro plan active 🚀 — you\'ve got everything you need, all that\'s left is a first plan to launch.',
      planStatusProActive: 'Pro plan active 🚀 — pick up right where you left off on your plans in progress, personal or team.',
      planStatusFreeEmpty: 'Free plan active ✨ — plenty to get started with, launch your very first plan.',
      planStatusFreeActive: 'Free plan active ✨ — your plans in progress are just waiting for you to move them forward.',
      createPlan: 'Create a new plan',
      resumeLabel: 'Resume',
      activityTitle: 'Recent activity',
      activityEmpty: 'Nothing to report yet.',
      novaSummaryTitle: 'Weekly summary',
      novaSummaryIntro: "Nova can summarize where your plans stand this week — stories completed, upcoming deadlines, things to watch.",
      novaSummaryError: "Couldn't generate the summary, try again in a moment.",
      novaSummaryCta: 'Ask Nova',
      novaSummaryRegenerate: 'Regenerate',
      novaSummaryLoading: 'Nova is thinking…',
      current: 'Current',
      openSpace: 'Open',
      planCount: (n) => `${n} plan${n > 1 ? 's' : ''}`,
      planSummaryTeam: (n) => n === 0
        ? 'No plans yet — the launchpad is wide open for the first one 🚀'
        : n === 1
          ? '1 plan in the works for this team — great start!'
          : `${n} plans in the works for this team — full steam ahead 🚀`,
      planSummaryPersonal: (n) => n === 0
        ? 'No plans yet — time to launch your first one.'
        : n === 1
          ? '1 personal plan in progress — nicely underway.'
          : `${n} personal plans in progress — thinking big.`,
      createTeam: 'Create a team',
      createTeamDesc: 'A shared space with your team',
      viewHistory: 'View full plan history',
      viewGallery: 'Public gallery',
      historyEmpty: 'No plans yet.',
      galleryEmpty: 'No covers yet.',
      tipTitle: 'Tip of the day',
      tipLoading: 'Loading tip of the day…',
      deadlinesTitle: 'Upcoming deadlines',
      deadlinesEmpty: 'No upcoming launch dates on your plans.',
      deadlinesUntitled: 'Untitled',
      deadlinesToday: 'Today',
      deadlinesTomorrow: 'Tomorrow',
      deadlinesInDays: (n) => `In ${n} days`,
      deadlinesKindLaunch: 'Launch',
      deadlinesKindSprint: (n) => `Sprint ${n} ends`,
      deadlinesPointsLeft: (n) => `${n} pt${n > 1 ? 's' : ''} left`,
      deadlinesPointsDone: 'All done ✓',
      calendarWeekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      calendarPrev: 'Previous month',
      calendarNext: 'Next month',
      calendarToday: 'Today',
      calendarLegendLaunch: 'Launch',
      calendarLegendSprint: 'Sprint end',
      calendarLegendActiveSprint: 'Active sprint',
      calendarSprintLabel: (n) => `Sprint ${n}`,
      calendarMoreStories: (n) => `+ ${n} more`
    },
    planFinancialReport: {
      title: (name) => `Financial report — ${name}`,
      grandTotal: 'Total budget (launch + marketing)',
      launchBudget: 'Launch budget',
      marketingBudget: 'Marketing budget',
      cashProjection: 'Cash projection',
      cashProjectionSubtitle: 'Remaining cash month by month, at the current burn rate',
      costBreakdownSubtitle: 'Share of each category in the monthly spend',
      monthShort: (n) => `Month ${n}`,
      cashLegendRemaining: 'Remaining cash',
      cashLegendBurn: (amount) => `Monthly burn: ${amount}`,
      exportPdf: 'Export as PDF',
      exportDocx: 'Export as Word',
      exportHtml: 'Export as HTML',
      exporting: 'Generating…'
    },
    planVersions: {
      back: 'Back to plan',
      title: 'Version library',
      cardDesc: 'A full snapshot on every save — compare two versions to see what changed',
      pickerBody: 'Choose which plan\'s versions you want to compare.',
      loading: 'Loading…',
      none: 'No saved version for this plan yet.',
      onlyOne: 'Only one saved version so far — check back after another "Save" to compare.',
      fromLabel: 'Before',
      toLabel: 'After',
      classification: 'Classification',
      marketingBudget: 'Marketing budget',
      roadmap: 'Roadmap',
      kpis: 'KPIs',
      personas: 'Personas',
      financials: 'Financials',
      executiveSummary: 'Executive summary',
      noChange: 'No change between these two versions.',
      compareLink: 'Compare versions'
    },
    team: {
      personalSpace: 'Personal',
      switcherTitle: 'Workspace',
      myTeams: 'My teams',
      createTeam: 'Create a team',
      createTeamTitle: 'Create a team',
      createTeamBody: 'Plans created in this space will be visible to every team member.',
      createTeamNamePlaceholder: 'Team name',
      createTeamConfirm: 'Create',
      createTeamCancel: 'Cancel',
      roleAdmin: 'Admin',
      roleMember: 'Member',
      membersTitle: 'Members',
      noTeamActive: 'You\'re in your personal space — select or create a team to see its members.',
      mockNotice: 'Simulated team in demo mode (no Clerk key configured) — real invitations aren\'t available here.',
      limitReachedFree: (limit) => `The Free plan is limited to ${limit} team space. Upgrade to Pro to create up to 5, or contact us for unlimited spaces on Enterprise.`,
      limitReachedPro: (limit) => `Your Pro plan is limited to ${limit} team spaces. Get in touch to move to Enterprise and unlock unlimited spaces.`
    },
    account: {
      title: 'My account',
      subtitle: 'Manage your profile, plans and subscription',
      backToApp: 'Back to app',
      creditsTitle: 'Plan generation',
      creditsFree: (used, limit) => `${used} / ${limit} free plans used`,
      creditsProTitle: 'Pro member',
      creditsProSubtitle: 'Unlimited generations and exports, unlocked on your account.',
      creditsExhausted: "You've used your 3 free plans.",
      limitModalTitle: 'Free plan limit reached',
      limitModalBody: "You've used your 3 free plans. Upgrade to Pro to generate unlimited plans, or delete an existing plan from your account if you just want to make room — note that deleting a plan does not refund a credit.",
      limitModalManage: 'View my plans',
      upgradeCta: 'Upgrade to Pro',
      upgradeTitle: 'Choose your plan',
      upgradeBody: 'Upgrade to Pro for unlimited generations and unlimited teams, or get in touch for a custom Enterprise plan.',
      upgradeNote: 'Stripe payment will go live as soon as the key is configured server-side.',
      upgradeError: 'Could not reach Stripe right now. Please try again shortly.',
      upgradeLoading: 'Redirecting to Stripe…',
      upgradeConfirm: 'Continue to payment',
      avatarChangeCta: 'Change avatar',
      avatarTitle: 'Pick your avatar',
      avatarUpload: 'Upload a photo',
      securityTitle: 'Security & sign-in',
      securityBody: 'Password, two-factor auth, connected devices and account deletion.',
      securityCta: 'Manage security',
      plansSectionTitle: 'History of all plans',
      draftsSectionTitle: 'My drafts',
      noPlans: 'No plan generated yet.',
      noDrafts: 'No saved drafts.',
      memberSince: 'Member since',
      demoBadge: 'Demo account',
      notificationsProNote: 'Team comment notifications are a Pro feature.',
      plansFreeNote: 'History limited to the active space. Upgrade to Pro to see all your spaces combined.',
      clearNotifications: 'Clear all',
      clearNotificationsConfirmTitle: 'Clear all notifications?',
      clearNotificationsConfirmBody: 'They\'ll disappear from this list (comments remain visible on their plans). This cannot be undone.'
    },
    settings: {
      title: 'Settings',
      backToApp: 'Back to app',
      appearanceTitle: 'Appearance',
      themeLabel: 'Theme',
      themeDark: 'Dark',
      themeLight: 'Light',
      languageTitle: 'Language',
      languageBody: 'Language for the interface and generated plans.',
      timezoneTitle: 'Timezone',
      timezoneBody: 'Used to display dates (history, notifications, exports).',
      timezoneAuto: "Automatic (this device's timezone)",
      accessibilityTitle: 'Accessibility',
      reduceMotionLabel: 'Reduce motion',
      reduceMotionBody: 'Turns off decorative transitions and animations across the app.',
      fontSizeLabel: 'Font size',
      fontSizeBody: 'Adjusts text size throughout the app.',
      fontSizeNormal: 'Normal',
      fontSizeLarge: 'Large',
      fontSizeXLarge: 'Extra large',
      highContrastLabel: 'High contrast',
      highContrastBody: 'Boosts secondary text and border contrast for better readability.',
      formatsTitle: 'Formats',
      dateFormatLabel: 'Date format',
      dateFormatBody: 'Day/month order used for numeric dates (calendars, exports).',
      dateFormatAuto: 'Automatic (based on language)',
      dateFormatDMY: 'DD/MM/YYYY',
      dateFormatMDY: 'MM/DD/YYYY',
      currencyLabel: 'Currency',
      currencyBody: 'Changes the symbol shown on amounts (no exchange-rate conversion).',
      integrationsTitle: 'Connected integrations',
      integrationsBody: 'Third-party accounts linked to VelocityLaunch for exports.',
      integrationsLoading: 'Checking...',
      integrationsConnected: (detail) => `Connected${detail ? ` — ${detail}` : ''}`,
      integrationsNotConnected: 'Not connected',
      integrationsConnectedBadge: 'Connected',
      integrationsNotConnectedBadge: 'Not connected',
      integrationsDisconnect: 'Disconnect',
      privacyTitle: 'Privacy & data',
      exportDataLabel: 'Export all my data',
      exportDataBody: 'Downloads a JSON file with your plans, drafts and preferences.',
      exportDataCta: 'Export (JSON)',
      deleteAccountLabel: 'Delete my account',
      deleteAccountBody: 'Permanent action: deletes your account and all associated data.',
      deleteAccountCta: 'Delete account',
      deleteAccountConfirm: 'Confirm deletion',
      deleteAccountCancel: 'Cancel',
      notificationsTitle: 'Email notifications',
      notificationsBody: (email) => `Sent to ${email}.`,
      notifAgentDoneLabel: 'AI generation completed',
      notifAgentDoneBody: 'An email on every AI generation (market watch, benchmarks, calendars, GDPR, AI table, backlog agents...).',
      notifInactiveLabel: 'Inactive plan reminder',
      notifInactiveBody: 'An email if a plan has had no activity for more than 14 days.',
      notifSlackLabel: 'Slack notifications',
      notifSlackBody: 'Same triggers, sent to a Slack channel via an Incoming Webhook (you create it, no app to install).',
      notifSlackDocsLink: 'Create a webhook →',
      notifSlackSave: 'Save',
      notifSlackSaved: 'Saved ✓',
      notifVeilleAutoLabel: 'Automatic AI market watch',
      notifVeilleAutoBody: 'Refreshes every Monday for plans that already have a market watch, and only notifies you when something new shows up.',
      notifMentionsLabel: '@mentions in comments',
      notifMentionsBody: 'Notifies you when a teammate mentions you (@you) in a comment on a shared plan.',
      notifWeeklyDigestLabel: 'Weekly digest',
      notifWeeklyDigestBody: "Every Monday, a summary of the week's activity (stories completed, progress, comments) for your active plans — only sent if something actually happened.",
      webhooksTitle: 'Outgoing webhooks',
      webhooksBody: 'Connect any external tool (Zapier, Make, your own backend...) to your plan events. Every delivery is signed with HMAC-SHA256 (X-VelocityLaunch-Signature header) so you can verify its authenticity.',
      webhookEventGeneration: 'AI generation completed',
      webhookEventStory: 'Story marked done',
      webhookAdd: 'Add webhook',
      webhookDelete: 'Delete',
      webhookError: 'Could not create the webhook. Check the URL (must be https) and that at least one event is checked.',
      webhookSecretTitle: 'Signing secret — copy it now',
      webhookSecretBody: "This secret will never be shown again. Use it to verify each delivery's HMAC-SHA256 signature.",
      webhookSecretDismiss: "I've copied the secret",
      brandingTitle: 'Custom branding on exports',
      brandingBody: 'Add your logo next to the VelocityLaunch credit on the pitch deck cover/closing slides (PPTX) and at the top of the PDF. The "Generated with VelocityLaunch" credit always stays — this is not a full white-label.',
      brandingUpgrade: 'Upgrade to Pro to enable',
      brandingUpload: 'Upload a logo',
      brandingChange: 'Change logo',
      brandingRemove: 'Remove',
      brandingEnableLabel: 'Show my logo on exports',
      brandingEnableBody: 'Turn off without deleting the uploaded logo.'
    }
  }
}

export function t(lang, path) {
  const parts = path.split('.')
  let node = translations[lang] || translations.fr
  for (const p of parts) node = node?.[p]
  return node ?? path
}
