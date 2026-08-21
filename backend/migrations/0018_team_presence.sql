-- Présence d'équipe (qui a un plan de cet espace ouvert en ce moment) — distincte de la
-- présence par plan (Durable Object PlanCollabRoom) : ici, un signal léger par équipe,
-- entretenu par heartbeat périodique plutôt qu'une connexion persistante, pour l'afficher
-- dans le tableau de bord d'équipe et le menu de bascule d'espace (pas liés à un plan
-- précis, donc pas connectés à un salon de collaboration).
CREATE TABLE IF NOT EXISTS team_presence (
  team_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  name TEXT,
  avatar TEXT,
  last_seen TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (team_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_team_presence_team ON team_presence (team_id, last_seen);
