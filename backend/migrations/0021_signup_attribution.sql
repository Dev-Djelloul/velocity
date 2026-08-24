-- Canal d'acquisition de chaque inscription (utm_*/referrer capturés côté frontend à la
-- première visite, voir frontend/src/lib/attribution.js), reçu via le webhook Clerk
-- user.created (event.data.unsafe_metadata). Permet de savoir d'où vient un testeur/
-- utilisateur sans avoir à deviner après coup (retour utilisateur).
CREATE TABLE IF NOT EXISTS signup_attribution (
  user_id TEXT PRIMARY KEY,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  referrer TEXT,
  landing_page TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
