const NAMES = ['Marie', 'Thomas', 'Sophie', 'Lucas', 'Emma', 'Nathan', 'Chloé', 'Hugo']

const TITLES = {
  freelancers: 'Independent Consultant',
  smb: 'Operations Manager, SMB',
  enterprise: 'Product Manager, Scale-up',
  niche: 'Specialist Practitioner'
}

const PAIN_POINTS = {
  acquire: ['Struggles to find qualified leads', 'Manual outreach wastes time'],
  retain: ['Users churn after first use', 'Low daily engagement'],
  monetize: ['Hard to justify pricing', 'Low conversion to paid plans']
}

const GOALS = {
  acquire: ['Grow signups predictably', 'Lower cost per acquisition'],
  retain: ['Build a sticky daily habit', 'Reduce churn'],
  monetize: ['Increase revenue per user', 'Convert free users to paid']
}

export function generatePersona(market, product, priorities) {
  const name = NAMES[Math.abs(hashCode(`${product?.name || ''}${market?.segment || ''}`)) % NAMES.length]
  const title = TITLES[product?.targetUser] || TITLES.smb
  const painPoints = PAIN_POINTS[priorities?.focus] || PAIN_POINTS.acquire
  const goals = GOALS[priorities?.focus] || GOALS.acquire

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
