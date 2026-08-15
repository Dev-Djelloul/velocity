-- Espaces d'équipe : un plan appartient soit à un utilisateur seul (team_id NULL,
-- comportement historique inchangé), soit à une équipe Clerk Organization (team_id =
-- l'id de l'org Clerk, ex: "org_..."). Pas de table "teams" dédiée : Clerk Organizations
-- est déjà la source de vérité pour les membres/rôles/invitations, inutile de dupliquer
-- cette donnée côté D1. On ne stocke que la référence sur les plans qu'elle possède.

ALTER TABLE plans ADD COLUMN team_id TEXT;

CREATE INDEX IF NOT EXISTS idx_plans_team_id ON plans(team_id);
