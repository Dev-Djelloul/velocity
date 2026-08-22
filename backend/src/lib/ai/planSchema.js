// Schéma de sortie que l'IA doit produire — reproduit exactement la forme générée
// par le moteur à règles (engine.js + generator/*.js) pour que PlanViewer, les exports
// et le stockage n'aient rien à connaître de l'origine du plan (IA ou règles).

const STORY_SCHEMA = {
  type: 'object',
  properties: {
    id: { type: 'string', description: 'Identifiant court, ex: US-001' },
    title: { type: 'string' },
    description: { type: 'string', description: 'Une phrase expliquant le quoi et le pourquoi de cette story, spécifique au produit décrit' },
    acceptanceCriteria: { type: 'array', items: { type: 'string' }, description: '2 critères concrets et vérifiables pour considérer la story terminée' },
    assignee: { type: 'string', description: 'Rôle responsable, ex: Dev, Marketing, Design, Product' },
    effort: { type: 'integer', description: 'Points d\'effort (story points)' },
    cost: { type: 'integer', description: 'Coût estimé en euros — la somme des coûts de toutes les stories de la roadmap doit rester cohérente avec le budget total du lancement (moins la part déjà réservée au budget marketing), pas une estimation déconnectée du budget déclaré' },
    dependsOn: { type: 'array', items: { type: 'string' }, description: 'IDs des stories dont celle-ci dépend' }
  },
  required: ['id', 'title', 'description', 'acceptanceCriteria', 'assignee', 'effort', 'cost', 'dependsOn']
}

const RISK_SCHEMA = {
  type: 'object',
  properties: {
    risk: { type: 'string', description: 'Description courte du risque spécifique à ce sprint' },
    mitigation: { type: 'string', description: 'Action concrète pour réduire ce risque' }
  },
  required: ['risk', 'mitigation']
}

const SPRINT_SCHEMA = {
  type: 'object',
  properties: {
    sprintId: { type: 'integer' },
    duration: { type: 'string', description: 'ex: "2 weeks"' },
    stories: { type: 'array', items: STORY_SCHEMA },
    estimatedCost: { type: 'integer' },
    risks: { type: 'array', items: RISK_SCHEMA, description: '0 à 2 risques propres à ce sprint, avec leur mitigation — laisser vide si aucun risque notable' }
  },
  required: ['sprintId', 'duration', 'stories', 'estimatedCost', 'risks']
}

const CHANNEL_ASSETS_SCHEMA = {
  type: 'object',
  description: 'Assets concrets prêts à l\'emploi pour ce canal, spécifiques au produit décrit (pas de placeholders génériques type [produit])',
  properties: {
    postBrief: { type: 'string', description: 'Brief d\'un post concret pour ce canal : format, accroche, angle' },
    emailSubject: { type: ['string', 'null'], description: 'Objet d\'email si pertinent pour ce canal, sinon null' },
    landingTagline: { type: ['string', 'null'], description: 'Accroche de landing page si pertinent pour ce canal, sinon null' }
  },
  required: ['postBrief', 'emailSubject', 'landingTagline']
}

const CHANNEL_SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string', description: 'ex: TikTok, LinkedIn, Content, Paid' },
    budget: { type: 'integer', description: 'Montant en euros' },
    pct: { type: 'integer', description: 'Pourcentage du budget total (0-100)' },
    goal: { type: 'string', description: 'Objectif chiffré atteignable avec ce budget' },
    cadence: { type: 'string' },
    contentPillars: { type: 'array', items: { type: 'string' } },
    assets: CHANNEL_ASSETS_SCHEMA
  },
  required: ['name', 'budget', 'pct', 'goal', 'cadence', 'contentPillars', 'assets']
}

const CALENDAR_ITEM_SCHEMA = {
  type: 'object',
  properties: {
    week: { type: 'integer' },
    channel: { type: 'string' },
    content: { type: 'string' },
    status: { type: 'string' }
  },
  required: ['week', 'channel', 'content', 'status']
}

const KPI_SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    formula: { type: 'string' },
    unit: { type: 'string' },
    target: { type: ['number', 'null'] },
    baseline: { type: 'number' },
    timeframe: { type: 'string', description: 'Fréquence de suivi recommandée, ex: "Hebdomadaire", "Mensuel"' }
  },
  required: ['name', 'formula', 'unit', 'target', 'baseline', 'timeframe']
}

const COST_LINE_SCHEMA = {
  type: 'object',
  properties: {
    category: { type: 'string', description: 'ex: Développement, Marketing, Design, Opérations' },
    amount: { type: 'integer', description: 'Montant en euros' },
    pct: { type: 'integer', description: 'Pourcentage du budget total (0-100)' }
  },
  required: ['category', 'amount', 'pct']
}

const FINANCIALS_SCHEMA = {
  type: 'object',
  description: 'Prévisionnel financier simplifié, chiffré à partir du BUDGET TOTAL du lancement déclaré (tous postes confondus — voir "budget total du lancement" dans le prompt), pas du budget marketing seul, et du modèle économique déclaré',
  properties: {
    monthlyBurn: { type: 'integer', description: 'Dépense mensuelle moyenne en euros sur la durée du plan, calculée à partir du budget total' },
    runwayMonths: { type: 'number', description: 'Nombre de mois que couvre le budget total déclaré à ce rythme de dépense' },
    assumedArpu: { type: 'integer', description: 'Revenu mensuel moyen par utilisateur/client supposé, en euros, réaliste pour ce type de produit et ce marché' },
    arpuRationale: { type: 'string', description: 'Une phrase justifiant ce montant d\'ARPU : sur quoi il se base (modèle économique, comparables du secteur, prix perçu du marché)' },
    breakEvenUsers: { type: 'integer', description: 'Nombre de clients payants nécessaires pour couvrir le burn mensuel, au prix (ARPU) supposé' },
    breakEvenMonthlyRevenue: { type: 'integer', description: 'Revenu mensuel correspondant au seuil de rentabilité, en euros' },
    costBreakdown: { type: 'array', items: COST_LINE_SCHEMA, description: 'Répartition du BUDGET TOTAL du lancement par poste (ex: Développement, Marketing, Opérations) — les montants doivent sommer exactement au budget total déclaré, pas au budget marketing seul ; la ligne "Marketing" doit rester cohérente avec le budget marketing déclaré séparément et avec marketing.totalBudget' }
  },
  required: ['monthlyBurn', 'runwayMonths', 'assumedArpu', 'arpuRationale', 'breakEvenUsers', 'breakEvenMonthlyRevenue', 'costBreakdown']
}

const STRATEGY_TOOLKIT_SCHEMA = {
  type: 'object',
  description: 'Boîte à outils stratégique : analyse SWOT et positionnement concurrentiel',
  properties: {
    swot: {
      type: 'object',
      properties: {
        strengths: { type: 'array', items: { type: 'string' }, description: '2-3 forces spécifiques au produit décrit' },
        weaknesses: { type: 'array', items: { type: 'string' }, description: '2-3 faiblesses réalistes, pas génériques' },
        opportunities: { type: 'array', items: { type: 'string' }, description: '2-3 opportunités liées au marché déclaré' },
        threats: { type: 'array', items: { type: 'string' }, description: '2-3 menaces liées à la concurrence déclarée' }
      },
      required: ['strengths', 'weaknesses', 'opportunities', 'threats']
    },
    competitivePositioning: { type: 'string', description: '2-3 phrases sur comment se positionner face au niveau de concurrence déclaré' }
  },
  required: ['swot', 'competitivePositioning']
}

export const PLAN_GENERATION_TOOL = {
  name: 'generate_launch_plan',
  description: 'Génère la partie calculée d\'un plan de lancement produit (persona, classification, roadmap agile, stratégie marketing, KPIs, prévisionnel financier, boîte à outils stratégique, résumé exécutif) à partir des réponses au questionnaire fournies dans le prompt.',
  input_schema: {
    type: 'object',
    properties: {
      persona: {
        type: 'object',
        description: 'Persona utilisateur cible, incarné et actionnable — pas un profil générique',
        properties: {
          name: { type: 'string', description: 'Prénom réaliste' },
          gender: { type: 'string', enum: ['male', 'female'], description: 'Genre du persona, cohérent avec le prénom choisi — sert à illustrer le persona avec une photo adaptée' },
          title: { type: 'string', description: 'Titre/rôle du persona' },
          ageRange: { type: 'string', description: 'Tranche d\'âge plausible, ex: "30-42 ans"' },
          context: { type: 'string', description: 'Une phrase de contexte situationnel : sa journée type, ses contraintes, ce qui pèse sur ses décisions' },
          painPoints: { type: 'array', items: { type: 'string' }, description: '2-3 points de douleur spécifiques, pas génériques' },
          goals: { type: 'array', items: { type: 'string' }, description: '2-3 objectifs concrets' },
          quote: { type: 'string', description: 'Une citation courte à la première personne qui capture sa frustration principale, dans son propre langage' },
          preferredChannel: { type: 'string', description: 'Où il/elle passe du temps et comment le/la toucher efficacement' },
          buyingTrigger: { type: 'string', description: 'L\'événement ou déclic précis qui le/la pousse à chercher activement une solution' }
        },
        required: ['name', 'gender', 'title', 'ageRange', 'context', 'painPoints', 'goals', 'quote', 'preferredChannel', 'buyingTrigger']
      },
      classification: {
        type: 'string',
        description: 'Étiquette courte de classification du stade de lancement, ex: "Sensibilisation + Validation"'
      },
      roadmap: {
        type: 'object',
        properties: {
          sprints: { type: 'array', items: SPRINT_SCHEMA },
          totalDuration: { type: 'integer', description: 'Durée totale en semaines' },
          estimatedCost: { type: 'integer', description: 'Coût total en euros' }
        },
        required: ['sprints', 'totalDuration', 'estimatedCost']
      },
      marketing: {
        type: 'object',
        properties: {
          strategy: { type: 'string', description: 'Nom de la stratégie retenue' },
          channels: { type: 'array', items: CHANNEL_SCHEMA },
          contentCalendar: { type: 'array', items: CALENDAR_ITEM_SCHEMA },
          totalBudget: { type: 'integer' }
        },
        required: ['strategy', 'channels', 'contentCalendar', 'totalBudget']
      },
      kpis: {
        type: 'array',
        items: KPI_SCHEMA,
        description: '4 KPIs : le principal, le secondaire, le tertiaire lié à la priorité déclarée, et un KPI de production de contenu'
      },
      financials: FINANCIALS_SCHEMA,
      strategyToolkit: STRATEGY_TOOLKIT_SCHEMA,
      executiveSummary: {
        type: 'string',
        description: '3 à 5 phrases résumant le plan pour quelqu\'un qui n\'a pas le temps de tout lire : quoi, pour qui, comment, avec quel objectif chiffré'
      }
    },
    required: ['persona', 'classification', 'roadmap', 'marketing', 'kpis', 'financials', 'strategyToolkit', 'executiveSummary']
  }
}
