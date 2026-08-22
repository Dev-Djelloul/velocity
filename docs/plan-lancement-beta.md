# Plan de lancement — Beta utilisateurs → acquisition

Statut du produit : le socle fonctionnel est considéré comme achevé pour un premier
passage devant de vrais utilisateurs (22 août 2026). Ce document sert de feuille de
route commune jusqu'à ce qu'on touche une première vraie clientèle. À mettre à jour au
fil de l'eau — chaque phase se termine par une décision explicite avant de passer à la
suivante, pas par calendrier fixe.

## Décisions déjà prises

- **Incitation testeurs** : accès **Pro gratuit** en échange d'un retour d'usage (pas de
  coupon Stripe pour l'instant — octroi manuel via l'endpoint `/admin/grant-pro`, voir
  plus bas).
- **Google Ads** : le tag de conversion (`gtag.js`) est câblé dès maintenant dans le code
  (`frontend/src/lib/consentScripts.js`), gated par le consentement cookies "Marketing"
  comme Meta Pixel et LinkedIn Insight Tag — prêt à s'activer dès qu'un ID est configuré,
  même si la campagne payante elle-même n'est prévue qu'en Phase 3.
- **Pas de synchronisation calendrier externe (Google/Apple Calendar)** pour le dashboard
  — jugé trop lourd (OAuth, identifiants) pour la valeur apportée à ce stade.

## Phase 1 — Beta fermée (1 à 2 semaines)

**Objectif** : valider qu'un inconnu peut générer un plan utile sans accompagnement, et
détecter les frictions bloquantes avant toute exposition publique.

- Recruter 10 à 20 testeurs ciblés : réseau personnel, communautés fondateurs/PM/growth
  (IndieHackers, groupes Slack/Discord startup, LinkedIn en 1-to-1 plutôt qu'en post
  public à ce stade).
- Offrir l'accès Pro gratuit en échange d'un engagement clair : générer au moins un plan
  complet, l'utiliser une semaine, puis un appel de 15 minutes (pas de formulaire NPS
  anonyme — retour qualitatif direct, plus riche).
- Octroi de l'accès :
  ```bash
  curl -X POST https://velocity-launch.djelloulabid75.workers.dev/admin/grant-pro \
    -H "Content-Type: application/json" \
    -d '{"secret": "<ADMIN_SECRET>", "userId": "<clerk_user_id>", "isPro": true}'
  ```
  (`ADMIN_SECRET` à définir soi-même via `wrangler secret put ADMIN_SECRET --name velocity-launch`
  — action volontairement laissée manuelle, jamais automatisée par l'assistant.)
- Grille d'entretien à préparer avant le premier appel : où le testeur bloque dans le
  questionnaire, ce qu'il modifie en premier dans le plan généré, s'il revient une
  deuxième fois sans y être invité.
- **Critère de sortie de phase** : au moins 70 % des testeurs terminent un plan sans aide,
  aucune friction bloquante récurrente identifiée (ou corrigée avant la Phase 2).

## Phase 2 — Ouverture douce sur les réseaux (1 semaine)

**Objectif** : mesurer l'intérêt organique avant d'investir un budget publicitaire.

- Post de lancement LinkedIn + X, ciblé fondateurs/PM/growth — ton direct, pas de
  storytelling excessif (cohérent avec le positionnement "pas de jargon" du produit).
- Mettre en avant la galerie publique opt-in comme preuve sociale (déjà en place).
- Aucun budget payant à ce stade : l'objectif est de mesurer le taux de conversion
  visiteur → inscription → premier plan généré sur du trafic gratuit, avant de décider
  si ça vaut la peine de payer pour en générer plus.
- **Critère de sortie de phase** : taux de conversion visiteur → premier plan généré
  mesuré et jugé suffisant pour justifier un budget pub (seuil à définir ensemble une
  fois les premiers chiffres en main).

## Phase 3 — Google Ads + retargeting

**Objectif** : acquisition payante ciblée, une fois le tunnel de conversion validé
organiquement.

- Le tag `gtag.js` est déjà en place côté code (voir ci-dessus) — il ne manque que :
  1. Un ID de conversion Google Ads (format `AW-XXXXXXXXX`), à configurer comme variable
     d'environnement `VITE_GOOGLE_ADS_ID` sur Netlify (build env).
  2. Un événement de conversion précis à suivre côté Google Ads (ex. "premier plan généré"),
     à définir une fois le compte Google Ads créé.
- Budget test modeste au démarrage, mots-clés à intention forte : "générateur plan de
  lancement produit", "business plan IA", variantes anglaises équivalentes si ciblage
  international envisagé.
- Retargeting Meta/LinkedIn sur les visiteurs qui n'ont pas terminé leur premier plan
  (Pixel et Insight Tag déjà branchés et prêts, voir mémoire projet).
- Landing page dédiée à la campagne à envisager si la page marketing générale convertit
  moins bien que prévu sur du trafic payant (intention plus resserrée qu'un visiteur
  organique).
- **Critère de sortie de phase** : coût d'acquisition (CAC) mesuré et comparé à une
  première estimation de valeur vie client (LTV), même approximative.

## Phase 4 — Itération sur la rétention

**Objectif** : transformer les premiers utilisateurs acquis en usage récurrent, pas
seulement en inscriptions.

- Suivre l'activation (premier plan généré dans les 24h) et la rétention à J7/J30 — les
  mêmes KPIs que ceux recommandés aux utilisateurs de VelocityLaunch eux-mêmes.
- Ajuster onboarding, pricing ou fonctionnalités mises en avant selon les chiffres réels
  plutôt que des suppositions.
- Revoir à ce stade si le tarif Pro actuel est le bon point d'entrée, ou si un palier
  intermédiaire fait sens.

## Ce qui reste à trancher avant de démarrer la Phase 1

- Qui recrute concrètement les 10-20 premiers testeurs (réseau direct vs. sollicitation
  froide dans des communautés).
- Définir `ADMIN_SECRET` et le garder dans un gestionnaire de mots de passe, pas en clair
  dans un message ou un fichier versionné.
- Créer le compte Google Ads et récupérer l'ID de conversion pour la Phase 3 (pas
  bloquant pour démarrer la Phase 1).
