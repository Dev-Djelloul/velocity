#!/bin/bash
# Restaure d'un coup tous les secrets du Worker "velocity-launch" à partir de
# backend/.dev.vars (jamais commité, voir .gitignore : ".dev.vars*"). Utile si les
# secrets disparaissent à nouveau après un déploiement — au lieu de repasser 20 minutes
# à retrouver chaque valeur manuellement, une seule commande les remet tous en place.
#
# Usage :
#   1. Copie .dev.vars.example vers .dev.vars et remplis chaque valeur une fois.
#   2. ./restore-secrets.sh

set -e
cd "$(dirname "$0")"

if [ ! -f .dev.vars ]; then
  echo "Fichier .dev.vars introuvable. Copie .dev.vars.example vers .dev.vars et remplis les valeurs d'abord."
  exit 1
fi

while IFS='=' read -r key value; do
  # Ignore les lignes vides, les commentaires, et les clés sans valeur renseignée.
  [ -z "$key" ] && continue
  case "$key" in \#*) continue ;; esac
  [ -z "$value" ] && continue
  echo "→ $key"
  printf '%s' "$value" | npx wrangler secret put "$key" --name velocity-launch
done < .dev.vars

echo "Terminé. Vérification :"
npx wrangler secret list --name velocity-launch
