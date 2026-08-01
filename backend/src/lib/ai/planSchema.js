// Schéma de sortie que l'IA doit produire — reproduit exactement la forme générée
// par le moteur à règles (engine.js + generator/*.js) pour que PlanViewer, les exports
// et le stockage n'aient rien à connaître de l'origine du plan (IA ou règles).

const STORY_SCHEMA = {
  type: 'object',
  properties: {
    id: { type: 'string', description: 'Identifiant court, ex: US-001' },
    title: { type: 'string' },
    assignee: { type: 'string', description: 'Rôle responsable, ex: Dev, Marketing, Design, Product' },
    effort: { type: 'integer', description: 'Points d\'effort (story points)' },
    cost: { type: 'integer', description: 'Coût estimé en euros' },
    dependsOn: { type: 'array', items: { type: 'string' }, description: 'IDs des stories dont celle-ci dépend' }
  },
  required: ['id', 'title', 'assignee', 'effort', 'cost', 'dependsOn']
}

const SPRINT_SCHEMA = {
  type: 'object',
  properties: {
    sprintId: { type: 'integer' },
    duration: { type: 'string', description: 'ex: "2 weeks"' },
    stories: { type: 'array', items: STORY_SCHEMA },
    estimatedCost: { type: 'integer' },
    risks: { type: 'array', items: { type: 'string' } }
  },
  required: ['sprintId', 'duration', 'stories', 'estimatedCost', 'risks']
}

const CHANNEL_SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string', description: 'ex: TikTok, LinkedIn, Content, Paid' },
    budget: { type: 'integer', description: 'Montant en euros' },
    pct: { type: 'integer', description: 'Pourcentage du budget total (0-100)' },
    goal: { type: 'string', description: 'Objectif chiffré atteignable avec ce budget' },
    cadence: { type: 'string' },
    contentPillars: { type: 'array', items: { type: 'string' } }
  },
  required: ['name', 'budget', 'pct', 'goal', 'cadence', 'contentPillars']
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
    baseline: { type: 'number' }
  },
  required: ['name', 'formula', 'unit', 'target', 'baseline']
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
  description: 'Prévisionnel financier simplifié, chiffré à partir du budget et du modèle économique déclarés',
  properties: {
    monthlyBurn: { type: 'integer', description: 'Dépense mensuelle moyenne en euros sur la durée du plan' },
    runwayMonths: { type: 'number', description: 'Nombre de mois que couvre le budget déclaré à ce rythme de dépense' },
    assumedArpu: { type: 'integer', description: 'Revenu mensuel moyen par utilisateur/client supposé, en euros, réaliste pour ce type de produit et ce marché' },
    breakEvenUsers: { type: 'integer', description: 'Nombre de clients payants nécessaires pour couvrir le burn mensuel, au prix (ARPU) supposé' },
    breakEvenMonthlyRevenue: { type: 'integer', description: 'Revenu mensuel correspondant au seuil de rentabilité, en euros' },
    costBreakdown: { type: 'array', items: COST_LINE_SCHEMA, description: 'Répartition du budget total par poste, les montants doivent sommer exactement au budget total' }
  },
  required: ['monthlyBurn', 'runwayMonths', 'assumedArpu', 'breakEvenUsers', 'breakEvenMonthlyRevenue', 'costBreakdown']
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
        description: 'Persona utilisateur cible',
        properties: {
          name: { type: 'string', description: 'Prénom réaliste' },
          title: { type: 'string', description: 'Titre/rôle du persona' },
          painPoints: { type: 'array', items: { type: 'string' }, description: '2-3 points de douleur' },
          goals: { type: 'array', items: { type: 'string' }, description: '2-3 objectifs' }
        },
        required: ['name', 'title', 'painPoints', 'goals']
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
