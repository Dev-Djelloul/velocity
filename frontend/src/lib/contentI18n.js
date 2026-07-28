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
      content: 'Axée contenu'
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
    assignees: {
      Dev: 'Dev',
      Marketing: 'Marketing',
      Design: 'Design',
      Product: 'Produit'
    },
    riskLabels: {
      notready: { risk: 'Produit pas encore totalement prêt', mitigation: 'Ajouter un sprint tampon de QA avant le lancement' },
      pmf: { risk: 'Adéquation produit-marché incertaine', mitigation: 'Valider avec 10 utilisateurs béta avant d\'augmenter les dépenses' },
      budget: { risk: 'Limite de budget atteinte', mitigation: 'Prioriser le canal au meilleur ROI' }
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
    contentPiecesKpi: 'Contenus publiés',
    contentPiecesFormula: 'articles + vidéos publiés',
    persona: {
      titles: {
        freelancers: 'Consultant indépendant',
        smb: 'Responsable des opérations, PME',
        enterprise: 'Chef de produit, Scale-up',
        niche: 'Expert spécialisé'
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
      content: 'Content-driven'
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
    assignees: {
      Dev: 'Dev',
      Marketing: 'Marketing',
      Design: 'Design',
      Product: 'Product'
    },
    riskLabels: {
      notready: { risk: 'Product not fully ready', mitigation: 'Add QA buffer sprint before launch' },
      pmf: { risk: 'Market fit unclear', mitigation: 'Validate with 10 beta users before scaling spend' },
      budget: { risk: 'Budget limits reach', mitigation: 'Prioritize highest-ROI channel first' }
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
    contentPiecesKpi: 'Content Pieces',
    contentPiecesFormula: 'published articles + videos',
    persona: {
      titles: {
        freelancers: 'Independent Consultant',
        smb: 'Operations Manager, SMB',
        enterprise: 'Product Manager, Scale-up',
        niche: 'Specialist Practitioner'
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
