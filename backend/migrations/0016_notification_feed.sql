-- Centre de notifications persistant dans l'app (cloche du header global) — distinct de
-- notification_prefs (préférences d'envoi email/Slack) : ici, un flux d'événements par
-- utilisateur, lu/non lu, consultable même après coup, indépendamment des préférences
-- email/Slack activées ou non.
CREATE TABLE IF NOT EXISTS notification_feed (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  detail TEXT,
  plan_id TEXT,
  read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_notification_feed_user ON notification_feed (user_id, created_at DESC);
