-- Badge "featured" pour la galerie publique. Pas de panneau admin pour l'instant :
-- activé manuellement via wrangler d1 execute, ex.
-- UPDATE plans SET is_featured = 1 WHERE id = 'xxx';
ALTER TABLE plans ADD COLUMN is_featured INTEGER NOT NULL DEFAULT 0;
