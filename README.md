# VelocityLaunch

**Génère un plan de lancement produit complet — roadmap, stratégie marketing et KPIs — en répondant à 12 questions.**

VelocityLaunch transforme une idée de produit en plan de lancement actionnable en quelques minutes : roadmap Agile par sprints, stratégie marketing chiffrée par canal, KPIs personnalisés et prévisionnel financier, générés à partir d'un questionnaire guidé. Disponible en français et en anglais.

🔗 [velocity.digitalblueskye.com](https://velocity.digitalblueskye.com)

---

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Architecture](#architecture)
- [Démarrage rapide](#démarrage-rapide)
- [Variables d'environnement](#variables-denvironnement)
- [Scripts disponibles](#scripts-disponibles)
- [Déploiement](#déploiement)
- [Structure du projet](#structure-du-projet)
- [Internationalisation](#internationalisation)
- [Contribuer](#contribuer)

---

## Fonctionnalités

- **Questionnaire guidé en 4 étapes** — produit, marché, ressources, priorités — avec sauvegarde automatique et brouillons nommés pour reprendre plus tard.
- **Génération par IA avec filet de sécurité** — le backend interroge un modèle de langage (via OpenRouter) pour produire un plan sur mesure ; en cas d'échec ou d'absence de clé API, un moteur à règles déterministe prend le relais localement, sans jamais bloquer l'utilisateur.
- **Roadmap Agile** — sprints, user stories, effort en points, coûts estimés, alertes de dépassement de budget, et un Gantt interactif où les stories peuvent être glissées d'un sprint à l'autre.
- **Stratégie marketing** — répartition budgétaire par canal, objectifs et calculateur A/B test intégré.
- **Dashboard KPI** — métriques de succès personnalisées selon le contexte du produit, avec formules affichées.
- **Prévisionnel financier & toolkit stratégique** — burn rate simplifié, seuils de rentabilité, et supports générés (accroche landing, brief réseaux sociaux, objet email).
- **Export & partage** — PDF, PPTX, CSV, JSON, issues GitHub/Jira, capture image, et lien de partage privé (expire après 30 jours).
- **Historique & brouillons** — tous les plans générés sont sauvegardés localement (`localStorage`) et consultables depuis "Mes plans" ; les réponses en cours peuvent être sauvegardées comme brouillon nommé.
- **Bilingue FR / EN** — interface, contenu généré et documents exportés s'adaptent à la langue choisie.
- **Sans compte, sans carte bancaire** — toutes les données restent dans le navigateur par défaut ; rien ne transite vers un serveur sauf partage explicite d'un lien.

## Stack technique

| Couche | Techno |
|---|---|
| Frontend | React 18 + Vite, CSS custom (pas de framework UI) |
| Backend | Cloudflare Workers (JavaScript, sans framework) |
| Génération IA | OpenRouter (modèle par défaut : Claude Sonnet 5), function calling avec schéma structuré |
| Génération de secours | Moteur à règles déterministe, 100 % local, aucune dépendance externe |
| Export | `html2canvas`, `pdfmake`, `pptxgenjs` |
| Formulaire de contact | Web3Forms (envoi direct sans backend dédié) |
| Hébergement frontend | Netlify |
| Hébergement backend | Cloudflare Workers |

## Architecture

```
                    ┌─────────────────────┐
                    │   Frontend (React)  │
                    │  Netlify — statique  │
                    └──────────┬───────────┘
                               │ POST /  (JSON questionnaire)
                               ▼
                    ┌─────────────────────┐
                    │  Backend (Worker)    │
                    │  Cloudflare Workers  │
                    └──────────┬───────────┘
                               │
                 ┌─────────────┴─────────────┐
                 ▼                           ▼
       ┌───────────────────┐       ┌───────────────────┐
       │  OpenRouter (IA)   │       │ Moteur à règles    │
       │  génération riche  │  ──▶  │ (fallback local,   │
       │  via function call │       │  toujours dispo)   │
       └───────────────────┘       └───────────────────┘
```

Le frontend fonctionne **de manière autonome** sans backend configuré : `VITE_BACKEND_URL` est optionnelle. Sans elle (ou si l'appel échoue), le même moteur à règles tourne directement dans le navigateur (`frontend/src/lib/planGenerator.js`), garantissant un résultat instantané en toutes circonstances.

## Démarrage rapide

### Prérequis

- Node.js ≥ 18
- npm

### Installation

```bash
git clone https://github.com/Dev-Djelloul/velocity.git
cd velocity
npm install --prefix frontend
npm install --prefix backend
```

### Lancer en développement

**Option 1 — frontend seul** (utilise le moteur à règles local, aucune clé API requise) :

```bash
cd frontend
npm run dev
```

L'application est disponible sur `http://localhost:5173`.

**Option 2 — frontend + backend** (génération IA via OpenRouter) :

```bash
./start.sh
```

Ce script lance `wrangler dev` (backend, port `8787` par défaut) et `vite` (frontend, port `5173` par défaut) en parallèle, avec repli automatique sur un port libre en cas de conflit.

## Variables d'environnement

### Frontend (`frontend/.env` ou `frontend/.env.local`)

Voir `frontend/.env.example` :

```bash
# URL du backend Cloudflare Worker (optionnel — sans elle, le moteur local prend le relais)
VITE_BACKEND_URL=

# Clé publique Web3Forms pour le formulaire de contact du footer
VITE_WEB3FORMS_ACCESS_KEY=
```

### Backend (secrets Wrangler)

```bash
cd backend
npx wrangler secret put OPENROUTER_API_KEY
```

| Variable | Requise | Description |
|---|---|---|
| `OPENROUTER_API_KEY` | Non | Clé API OpenRouter. Sans elle, le backend bascule automatiquement sur le moteur à règles. |
| `AI_MODEL` | Non | Modèle OpenRouter à utiliser (défaut : `anthropic/claude-sonnet-5`). |

Un binding KV nommé `AI_USAGE` est déclaré dans `wrangler.toml` pour le suivi de consommation IA.

## Scripts disponibles

**Frontend** (`frontend/package.json`) :

| Script | Description |
|---|---|
| `npm run dev` | Serveur de développement Vite |
| `npm run build` | Build de production dans `frontend/dist` |
| `npm run preview` | Prévisualise le build de production |

**Backend** (`backend/package.json`) :

| Script | Description |
|---|---|
| `npm run dev` | Lance le Worker en local via Wrangler |
| `npm run deploy` | Déploie le Worker sur l'environnement `production` |

## Déploiement

- **Frontend** : déployé sur Netlify. Configuration dans `netlify.toml` — build depuis `frontend/` (`npm run build`), publication du dossier `dist`.
- **Backend** : déployé sur Cloudflare Workers via `npm run deploy` (utilise `wrangler.toml`, environnement `production`).

## Structure du projet

```
velocity/
├── frontend/                  # Application React (Vite)
│   ├── src/
│   │   ├── components/        # Composants React (~30)
│   │   ├── lib/                # Logique métier : génération, i18n, export, stockage
│   │   └── styles/             # CSS par composant
│   ├── assets/                 # Design system de référence
│   └── public/
├── backend/                    # Cloudflare Worker
│   └── src/
│       ├── workers/generate.js # Point d'entrée HTTP
│       └── lib/
│           ├── ai/             # Client OpenRouter, schéma de sortie, brand voice
│           └── generator/      # Moteur à règles (roadmap, marketing, KPIs, financier)
├── docs/                       # Notes de conception et spécification produit
├── start.sh                    # Lance frontend + backend en local
└── netlify.toml                # Configuration de déploiement frontend
```

## Internationalisation

Toute l'interface, le contenu généré (plans, exports) et les modales (footer, brouillons, historique des plans) sont disponibles en français et en anglais via `frontend/src/lib/i18n.js` (interface) et `frontend/src/lib/landingI18n.js` (page d'accueil). Le contenu généré côté backend est localisé selon la langue transmise dans la requête.

## Contribuer

Projet indépendant maintenu par [digitalblueskye](https://github.com/Dev-Djelloul). Les retours, rapports de bugs et suggestions sont bienvenus via les issues GitHub ou le [formulaire de contact](https://velocity.digitalblueskye.com) du site.
