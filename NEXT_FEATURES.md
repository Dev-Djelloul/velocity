# VelocityLaunch — Fiche de reprise : prochaines fonctionnalités

> Colle ce fichier (ou son contenu) dans une nouvelle conversation Claude Code pour reprendre le travail. Contexte projet : générateur IA de plan de lancement produit, React/Vite (`frontend/`) + Cloudflare Worker (`backend/`, D1 + Queues + Cron Triggers), Clerk (auth), Stripe (Pro), OpenRouter (IA), Resend (email), Slack (webhooks), intégrations Notion/Jira/GitHub déjà en place.

## État au 18 août 2026 — déjà livré

- **Linear** — alternative à Jira, sans OAuth (clé API personnelle, comme prévu par la fiche pour un MVP). `backend/src/lib/linear/linearClient.js` (GraphQL, header `Authorization: <clé>`), table `linear_tokens` (migration `0010_linear_tokens.sql`), routes `/linear/status|connect|disconnect|teams|select|export` dans `api.js`. Export plat en issues (pas d'Epic manipulable par l'API Linear standard) avec label `vl-sprint:N` par phase et `vl-id:X` par story pour permettre la ré-synchronisation en mise à jour plutôt qu'en doublon (même logique que Jira). UI dans `ExportModal.jsx` (saisie de clé + sélection d'équipe, au lieu du popup OAuth) et `IntegrationsPanel.jsx`.
- **@mentions dans les commentaires** — la sélection @Nom dans le composeur de commentaire (`PlanSidebar.jsx`, dropdown déclenché par "@" + filtre sur `useTeam().members`) insère "@Nom" dans le texte et ajoute l'id du membre à `comment.mentions`. `PlanViewer.jsx` → `addComment` déclenche ensuite `POST /comments/notify` (fire-and-forget), qui pour chaque mentionné vérifie SA propre préférence (`notification_prefs.mentions`, colonne ajoutée par la migration `0009_mention_notifications.sql`, activée par défaut) et envoie l'email (`mentionEmail`) et/ou le Slack (`mentionSlackMessage`) correspondants — indépendant de la préférence du propriétaire du plan.
- **Fil d'activité par plan** — déjà livré avant cette fiche, contrairement à ce que la fiche disait : `plan.changeLog` (rempli via `markChanged()`/`handleSave` dans `PlanViewer.jsx`, persisté avec le reste du plan en JSON dans `plans.data`) est affiché avec date/auteur/détail dans le panneau "Historique" de `PlanSidebar.jsx` (voir `plan-sidebar-history-panel`).
- **Copilote IA conversationnel** — chat flottant dans PlanViewer (`frontend/src/components/CopilotChat.jsx`) pour itérer sur le plan en langage naturel. Backend : `POST /copilot/chat` (`backend/src/workers/api.js` → `backend/src/lib/ai/copilotClient.js`), function-calling OpenRouter qui renvoie une réponse conversationnelle + la valeur complète mise à jour de chaque section modifiée (sections éditables : product, persona, market, priorities, classification, roadmap, marketing, kpis, financials, strategyToolkit, executiveSummary, launchDate, planStartDate). Les changements passent par le circuit `markChanged()`/`pendingChanges` existant — rien n'est enregistré sans clic sur "Enregistrer".
- Génération de plan IA complet (persona, roadmap, marketing, KPIs, finances, veille, benchmarks, calendriers éditorial/pub, RGPD, tableau/graphique IA)
- Espaces d'équipe (Clerk Organizations) + offre Pro (Stripe)
- Exports PDF / PPTX (pitch deck 9 diapos) / CSV / PNG / JSON
- Intégrations OAuth : Notion (bases de données natives), Jira (Epics/Stories/sync), GitHub (issues)
- **Notifications** : email (Resend) + Slack (Incoming Webhook), sur génération IA terminée (veille/benchmarks/calendriers/RGPD/tableau/agents dont Analyse des risques et Optimisation budgétaire), rappel d'inactivité (14j), **veille IA auto hebdomadaire (lundi 8h UTC) avec diff de nouveautés**
- Page Paramètres : thème, langue, fuseau, accessibilité (police/contraste/animations), formats (date/devise), RGPD (export/suppression compte), panneau intégrations connectées
- Agents IA async (Cloudflare Queues) : brief d'exécution, recalcul KPIs, analyse des risques, optimisation budgétaire — tous câblés UI + email + Slack
- Sommaire du plan en 8 groupes thématiques repliables
- Footer responsive centré (mobile → iPad Pro)

## Fonctionnalités proposées, non commencées (par thème)

### 🔌 Intégrations supplémentaires
1. **Google Calendar** — sync du calendrier éditorial/pub et de la date de lancement. OAuth Google Calendar API, création d'événements pour chaque item du calendrier.
2. **Webhooks sortants / Zapier** — permettre aux utilisateurs de brancher n'importe quel outil externe sur les événements du plan (génération terminée, story terminée, etc.). Nécessite : table `webhooks` (user_id, url, events[], secret pour signature HMAC), déclenchement depuis les mêmes points que les notifications Slack/email actuelles.

### 📈 Rétention & scale
3. **Templates de plans / duplication** — dupliquer un plan existant plutôt que de tout régénérer depuis le formulaire. Backend : `POST /plans/:id/duplicate`. Frontend : bouton dans PlansHistory.jsx / SpacePage.jsx.
4. **Résumé hebdomadaire par email** — étend le rappel d'inactivité (`sendInactivityReminders` dans `generate.js`) à un digest actif pour les plans ACTIFS : "cette semaine : 3 stories terminées, budget à 60%, 2 commentaires". Réutilise le cron quotidien existant ou un nouveau cron hebdomadaire (attention : le cron `0 8 * * 1` du lundi est déjà pris par la veille auto — utiliser un autre horaire, ex. `0 9 * * 1`).
5. **API publique (Entreprise)** — génération de plan programmatique via clé API. Nécessite : table `api_keys` (user_id, key_hash, scopes), middleware d'auth par clé API en plus de Clerk, doc API, rate limiting (KV).
6. **Export marque blanche (Entreprise)** — PDF/PPTX sans branding VelocityLaunch, avec logo custom de l'utilisateur. Modifier `frontend/src/lib/pdfExport.js` pour accepter un thème custom quand `plan` appartient à un compte Entreprise.

### 🚀 Distribution
7. **Galerie publique de plans** (opt-in) — vitrine + acquisition organique façon Product Hunt. Nécessite : flag `plan.isPublic`, route publique `/gallery`, modération basique, page de détail publique (réutiliser le système de partage par lien existant `db.createShare`/`db.resolveShare`).
8. **Image de partage (OG) par plan** — génération d'une image dynamique pour un partage LinkedIn/Twitter propre (titre du plan, classification, logo). Faisable via un Worker qui génère du SVG→PNG à la volée (Cloudflare a des exemples avec `@cloudflare/pages-plugin-vercel-og` ou équivalent), ou plus simple : template Canvas côté client au moment de l'export.

## Notes techniques utiles pour la suite

- **Pattern notification** : `backend/src/lib/email/resendClient.js` (templates + `extractHighlights` par type) et `backend/src/lib/slack/slackClient.js` sont conçus pour être réutilisés — toute nouvelle notification devrait suivre le même schéma (fonction `xxxEmail()` + `xxxSlackMessage()`, appelée depuis `notifyGenerationDone`/`notifyAgentDone` dans `api.js`/`generate.js`).
- **Pattern intégration OAuth** : voir `backend/src/lib/jira/jiraClient.js` pour le modèle complet (buildAuthorizeUrl, exchangeCode, ensureAccessToken avec refresh, table de tokens dédiée, routes `/xxx/status|authorize-url|callback|disconnect`).
- **Cron Triggers** : `backend/wrangler.toml` → `[triggers] crons = [...]`, distingués dans `generate.js` → `scheduled(event, env)` via `event.cron`. Un seul Worker, plusieurs cron expressions possibles.
- **Merge partiel des préférences** : `db.setNotificationPrefs` fait un merge avec l'existant (ne jamais écraser un champ non fourni) — reproduire ce pattern pour toute nouvelle table de préférences.
- **Déploiement** : toujours depuis `backend/` avec `npx wrangler deploy --name velocity-launch` (jamais depuis la racine, sinon Wrangler propose de créer un Worker parasite). Migrations : `npx wrangler d1 migrations apply velocity-launch-db --remote`.
- **Numérotation des migrations** : bien vérifier `ls backend/migrations/` avant de nommer un nouveau fichier (collision déjà survenue une fois avec deux `0005_*.sql`).

## Comment démarrer la prochaine session

Dis simplement à Claude : *"Reprends le fichier NEXT_FEATURES.md à la racine du projet VelocityLaunch, et attaque [la fonctionnalité X]"* — ou demande un nouvel audit si la situation a changé entre-temps.
