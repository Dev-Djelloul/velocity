-- Préférences de notification par email (agent IA terminé, plan inactif). Une ligne par
-- utilisateur ; l'email est celui déclaré côté Clerk et renvoyé par le frontend (l'API
-- Worker n'a pas accès à Clerk directement).

CREATE TABLE IF NOT EXISTS notification_prefs (
  user_id TEXT PRIMARY KEY,
  email TEXT,
  agent_done INTEGER NOT NULL DEFAULT 0,
  inactivity_reminder INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Horodatage du dernier rappel d'inactivité envoyé pour ce plan, pour ne relancer qu'une
-- fois par période d'inactivité (si le plan est de nouveau modifié, updated_at avance et
-- un nouveau rappel redevient possible après 14 jours).
ALTER TABLE plans ADD COLUMN reminder_sent_at TEXT;
