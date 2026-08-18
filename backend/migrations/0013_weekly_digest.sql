-- Résumé hebdomadaire par email/Slack pour les plans ACTIFS (par opposition au rappel
-- d'inactivité, qui cible les plans à l'arrêt). Opt-in comme les autres préférences
-- optionnelles (contrairement à mentions, activée par défaut) : c'est un digest récurrent,
-- pas une alerte ciblée.
ALTER TABLE notification_prefs ADD COLUMN weekly_digest INTEGER NOT NULL DEFAULT 0;
