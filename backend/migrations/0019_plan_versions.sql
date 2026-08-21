-- Bibliothèque de plans "avant/après" : un instantané complet du plan à chaque
-- enregistrement (voir db.upsertPlan), consultable et comparable entre eux (deux versions
-- au choix) sans jamais toucher à la ligne "vivante" de la table plans. Purgé aux 20
-- dernières versions par plan pour borner le volume (voir db.snapshotPlanVersion).
CREATE TABLE IF NOT EXISTS plan_versions (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  data TEXT NOT NULL, -- JSON complet du plan à cet instant (même forme que plans.data)
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_plan_versions_plan_id ON plan_versions(plan_id, created_at);
