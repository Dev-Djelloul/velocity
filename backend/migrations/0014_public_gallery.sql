-- Galerie publique de plans (opt-in) : is_public mirrore le champ plan.isPublic présent
-- dans le JSON (data), maintenu à jour à chaque upsertPlan — colonne dédiée plutôt qu'un
-- json_extract sur data à chaque requête de la galerie, qui tournerait en table scan complet.
ALTER TABLE plans ADD COLUMN is_public INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_plans_public ON plans(is_public);
