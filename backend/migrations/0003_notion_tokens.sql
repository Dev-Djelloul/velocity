-- Jetons OAuth Notion par utilisateur, pour l'export d'un plan vers une page Notion.
-- Le token d'accès permet de créer des pages dans l'espace de travail que
-- l'utilisateur a explicitement autorisé lors du flux OAuth.

CREATE TABLE IF NOT EXISTS notion_tokens (
  user_id TEXT PRIMARY KEY,
  access_token TEXT NOT NULL,
  workspace_name TEXT,
  workspace_id TEXT,
  bot_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
