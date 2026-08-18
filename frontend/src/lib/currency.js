const CURRENCY_KEY = 'plp_currency'

// Préférence d'affichage uniquement — change le symbole/format, PAS de conversion de
// taux de change. Un plan chiffré à "10 000" reste "10 000" quelle que soit la devise
// choisie ; seul le symbole et sa position (avant/après le nombre) changent.
const SYMBOLS = { EUR: '€', USD: '$', GBP: '£' }

export function getCurrency() {
  return localStorage.getItem(CURRENCY_KEY) || 'EUR'
}

export function setCurrency(code) {
  localStorage.setItem(CURRENCY_KEY, code || 'EUR')
}

// Formate un montant avec le symbole de la devise choisie (EUR après le nombre, à la
// française ; USD/GBP avant, comme en anglais) — cohérent avec l'usage existant "1 000 €".
export function formatMoney(amount) {
  const n = Number(amount)
  const value = Number.isFinite(n) ? n.toLocaleString('fr-FR') : amount
  const currency = getCurrency()
  const symbol = SYMBOLS[currency] || SYMBOLS.EUR
  return currency === 'EUR' ? `${value} ${symbol}` : `${symbol}${value}`
}

export function currencySymbol() {
  return SYMBOLS[getCurrency()] || SYMBOLS.EUR
}
