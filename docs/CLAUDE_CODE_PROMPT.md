# Product Launch Planner - Prompt pour Claude Code

## 🎯 Mission
Créer un **générateur intelligent de plan de lancement SaaS** bilingue (FR/EN) avec questionnaire interactif, logique d'adaptation avancée, roadmap agile, plan marketing, KPI dashboard, et exports (PDF + JSON).

**Status** : À partir d'une structure scaffold
**Tech Stack** : React/Vite (frontend) + Cloudflare Workers (backend)
**Deployment** : Digital Blue Skye (portfolio)

---

## 📋 Architecture du Projet

```
product-launch-planner/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Questionnaire.jsx          # Multi-step form (19 critères)
│   │   │   ├── PlanViewer.jsx              # Affiche roadmap + marketing + KPI
│   │   │   ├── InteractiveControls.jsx     # Budget slider, toggle channels, refinement
│   │   │   ├── RoadmapCard.jsx             # Sprint visualization
│   │   │   ├── MarketingCard.jsx           # Channels + calendar
│   │   │   ├── KPIDashboard.jsx            # Metrics cards
│   │   │   └── ExportModal.jsx             # PDF + JSON export
│   │   ├── lib/
│   │   │   ├── engine.js                   # Logique d'adaptation (classification, channels, KPIs)
│   │   │   ├── costMatrix.js               # Matrice de coûts par type de tâche
│   │   │   ├── personaGenerator.js         # Génère persona synthétisée
│   │   │   ├── pdfExport.js                # PDF generation (PDFKit)
│   │   │   └── i18n.js                     # FR/EN translations
│   │   ├── App.jsx
│   │   └── index.css
│   ├── public/
│   ├── vite.config.js
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── workers/
│   │   │   ├── generate.js                 # Endpoint: POST /generate (lancé par frontend)
│   │   │   └── export.js                   # Endpoint: POST /export (PDF/JSON)
│   │   ├── lib/
│   │   │   ├── generator/
│   │   │   │   ├── roadmapGenerator.js
│   │   │   │   ├── marketingStrategyGenerator.js
│   │   │   │   ├── kpiCalculator.js
│   │   │   │   └── riskRegister.js
│   │   │   └── utils.js
│   │   └── wrangler.toml                   # Cloudflare config
│   └── package.json
│
└── docs/
    ├── SPEC.md                             # Specification complète (déjà créée)
    ├── API_SCHEMA.md                       # POST /generate input/output schemas
    └── DEPLOYMENT.md                       # Instructions Netlify + Cloudflare Workers
```

---

## 🔧 Étapes de Développement

### Phase 1 : Frontend Scaffold + Questionnaire
**Fichiers clés** : Questionnaire.jsx, i18n.js

1. **Créer la structure Vite React**
2. **Implémenter le questionnaire** :
   - Multi-step form (5 sections)
   - Validation des inputs
   - Sauvegarde locale (localStorage)
   - Bilingue FR/EN
3. **Intégration traductions** : i18n.js avec dictionnaire FR/EN complet

### Phase 2 : Engine + Logique d'Adaptation
**Fichiers clés** : engine.js, costMatrix.js, personaGenerator.js

1. **Implémenter engine.js** :
   - Classification du produit (pre-launch / MVP / growing)
   - Sélection des canaux marketing
   - Budget allocation (TikTok 60%, LinkedIn 30%, etc.)
   - Calcul de sprints et capacité
2. **Matrice de coûts** (costMatrix.js) :
   ```javascript
   const costMatrix = {
     product: { design: 300, frontend: 250, backend: 400, qa: 150 },
     marketing: { content: 100, video: 500, design: 200, paid_ad: 1000 },
     ops: { analytics: 150, community: 100 }
   }
   ```
3. **Générateur de persona** (personaGenerator.js) :
   - Input : Target User, segment, category
   - Output : Persona JSON (nom, âge, job title, pain points, goals)

### Phase 3 : Générateurs de Plan (Backend)
**Fichiers clés** : roadmapGenerator.js, marketingStrategyGenerator.js, kpiCalculator.js

1. **Roadmap Agile** :
   - Générer sprints basé sur timeline + team size
   - Créer user stories avec dépendances
   - Estimer effort (story points)
   - Calculer coûts via costMatrix
   - Ajouter risques + mitigations
2. **Marketing Strategy** :
   - Canaux + budget par canal
   - Content calendar (week-by-week)
   - KPIs par channel
3. **KPI Dashboard** :
   - Formules (CAC, conversion rate, etc.)
   - Targets basées sur audience size + budget
   - Baseline = 0 (or personalized)

### Phase 4 : Frontend Visualization + Interaction
**Fichiers clés** : PlanViewer.jsx, RoadmapCard.jsx, MarketingCard.jsx, KPIDashboard.jsx, InteractiveControls.jsx

1. **Plan Viewer** : Afficher les 3 outputs (Roadmap + Marketing + KPI)
2. **Budget Slider** : Ajuster budget → recalcul en direct (appel backend)
3. **Channel Toggle** : On/off des canaux → redistribution budget
4. **KPI Deep-dive** : Click une métrique → voir formule + actions

### Phase 5 : Export
**Fichiers clés** : ExportModal.jsx, pdfExport.js

1. **PDF Export** : PDFKit ou pdfmake
   - Header (product name + launch date)
   - Sections : Roadmap compacte + Marketing channels + KPIs + Risk register
2. **JSON Export** : Structure complète (voir spec)
3. **GitHub Issues / Jira templates** (optionnel Phase 2)

### Phase 6 : Deployment
1. Build Vite → Netlify
2. Deploy Cloudflare Workers
3. Intégrer Cloudflare KV pour cache optionnel

---

## 🔌 API Contracts (Backend)

### POST /generate
**Input** :
```json
{
  "product": {
    "name": "AI Note Taker",
    "stage": "MVP",
    "category": "Productivity",
    "pitch": "AI that captures meetings and transforms them into actionable notes",
    "usp": "Real-time transcription + automatic summaries",
    "targetUser": "Remote teams"
  },
  "market": {
    "geography": "Global",
    "b2bVsB2c": "B2B",
    "segment": "Remote teams / Hybrid orgs",
    "audienceSize": "10k-100k",
    "competition": "Moderate"
  },
  "resources": {
    "timelineWeeks": 8,
    "budgetEur": 10000,
    "teamSize": "2-3",
    "rolesPresent": ["Product", "Marketing", "Dev"]
  },
  "priorities": {
    "focus": "Acquire users",
    "engagement": "Moderate",
    "riskKnown": "Market fit unclear",
    "successMetric": "# signups"
  },
  "language": "fr"  // or "en"
}
```

**Output** :
```json
{
  "persona": {
    "name": "Marie",
    "title": "Product Manager, Scale-up",
    "painPoints": ["Manual note-taking wastes time", "Missing action items"],
    "goals": ["Save 2h/week", "Perfect meeting follow-up"]
  },
  "strategy": "Balanced (40% TikTok, 30% LinkedIn, 20% Content, 10% Paid)",
  "roadmap": [
    {
      "sprintId": 1,
      "duration": "2 weeks",
      "stories": [
        {
          "id": "US-001",
          "title": "Setup recording infrastructure",
          "type": "backend",
          "effort": 13,
          "cost": 400,
          "dependsOn": [],
          "assignee": "Dev"
        }
      ],
      "riskRegister": [...]
    }
  ],
  "marketing": {
    "channels": [
      {
        "name": "LinkedIn",
        "budget": 3000,
        "goal": "500 leads",
        "cadence": "3x/week",
        "contentPillars": [...]
      }
    ],
    "contentCalendar": [...]
  },
  "kpis": [
    {
      "name": "Total Signups",
      "target": 500,
      "formula": "count(signup_events)",
      "baseline": 0
    }
  ]
}
```

### POST /export
**Input** :
```json
{
  "planId": "uuid-from-generate",
  "format": "pdf"  // or "json"
}
```

**Output** : Binary (PDF) or JSON

---

## 📝 Fichiers de Configuration à Créer

### 1. Frontend/package.json
```json
{
  "name": "product-launch-planner-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "pdfmake": "^0.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.4.0"
  }
}
```

### 2. Backend/wrangler.toml
```toml
name = "product-launch-planner"
main = "src/workers/generate.js"
type = "service"

[env.production]
name = "product-launch-planner-prod"
```

### 3. Frontend/.env.local
```
VITE_BACKEND_URL=https://product-launch-planner.your-domain.workers.dev
VITE_APP_ENV=development
```

---

## 🎨 Design Requirements

1. **Questionnaire** : Multi-step progressbar, clean form inputs
2. **Plan View** : 3 cards (Roadmap / Marketing / KPI) avec tabs optionnels
3. **Interaction** : Budget slider → live recalc
4. **Export** : Modal avec options (PDF, JSON, etc.)
5. **Color scheme** : Aligné avec Digital Blue Skye (bleu + accent)
6. **Responsive** : Mobile-first
7. **Branding** : Logo Yellow Blue Skye si applicable

---

## 🌍 Traductions (i18n)

**Clés principales à traduire** :
- Tous labels du questionnaire
- Noms de sprints / canaux / KPIs
- Textes de confirmation
- Messages d'erreur

Exemple structure :
```javascript
// i18n.js
export const translations = {
  fr: {
    questionnaire: {
      title: "Créez votre plan de lancement SaaS",
      productName: "Nom du produit",
      ...
    },
    outputs: {
      roadmap: "Roadmap Agile",
      marketing: "Stratégie Marketing",
      ...
    }
  },
  en: {
    questionnaire: {
      title: "Create your SaaS launch plan",
      productName: "Product name",
      ...
    },
    ...
  }
};
```

---

## ✅ Checklist de Développement

### MVP (Phase 1-3)
- [ ] Questionnaire complet (19 inputs, bilingue)
- [ ] Engine + logique d'adaptation
- [ ] Roadmap Agile (sprints + stories + dépendances)
- [ ] Marketing channels (5+ canaux, budget allocation)
- [ ] KPI Calculator (6+ métriques principales)
- [ ] JSON export

### v1.0 (Phase 4-5)
- [ ] PlanViewer UI (cards + visualization)
- [ ] Budget slider (interactive refinement)
- [ ] PDF export (professionnel)
- [ ] Channel toggles + refinement
- [ ] Error handling + validation

### Nice-to-have (Phase 2)
- [ ] GitHub Issues export
- [ ] Jira export
- [ ] Risk deep-dive UI
- [ ] Persona detailed view
- [ ] A/B test calculator (for marketing)

---

## 🚀 Command to Start

```bash
# Create Vite project
npm create vite@latest product-launch-planner -- --template react
cd product-launch-planner

# Install dependencies
npm install

# Start dev server
npm run dev

# Deploy
npm run build
# Push dist/ to Netlify

# Cloudflare Workers
npm init cloudflare
# Deploy backend/src/workers/*
```

---

## 📚 Resources & Refs

- **Spec complète** : `/home/claude/product_launch_planner_spec.md`
- **Vite Docs** : https://vitejs.dev
- **Cloudflare Workers** : https://developers.cloudflare.com/workers/
- **PDFMake** : http://pdfmake.org/

---

## 🎯 Success Criteria

✅ Questionnaire capturable en < 5 min  
✅ Roadmap généré avec dépendances intelligentes  
✅ Marketing channels adaptés au segment  
✅ Budget allocation réaliste (matrice coûts)  
✅ Persona synthétisée pertinente  
✅ Slider budget → recalc en < 500ms  
✅ PDF export professionnel  
✅ Bilingue parfait (FR/EN)  
✅ Design élégant aligné Digital Blue Skye  
✅ Déployable en production  

**Let's ship this! 🚀**
