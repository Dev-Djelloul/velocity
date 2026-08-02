-- File d'exécution asynchrone des agents IA (brief d'exécution, recalcul de KPIs, etc.)
-- Le message poussé sur la queue ne contient que l'id ; toute la donnée utile vit ici,
-- pour que le consumer puisse reprendre même après un redéploiement du Worker.

CREATE TABLE IF NOT EXISTS agent_tasks (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL, -- ex: 'story_brief', 'recalc_kpis'
  status TEXT NOT NULL DEFAULT 'queued', -- queued | running | done | error
  input TEXT NOT NULL, -- JSON : contexte nécessaire à l'exécution (story, plan snapshot...)
  output TEXT, -- JSON : résultat une fois terminé
  error TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_agent_tasks_plan_id ON agent_tasks(plan_id);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_user_id ON agent_tasks(user_id);
