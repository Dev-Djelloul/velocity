-- Jetons OAuth GitHub par utilisateur, pour la synchro d'un plan vers des issues GitHub.
-- Contrairement à Jira, un token OAuth App GitHub classique n'expire pas par défaut : pas
-- de refresh token à gérer. On mémorise le dépôt (owner/repo) choisi par l'utilisateur.

CREATE TABLE IF NOT EXISTS github_tokens (
  user_id TEXT PRIMARY KEY,
  access_token TEXT NOT NULL,
  owner TEXT,             -- utilisateur ou organisation GitHub du dépôt sélectionné
  repo TEXT,              -- nom du dépôt sélectionné
  repo_full_name TEXT,    -- "owner/repo", pour les deep-links
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
