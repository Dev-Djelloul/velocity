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
      dragHint: 'Astuce : fais glisser une carte vers une autre colonne pour changer son sprint. Clique sur ▸ pour voir le détail complet.',
      expand: 'Voir le détail',
      collapse: 'Réduire',
      edit: 'Modifier',
      done: 'Terminé',
      errors: {
        pastSprint: 'Impossible de replanifier avant le sprint en cours.',
        beforeDependency: 'Cette story dépend de {dep} — elle ne peut pas être planifiée avant.',
        afterDependent: '{dep} dépend de cette story — elle ne peut pas être planifiée après.'
      }
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
      generating: 'Génération…',
      addRow: '+ Ajouter une ligne',
      removeRow: 'Supprimer la ligne',
      removeColumn: 'Supprimer la colonne',
      exportCsv: 'Exporter en CSV'
    },
    backlog: {
      title: 'Backlog',
      subtitle: (done, total) => `${done}/${total} stories terminées, tous sprints confondus`,
      searchPlaceholder: 'Rechercher une story...',
      filterAll: 'Tous les statuts',
      filterTodo: 'À faire',
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
      behind: 'En retard'
    },
    dashboardBi: {
      title: 'Dashboard',
      subtitle: 'Vue d\'ensemble croisée du plan — budget, charge, vélocité et KPIs',
      budgetByChannel: 'Budget par canal',
      workloadByRole: 'Charge par responsable',
      velocityBySprint: 'Vélocité par sprint',
      kpiTargets: 'Objectifs KPIs',
      costSplit: 'Répartition des coûts',
      total: 'Total',
      totalEffort: 'Effort total',
      monthlyBurn: 'Burn mensuel'
    },
    sidebar: {
      title: 'Sommaire du plan',
      persona: 'Persona',
      collapse: 'Réduire le panneau',
      expand: 'Déplier le panneau'
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
      roadmapSubtitle: 'Plan d\'exécution par sprints',
      kpiSubtitle: 'Métriques principales de succès',
      marketingChannelsTitle: 'Canaux de marketing',
      strategyLabel: 'Stratégie',
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
      planLoadedTitle: 'Ravi de te revoir !',
      planLoadedSubtitle: (dateTime) => `Ce plan a été généré ${dateTime} — reprenons là où tu t'étais arrêté 😃`,
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
        arpuLabel: 'Pourquoi cet ARPU :',
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
    },
    modals: {
      pricing: {
        title: 'Tarification',
        intro: 'VelocityLaunch est gratuit pendant la beta. Pas de carte bancaire, pas de limite cachée sur les fonctionnalités principales.',
        currentBadge: 'Actuel',
        currentTitle: 'Beta gratuite',
        currentPrice: '0€',
        currentFeatures: [
          'Plans de lancement illimités',
          'Questionnaire complet FR / EN',
          'Roadmap, stratégie marketing et KPIs générés',
          'Export PDF et CSV',
          'Partage par lien privé',
          'Brouillons sauvegardés localement'
        ],
        soonBadge: 'Bientôt',
        soonTitle: 'Pro',
        soonPrice: 'À venir',
        soonFeatures: [
          'Historique et sauvegarde cloud',
          "Espaces d'équipe collaboratifs",
          'Templates sectoriels avancés',
          'Intégrations (Notion, Slack…)'
        ],
        notifyMe: 'Me prévenir'
      },
      changelog: {
        title: 'Changelog',
        entries: [
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
      roadmap: {
        title: 'Roadmap',
        intro: "Un aperçu honnête de ce qui existe déjà et de ce qui s'en vient. Cette roadmap évolue avec les retours des premiers utilisateurs.",
        columns: [
          {
            label: 'Disponible',
            items: ['Questionnaire guidé 12 questions', 'Roadmap générée par sprints', 'Stratégie marketing et KPIs', 'Export PDF / CSV', 'Partage par lien privé', 'FR / EN']
          },
          {
            label: 'En cours',
            items: ['Tableau de bord de suivi post-lancement', 'Comparateur A/B test intégré', 'Modèles de plan par secteur']
          },
          {
            label: 'Envisagé',
            items: ["Comptes et espaces d'équipe", 'Intégrations Notion / Slack', 'API publique', 'Historique cloud synchronisé']
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
        updated: 'Dernière mise à jour : juillet 2026. VelocityLaunch accorde une attention particulière à la confidentialité de vos données.',
        dataHeading: 'Données collectées',
        dataText: 'Les réponses que vous saisissez dans le questionnaire (informations produit, marché, ressources) servent uniquement à générer votre plan de lancement. Par défaut, ces données restent stockées localement dans votre navigateur (localStorage) et ne transitent vers nos serveurs que si vous choisissez explicitement de partager un plan via un lien.',
        usageHeading: 'Utilisation des données',
        usageText: "Nous n'utilisons jamais le contenu de vos plans à des fins publicitaires ou de revente. Google Analytics est utilisé uniquement pour comprendre l'usage global du service, sans lien avec le contenu de vos plans.",
        rightsHeading: 'Vos droits (RGPD)',
        rightAccessLabel: 'Accès :',
        rightAccessText: 'vous pouvez consulter toutes les données que vous avez générées',
        rightDeleteLabel: 'Suppression :',
        rightDeleteText: 'vider votre localStorage supprime immédiatement vos données locales',
        rightPortabilityLabel: 'Portabilité :',
        rightPortabilityText: 'export possible à tout moment en PDF ou CSV',
        rightOppositionLabel: 'Opposition :',
        rightOppositionText: 'écrivez-nous pour toute demande spécifique',
        contactHeading: 'Contact',
        contactText: 'Pour toute question relative à vos données :',
        note: 'Ce document est fourni à titre indicatif pour un projet en beta. Il ne remplace pas un avis juridique et sera précisé avant toute mise en production commerciale.'
      },
      terms: {
        title: "Conditions d'utilisation",
        updated: 'Dernière mise à jour : juillet 2026. En utilisant VelocityLaunch, vous acceptez les conditions suivantes.',
        serviceHeading: 'Le service',
        serviceText: 'VelocityLaunch génère des recommandations (roadmap, stratégie marketing, KPIs) à partir des réponses que vous fournissez. Ces recommandations sont des points de départ, pas des conseils professionnels garantis : à vous de les adapter à votre contexte réel.',
        usageHeading: 'Utilisation acceptable',
        usageItem1: 'Le service est fourni "tel quel", sans garantie de résultat commercial',
        usageItem2: 'Vous restez propriétaire du contenu de vos plans',
        usageItem3: "Toute tentative d'abus, de scraping massif ou d'attaque du service est interdite",
        availabilityHeading: 'Disponibilité',
        availabilityText: 'VelocityLaunch est en beta gratuite : le service peut évoluer, et certaines fonctionnalités peuvent être ajustées sans préavis pendant cette phase.',
        contactHeading: 'Contact',
        contactText: 'Pour toute question sur ces conditions :',
        note: 'Ce document est fourni à titre indicatif pour un projet en beta. Il ne remplace pas un avis juridique et sera précisé avant toute mise en production commerciale.'
      },
      cookies: {
        title: 'Politique de cookies',
        intro: 'VelocityLaunch utilise le minimum de cookies et de stockage nécessaire au fonctionnement du service.',
        storageHeading: 'Stockage local (essentiel)',
        storageText: "Votre langue préférée, vos brouillons et vos plans générés sont conservés dans le localStorage de votre navigateur. Ce stockage n'est pas un cookie tiers : il reste sur votre appareil et n'est jamais transmis sans action de votre part.",
        analyticsHeading: "Mesure d'audience",
        analyticsText: "Google Analytics dépose des cookies de mesure d'audience pour comprendre l'utilisation globale du service (pages visitées, provenance). Aucune donnée personnelle issue de vos plans n'y est associée.",
        manageHeading: 'Gérer vos cookies',
        manageText: 'Vous pouvez à tout moment bloquer les cookies de mesure d\'audience via les réglages de votre navigateur, sans impact sur le fonctionnement du générateur de plan.',
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
        trackingText: 'Nous utilisons uniquement Google Analytics pour comprendre l\'utilisation globale du service. Nous ne trackons pas les données personnelles ou le contenu de vos plans.',
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
    plans: {
      title: 'Vos plans de lancement',
      emptyTitle: 'Historique des plans',
      emptyText: "Vous n'avez pas encore généré de plan. Commencez par en créer un !",
      intro: 'Gérez vos plans générés et partagez-les avec votre équipe',
      untitled: 'Plan sans titre',
      createdAtPrefix: 'Créé le',
      load: 'Charger',
      share: 'Partager',
      delete: 'Supprimer',
      shareLinkHeading: 'Lien de partage',
      copy: 'Copier',
      copied: 'Copié',
      shareExpiry: 'Ce lien expire dans 30 jours',
      deleteConfirmTitle: 'Supprimer ce plan ?',
      deleteConfirmSuffix: 'sera définitivement supprimé. Cette action est irréversible.',
      cancel: 'Annuler',
      defaultPlanName: 'Ce plan'
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
      subtitle: 'Vue calendrier de la roadmap, actualisée automatiquement à chaque déplacement',
      prevMonth: 'Mois précédent',
      nextMonth: 'Mois suivant',
      today: "Aujourd'hui",
      autoSyncHint: 'Ce calendrier se recalcule automatiquement dès qu\'une story est déplacée dans le Gantt ou la roadmap.'
    },
    auth: {
      getStarted: 'Commencer',
      signIn: 'Se connecter',
      signOut: 'Se déconnecter',
      myAccount: 'Mon compte',
      plansGate: 'Connecte-toi pour accéder à tes plans et brouillons.',
      demoModeNotice: 'Mode démo — aucune clé Clerk configurée, la connexion est simulée en local.'
    },
    account: {
      title: 'Mon compte',
      subtitle: 'Gère ton profil, tes plans et ton abonnement',
      backToApp: "Retour à l'app",
      creditsTitle: 'Génération de plans',
      creditsFree: (used, limit) => `${used} / ${limit} plans gratuits utilisés`,
      creditsPro: 'Abonnement Pro actif — générations illimitées',
      creditsExhausted: 'Tu as utilisé tes 3 plans gratuits.',
      upgradeCta: 'Passer en Pro',
      upgradeTitle: 'Passer en Pro',
      upgradeBody: 'Débloque des générations de plans illimitées et les futures fonctionnalités Pro.',
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
      plansSectionTitle: 'Mes plans',
      draftsSectionTitle: 'Mes brouillons',
      noPlans: 'Aucun plan généré pour le moment.',
      noDrafts: 'Aucun brouillon sauvegardé.',
      memberSince: 'Membre depuis',
      demoBadge: 'Compte démo'
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
      dragHint: 'Tip: drag a card to another column to change its sprint. Click ▸ to see the full detail.',
      expand: 'View detail',
      collapse: 'Collapse',
      edit: 'Edit',
      done: 'Done',
      errors: {
        pastSprint: 'Cannot reschedule before the current sprint.',
        beforeDependency: 'This story depends on {dep} — it cannot be scheduled before it.',
        afterDependent: '{dep} depends on this story — it cannot be scheduled after it.'
      }
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
      generating: 'Generating…',
      addRow: '+ Add row',
      removeRow: 'Remove row',
      removeColumn: 'Remove column',
      exportCsv: 'Export as CSV'
    },
    backlog: {
      title: 'Backlog',
      subtitle: (done, total) => `${done}/${total} stories done, across all sprints`,
      searchPlaceholder: 'Search a story...',
      filterAll: 'All statuses',
      filterTodo: 'To do',
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
      behind: 'Behind'
    },
    dashboardBi: {
      title: 'Dashboard',
      subtitle: 'Cross-cutting overview of the plan — budget, workload, velocity and KPIs',
      budgetByChannel: 'Budget by channel',
      workloadByRole: 'Workload by role',
      velocityBySprint: 'Velocity by sprint',
      kpiTargets: 'KPI targets',
      costSplit: 'Cost split',
      total: 'Total',
      totalEffort: 'Total effort',
      monthlyBurn: 'Monthly burn'
    },
    sidebar: {
      title: 'Plan overview',
      persona: 'Persona',
      collapse: 'Collapse panel',
      expand: 'Expand panel'
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
      roadmapSubtitle: 'Sprint execution plan',
      kpiSubtitle: 'Key success metrics',
      marketingChannelsTitle: 'Marketing channels',
      strategyLabel: 'Strategy',
      risksLabel: 'Risks',
      budgetAvailable: (amount) => `Available budget: ${amount}`,
      effort: 'Effort',
      cost: 'Cost',
      dependsOn: 'Depends on',
      risks: 'Risks',
      budget: 'Budget',
      goal: 'Goal',
      assets: {
        post: 'Post',
        email: 'Email subject',
        landing: 'Landing tagline'
      },
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
      planReadyTitle: 'Your launch plan is ready!',
      planReadySubtitle: (dateTime) => `Generated just now, ${dateTime}.`,
      planLoadedTitle: 'Good to see you again!',
      planLoadedSubtitle: (dateTime) => `This plan was generated ${dateTime} — let's pick up where you left off 😃`,
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
        arpuLabel: 'Why this ARPU:',
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
    },
    modals: {
      pricing: {
        title: 'Pricing',
        intro: 'VelocityLaunch is free during beta. No credit card, no hidden limits on core features.',
        currentBadge: 'Current',
        currentTitle: 'Free beta',
        currentPrice: '€0',
        currentFeatures: [
          'Unlimited launch plans',
          'Full questionnaire FR / EN',
          'Generated roadmap, marketing strategy and KPIs',
          'PDF and CSV export',
          'Private link sharing',
          'Drafts saved locally'
        ],
        soonBadge: 'Coming soon',
        soonTitle: 'Pro',
        soonPrice: 'Coming soon',
        soonFeatures: [
          'History and cloud backup',
          'Collaborative team spaces',
          'Advanced sector templates',
          'Integrations (Notion, Slack…)'
        ],
        notifyMe: 'Notify me'
      },
      changelog: {
        title: 'Changelog',
        entries: [
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
      roadmap: {
        title: 'Roadmap',
        intro: "An honest look at what already exists and what's coming next. This roadmap evolves with feedback from early users.",
        columns: [
          {
            label: 'Available',
            items: ['Guided 12-question questionnaire', 'Sprint-generated roadmap', 'Marketing strategy and KPIs', 'PDF / CSV export', 'Private link sharing', 'FR / EN']
          },
          {
            label: 'In progress',
            items: ['Post-launch tracking dashboard', 'Built-in A/B test comparator', 'Sector-specific plan templates']
          },
          {
            label: 'Considered',
            items: ['Accounts and team spaces', 'Notion / Slack integrations', 'Public API', 'Synced cloud history']
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
        updated: 'Last updated: July 2026. VelocityLaunch pays close attention to the privacy of your data.',
        dataHeading: 'Data collected',
        dataText: 'The answers you enter in the questionnaire (product, market, resources information) are used solely to generate your launch plan. By default, this data stays stored locally in your browser (localStorage) and only reaches our servers if you explicitly choose to share a plan via a link.',
        usageHeading: 'Data usage',
        usageText: 'We never use the content of your plans for advertising or resale purposes. Google Analytics is used solely to understand overall service usage, with no link to the content of your plans.',
        rightsHeading: 'Your rights (GDPR)',
        rightAccessLabel: 'Access:',
        rightAccessText: 'you can view all the data you have generated',
        rightDeleteLabel: 'Deletion:',
        rightDeleteText: 'clearing your localStorage immediately deletes your local data',
        rightPortabilityLabel: 'Portability:',
        rightPortabilityText: 'export possible at any time in PDF or CSV',
        rightOppositionLabel: 'Objection:',
        rightOppositionText: 'write to us for any specific request',
        contactHeading: 'Contact',
        contactText: 'For any question about your data:',
        note: 'This document is provided for guidance for a beta project. It does not replace legal advice and will be refined before any commercial production release.'
      },
      terms: {
        title: 'Terms of Use',
        updated: 'Last updated: July 2026. By using VelocityLaunch, you accept the following terms.',
        serviceHeading: 'The service',
        serviceText: 'VelocityLaunch generates recommendations (roadmap, marketing strategy, KPIs) from the answers you provide. These recommendations are a starting point, not guaranteed professional advice: it is up to you to adapt them to your actual context.',
        usageHeading: 'Acceptable use',
        usageItem1: 'The service is provided "as is", with no guarantee of commercial results',
        usageItem2: 'You remain the owner of your plans\' content',
        usageItem3: 'Any attempt at abuse, mass scraping or attacking the service is prohibited',
        availabilityHeading: 'Availability',
        availabilityText: 'VelocityLaunch is in free beta: the service may evolve, and some features may be adjusted without notice during this phase.',
        contactHeading: 'Contact',
        contactText: 'For any question about these terms:',
        note: 'This document is provided for guidance for a beta project. It does not replace legal advice and will be refined before any commercial production release.'
      },
      cookies: {
        title: 'Cookie Policy',
        intro: 'VelocityLaunch uses the minimum amount of cookies and storage necessary for the service to work.',
        storageHeading: 'Local storage (essential)',
        storageText: 'Your preferred language, your drafts and your generated plans are kept in your browser\'s localStorage. This storage is not a third-party cookie: it stays on your device and is never transmitted without action on your part.',
        analyticsHeading: 'Audience measurement',
        analyticsText: 'Google Analytics sets audience measurement cookies to understand overall service usage (pages visited, origin). No personal data from your plans is associated with it.',
        manageHeading: 'Managing your cookies',
        manageText: 'You can block audience measurement cookies at any time via your browser settings, with no impact on how the plan generator works.',
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
        trackingText: 'We only use Google Analytics to understand overall service usage. We do not track personal data or the content of your plans.',
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
    plans: {
      title: 'Your launch plans',
      emptyTitle: 'Plan history',
      emptyText: "You haven't generated a plan yet. Start by creating one!",
      intro: 'Manage your generated plans and share them with your team',
      untitled: 'Untitled plan',
      createdAtPrefix: 'Created on',
      load: 'Load',
      share: 'Share',
      delete: 'Delete',
      shareLinkHeading: 'Share link',
      copy: 'Copy',
      copied: 'Copied',
      shareExpiry: 'This link expires in 30 days',
      deleteConfirmTitle: 'Delete this plan?',
      deleteConfirmSuffix: 'will be permanently deleted. This action cannot be undone.',
      cancel: 'Cancel',
      defaultPlanName: 'This plan'
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
      subtitle: 'Calendar view of the roadmap, automatically refreshed on every move',
      prevMonth: 'Previous month',
      nextMonth: 'Next month',
      today: 'Today',
      autoSyncHint: 'This calendar recalculates automatically whenever a story is moved in the Gantt or roadmap.'
    },
    auth: {
      getStarted: 'Get Started',
      signIn: 'Sign in',
      signOut: 'Sign out',
      myAccount: 'My account',
      plansGate: 'Sign in to access your plans and drafts.',
      demoModeNotice: 'Demo mode — no Clerk key configured, sign-in is simulated locally.'
    },
    account: {
      title: 'My account',
      subtitle: 'Manage your profile, plans and subscription',
      backToApp: 'Back to app',
      creditsTitle: 'Plan generation',
      creditsFree: (used, limit) => `${used} / ${limit} free plans used`,
      creditsPro: 'Pro subscription active — unlimited generations',
      creditsExhausted: "You've used your 3 free plans.",
      upgradeCta: 'Upgrade to Pro',
      upgradeTitle: 'Upgrade to Pro',
      upgradeBody: 'Unlock unlimited plan generations and future Pro features.',
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
      plansSectionTitle: 'My plans',
      draftsSectionTitle: 'My drafts',
      noPlans: 'No plan generated yet.',
      noDrafts: 'No saved drafts.',
      memberSince: 'Member since',
      demoBadge: 'Demo account'
    }
  }
}

export function t(lang, path) {
  const parts = path.split('.')
  let node = translations[lang] || translations.fr
  for (const p of parts) node = node?.[p]
  return node ?? path
}
