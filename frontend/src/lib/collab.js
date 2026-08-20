import * as Y from 'yjs'

// Même hôte que les autres appels serveur (voir serverStorage.js), juste en ws(s)://
// au lieu de http(s):// — le Worker Cloudflare répond aux deux sur la même route.
const WS_BASE = (import.meta.env.VITE_BACKEND_URL || '').replace(/^http/, 'ws')

const PRESENCE_COLORS = ['#f97316', '#22c55e', '#3b82f6', '#ec4899', '#a855f7', '#14b8a6', '#eab308', '#ef4444']

function colorFor(seed) {
  let hash = 0
  const s = String(seed || 'x')
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) | 0
  return PRESENCE_COLORS[Math.abs(hash) % PRESENCE_COLORS.length]
}

// Traduit roadmap.sprints (JSON plain) en structure Yjs partagée à granularité story —
// Y.Array de sprints, chacun avec un Y.Array de stories en Y.Map — pour que deux
// personnes éditant des stories différentes (ou des champs différents d'une même story)
// fusionnent leurs changements au lieu de s'écraser. N'amorce que si le doc est vide :
// un doc déjà peuplé (par un pair déjà connecté, ou restauré côté Durable Object) est
// la source de vérité, pas le state local qu'on avait avant de se connecter.
export function seedDocFromRoadmap(doc, roadmap) {
  const sprintsArr = doc.getArray('sprints')
  if (sprintsArr.length > 0 || !roadmap?.sprints?.length) return
  doc.transact(() => {
    roadmap.sprints.forEach(sp => {
      const sprintMap = new Y.Map()
      sprintMap.set('sprintId', sp.sprintId)
      sprintMap.set('duration', sp.duration)
      sprintMap.set('estimatedCost', sp.estimatedCost)
      sprintMap.set('risks', sp.risks || [])
      const storiesArr = new Y.Array()
      ;(sp.stories || []).forEach(story => {
        const storyMap = new Y.Map()
        Object.entries(story).forEach(([k, v]) => storyMap.set(k, v))
        storiesArr.push([storyMap])
      })
      sprintMap.set('stories', storiesArr)
      sprintsArr.push([sprintMap])
    })
  })
}

export function roadmapFromDoc(doc, fallback) {
  const sprintsArr = doc.getArray('sprints')
  if (sprintsArr.length === 0) return fallback
  return {
    ...fallback,
    sprints: sprintsArr.toArray().map(sprintMap => ({
      sprintId: sprintMap.get('sprintId'),
      duration: sprintMap.get('duration'),
      estimatedCost: sprintMap.get('estimatedCost'),
      risks: sprintMap.get('risks') || [],
      stories: sprintMap.get('stories').toArray().map(storyMap => storyMap.toJSON())
    }))
  }
}

function findStoryEntry(doc, storyId) {
  for (const sprintMap of doc.getArray('sprints').toArray()) {
    const storiesArr = sprintMap.get('stories')
    const list = storiesArr.toArray()
    const idx = list.findIndex(storyMap => storyMap.get('id') === storyId)
    if (idx !== -1) return { storiesArr, idx, storyMap: list[idx] }
  }
  return null
}

function findSprintMap(doc, sprintId) {
  return doc.getArray('sprints').toArray().find(sp => sp.get('sprintId') === sprintId)
}

// Traduit une mutation locale de `roadmap` (déjà calculée par les composants existants :
// BacklogCard, RoadmapCard, GanttChart, AgentActivity) en opérations Yjs ciblées, plutôt
// que de remplacer tout le document — remplacer tout annulerait l'intérêt du CRDT (deux
// remplacements concurrents s'écrasent exactement comme le JSON brut le fait déjà).
export function applyRoadmapDiff(doc, prevRoadmap, nextRoadmap) {
  if (!nextRoadmap?.sprints) return
  const prevById = new Map()
  ;(prevRoadmap?.sprints || []).forEach(sp => (sp.stories || []).forEach(s => prevById.set(s.id, { ...s, sprintId: sp.sprintId })))
  const nextById = new Map()
  nextRoadmap.sprints.forEach(sp => (sp.stories || []).forEach(s => nextById.set(s.id, { ...s, sprintId: sp.sprintId })))

  doc.transact(() => {
    for (const [id, story] of nextById) {
      const prev = prevById.get(id)
      if (!prev) continue // création de story : hors scope de cette itération (régénération rare, pas d'édition concurrente typique)
      if (prev.sprintId !== story.sprintId) {
        const found = findStoryEntry(doc, id)
        const targetSprint = findSprintMap(doc, story.sprintId)
        if (found && targetSprint) {
          found.storiesArr.delete(found.idx, 1)
          const clone = new Y.Map()
          Object.entries(story).forEach(([k, v]) => { if (k !== 'sprintId') clone.set(k, v) })
          targetSprint.get('stories').push([clone])
        }
        continue
      }
      const found = findStoryEntry(doc, id)
      if (!found) continue
      Object.entries(story).forEach(([k, v]) => {
        if (k === 'sprintId') return
        const current = found.storyMap.get(k)
        if (JSON.stringify(current) !== JSON.stringify(v)) found.storyMap.set(k, v)
      })
    }
  })
}

// Ouvre la connexion WebSocket vers la Durable Object du plan (voir
// backend/src/durable/planCollabRoom.js) et maintient un Y.Doc synchronisé. Reconnexion
// automatique (délai fixe, suffisant vu l'usage attendu : quelques personnes par plan).
export function connectCollab(planId, { onRoadmap, onPresence, onReady } = {}) {
  const doc = new Y.Doc()
  if (!WS_BASE || !planId) return { doc, sendPresence: () => {}, close: () => {}, clientId: null }

  let ws = null
  let closed = false
  let clientId = null

  const connect = () => {
    if (closed) return
    try {
      ws = new WebSocket(`${WS_BASE}/collab/${encodeURIComponent(planId)}`)
    } catch {
      setTimeout(connect, 3000)
      return
    }
    ws.addEventListener('message', (evt) => {
      let msg
      try { msg = JSON.parse(evt.data) } catch { return }
      if (msg.type === 'init') {
        clientId = msg.id
        Y.applyUpdate(doc, new Uint8Array(msg.update), 'remote')
        onRoadmap?.(doc)
        onReady?.()
      } else if (msg.type === 'update') {
        Y.applyUpdate(doc, new Uint8Array(msg.update), 'remote')
        onRoadmap?.(doc)
      } else if (msg.type === 'presence') {
        onPresence?.((msg.peers || []).filter(p => p.id !== clientId))
      }
    })
    ws.addEventListener('close', () => { if (!closed) setTimeout(connect, 2500) })
    ws.addEventListener('error', () => { try { ws.close() } catch { /* ignore */ } })
  }
  connect()

  doc.on('update', (update, origin) => {
    if (origin === 'remote') return // évite de renvoyer au serveur ce qu'il vient d'envoyer
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'update', update: Array.from(update) }))
    }
  })

  const sendPresence = (name, section) => {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'presence', name, color: colorFor(clientId || name), section }))
    }
  }

  const close = () => {
    closed = true
    try { ws?.close() } catch { /* ignore */ }
  }

  return { doc, sendPresence, close, get clientId() { return clientId } }
}
