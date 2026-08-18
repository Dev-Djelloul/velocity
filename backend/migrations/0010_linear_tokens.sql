-- Intégration Linear : contrairement à Jira, pas d'OAuth 3LO — l'utilisateur colle sa
-- propre clé API personnelle (Settings > API keys côté Linear), on la garde telle quelle
-- et on l'envoie en header Authorization sur chaque appel GraphQL. Pas d'expiration à
-- gérer côté serveur (contrairement au token Jira) : la clé vit jusqu'à révocation côté
-- Linear par l'utilisateur.
CREATE TABLE IF NOT EXISTS linear_tokens (
  user_id TEXT PRIMARY KEY,
  api_key TEXT NOT NULL,
  team_id TEXT,
  team_key TEXT,
  team_name TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
