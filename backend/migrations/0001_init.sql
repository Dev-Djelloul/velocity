-- Stockage serveur des plans et brouillons, scopé par utilisateur Clerk (user_id).
-- Remplace le localStorage côté client une fois l'utilisateur connecté (multi-appareil).

CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  data TEXT NOT NULL, -- JSON complet du plan (roadmap, marketing, kpis, financials...)
  product_name TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_plans_user_id ON plans(user_id);

CREATE TABLE IF NOT EXISTS drafts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT,
  data TEXT NOT NULL, -- JSON du formData du questionnaire
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_drafts_user_id ON drafts(user_id);

CREATE TABLE IF NOT EXISTS shares (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL,
  access_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS credits (
  user_id TEXT PRIMARY KEY,
  used INTEGER NOT NULL DEFAULT 0,
  is_pro INTEGER NOT NULL DEFAULT 0,
  stripe_customer_id TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
