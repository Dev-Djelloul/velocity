-- team_id du plan concerné, pour que le clic sur une notification puisse basculer vers
-- le bon espace avant d'ouvrir le plan (même mécanisme que les notifications de
-- commentaires existantes, voir handleOpenNotification côté frontend).
ALTER TABLE notification_feed ADD COLUMN team_id TEXT;
