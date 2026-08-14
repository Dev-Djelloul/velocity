export const content = {
  fr: {
    classification: {
      awareness: 'Sensibilisation + Validation',
      acquisition: 'Acquisition + Adéquation produit-marché',
      growth: 'Croissance + Rétention'
    },
    strategyNames: {
      enterprise: 'Stratégie Entreprise',
      viral: 'Croissance virale',
      balanced: 'Équilibrée',
      content: 'Axée contenu',
      sector_ecommerce: 'Stratégie e-commerce',
      sector_saas: 'Stratégie SaaS B2B',
      sector_marketplace: 'Stratégie marketplace',
      sector_mobile: 'Stratégie appli mobile',
      sector_fintech: 'Stratégie fintech',
      sector_healthtech: 'Stratégie healthtech',
      sector_devtools: 'Stratégie dev tools',
      sector_ai: 'Stratégie IA / ML',
      sector_media: 'Stratégie contenu / média',
      sector_edtech: 'Stratégie edtech'
    },
    sectorKpi: {
      ecommerce: { name: 'Panier moyen (AOV)', formula: 'chiffre_affaires / nombre_commandes', unit: '€' },
      saas: { name: 'MRR', formula: 'Σ(abonnements_mensuels)', unit: '€' },
      marketplace: { name: 'GMV', formula: 'Σ(valeur_des_transactions)', unit: '€' },
      mobile: { name: 'Rétention J7', formula: 'utilisateurs_actifs_j7 / installs_cohorte', unit: '%' },
      fintech: { name: 'Taux de complétion KYC', formula: 'kyc_complétés / kyc_démarrés', unit: '%' },
      healthtech: { name: 'Taux d\'adoption clinique', formula: 'professionnels_actifs / professionnels_inscrits', unit: '%' },
      devtools: { name: 'Installations SDK', formula: 'Σ(installations_package)', unit: '#' },
      ai: { name: 'Taux d\'adoption du modèle', formula: 'requêtes_acceptées / requêtes_générées', unit: '%' },
      media: { name: 'Temps de session moyen', formula: 'durée_totale_sessions / nombre_sessions', unit: 'min' },
      edtech: { name: 'Taux de complétion de cours', formula: 'cours_terminés / cours_démarrés', unit: '%' }
    },
    stories: {
      onboarding: 'Finaliser le parcours d\'onboarding',
      positioning: 'Rédiger le document de positionnement de marque',
      landing: 'Créer les maquettes de la landing page',
      stagingDeploy: 'Déployer le MVP en environnement de test',
      teaser: 'Tourner les vidéos teaser de lancement',
      analytics: 'Mettre en place le suivi analytics',
      publicBeta: 'Lancer la bêta publique',
      paidCampaign: 'Lancer la campagne d\'acquisition payante',
      community: 'Créer le canal communautaire',
      qa: 'Effectuer une passe de tests de non-régression',
      thoughtLeadership: 'Publier du contenu d\'expertise',
      feedback: 'Itérer sur les retours utilisateurs'
    },
    storyDescriptions: {
      onboarding: 'Guider les nouveaux utilisateurs jusqu\'à leur premier succès dans le produit.',
      positioning: 'Clarifier le message et la différenciation avant toute communication publique.',
      landing: 'Concevoir la page qui convertira les premiers visiteurs en inscrits.',
      stagingDeploy: 'Rendre le produit testable dans un environnement proche de la production.',
      teaser: 'Créer un contenu vidéo qui donne envie avant même le lancement.',
      analytics: 'Instrumenter le produit pour mesurer l\'usage réel dès le premier jour.',
      publicBeta: 'Ouvrir l\'accès à un premier groupe d\'utilisateurs réels.',
      paidCampaign: 'Tester l\'acquisition payante sur le canal identifié comme prioritaire.',
      community: 'Créer un point de rassemblement pour les premiers utilisateurs engagés.',
      qa: 'Sécuriser la stabilité avant une exposition plus large.',
      thoughtLeadership: 'Construire la crédibilité de la marque sur son sujet d\'expertise.',
      feedback: 'Transformer les retours des premiers utilisateurs en améliorations concrètes.'
    },
    storyAcceptance: {
      onboarding: ['L\'utilisateur atteint la première action clé sans aide', 'Moins de 3 étapes avant la valeur perçue'],
      positioning: ['Une phrase de positionnement validée par l\'équipe', 'Le document distingue clairement des 2-3 concurrents principaux'],
      landing: ['Un CTA principal visible sans scroll', 'Le bénéfice principal est lisible en moins de 5 secondes'],
      stagingDeploy: ['L\'environnement est accessible à l\'équipe', 'Le parcours principal fonctionne de bout en bout'],
      teaser: ['Durée de 15 à 30 secondes', 'Le produit et son bénéfice sont identifiables en un visionnage'],
      analytics: ['Les événements clés du parcours utilisateur sont trackés', 'Un dashboard basique est consultable par l\'équipe'],
      publicBeta: ['Un canal de retour utilisateur est en place', 'Les inscriptions sont limitées et suivies'],
      paidCampaign: ['Le tracking de conversion est en place avant le lancement', 'Un budget quotidien plafond est défini'],
      community: ['Le canal est accessible publiquement', 'Un message de bienvenue explique les règles'],
      qa: ['Le parcours critique est testé manuellement', 'Aucun bug bloquant connu n\'est ouvert'],
      thoughtLeadership: ['Le contenu est publié sur au moins un canal propre', 'Le sujet est directement lié à la proposition de valeur'],
      feedback: ['Au moins 3 retours utilisateurs sont synthétisés', 'Une action produit est priorisée à partir de ces retours']
    },
    assignees: {
      Dev: 'Dev',
      Marketing: 'Marketing',
      Design: 'Design',
      Product: 'Produit'
    },
    riskLabels: {
      notready: { risk: 'Produit pas encore totalement prêt', mitigation: 'Ajouter un sprint tampon de QA avant le lancement' },
      pmf: { risk: 'Adéquation produit-marché incertaine', mitigation: 'Valider avec 10 utilisateurs béta avant d\'augmenter les dépenses' },
      budget: { risk: 'Limite de budget atteinte', mitigation: 'Prioriser le canal au meilleur ROI' },
      regulatory: { risk: 'Contraintes réglementaires ou de conformité', mitigation: 'Cadrer les exigences légales tôt et prévoir une revue conformité avant lancement' },
      techdebt: { risk: 'Dette technique susceptible de ralentir les itérations', mitigation: 'Réserver ~20% de la capacité de chaque sprint au refactoring' },
      platform: { risk: 'Dépendance forte à une plateforme tierce', mitigation: 'Prévoir une alternative et isoler les intégrations derrière une couche d\'abstraction' },
      timing: { risk: 'Fenêtre de marché incertaine', mitigation: 'Lancer un MVP rapidement pour tester la traction avant d\'investir davantage' },
      hiring: { risk: 'Recrutement des rôles clés non finalisé', mitigation: 'Prioriser les stories réalisables par l\'équipe actuelle et externaliser le reste' }
    },
    channelUnits: {
      TikTok: 'k vues',
      YouTube: 'abonnés',
      LinkedIn: 'leads',
      Content: 'articles',
      Paid: 'conversions',
      Community: 'membres',
      Partnerships: 'partenaires',
      Social: 'abonnés'
    },
    channelGoalGeneric: 'Croissance via',
    cadence: '3x/semaine',
    contentPillars: {
      TikTok: ['Démos produit', 'Coulisses', 'Témoignages utilisateurs'],
      LinkedIn: ['Expertise métier', 'Études de cas', 'Actualités produit'],
      Content: ['Guides SEO', 'Comparatifs', 'Tutoriels'],
      YouTube: ['Analyses approfondies', 'Tutoriels'],
      Paid: ['Retargeting', 'Audiences similaires'],
      Community: ['Questions/Réponses', 'Demandes de fonctionnalités'],
      Partnerships: ['Co-marketing', 'Intégrations'],
      Social: ['Annonces', 'Contenu généré par les utilisateurs']
    },
    contentPillarsGeneric: ['Contenu général'],
    channelAssets: {
      TikTok: { postBrief: 'Vidéo verticale 15s : montrer le produit en action dès la 1ère seconde, texte overlay avec le bénéfice clé.', emailSubject: null, landingTagline: null },
      YouTube: { postBrief: 'Format tutoriel 3-5min : présenter un cas d\'usage concret de bout en bout.', emailSubject: null, landingTagline: null },
      LinkedIn: { postBrief: 'Post texte + visuel : partager un résultat chiffré obtenu par un client ou l\'équipe.', emailSubject: 'Comment [segment] gagne du temps avec [produit]', landingTagline: 'La solution que [segment] attendait' },
      Content: { postBrief: 'Article de fond (1200+ mots) répondant à une question précise de la cible.', emailSubject: 'Le guide complet pour [objectif]', landingTagline: 'Tout ce qu\'il faut savoir pour [objectif]' },
      Paid: { postBrief: 'Visuel + accroche orientée bénéfice, avec un CTA unique et clair.', emailSubject: null, landingTagline: 'Essayez gratuitement, sans carte bancaire' },
      Community: { postBrief: 'Question ouverte pour lancer une discussion sur un pain point courant.', emailSubject: 'Rejoignez la communauté [produit]', landingTagline: null },
      Partnerships: { postBrief: 'Proposition de co-marketing : offre croisée avec un partenaire complémentaire.', emailSubject: 'Proposition de partenariat avec [produit]', landingTagline: null },
      Social: { postBrief: 'Annonce courte et visuelle, ton direct, appel à partager.', emailSubject: null, landingTagline: null }
    },
    channelAssetsGeneric: { postBrief: 'Contenu adapté au canal, orienté bénéfice utilisateur.', emailSubject: 'Découvrez [produit]', landingTagline: 'Simplifiez [objectif] avec [produit]' },
    kpiFocus: {
      retain: {
        primary: { name: 'DAU/MAU', formula: 'utilisateurs_actifs_jour / utilisateurs_actifs_mois', unit: '%' },
        secondary: { name: 'Taux de désabonnement', formula: '(utilisateurs_perdus / utilisateurs_totaux) × 100', unit: '%' },
        tertiary: { name: 'Score d\'engagement', formula: 'pondération(sessions, actions, durée)', unit: 'pts' }
      },
      monetize: {
        primary: { name: 'ARR', formula: 'Σ(valeur_abonnement × 12)', unit: '€' },
        secondary: { name: 'ARPU', formula: 'revenu_total / utilisateurs_totaux', unit: '€' },
        tertiary: { name: 'Taux d\'expansion', formula: 'revenu_upsell / revenu_base', unit: '%' }
      },
      acquire: {
        primary: { name: 'Total des inscriptions', formula: 'Σ(événements_inscription)', unit: '#' },
        secondary: { name: 'CAC', formula: 'budget_total / total_inscriptions', unit: '€/inscription' },
        tertiary: { name: 'Taux de conversion', formula: '(inscriptions / visiteurs) × 100', unit: '%' }
      }
    },
    successMetrics: {
      arr: { name: 'ARR', formula: 'Σ(valeur_abonnement × 12)', unit: '€' },
      mrr: { name: 'MRR', formula: 'Σ(abonnements_mensuels)', unit: '€' },
      retention: { name: 'Taux de rétention', formula: '(utilisateurs_restants / cohorte) × 100', unit: '%' },
      community: { name: 'Taille de la communauté', formula: 'membres_actifs', unit: 'membres' },
      nps: { name: 'NPS', formula: '% promoteurs − % détracteurs', unit: 'pts' },
      ltv: { name: 'LTV', formula: 'ARPU × durée_de_vie_moyenne', unit: '€' },
      conversion: { name: 'Taux de conversion', formula: '(conversions / visiteurs) × 100', unit: '%' },
      activeUsers: { name: 'DAU/MAU', formula: 'actifs_jour / actifs_mois', unit: '%' }
    },
    contentPiecesKpi: 'Contenus publiés',
    contentPiecesFormula: 'articles + vidéos publiés',
    persona: {
      titles: {
        freelancers: 'Consultant indépendant',
        smb: 'Responsable des opérations, PME',
        enterprise: 'Chef de produit, Scale-up',
        niche: 'Expert spécialisé'
      },
      ageRanges: {
        freelancers: '28-40 ans',
        smb: '32-45 ans',
        enterprise: '30-42 ans',
        niche: '35-50 ans'
      },
      contexts: {
        freelancers: 'Jongle entre plusieurs clients et outils : chaque minute gagnée compte directement sur sa marge.',
        smb: 'Porte plusieurs casquettes dans une petite équipe et doit justifier chaque dépense en interne.',
        enterprise: 'Doit faire adopter l\'outil par plusieurs équipes ; la décision passe par un cycle d\'achat plus long.',
        niche: 'Expert reconnu dans son domaine, exigeant sur la précision et la crédibilité des outils qu\'il utilise.'
      },
      preferredChannels: {
        freelancers: 'LinkedIn et newsletters spécialisées',
        smb: 'LinkedIn et recommandations entre pairs',
        enterprise: 'Communautés Slack et conférences métier',
        niche: 'Forums spécialisés et bouche-à-oreille'
      },
      painPoints: {
        acquire: ['Peine à trouver des prospects qualifiés', 'La prospection manuelle fait perdre du temps'],
        retain: ['Les utilisateurs abandonnent après le premier usage', 'Faible engagement quotidien'],
        monetize: ['Difficile de justifier le prix', 'Faible conversion vers les offres payantes']
      },
      goals: {
        acquire: ['Faire croître les inscriptions de façon prévisible', 'Réduire le coût d\'acquisition'],
        retain: ['Créer une habitude quotidienne durable', 'Réduire le taux d\'attrition'],
        monetize: ['Augmenter le revenu par utilisateur', 'Convertir les utilisateurs gratuits en payants']
      },
      quotes: {
        acquire: 'Je passe plus de temps à chercher des clients qu\'à faire le travail que j\'aime.',
        retain: 'J\'ai essayé plein d\'outils, je les abandonne tous au bout de deux semaines.',
        monetize: 'Je sais que ça vaut le coup, mais j\'ai du mal à justifier le prix en interne.'
      },
      buyingTriggers: {
        acquire: 'Voit un concurrent ou un pair obtenir des résultats visibles avec un outil similaire.',
        retain: 'Vient de perdre un client ou un utilisateur clé faute de suivi.',
        monetize: 'Doit présenter un budget ou justifier un ROI lors d\'une revue interne prochaine.'
      }
    },
    pdf: {
      pitchless: '',
      roadmapLine: (sp) => `Sprint ${sp.sprintId} — ${sp.estimatedCost} € — ${sp.stories.map(s => s.title).join(', ')}`,
      channelLine: (ch) => `${ch.name} : ${ch.budget} € — ${ch.goal}`,
      kpiLine: (k) => `${k.name} : ${k.target ?? '—'} ${k.unit}`
    }
  },
  en: {
    classification: {
      awareness: 'Awareness + Validation',
      acquisition: 'Acquisition + Product-market fit',
      growth: 'Growth + Retention'
    },
    strategyNames: {
      enterprise: 'Enterprise play',
      viral: 'Viral growth strategy',
      balanced: 'Balanced',
      content: 'Content-driven',
      sector_ecommerce: 'E-commerce strategy',
      sector_saas: 'B2B SaaS strategy',
      sector_marketplace: 'Marketplace strategy',
      sector_mobile: 'Mobile app strategy',
      sector_fintech: 'Fintech strategy',
      sector_healthtech: 'HealthTech strategy',
      sector_devtools: 'Dev tools strategy',
      sector_ai: 'AI / ML strategy',
      sector_media: 'Content / media strategy',
      sector_edtech: 'EdTech strategy'
    },
    sectorKpi: {
      ecommerce: { name: 'Average Order Value (AOV)', formula: 'revenue / number_of_orders', unit: '€' },
      saas: { name: 'MRR', formula: 'Σ(monthly_subscriptions)', unit: '€' },
      marketplace: { name: 'GMV', formula: 'Σ(transaction_value)', unit: '€' },
      mobile: { name: 'D7 retention', formula: 'active_users_d7 / cohort_installs', unit: '%' },
      fintech: { name: 'KYC completion rate', formula: 'kyc_completed / kyc_started', unit: '%' },
      healthtech: { name: 'Clinical adoption rate', formula: 'active_professionals / registered_professionals', unit: '%' },
      devtools: { name: 'SDK installs', formula: 'Σ(package_installs)', unit: '#' },
      ai: { name: 'Model adoption rate', formula: 'accepted_requests / generated_requests', unit: '%' },
      media: { name: 'Average session time', formula: 'total_session_duration / number_of_sessions', unit: 'min' },
      edtech: { name: 'Course completion rate', formula: 'courses_completed / courses_started', unit: '%' }
    },
    stories: {
      onboarding: 'Finalize onboarding flow',
      positioning: 'Create brand positioning doc',
      landing: 'Build landing page mockups',
      stagingDeploy: 'Deploy MVP to staging',
      teaser: 'Film launch teaser videos',
      analytics: 'Set up analytics tracking',
      publicBeta: 'Launch public beta',
      paidCampaign: 'Run paid acquisition campaign',
      community: 'Set up community channel',
      qa: 'QA regression pass',
      thoughtLeadership: 'Publish thought-leadership content',
      feedback: 'Iterate on user feedback'
    },
    storyDescriptions: {
      onboarding: 'Guide new users to their first success moment in the product.',
      positioning: 'Clarify the message and differentiation before any public communication.',
      landing: 'Design the page that will convert first-time visitors into signups.',
      stagingDeploy: 'Make the product testable in an environment close to production.',
      teaser: 'Create a video that builds anticipation ahead of launch.',
      analytics: 'Instrument the product to measure real usage from day one.',
      publicBeta: 'Open access to a first group of real users.',
      paidCampaign: 'Test paid acquisition on the channel identified as the priority.',
      community: 'Create a gathering point for the first engaged users.',
      qa: 'Lock down stability before wider exposure.',
      thoughtLeadership: 'Build brand credibility on its area of expertise.',
      feedback: 'Turn early user feedback into concrete product improvements.'
    },
    storyAcceptance: {
      onboarding: ['User reaches the first key action without help', 'Fewer than 3 steps before perceived value'],
      positioning: ['A positioning statement validated by the team', 'The doc clearly differentiates from 2-3 main competitors'],
      landing: ['A primary CTA is visible without scrolling', 'The core benefit is legible in under 5 seconds'],
      stagingDeploy: ['The environment is accessible to the team', 'The core flow works end to end'],
      teaser: ['15 to 30 seconds long', 'Product and benefit are identifiable in one viewing'],
      analytics: ['Key user journey events are tracked', 'A basic dashboard is available to the team'],
      publicBeta: ['A user feedback channel is in place', 'Signups are capped and tracked'],
      paidCampaign: ['Conversion tracking is in place before launch', 'A daily budget cap is defined'],
      community: ['The channel is publicly accessible', 'A welcome message explains the rules'],
      qa: ['The critical flow is manually tested', 'No known blocking bug is open'],
      thoughtLeadership: ['Content is published on at least one owned channel', 'The topic ties directly to the value proposition'],
      feedback: ['At least 3 pieces of user feedback are synthesized', 'One product action is prioritized from that feedback']
    },
    assignees: {
      Dev: 'Dev',
      Marketing: 'Marketing',
      Design: 'Design',
      Product: 'Product'
    },
    riskLabels: {
      notready: { risk: 'Product not fully ready', mitigation: 'Add QA buffer sprint before launch' },
      pmf: { risk: 'Market fit unclear', mitigation: 'Validate with 10 beta users before scaling spend' },
      budget: { risk: 'Budget limits reach', mitigation: 'Prioritize highest-ROI channel first' },
      regulatory: { risk: 'Regulatory or compliance constraints', mitigation: 'Scope legal requirements early and plan a compliance review before launch' },
      techdebt: { risk: 'Technical debt may slow iterations', mitigation: 'Reserve ~20% of each sprint capacity for refactoring' },
      platform: { risk: 'Heavy dependency on a third-party platform', mitigation: 'Plan a fallback and isolate integrations behind an abstraction layer' },
      timing: { risk: 'Uncertain market timing', mitigation: 'Ship an MVP quickly to test traction before investing further' },
      hiring: { risk: 'Key roles not yet hired', mitigation: 'Prioritize stories the current team can deliver and outsource the rest' }
    },
    channelUnits: {
      TikTok: 'k views',
      YouTube: 'subscribers',
      LinkedIn: 'leads',
      Content: 'articles',
      Paid: 'conversions',
      Community: 'members',
      Partnerships: 'partners',
      Social: 'followers'
    },
    channelGoalGeneric: 'Growth via',
    cadence: '3x/week',
    contentPillars: {
      TikTok: ['Product demos', 'Behind the scenes', 'User stories'],
      LinkedIn: ['Thought leadership', 'Case studies', 'Product updates'],
      Content: ['SEO guides', 'Comparisons', 'Tutorials'],
      YouTube: ['Deep dives', 'Tutorials'],
      Paid: ['Retargeting', 'Lookalike audiences'],
      Community: ['Q&A', 'Feature requests'],
      Partnerships: ['Co-marketing', 'Integrations'],
      Social: ['Announcements', 'UGC']
    },
    contentPillarsGeneric: ['General content'],
    channelAssets: {
      TikTok: { postBrief: '15s vertical video: show the product in action from second 1, overlay text with the key benefit.', emailSubject: null, landingTagline: null },
      YouTube: { postBrief: '3-5min tutorial format: walk through one concrete use case end to end.', emailSubject: null, landingTagline: null },
      LinkedIn: { postBrief: 'Text + visual post: share a quantified result from a customer or the team.', emailSubject: 'How [segment] saves time with [product]', landingTagline: 'The solution [segment] has been waiting for' },
      Content: { postBrief: 'In-depth article (1200+ words) answering a specific question from the target audience.', emailSubject: 'The complete guide to [goal]', landingTagline: 'Everything you need to know to [goal]' },
      Paid: { postBrief: 'Benefit-driven visual + hook, with one clear CTA.', emailSubject: null, landingTagline: 'Try it free, no credit card required' },
      Community: { postBrief: 'Open question to spark a discussion around a common pain point.', emailSubject: 'Join the [product] community', landingTagline: null },
      Partnerships: { postBrief: 'Co-marketing proposal: cross offer with a complementary partner.', emailSubject: 'Partnership proposal with [product]', landingTagline: null },
      Social: { postBrief: 'Short, visual announcement, direct tone, call to share.', emailSubject: null, landingTagline: null }
    },
    channelAssetsGeneric: { postBrief: 'Channel-adapted content, focused on user benefit.', emailSubject: 'Discover [product]', landingTagline: 'Simplify [goal] with [product]' },
    kpiFocus: {
      retain: {
        primary: { name: 'DAU/MAU', formula: 'active_users_daily / active_users_monthly', unit: '%' },
        secondary: { name: 'Churn rate', formula: '(churned_users / total_users) × 100', unit: '%' },
        tertiary: { name: 'Engagement score', formula: 'weighted(sessions, actions, duration)', unit: 'pts' }
      },
      monetize: {
        primary: { name: 'ARR', formula: 'Σ(subscription_value × 12)', unit: '€' },
        secondary: { name: 'ARPU', formula: 'total_revenue / total_users', unit: '€' },
        tertiary: { name: 'Expansion rate', formula: 'upsell_revenue / base_revenue', unit: '%' }
      },
      acquire: {
        primary: { name: 'Total Signups', formula: 'Σ(signup_events)', unit: '#' },
        secondary: { name: 'CAC', formula: 'total_budget / total_signups', unit: '€/signup' },
        tertiary: { name: 'Conversion Rate', formula: '(signups / visitors) × 100', unit: '%' }
      }
    },
    successMetrics: {
      arr: { name: 'ARR', formula: 'Σ(subscription_value × 12)', unit: '€' },
      mrr: { name: 'MRR', formula: 'Σ(monthly_subscriptions)', unit: '€' },
      retention: { name: 'Retention rate', formula: '(retained_users / cohort) × 100', unit: '%' },
      community: { name: 'Community size', formula: 'active_members', unit: 'members' },
      nps: { name: 'NPS', formula: '% promoters − % detractors', unit: 'pts' },
      ltv: { name: 'LTV', formula: 'ARPU × average_lifetime', unit: '€' },
      conversion: { name: 'Conversion rate', formula: '(conversions / visitors) × 100', unit: '%' },
      activeUsers: { name: 'DAU/MAU', formula: 'daily_active / monthly_active', unit: '%' }
    },
    contentPiecesKpi: 'Content Pieces',
    contentPiecesFormula: 'published articles + videos',
    persona: {
      titles: {
        freelancers: 'Independent Consultant',
        smb: 'Operations Manager, SMB',
        enterprise: 'Product Manager, Scale-up',
        niche: 'Specialist Practitioner'
      },
      ageRanges: {
        freelancers: '28-40 y/o',
        smb: '32-45 y/o',
        enterprise: '30-42 y/o',
        niche: '35-50 y/o'
      },
      contexts: {
        freelancers: 'Juggles several clients and tools at once — every minute saved shows up directly in their margin.',
        smb: 'Wears several hats on a small team and has to justify every expense internally.',
        enterprise: 'Needs several teams to adopt the tool; the decision runs through a longer buying cycle.',
        niche: 'A recognized expert in their field, demanding on the precision and credibility of the tools they use.'
      },
      preferredChannels: {
        freelancers: 'LinkedIn and niche newsletters',
        smb: 'LinkedIn and peer recommendations',
        enterprise: 'Slack communities and industry conferences',
        niche: 'Specialist forums and word of mouth'
      },
      painPoints: {
        acquire: ['Struggles to find qualified leads', 'Manual outreach wastes time'],
        retain: ['Users churn after first use', 'Low daily engagement'],
        monetize: ['Hard to justify pricing', 'Low conversion to paid plans']
      },
      goals: {
        acquire: ['Grow signups predictably', 'Lower cost per acquisition'],
        retain: ['Build a sticky daily habit', 'Reduce churn'],
        monetize: ['Increase revenue per user', 'Convert free users to paid']
      },
      quotes: {
        acquire: 'I spend more time chasing leads than doing the work I actually enjoy.',
        retain: 'I\'ve tried plenty of tools — I abandon all of them within two weeks.',
        monetize: 'I know it\'s worth it, but I struggle to justify the price internally.'
      },
      buyingTriggers: {
        acquire: 'Sees a competitor or peer getting visible results with a similar tool.',
        retain: 'Just lost a key customer or user due to a lack of follow-up.',
        monetize: 'Has to present a budget or justify ROI at an upcoming internal review.'
      }
    },
    pdf: {
      pitchless: '',
      roadmapLine: (sp) => `Sprint ${sp.sprintId} — ${sp.estimatedCost} € — ${sp.stories.map(s => s.title).join(', ')}`,
      channelLine: (ch) => `${ch.name}: ${ch.budget} € — ${ch.goal}`,
      kpiLine: (k) => `${k.name}: ${k.target ?? '—'} ${k.unit}`
    }
  }
}

export function c(lang) {
  return content[lang] || content.fr
}
