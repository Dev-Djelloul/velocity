// Clés localStorage des réglages d'affichage/accessibilité (voir App.jsx) gouvernées par la
// catégorie "Préférences" de la bannière cookies — centralisées ici pour que
// CookieConsentBanner.jsx puisse les purger sur un refus explicite sans dépendre du détail
// de App.jsx, et que App.jsx sache quand (re)persister l'état courant sur un accord.
export const PREFERENCE_STORAGE_KEYS = [
  'plp_lang',
  'plp_theme',
  'plp_timezone',
  'plp_reduce_motion',
  'plp_font_size',
  'plp_high_contrast',
  'plp_date_format',
  'plp_currency'
]

// Événement déclenché quand l'utilisateur vient d'accorder "Préférences" (accepter tout ou
// enregistrer une sélection qui l'inclut) : App.jsx écoute pour sauvegarder immédiatement les
// réglages en cours plutôt que d'attendre le prochain changement effectif de l'utilisateur.
export const PREFERENCES_GRANTED_EVENT = 'plp:preferences-consent-granted'
