-- Historique multi-fils du copilote Nova (voir CopilotChat.jsx) — jusqu'ici une seule
-- conversation "courante" vivait dans plans.data.copilotHistory, écrasée à chaque nouvelle
-- conversation. Chaque fil devient une ligne indépendante, listable/recherchable/rouvrable
-- (façon Cloudflare AI), sans limite de rétention (contrairement à plan_versions) : ce sont
-- des conversations que l'utilisateur choisit explicitement de garder ou de supprimer, pas
-- des instantanés automatiques.
CREATE TABLE IF NOT EXISTS copilot_conversations (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  title TEXT,
  messages TEXT NOT NULL, -- JSON array [{role, content, createdAt, note?, error?}]
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_copilot_conversations_plan_id ON copilot_conversations(plan_id, updated_at);
