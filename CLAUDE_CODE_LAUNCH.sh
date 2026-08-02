#!/bin/bash

# Product Launch Planner - Setup & Claude Code Launch Script
# Usage: bash CLAUDE_CODE_LAUNCH.sh

set -e

echo "🚀 Product Launch Planner - Claude Code Setup"
echo "=============================================="

# Configuration
PROJECT_DIR="$HOME/projects/velocity-launch"
DOCS_DIR="$HOME/claude"

# Step 1: Create project directory
echo "📁 Creating project directory..."
mkdir -p "$PROJECT_DIR"
cd "$PROJECT_DIR"

# Step 2: Copy documentation
echo "📚 Copying documentation..."
cp "$DOCS_DIR/CLAUDE_CODE_PROMPT.md" .
cp "$DOCS_DIR/PROJECT_BOOTSTRAP.md" .
cp "$DOCS_DIR/product_launch_planner_spec.md" .

# Step 3: Create initial folder structure
echo "🏗️  Creating project structure..."
mkdir -p frontend/src/{components,lib,styles,assets}
mkdir -p frontend/public
mkdir -p backend/src/{workers,lib/generator}
mkdir -p docs

# Step 4: Copy base files from bootstrap
echo "📄 Setting up base files..."

# Frontend package.json
cat > frontend/package.json << 'EOF'
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
EOF

# Frontend vite.config.js
cat > frontend/vite.config.js << 'EOF'
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
EOF

# Frontend index.html
cat > frontend/index.html << 'EOF'
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
EOF

# Frontend src/main.jsx
cat > frontend/src/main.jsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
EOF

# Frontend src/App.jsx (minimal)
cat > frontend/src/App.jsx << 'EOF'
import { useState } from 'react'
import './App.css'

export default function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>Product Launch Planner</h1>
        <p>Intelligent SaaS Launch Planning (FR/EN)</p>
      </header>
      <main>
        {/* Components will be added by Claude Code */}
      </main>
    </div>
  )
}
EOF

# Frontend src/index.css
cat > frontend/src/index.css << 'EOF'
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
EOF

# Backend wrangler.toml
cat > backend/wrangler.toml << 'EOF'
name = "velocity-launch"
main = "src/workers/generate.js"
type = "service"
compatibility_date = "2024-01-01"

[env.production]
name = "velocity-launch-prod"

[env.development]
name = "velocity-launch-dev"
EOF

# Backend generate.js
cat > backend/src/workers/generate.js << 'EOF'
export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    try {
      const data = await request.json()
      
      // TODO: Implement generation logic
      
      return new Response(JSON.stringify({
        message: 'Generation logic to be implemented by Claude Code',
        receivedData: data
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
EOF

# Create README
cat > README.md << 'EOF'
# Product Launch Planner

Intelligent SaaS launch planning tool with:
- Bilingual questionnaire (FR/EN)
- Adaptive marketing strategy
- Agile roadmap generation
- KPI dashboard
- PDF + JSON exports

## Setup

1. Copy `CLAUDE_CODE_PROMPT.md` content
2. Run Claude Code in this directory
3. Paste the prompt
4. Let Claude Code build everything

## Frontend Dev
```bash
cd frontend
npm install
npm run dev
```

## Backend Dev
```bash
cd backend
npm install
npx wrangler dev
```

## Documentation
- `CLAUDE_CODE_PROMPT.md` - Complete prompt for Claude Code
- `PROJECT_BOOTSTRAP.md` - Setup guide & file structure
- `product_launch_planner_spec.md` - Technical specification

## Deployment
- Frontend: Netlify
- Backend: Cloudflare Workers
EOF

# Step 5: Show summary
echo ""
echo "✅ Setup Complete!"
echo "================================================"
echo ""
echo "📍 Project directory: $PROJECT_DIR"
echo ""
echo "📄 Files created:"
echo "  ✓ CLAUDE_CODE_PROMPT.md (Prompt for Claude Code)"
echo "  ✓ PROJECT_BOOTSTRAP.md (Setup guide)"
echo "  ✓ product_launch_planner_spec.md (Spec)"
echo "  ✓ Frontend structure (React/Vite)"
echo "  ✓ Backend structure (Cloudflare Workers)"
echo "  ✓ README.md"
echo ""
echo "🚀 Next Steps:"
echo ""
echo "1. Navigate to project:"
echo "   cd $PROJECT_DIR"
echo ""
echo "2. Open Claude Code:"
echo "   claude"
echo ""
echo "3. Copy & paste CLAUDE_CODE_PROMPT.md"
echo ""
echo "4. Let Claude Code generate the full app!"
echo ""
echo "💡 Pro Tips:"
echo "  • Frontend dev: cd frontend && npm run dev"
echo "  • Backend dev: cd backend && npx wrangler dev"
echo "  • Check CLAUDE_CODE_PROMPT.md for detailed instructions"
echo ""
echo "================================================"
echo "Questions? Check PROJECT_BOOTSTRAP.md"
echo "Ready? Run: claude && paste CLAUDE_CODE_PROMPT.md"
echo "================================================"
