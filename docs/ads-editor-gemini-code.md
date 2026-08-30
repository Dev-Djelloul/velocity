# Correctif Export CSV Google Ads Editor — Velocity Launch

## Problème identifié
Le fichier CSV exporté par Velocity Launch pose des soucis lors de l'import direct dans **Google Ads Editor** :
1. **Titres d'Ad Groups trop longs :** Les descriptions de ciblage sont placées dans la colonne `Ad group`, générant des erreurs de format.
2. **Absence de granularité Mots-clés & Annonces :** Le CSV ne crée que la structure haute (Campagnes), ce qui donne des campagnes "coquilles vides" sans mots-clés ni annonces.
3. **Paramètres de conformité manquants :** Manque de la déclaration par défaut sur les annonces politiques pour l'UE (`EU Political Ads`).

---

## Spécifications de la correction

Mettre à jour le générateur CSV / prompt de génération backend pour que l'export respecte strictement les règles de formatage de Google Ads Editor.

### 1. Structure du CSV (En-têtes requis)
Chaque export doit générer un CSV UTF-8 contenant la structure d'en-têtes suivante :

```csv
Campaign,Campaign Type,Campaign Daily Budget,Start Date,End Date,Ad Group,Ad Group Status,Criterion Type,Keyword,Headline 1,Headline 2,Headline 3,Description 1,Description 2,Final URL,EU Political Ads