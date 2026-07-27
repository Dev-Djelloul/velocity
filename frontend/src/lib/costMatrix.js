export const costMatrix = {
  product: { design: 300, frontend: 250, backend: 400, qa: 150 },
  marketing: { content: 100, video: 500, design: 200, paid_ad: 1000 },
  ops: { analytics: 150, community: 100 }
}

export function costFor(category, type) {
  return costMatrix[category]?.[type] ?? 200
}
