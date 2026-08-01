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

export const PLAN_GENERATION_TOOL = {
  name: 'generate_launch_plan',
  description: 'Génère la partie calculée d\'un plan de lancement produit (persona, classification, roadmap agile, stratégie marketing, KPIs) à partir des réponses au questionnaire fournies dans le prompt.',
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
      }
    },
    required: ['persona', 'classification', 'roadmap', 'marketing', 'kpis']
  }
}
