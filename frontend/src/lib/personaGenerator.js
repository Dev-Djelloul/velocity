import { c } from './contentI18n'

const NAMES = ['Marie', 'Thomas', 'Sophie', 'Lucas', 'Emma', 'Nathan', 'Chloé', 'Hugo']
const GENDERS = ['female', 'male', 'female', 'male', 'female', 'male', 'female', 'male']

export function generatePersona(market, product, priorities, lang) {
  const persona = c(lang).persona
  const nameIdx = Math.abs(hashCode(`${product?.name || ''}${market?.segment || ''}`)) % NAMES.length
  const name = NAMES[nameIdx]
  const gender = GENDERS[nameIdx]
  const targetUser = product?.targetUser
  const focus = priorities?.focus
  const title = persona.titles[targetUser] || persona.titles.smb
  const ageRange = persona.ageRanges[targetUser] || persona.ageRanges.smb
  const context = persona.contexts[targetUser] || persona.contexts.smb
  const preferredChannel = persona.preferredChannels[targetUser] || persona.preferredChannels.smb
  const painPoints = persona.painPoints[focus] || persona.painPoints.acquire
  const goals = persona.goals[focus] || persona.goals.acquire
  const quote = persona.quotes[focus] || persona.quotes.acquire
  const buyingTrigger = persona.buyingTriggers[focus] || persona.buyingTriggers.acquire

  return { name, gender, title, ageRange, context, painPoints, goals, quote, preferredChannel, buyingTrigger }
}

function hashCode(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return hash
}
