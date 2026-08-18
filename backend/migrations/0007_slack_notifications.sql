-- Notifications Slack (Incoming Webhook, pas d'OAuth) : l'utilisateur crée son propre
-- webhook dans Slack (Apps > Incoming Webhooks) et colle l'URL dans Paramètres. L'activation
-- est un toggle séparé de l'email, pour pouvoir choisir un seul canal ou les deux.

ALTER TABLE notification_prefs ADD COLUMN slack_webhook_url TEXT;
ALTER TABLE notification_prefs ADD COLUMN slack_enabled INTEGER NOT NULL DEFAULT 0;
