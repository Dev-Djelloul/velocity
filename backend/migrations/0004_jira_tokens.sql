-- Jetons OAuth Atlassian/Jira par utilisateur, pour l'export d'un plan vers un projet Jira.
-- Contrairement à Notion, Atlassian expire le token d'accès en 1h ; on stocke aussi le refresh
-- token et une date d'expiration, et on rafraîchit à la demande. Un utilisateur peut avoir
-- plusieurs sites Jira ; on mémorise celui qu'il a sélectionné (cloud_id + site_url + project_key).

CREATE TABLE IF NOT EXISTS jira_tokens (
  user_id TEXT PRIMARY KEY,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at INTEGER NOT NULL, -- epoch ms
  cloud_id TEXT,               -- id du site Jira Cloud sélectionné
  site_url TEXT,               -- ex: https://mycompany.atlassian.net (pour deep-links)
  site_name TEXT,
  project_key TEXT,            -- ex: PROD
  project_name TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
