# Soumission Google Play — VelocityLaunch AI

Note privée locale, jamais commitée (même logique que les autres docs de
suivi de lancement retirés du repo public).

## Statut au 24/08/2026

L'app est techniquement prête. Il ne manque que le compte développeur.

| Étape | Statut |
|---|---|
| Projet Android TWA généré (Bubblewrap) | ✅ Fait |
| Clé de signature créée | ✅ Fait (voir `android-twa/KEYSTORE_CREDENTIALS.txt` — **jamais perdre ce fichier**) |
| App Bundle signé | ✅ Fait — `android-twa/app-release-bundle.aab` |
| Vérification de domaine (assetlinks.json) | ✅ Déployé en prod |
| Page de confidentialité publique | ✅ Déployée — https://velocity.digitalblueskye.com/confidentialite |
| Compte développeur Google Play | ⏳ En attente — paiement prévu d'ici le **05/09/2026** |
| Captures d'écran | ⏳ À faire |
| Description courte/longue | ⏳ À faire |
| Catégorie de l'app | ⏳ À faire |
| Upload de l'.aab dans Play Console | ⏳ À faire (une fois le compte validé) |

## Infos techniques de l'app

- **Package ID** : `com.digitalblueskye.velocitylaunch`
- **Nom affiché** : VelocityLaunch AI
- **Icône store** : `android-twa/store_icon.png`
- **Compte Google Play** : https://play.google.com/console/signup (25$ à vie, une fois)

## Pour reconstruire l'App Bundle plus tard

```bash
cd android-twa
export BUBBLEWRAP_KEYSTORE_PASSWORD='<voir KEYSTORE_CREDENTIALS.txt>'
export BUBBLEWRAP_KEY_PASSWORD='<voir KEYSTORE_CREDENTIALS.txt>'
npx @bubblewrap/cli build
```

## Prochaine étape

Une fois le compte Play Console validé : prévenir Claude pour lancer
l'upload de l'.aab et remplir la fiche store (captures, description,
catégorie).
