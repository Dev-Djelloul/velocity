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
- **Compte & crédits** — connexion via Clerk (Google, Apple, Slack ou email), quota de plans gratuits par utilisateur, passage en illimité via un abonnement Stripe.
- **Intégrations Notion, Jira et GitHub** — connexion OAuth par utilisateur, export d'une page Notion structurée (roadmap + calendrier éditorial/pub unifiés), création d'Epics/Stories Jira et d'issues/milestones GitHub à partir du plan, avec synchronisation bidirectionnelle idempotente.

## Stack technique

| Couche | Techno |
|---|---|
| Frontend | React 18 + Vite, React Router (URLs propres par page), CSS custom (pas de framework UI) |
| Backend | Cloudflare Workers (JavaScript, sans framework) |
| Authentification | Clerk (Google, Apple, Slack, email) — mode démo local (session simulée) si aucune clé n'est configurée |
| Paiement | Stripe (abonnement Pro récurrent) |
| Base de données | Cloudflare D1 (comptes, crédits, tokens OAuth Notion/Jira/GitHub) |
| Tâches asynchrones | Cloudflare Queues (agents IA) |
| Intégrations tierces | Notion, Jira, GitHub — OAuth + API REST propres à chaque provider |
| Génération IA | OpenRouter (modèle configurable via `AI_MODEL`), function calling avec schéma structuré |
| Génération de secours | Moteur à règles déterministe, 100 % local, aucune dépendance externe |
| Export | `html2canvas`, `pdfmake`, `pptxgenjs` |
| Formulaire de contact | Web3Forms (envoi direct sans backend dédié) |
| SEO | Meta tags/Open Graph, robots.txt + sitemap.xml, prérendu HTML statique des pages publiques |
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

Le schéma ci-dessus couvre le flux de génération. Le Worker gère aussi, indépendamment : l'authentification et les crédits (Clerk + D1), les abonnements Pro (webhooks Stripe), et les connexions OAuth par utilisateur vers Notion, Jira et GitHub (export et synchronisation du plan).

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

# Clé publique Clerk (dashboard.clerk.com > API Keys > Publishable key)
# Sans elle, l'app tourne en mode démo : connexion simulée en local, aucun compte réel.
VITE_CLERK_PUBLISHABLE_KEY=

# ID du prix Stripe (mode récurrent) pour l'abonnement Pro
VITE_STRIPE_PRICE_ID=
```

### Backend (secrets Wrangler)

```bash
cd backend
npx wrangler secret put OPENROUTER_API_KEY
```

| Variable | Requise | Description |
|---|---|---|
| `OPENROUTER_API_KEY` | Non | Clé API OpenRouter. Sans elle, le backend bascule automatiquement sur le moteur à règles. |
| `AI_MODEL` | Non | Modèle OpenRouter à utiliser (voir `wrangler.toml` > `[vars]` pour la valeur par défaut). |
| `STRIPE_SECRET_KEY` | Pour le paiement | Clé secrète Stripe. |
| `STRIPE_WEBHOOK_SECRET` | Pour le paiement | Secret du endpoint webhook Stripe (activation du Pro après paiement). |
| `STRIPE_PRICE_ID` | Pour le paiement | ID du prix Stripe côté serveur. |
| `NOTION_CLIENT_SECRET` | Pour l'intégration Notion | Secret de l'app OAuth Notion (`NOTION_CLIENT_ID` est en clair dans `wrangler.toml`). |
| `JIRA_CLIENT_SECRET` | Pour l'intégration Jira | Secret de l'app OAuth Jira. |
| `GITHUB_CLIENT_SECRET` | Pour l'intégration GitHub | Secret de l'app OAuth GitHub. |

Bindings déclarés dans `wrangler.toml` : KV `AI_USAGE` (suivi de consommation IA), D1 `DB` (comptes, crédits, tokens OAuth — migrations dans `backend/migrations/`), et une queue `velocity-agent-tasks` (traitement asynchrone des agents IA).

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
| `npm run deploy` | Déploie le Worker `velocity-launch` — jamais automatique, à lancer manuellement |

## Déploiement

- **Frontend** : déployé automatiquement par Netlify à chaque push sur `main`. Configuration dans `netlify.toml` — build depuis `frontend/` (`npm run build`, qui enchaîne `vite build` puis le prérendu des pages publiques), publication du dossier `dist`.
- **Backend** : déploiement **manuel**, jamais automatique. Depuis `backend/` :
  ```bash
  npm run deploy
  ```
  Déploie sur le Worker `velocity-launch` (nom défini dans `wrangler.toml`). À relancer après chaque modification dans `backend/`.

## Structure du projet

```
velocity/
├── frontend/
│   ├── src/
│   │   ├── components/         # Composants React (~30)
│   │   ├── lib/                 # Logique métier : génération, auth (Clerk), i18n, export, stockage
│   │   ├── entry-server.jsx     # Point d'entrée SSR dédié au prérendu (voir scripts/prerender.mjs)
│   │   └── styles/              # CSS par composant
│   ├── scripts/prerender.mjs    # Génère le HTML statique des pages publiques après le build
│   ├── assets/                  # Design system de référence
│   └── public/                  # robots.txt, sitemap.xml, _redirects (fallback SPA Netlify)
├── backend/                     # Cloudflare Worker
│   ├── migrations/              # Schéma D1 (comptes, crédits, tokens OAuth)
│   └── src/
│       ├── workers/generate.js  # Point d'entrée HTTP
│       └── lib/
│           ├── ai/              # Client OpenRouter, schéma de sortie, brand voice
│           ├── generator/       # Moteur à règles (roadmap, marketing, KPIs, financier)
│           ├── stripe.js        # Abonnement Pro (webhooks)
│           ├── notion/          # Export Notion (OAuth + API)
│           ├── jira/            # Sync Jira (OAuth + API)
│           └── github/          # Sync GitHub (OAuth + API)
├── docs/                        # Documentation technique (checklist SEO...)
├── start.sh                     # Lance frontend + backend en local
└── netlify.toml                 # Configuration de déploiement frontend
```

## Internationalisation

Toute l'interface, le contenu généré (plans, exports) et les modales (footer, brouillons, historique des plans) sont disponibles en français et en anglais via `frontend/src/lib/i18n.js` (interface) et `frontend/src/lib/landingI18n.js` (page d'accueil). Le contenu généré côté backend est localisé selon la langue transmise dans la requête.

## Contribuer

Projet indépendant maintenu par [digitalblueskye](https://github.com/Dev-Djelloul). Les retours, rapports de bugs et suggestions sont bienvenus via les issues GitHub ou le [formulaire de contact](https://velocity.digitalblueskye.com) du site.
