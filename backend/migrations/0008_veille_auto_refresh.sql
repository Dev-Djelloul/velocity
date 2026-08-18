-- Régénération hebdomadaire automatique de la Veille IA pour les plans qui en ont déjà
-- une, avec notification (email/Slack) uniquement si du contenu nouveau apparaît — évite
-- de spammer chaque semaine si rien n'a changé.

ALTER TABLE notification_prefs ADD COLUMN veille_auto_refresh INTEGER NOT NULL DEFAULT 0;
