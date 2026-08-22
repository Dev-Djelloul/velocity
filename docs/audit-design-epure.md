# Audit — Densité de dégradé et piste "design épuré"

Statut : audit de constat, pas une décision. Rédigé à la demande explicite de l'utilisateur
pour objectiver "où le dégradé est le plus envahissant", avec un désaccord de fond assumé —
l'intention initiale du produit était d'avoir quelque chose d'esthétique et coloré, pas un
outil noir/blanc minimal. Ce document sert de base de discussion, pas de mandat de refonte.

## Méthodologie

Comptage automatique des occurrences du dégradé de marque (`--wordmark-gradient`,
`linear-gradient(135deg, #9184d9 0%, #6366f1 40%, #06b6d4 100%)`) et de ses composantes
(violet `#9184d9`/`rgba(145,132,217,…)`, indigo `#6366f1`/`rgba(99,102,241,…)`, cyan
`#06b6d4`/`rgba(6,182,212,…)`) dans les 39 feuilles de style du frontend, au 22 août 2026.

## Constat : le dégradé n'est pas anecdotique, il est partout

**30 remplissages pleins** du dégradé (`background: var(--wordmark-gradient)`, le rendu le
plus visuellement lourd — un bloc de couleur saturé, pas une simple teinte) répartis sur 13
fichiers. Le dégradé sert de fond pour : boutons primaires, badges "Actuel"/"Pro", avatars
sans photo, icône flottante de Nova, orbe d'accueil de Nova, bandeau défilant du dashboard,
sélecteur "aujourd'hui" du calendrier, barre de progression, logo/wordmark, cercle
"tooltip d'aide" de plusieurs cartes.

### Classement des fichiers les plus saturés (dégradé plein + teintes translucides confondus)

| Rang | Fichier | Remplissages pleins | Teintes/bordures translucides |
|---|---|---|---|
| 1 | `PlanSidebar.css` | présent | 18 |
| 2 | `PlanViewer.css` | 4 | 23 |
| 3 | `DashboardHome.css` | 8 | 38 |
| 4 | `Landing.css` | 3 | 33 |
| 5 | `AccountPage.css` | présent | 9 |
| 6 | `Questionnaire.css` | 2 | 23 |
| 7 | `CopilotChat.css` | 1 | 18 |
| 8 | `design-system.css` (base partagée) | 1 | 15 |
| 9 | `PostLaunchTracking.css` | — | 17 |
| 10 | `HowItWorksPage.css` | 1 | 15 |

**Lecture** : les deux surfaces à plus fort enjeu de crédibilité — la **page d'accueil**
(Landing.css) et le **dashboard applicatif** (DashboardHome.css) — sont aussi parmi les plus
denses en dégradé. C'est cohérent avec le ressenti "ça fait très coloré dès le premier
contact", que ce soit visiteur non connecté ou utilisateur qui vient de se connecter.

## Répartition par type d'usage

Tous les usages ne se valent pas — certains sont fonctionnels (le dégradé porte une
information), d'autres sont purement décoratifs.

**Fonctionnel (à garder, quel que soit le choix final)**
- Statuts de story (todo/en cours/terminé) — la couleur EST l'information
- Badge "Actuel" sur la carte d'espace actif
- Points du calendrier (lancement vs fin de sprint) — différenciation sémantique
- Bordures d'alerte (orange = avertissement, rouge = erreur) — hors dégradé de marque

**Décoratif (le vrai terrain de discussion)**
- Fond plein des boutons primaires (`.btn-primary`, CTA "Créer un plan", etc.)
- Icônes en dégradé via `stroke: url(#gradient)` (technique `IconGradientDefs`, répétée
  dans Dashboard, PlanSidebar, InfoModal…)
- Bordures dégradées en "cadre" (`border: 1.5px solid transparent` + double
  `background` padding-box/border-box) — utilisées sur quasiment toutes les cartes, gros
  contributeur au comptage "teintes translucides"
- Orbe et bandeau défilant de Nova (accueil du copilote)
- Trame de points en dégradé (texture de fond des cartes du plan généré)

C'est cette seconde catégorie — surtout les bordures-cadre répétées sur chaque carte et les
icônes en dégradé — qui crée l'effet cumulatif "il y a de la couleur partout", plus que
quelques gros aplats isolés.

## Où le resserrer en premier, si l'option est retenue

Par ordre d'impact perçu / risque de retouche :

1. **Landing page (`Landing.css`)** — premier contact, le plus visible pour un jugement
   "pro vs amateur" en quelques secondes. Zone la plus sûre pour un test isolé (change une
   page, pas tout le produit) avant de généraliser.
2. **Boutons primaires globaux** (`.btn-primary` dans `design-system.css`) — un seul
   endroit à changer, effet en cascade sur tout le produit puisque c'est la classe partagée.
3. **Icônes en dégradé** (`IconGradientDefs`/`gradientIcon()`) — repasser en `currentColor`
   uni serait un changement mécanique, peu risqué visuellement.
4. **Bordures-cadre des cartes** — le plus gros chantier en volume (répété sur des dizaines
   de composants), mais aussi celui qui change le plus la "texture" générale de l'app.

**À ne pas toucher en premier** : Nova (orbe, bandeau) et le dashboard tip ticker — ce sont
des zones où la couleur a déjà une fonction d'accroche/personnalité assumée, pas juste de la
déco de fond ; les changer en dernier permet de garder un point de repère "identité produit"
même si le reste se resserre.

## Recommandation

Pas de refonte totale d'un coup. Deux options raisonnables, dans l'ordre de risque croissant :

- **Option pilote (recommandée)** : resserrer uniquement la landing page (zone 1
  ci-dessus) et recueillir un retour utilisateur réel avant de généraliser. Coût faible,
  réversible, donne une vraie donnée plutôt qu'une intuition.
- **Option globale** : centraliser le changement dans `design-system.css` (boutons +
  icônes), qui se propage automatiquement à tout le produit sans toucher fichier par
  fichier — mais sans retour utilisateur préalable, c'est un pari sur l'intuition seule.

Dans les deux cas, la couleur ne disparaît pas : elle recule en accent (bordure fine, icône
active, badge) plutôt qu'en aplat plein — c'est la différence entre "une touche de couleur
qui signale quelque chose" et "de la couleur partout par défaut".

## Ce qui ne doit pas dépendre de ce choix

Le retour utilisateur le plus important reste, comme évoqué, sur la clarté fonctionnelle
(complexité perçue, fonctionnalités qui semblent redondantes) — pas sur la palette. Un
produit visuellement sobre avec un parcours confus restera confus ; l'inverse aussi. Ce
chantier design et le travail déjà fait sur la clarté (textes explicatifs Stratégie
Marketing/Calendrier, cohérence budgétaire, avertissements de désynchronisation roadmap)
sont deux sujets distincts, à juger séparément sur les retours réels.
