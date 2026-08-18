-- @mentions dans les commentaires d'un plan : notification ciblée (email/Slack) à la
-- personne mentionnée. Activée par défaut (1) contrairement aux autres préférences —
-- être mentionné nommément est un signal fort, pas un digest qu'on choisit d'activer.
ALTER TABLE notification_prefs ADD COLUMN mentions INTEGER NOT NULL DEFAULT 1;
