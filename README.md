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

### Génération du plan

- **Questionnaire guidé en 4 étapes** — produit, marché, ressources, priorités — avec sauvegarde automatique, brouillons nommés pour reprendre plus tard, et **import de document** (PDF, Word, Excel, PowerPoint) : le texte est extrait côté client et ajouté au contexte transmis à l'IA, dans un champ éditable avant génération.
- **Budget marketing et budget total du lancement distincts** — le budget marketing pilote la répartition par canal, le budget total (dev + marketing + ops) pilote le prévisionnel financier ; les deux sont saisis séparément pour éviter la confusion entre les deux montants.
- **Génération par IA avec filet de sécurité** — le backend interroge un modèle de langage (via OpenRouter) pour produire un plan sur mesure ; en cas d'échec ou d'absence de clé API, un moteur à règles déterministe prend le relais localement, sans jamais bloquer l'utilisateur.
- **Copilote IA conversationnel (Nova)** — chat flottant dans le plan pour itérer en langage naturel ("réduis le budget marketing de 20%", "ajoute un persona B2C") ; les changements proposés passent par le même circuit "modifications en attente" que les autres éditions, rien n'est appliqué sans validation.

### Contenu du plan

- **Roadmap Agile** — sprints, user stories, effort en points, coûts estimés, alertes de dépassement de budget, et un Gantt interactif où les stories peuvent être glissées d'un sprint à l'autre.
- **Stratégie marketing** — répartition budgétaire par canal, objectifs et calculateur A/B test intégré.
- **Dashboard KPI & tableaux générés par IA** — métriques de succès personnalisées selon le contexte du produit, avec formules affichées.
- **Prévisionnel financier & toolkit stratégique** — burn rate simplifié, seuils de rentabilité, et supports générés (accroche landing, brief réseaux sociaux, objet email).
- **Veille, benchmarks, calendriers éditorial/pub, conformité RGPD** — sections générées par IA à la demande, avec veille automatique hebdomadaire et diff des nouveautés.
- **Suivi post-lancement & simulateur budget/timeline** — mesures réelles vs prévisionnel, simulation en direct sans modifier le plan initial.
- **Agents IA asynchrones** (Cloudflare Queues) — brief d'exécution, recalcul de KPIs, analyse des risques, optimisation budgétaire, notifiés par email/Slack à la fin.
- **Fil d'activité & commentaires** — historique des modifications par plan, commentaires d'équipe avec @mentions notifiées, tags transversaux pour organiser ses plans.

### Export, partage & organisation

- **Export & partage** — PDF, PPTX (pitch deck 9 diapositives, marque personnalisable en Pro), CSV, PNG, JSON, issues GitHub/Jira, et lien de partage privé (expire après 30 jours) ou image Open Graph dédiée.
- **Galerie publique (opt-in)** — un plan peut être rendu consultable sans compte via un lien dédié, réversible à tout moment par son auteur ; aucune modération centralisée, l'auteur contrôle seul sa visibilité.
- **Modèles & duplication** — dupliquer un plan existant comme point de départ d'un nouveau, sans ses données propres à l'instance d'origine (id, commentaires, liens providers...).
- **Historique & brouillons** — tous les plans générés sont sauvegardés localement (`localStorage`, synchronisé serveur pour les brouillons) et consultables depuis "Mes plans" ; les réponses en cours peuvent être sauvegardées comme brouillon nommé, repris plus tard sans perte.
- **Webhooks sortants (Zapier-compatible)** — déclenchés sur `generation.completed` et `story.completed`, signature HMAC, gérés depuis les Paramètres.

### Compte, équipe & notifications

- **Compte & crédits** — connexion via Clerk (Google, Apple, Slack ou email), quota de plans gratuits par utilisateur, passage en illimité via un abonnement Stripe.
- **Espaces d'équipe** — organisations Clerk : espace personnel + équipes (invitations, rôles), plans déplaçables entre espaces, historique et notifications de commentaires partagés. Limite d'espaces par plan (1 Gratuit / 5 Pro / illimité Entreprise), appliquée côté interface et côté serveur via un webhook Clerk.
- **Tarification à 3 offres** — Gratuit, Pro (mensuel ou annuel, checkout Stripe) et Entreprise (sur devis, formulaire de contact). PPTX, intégrations, historique multi-espaces et notifications d'équipe réservés à Pro.
- **Notifications email (Resend) & Slack** — génération IA terminée, rappel d'inactivité (14j), veille hebdomadaire automatique, résumé hebdomadaire d'avancement (plans actifs uniquement) ; chaque préférence est activable indépendamment.
- **Page Paramètres** — thème clair/sombre, langue, fuseau horaire, formats date/devise, accessibilité (police/contraste/animations), export RGPD des données et suppression de compte, panneau des intégrations connectées.

### Intégrations

- **Notion** — export OAuth d'une page structurée avec bases de données natives (roadmap + calendrier éditorial/pub).
- **Jira** — OAuth, création d'Epics par phase et de Stories liées, sync incrémental idempotent, deep-links depuis le Backlog.
- **GitHub** — OAuth, création d'issues/milestones à partir du plan.
- **Linear** — clé API personnelle (sans OAuth), export en issues labellisées pour resynchronisation sans doublon.
- **Google Calendar** — OAuth, synchronise date de lancement, calendrier éditorial et calendrier publicitaire en événements idempotents.

### Autres

- **Bilingue FR / EN** — interface, contenu généré et documents exportés s'adaptent à la langue choisie.
- **Recherche globale (⌘K)** et navigation clavier.

## Stack technique

| Couche | Techno |
|---|---|
| Frontend | React 18 + Vite, React Router (URLs propres par page), CSS custom (pas de framework UI) |
| Backend | Cloudflare Workers (JavaScript, sans framework) |
| Authentification | Clerk (Google, Apple, Slack, email) + Organizations (espaces d'équipe) — mode démo local (session + équipe simulées) si aucune clé n'est configurée |
| Paiement | Stripe (abonnement Pro récurrent, mensuel ou annuel) |
| Base de données | Cloudflare D1 (comptes, crédits, tokens OAuth, webhooks, préférences de notification) |
| Tâches planifiées | Cloudflare Queues (agents IA) + Cron Triggers (rappels, veille hebdo, résumé hebdo) |
| Intégrations tierces | Notion, Jira, GitHub, Google Calendar — OAuth ; Linear — clé API personnelle |
| Notifications | Resend (email) + Slack (Incoming Webhooks) |
| Génération IA | OpenRouter (modèle configurable via `AI_MODEL`), function calling avec schéma structuré |
| Génération de secours | Moteur à règles déterministe, 100 % local, aucune dépendance externe |
| Extraction de document | `pdfjs-dist`, `mammoth`, `xlsx`, `jszip` — parsing 100 % côté client, en import dynamique |
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

Le schéma ci-dessus couvre le flux de génération. Le Worker gère aussi, indépendamment : l'authentification et les crédits (Clerk + D1), les abonnements Pro (webhooks Stripe), les connexions OAuth par utilisateur vers Notion, Jira et GitHub (export et synchronisation du plan), et l'application côté serveur de la limite d'espaces d'équipe par plan (webhook Clerk sur `organization.created`, voir `backend/src/lib/clerk.js`).

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

Le prix Stripe **annuel** (bascule "Annuel" de la grille tarifaire) est configuré uniquement côté serveur — voir `STRIPE_PRICE_ID_YEARLY` ci-dessous. Sans lui, le checkout retombe silencieusement sur le prix mensuel.

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
| `STRIPE_PRICE_ID` | Pour le paiement | ID du prix Stripe mensuel côté serveur. |
| `STRIPE_PRICE_ID_YEARLY` | Optionnelle | ID du prix Stripe annuel. Sans elle, le checkout "Annuel" facture au tarif mensuel. |
| `CLERK_SECRET_KEY` | Pour les espaces d'équipe | Clé secrète Clerk (Backend API) — sert à compter les organisations d'un utilisateur et à en supprimer une en trop lors du webhook `organization.created`. |
| `CLERK_WEBHOOK_SECRET` | Pour les espaces d'équipe | Secret de signature (Svix) du endpoint webhook Clerk. Endpoint à créer dans Clerk Dashboard → Webhooks, événement `organization.created`, URL `<votre-worker>/webhooks/clerk`. |
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
│           ├── stripe.js        # Abonnement Pro (checkout mensuel/annuel, webhooks)
│           ├── clerk.js         # Webhook Clerk (Svix) + Backend API — limite d'espaces d'équipe par plan
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
