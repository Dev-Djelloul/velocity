import { c } from './contentI18n'

const NAMES = ['Marie', 'Thomas', 'Sophie', 'Lucas', 'Emma', 'Nathan', 'Chloé', 'Hugo']

export function generatePersona(market, product, priorities, lang) {
  const persona = c(lang).persona
  const name = NAMES[Math.abs(hashCode(`${product?.name || ''}${market?.segment || ''}`)) % NAMES.length]
  const title = persona.titles[product?.targetUser] || persona.titles.smb
  const painPoints = persona.painPoints[priorities?.focus] || persona.painPoints.acquire
  const goals = persona.goals[priorities?.focus] || persona.goals.acquire

  return { name, title, painPoints, goals }
}

function hashCode(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return hash
}
