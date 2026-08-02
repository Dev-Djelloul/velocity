# Product Launch Planner - Bootstrap & Setup Guide

## 🚀 Démarrage Rapide

### Option 1 : Utiliser Claude Code Directement (Recommandé)

1. **Copie le prompt complet** de `CLAUDE_CODE_PROMPT.md`
2. **Ouvre Claude Code** dans ton terminal :
   ```bash
   cd /path/to/your/projects
   claude
   ```
3. **Paste le prompt** dans Claude Code
4. **Claude Code créera** toute la structure automatiquement

### Option 2 : Setup Manuel

#### Étape 1 : Créer la structure de base
```bash
mkdir -p velocity-launch
cd velocity-launch

# Frontend
mkdir -p frontend/src/{components,lib,assets}
mkdir -p frontend/public

# Backend
mkdir -p backend/src/{workers,lib/generator}

# Docs
mkdir -p docs
```

#### Étape 2 : Copier les fichiers de base (voir ci-dessous)

#### Étape 3 : Installer dépendances
```bash
# Frontend
cd frontend
npm install react react-dom pdfmake
npm install -D vite @vitejs/plugin-react

# Backend
cd ../backend
npm install wrangler
```

---

## 📄 Fichiers de Base à Créer

### frontend/package.json
```json
{
  "name": "velocity-launch-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "npm run build && netlify deploy --prod"
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

### frontend/vite.config.js
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true
      }
    }
  }
})
```

### frontend/index.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Product Launch Planner</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
```

### frontend/src/main.jsx
```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### frontend/src/App.jsx
```jsx
import { useState } from 'react'
import Questionnaire from './components/Questionnaire'
import PlanViewer from './components/PlanViewer'
import './App.css'

export default function App() {
  const [formData, setFormData] = useState(null)
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleGenerate = async (data) => {
    setFormData(data)
    setLoading(true)
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await response.json()
      setPlan(result)
    } catch (error) {
      console.error('Error generating plan:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Product Launch Planner</h1>
        <p>Bilingue SaaS Launch Planning Tool</p>
      </header>
      
      {!plan ? (
        <Questionnaire onSubmit={handleGenerate} loading={loading} />
      ) : (
        <PlanViewer plan={plan} onReset={() => setPlan(null)} />
      )}
    </div>
  )
}
```

### frontend/src/index.css
```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: #333;
}

.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  text-align: center;
  color: white;
  margin-bottom: 3rem;
}

.header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.header p {
  font-size: 1.1rem;
  opacity: 0.9;
}
```

### frontend/src/components/Questionnaire.jsx
```jsx
import { useState } from 'react'
import '../styles/Questionnaire.css'

export default function Questionnaire({ onSubmit, loading }) {
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState({
    product: {},
    market: {},
    resources: {},
    priorities: {},
    language: 'fr'
  })

  const handleChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }))
  }

  const handleSubmit = () => {
    onSubmit(formData)
  }

  const steps = [
    { title: 'Product Info', section: 'product', fields: ['name', 'stage', 'category', 'pitch', 'usp', 'targetUser'] },
    { title: 'Market & Audience', section: 'market', fields: ['geography', 'b2bVsB2c', 'segment', 'audienceSize', 'competition'] },
    { title: 'Timeline & Resources', section: 'resources', fields: ['timelineWeeks', 'budgetEur', 'teamSize', 'rolesPresent'] },
    { title: 'Priorities', section: 'priorities', fields: ['focus', 'engagement', 'riskKnown', 'successMetric'] }
  ]

  return (
    <div className="questionnaire-container">
      <div className="progress-bar">
        {steps.map((s, i) => (
          <div key={i} className={`step ${i === step ? 'active' : i < step ? 'completed' : ''}`}>
            {i + 1}
          </div>
        ))}
      </div>

      <div className="form-section">
        <h2>{steps[step].title}</h2>
        {/* Form fields would go here */}
      </div>

      <div className="button-group">
        <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
          Précédent
        </button>
        {step < steps.length - 1 ? (
          <button onClick={() => setStep(step + 1)}>
            Suivant
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Generating...' : 'Generate Plan'}
          </button>
        )}
      </div>
    </div>
  )
}
```

### frontend/src/components/PlanViewer.jsx
```jsx
import RoadmapCard from './RoadmapCard'
import MarketingCard from './MarketingCard'
import KPIDashboard from './KPIDashboard'
import ExportModal from './ExportModal'
import { useState } from 'react'

export default function PlanViewer({ plan, onReset }) {
  const [showExport, setShowExport] = useState(false)

  return (
    <div className="plan-viewer">
      <div className="plan-header">
        <h2>{plan.product?.name} - Launch Plan</h2>
        <div className="plan-actions">
          <button onClick={() => setShowExport(true)}>Export</button>
          <button onClick={onReset}>New Plan</button>
        </div>
      </div>

      <div className="plan-grid">
        <RoadmapCard roadmap={plan.roadmap} />
        <MarketingCard marketing={plan.marketing} />
        <KPIDashboard kpis={plan.kpis} />
      </div>

      {showExport && (
        <ExportModal plan={plan} onClose={() => setShowExport(false)} />
      )}
    </div>
  )
}
```

### backend/wrangler.toml
```toml
name = "velocity-launch"
main = "src/workers/generate.js"
type = "service"
compatibility_date = "2024-01-01"

[env.production]
name = "velocity-launch-prod"

[env.development]
name = "velocity-launch-dev"

[[env.development.triggers.crons]]
cron = "0 0 * * *"
```

### backend/src/workers/generate.js
```javascript
import { generateRoadmap } from '../lib/generator/roadmapGenerator'
import { generateMarketingStrategy } from '../lib/generator/marketingStrategyGenerator'
import { calculateKPIs } from '../lib/generator/kpiCalculator'
import { generatePersona } from '../lib/generator/personaGenerator'

export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    try {
      const data = await request.json()
      
      // Generate all components
      const persona = generatePersona(data.market)
      const roadmap = generateRoadmap(data.resources, data.product, data.priorities)
      const marketing = generateMarketingStrategy(data.market, data.priorities, data.resources.budgetEur)
      const kpis = calculateKPIs(data.priorities, data.resources, data.market)

      return new Response(JSON.stringify({
        persona,
        roadmap,
        marketing,
        kpis,
        generatedAt: new Date().toISOString()
      }), {
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }
}
```

### backend/src/lib/generator/roadmapGenerator.js
```javascript
export function generateRoadmap(resources, product, priorities) {
  const weeks = resources.timelineWeeks || 8
  const sprints = Math.ceil(weeks / 2)
  
  // Implement roadmap generation logic
  // Return array of sprints with user stories, dependencies, costs
  
  return {
    sprints: [],
    totalDuration: weeks,
    estimatedCost: 0
  }
}
```

### backend/src/lib/generator/marketingStrategyGenerator.js
```javascript
export function generateMarketingStrategy(market, priorities, budget) {
  // Implement channel selection + budget allocation
  // Return channels with goals, cadence, content pillars, KPIs
  
  return {
    strategy: 'Balanced',
    channels: [],
    contentCalendar: [],
    totalBudget: budget
  }
}
```

### backend/src/lib/generator/kpiCalculator.js
```javascript
export function calculateKPIs(priorities, resources, market) {
  // Implement KPI calculation based on priorities
  // Return array of metrics with targets and baselines
  
  return []
}
```

---

## 🔄 Workflow de Développement

1. **Frontend dev** :
   ```bash
   cd frontend
   npm run dev
   ```
   → Accessible sur http://localhost:5173

2. **Backend local** :
   ```bash
   cd backend
   npx wrangler dev
   ```
   → API sur http://localhost:8787

3. **Test integration** :
   - Frontend calls `/api/generate` (proxied to localhost:8787)
   - Mock response or real backend

4. **Deploy** :
   ```bash
   # Frontend to Netlify
   cd frontend && npm run deploy
   
   # Backend to Cloudflare
   cd backend && npx wrangler deploy --env production
   ```

---

## 📌 Prochaines Étapes pour Claude Code

Quand tu lanceras Claude Code, il aura :
- ✅ Le prompt complet (CLAUDE_CODE_PROMPT.md)
- ✅ La structure scaffold (cette doc)
- ✅ Les fichiers de base (ci-dessus)
- ✅ La spec détaillée (product_launch_planner_spec.md)

**Claude Code pourra alors** :
1. Générer les composants React complets
2. Implémenter la logique d'adaptation (engine.js)
3. Créer les workers Cloudflare
4. Ajouter les traductions bilingues
5. Styler avec Tailwind ou CSS perso

---

## 🎯 Ordre de Priorité

**Pour Claude Code** (en ordre) :
1. ✅ Créer structure Vite + composants de base
2. ✅ Implémenter Questionnaire complet (19 inputs, FR/EN)
3. ✅ Créer engine.js (logique d'adaptation)
4. ✅ Implémenter roadmapGenerator + marketingStrategyGenerator
5. ✅ Créer PlanViewer + visualization components
6. ✅ Ajouter PDF export
7. ✅ Budget slider + interactive refinement
8. ✅ Déployer sur Netlify + Cloudflare Workers

---

## ✨ Tips pour Claude Code

- **Utilise des variables d'env** pour backend URL
- **Ajoute error boundaries** React
- **Mock les données** avant API real
- **Teste responsive** sur mobile
- **Utilise localStorage** pour sauvegarder form state
- **Ajoute loading states** partout
- **Traduis TOUS les texts** (pas d'English hardcodé)

---

**Ready to launch? Let's go! 🚀**
