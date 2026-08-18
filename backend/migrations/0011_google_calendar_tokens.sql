-- Intégration Google Calendar : OAuth 2.0 classique (comme Jira/GitHub), un token par
-- utilisateur. access_token expire en ~1h ; on garde le refresh_token pour renouveler à la
-- demande (voir ensureAccessToken dans googleCalendarClient.js, même pattern que Jira).
CREATE TABLE IF NOT EXISTS google_calendar_tokens (
  user_id TEXT PRIMARY KEY,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at INTEGER NOT NULL, -- epoch ms
  calendar_id TEXT,            -- calendrier Google sélectionné (ex: "primary" ou un id dédié)
  calendar_name TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
