# Product Launch Planner - Specification complète

## 1. QUESTIONNAIRE D'INPUT

### Section A : Infos Produit (6 questions)

| Critère | Réponses possibles | Impact |
|---------|-------------------|--------|
| **Nom produit** | Texte libre | Utilisé dans les outputs (roadmap, marketing) |
| **Stade** | Pre-launch / MVP / Growing | Détermine stratégie marketing (awareness vs retention) |
| **Catégorie SaaS** | Project mgmt / Analytics / Automation / HR / Finance / Other | Affine les canaux pertinents |
| **Pitch court** | Textarea (2-3 lignes) | Base du messaging marketing |
| **USP (Unique Selling Point)** | Texte court | Crée la proposition de valeur clé |
| **Target User** | Freelancers / SMB / Entreprise / Niche | Détermine tone + canaux |

### Section B : Marché & Audience (5 questions)

| Critère | Réponses possibles | Impact |
|---------|-------------------|--------|
| **Géographie** | France / EU / Global | Affecte timing (fuseaux), langues |
| **B2B vs B2C** | B2B / B2C / Hybrid | B2C → réseaux viraux; B2B → LinkedIn, contenus techniques |
| **Segment principal** | (dropdown) | Affine personas + messaging |
| **Taille audience potentielle** | <1k / 1k-10k / 10k-100k / 100k+ | Budget par lead déduit |
| **Concurrence** | Aucune / Faible / Modérée / Forte | Ajuste agressivité marketing |

### Section C : Timeline & Ressources (4 questions)

| Critère | Réponses possibles | Impact |
|---------|-------------------|--------|
| **Durée avant launch** | 4 semaines / 8 semaines / 12 semaines / 6 mois | Détermine nb sprints, densité |
| **Budget marketing total** | €2k / €5k / €10k / €25k / €50k+ | Affecte # canaux, profondeur |
| **Taille équipe** | Solo / 2-3 / 4-6 / 7+ | Affecte capacité par sprint (story points) |
| **Rôles présents** | Product (✓) / Marketing (✓) / Dev (✓) / Design (✓) | Détermine dépendances sprints |

### Section D : Priorités & Contexte (4 questions)

| Critère | Réponses possibles | Impact |
|---------|-------------------|--------|
| **Prioriser** | Acquérir utilisateurs / Retenir / Monétiser | Affecte KPIs + stratégie |
| **Engagement requis** | Minimal (passive) / Modéré / Élevé (community) | Détermine stratégie contenu |
| **Risques connus** | None / Product not ready / Market fit unclear / Budget limits | Ajoute ligne "risques" au roadmap |
| **Success metric** | # signups / ARR / Retention / Community size | Définit le KPI primaire |

**Total : 19 critères → plan hautement adaptatif**

---

## 2. LOGIQUE D'ADAPTATION (ENGINE)

### A. Classification du Produit

```
IF stade == "Pre-launch" AND audience_size < 10k
  → "Awareness + Validation"
ELSE IF stade == "MVP"
  → "Acquisition + Product-market fit"
ELSE
  → "Growth + Retention"
```

### B. Stratégie Marketing (canaux + budget allocation)

**Pour SaaS B2C (priorité) :**

```
IF taille_audience < 10k OR concurrence == "Forte"
  → "Viral growth strategy" (60% TikTok/Reels, 20% YouTube, 20% Community)
ELSE IF concurrence == "Modérée"
  → "Balanced" (40% TikTok/Reels, 30% LinkedIn, 20% Content, 10% Paid)
ELSE
  → "Content-driven" (40% Blog/Content, 30% LinkedIn, 20% Organic Social, 10% Paid)
```

**Pour SaaS B2B :**
```
→ "Enterprise play" (50% LinkedIn, 25% Content (webinars), 15% Partnerships, 10% Paid)
```

### C. Budget par canal

```
Budget total = user input

IF strategy == "Viral"
  TikTok/Reels: 60% of budget (ad spend + creators)
  YouTube: 20%
  Community: 20%
ELSE IF strategy == "Balanced"
  TikTok/Reels: 40%
  LinkedIn: 30%
  Content: 20%
  Paid: 10%
...
```

### D. Sprint Sizing (Agile Roadmap)

```
nb_sprints = ceil(days_until_launch / 14)  // 2-week sprints

capacity_per_sprint = base_capacity × team_size_multiplier

IF team_size == "Solo": multiplier = 1x (8 story_points)
ELSE IF team_size == "2-3": multiplier = 2.5x (20 sp)
ELSE IF team_size == "4-6": multiplier = 5x (40 sp)
ELSE: multiplier = 8x (64 sp)

effort_per_deliverable = 3 to 13 story_points (depending on type)
cost_per_deliverable = (effort × hourly_rate) / 40
```

### E. KPI Targets

```
IF priority == "Acquire users"
  PRIMARY: Target signups / MQLs
  SECONDARY: CAC (cost per acquisition)
  TERTIARY: Conversion rate (% landing → signup)

ELSE IF priority == "Retain"
  PRIMARY: DAU / MAU
  SECONDARY: Churn rate
  TERTIARY: Engagement score

ELSE IF priority == "Monetize"
  PRIMARY: ARR / MRR
  SECONDARY: ARPU (revenue per user)
  TERTIARY: Expansion rate
```

---

## 3. OUTPUT 1: ROADMAP AGILE

**Structure :**
```
Sprint 1 (Weeks 1-2): Foundation
├─ US-001: [Product] Finalize onboarding flow (8 sp, €200)
├─ US-002: [Marketing] Create brand positioning doc (5 sp, €150)
├─ US-003: [Design] Build landing page mockups (8 sp, €300)
└─ Risk: Unclear customer needs → Action: Validate with 10 beta users

Sprint 2 (Weeks 3-4): Beta Launch
├─ US-004: [Product] Deploy MVP to staging (8 sp, €250)
├─ US-005: [Marketing] Film 3 TikTok teasers (13 sp, €600)
├─ US-006: [Dev] Set up analytics (5 sp, €150)
└─ Risk: Bugs slow launch → Action: QA checklist + 1 week buffer

Sprint 3 (Weeks 5-6): Go-Live + Early Marketing
├─ US-007: [Product] Launch public beta (5 sp, €200)
├─ US-008: [Marketing] Post TikToks + paid ads (8 sp, €800)
├─ US-009: [Community] Set up Discord community (5 sp, €100)
└─ Milestone: 100 beta users by week 6

...
```

**Colonnes détails :**
- Story ID, Title, Assignee, Effort (sp), Estimated Cost, Sprint, Completion Date

---

## 4. OUTPUT 2: PLAN MARKETING

**Structure :**
```
Marketing Strategy Overview
├─ Target Audience: [Persona créée]
├─ Primary Channels: [Ordered by budget allocation]
├─ Launch Timeline: [Semaine par semaine]
├─ Budget: [Total + breakdown]
└─ Success Metrics: [KPIs measurables]

Channel Deep-Dive (par canal majeur)
├─ TikTok/Reels
│  ├─ Goal: [ex: 100k views, 5k followers]
│  ├─ Content pillars: [5-7 topics]
│  ├─ Posting cadence: [3x/week]
│  ├─ Budget: €3000
│  ├─ Owner: [Role]
│  └─ KPI: Engagement rate > 3%
├─ LinkedIn
│  ├─ Goal: [ex: 1k connections, 50 leads]
│  ├─ Content: [Thought leadership, case studies]
│  ├─ Cadence: 3x/week
│  ├─ Budget: €2000
│  └─ KPI: Click-through rate > 2%
...

Content Calendar
┌────────┬──────────┬────────────┬──────────┐
│ Week   │ Channel  │ Content    │ Status   │
├────────┼──────────┼────────────┼──────────┤
│ Week 1 │ TikTok   │ Teaser #1  │ Planned  │
│ Week 1 │ LinkedIn │ Intro post │ Planned  │
...
```

---

## 5. OUTPUT 3: KPI DASHBOARD

**Cards affichées :**

| Métrique | Formule | Unit | Target | Baseline |
|----------|---------|------|--------|----------|
| Total Signups | Σ(signups over 8w) | # | 500 (ex) | 0 |
| CAC | Total budget / total signups | €/signup | < €20 | - |
| Conversion Rate | (signups / visitors) × 100 | % | > 3% | - |
| Avg Time to Signup | median(signup date - first visit) | days | < 2 | - |
| TikTok Reach | Total views across all videos | # | 50k | 0 |
| LinkedIn Engagement | Σ(likes+comments+shares) | # | 200 | 0 |
| Content Pieces | Published articles + videos | # | 12 | 0 |

---

## 6. OUTPUT 4: EXPORT

### PDF Export
```
[Header: Product name + launch date]
[Executive summary: 2-3 phrases]
[Section 1: Roadmap (sprints compacts)]
[Section 2: Marketing channels (1 page per channel)]
[Section 3: KPIs (table summary)]
[Section 4: Risk register]
```

### JSON Export
```json
{
  "product": {
    "name": "...",
    "pitch": "...",
    "launchDate": "2024-09-15"
  },
  "roadmap": [
    {
      "sprintId": 1,
      "startDate": "2024-08-15",
      "endDate": "2024-08-28",
      "stories": [
        {
          "id": "US-001",
          "title": "...",
          "effort": 8,
          "estimatedCost": 200,
          "status": "planned"
        }
      ]
    }
  ],
  "marketing": {
    "strategy": "...",
    "channels": [
      {
        "name": "TikTok",
        "budget": 3000,
        "goal": "100k views",
        "cadence": "3x/week"
      }
    ],
    "contentCalendar": [...]
  },
  "kpis": [
    {
      "name": "Total Signups",
      "target": 500,
      "baseline": 0,
      "metric": "signup_count"
    }
  ]
}
```

---

## 7. INTERACTION & REFINEMENT

**Features post-generation :**

1. **Budget Slider** : User ajuste budget total → tous les canaux + sprints recalculés en direct
2. **Toggle Channels** : On/off des canaux → budget redistributed
3. **Sprint Density** : "Accelerate" (1-week sprints) vs "Steady" (2-week)
4. **KPI Deep-dive** : Click une métrique → voir la formule + actions pour l'améliorer
5. **Risk Annotation** : User peut ajouter/éditer des risques + mitigations

---

## 8. TECH STACK PROPOSED

- **Frontend** : React/Vite (form + visualization)
- **Backend** : Cloudflare Workers (templating engine)
- **Exports** : PDFKit (PDF) + built-in JSON
- **Deployment** : Netlify frontend + Cloudflare Workers

---

## 9. PHASING (si on le fait par étapes)

**Phase 1 (MVP)** : Questionnaire + Roadmap + Marketing channels + JSON export
**Phase 2** : KPI dashboard + Budget slider interaction
**Phase 3** : PDF export + Risk register + Advanced refinement UI

---

## Questions pour Djelloul avant de coder :

1. **Les estimations de coût par deliverable** : Tu veux une formule simple (effort × taux horaire) ou tu veux une matrice plus nuancée (design task = €300, dev task = €200, content = €100) ?

2. **Template de sprints** : Tu veux des sprints vraiment détaillés (avec dépendances, blockers) ou plus légers (juste les stories + effort) ?

3. **Persona génération** : L'outil doit créer une persona synthétisée ou juste utiliser le "Target User" input ?

4. **Langues** : Tout en français ou bilingue ?

5. **Qui peut utiliser** : Gratuit pour tous / Pro feature / Freemium ?

Dis-moi ce qui te manque ou qu'on affine, et on attaque le code ! 🚀
