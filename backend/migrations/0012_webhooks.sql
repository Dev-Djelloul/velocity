-- Webhooks sortants : l'utilisateur branche n'importe quel outil externe (Zapier, Make,
-- son propre backend...) sur les événements du plan. events est un tableau JSON de types
-- d'événements souscrits (ex: ["generation.completed", "story.completed"]) — un webhook
-- peut s'abonner à plusieurs événements à la fois. secret sert à signer chaque livraison
-- en HMAC-SHA256 (header X-VelocityLaunch-Signature) pour que le destinataire authentifie
-- l'origine de la requête.
CREATE TABLE IF NOT EXISTS webhooks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT NOT NULL, -- JSON array
  secret TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_webhooks_user ON webhooks(user_id);
