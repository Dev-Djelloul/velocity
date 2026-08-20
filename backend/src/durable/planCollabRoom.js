import * as Y from 'yjs'
import { getPlan } from '../lib/db'

const PERSIST_DEBOUNCE_MS = 1500

// Une instance par plan (adressée par idFromName(planId)) : relaie les mises à jour Yjs
// binaires entre tous les clients connectés au même plan, et persiste l'état fusionné en
// Durable Object storage (pas en D1 — c'est un cache de collaboration, pas la source de
// vérité ; la sauvegarde "officielle" reste le bouton Enregistrer existant qui écrit dans
// la table plans). Au tout premier client d'un plan qui n'a jamais eu de session collab,
// on amorce le document Yjs depuis la roadmap actuelle en base pour ne pas repartir vide.
export class PlanCollabRoom {
  constructor(state, env) {
    this.state = state
    this.env = env
    this.doc = new Y.Doc()
    this.sessions = new Map() // WebSocket -> { id, name, color, section }
    this.hydrated = null
    this.persistTimer = null
  }

  async fetch(request) {
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('expected websocket', { status: 400 })
    }
    await this.hydrate(new URL(request.url).searchParams.get('planId'))

    const pair = new WebSocketPair()
    const [client, server] = Object.values(pair)
    server.accept()

    const clientId = crypto.randomUUID().slice(0, 8)
    this.sessions.set(server, { id: clientId, name: '', color: '', section: null })

    server.addEventListener('message', (evt) => this.handleMessage(server, evt.data))
    const cleanup = () => this.handleClose(server)
    server.addEventListener('close', cleanup)
    server.addEventListener('error', cleanup)

    server.send(JSON.stringify({ type: 'init', id: clientId, update: Array.from(Y.encodeStateAsUpdate(this.doc)) }))
    this.broadcastPresence()

    return new Response(null, { status: 101, webSocket: client })
  }

  async hydrate(planId) {
    if (this.hydrated) return this.hydrated
    this.hydrated = (async () => {
      const stored = await this.state.storage.get('ydoc')
      if (stored) {
        Y.applyUpdate(this.doc, new Uint8Array(stored))
        return
      }
      if (planId && this.env.DB) {
        try {
          const plan = await getPlan(this.env, planId)
          if (plan?.roadmap?.sprints) seedRoadmap(this.doc, plan.roadmap)
        } catch { /* amorçage best-effort : une roadmap vide se remplira au premier edit */ }
      }
    })()
    return this.hydrated
  }

  handleMessage(ws, raw) {
    let msg
    try { msg = JSON.parse(raw) } catch { return }
    if (msg.type === 'update') {
      try {
        Y.applyUpdate(this.doc, new Uint8Array(msg.update))
      } catch { return }
      this.relay(ws, { type: 'update', update: msg.update })
      this.schedulePersist()
    } else if (msg.type === 'presence') {
      const session = this.sessions.get(ws)
      if (session) {
        session.name = msg.name || session.name
        session.color = msg.color || session.color
        session.section = msg.section || null
      }
      this.broadcastPresence()
    }
  }

  handleClose(ws) {
    if (!this.sessions.has(ws)) return
    this.sessions.delete(ws)
    this.broadcastPresence()
  }

  relay(sender, payload) {
    const data = JSON.stringify(payload)
    for (const ws of this.sessions.keys()) {
      if (ws === sender) continue
      try { ws.send(data) } catch { /* le close event nettoiera cette session */ }
    }
  }

  broadcastPresence() {
    const peers = [...this.sessions.values()].filter(p => p.name)
    const data = JSON.stringify({ type: 'presence', peers })
    for (const ws of this.sessions.keys()) {
      try { ws.send(data) } catch { /* ignore */ }
    }
  }

  // Debounce simple : le Worker reste actif tant qu'une socket est ouverte, donc ce
  // timer survit entre deux updates rapprochées sans souci de réveil/hibernation.
  schedulePersist() {
    if (this.persistTimer) return
    this.persistTimer = setTimeout(() => {
      this.persistTimer = null
      this.state.storage.put('ydoc', Array.from(Y.encodeStateAsUpdate(this.doc))).catch(() => {})
    }, PERSIST_DEBOUNCE_MS)
  }
}

// Miroir de roadmap.sprints[].stories[] en structure Yjs imbriquée (Y.Array de sprints,
// chacun avec un Y.Array de stories en Y.Map) — même granularité que côté frontend
// (voir frontend/src/lib/collab.js) pour que deux personnes éditant des stories
// différentes, ou des champs différents d'une même story, fusionnent sans s'écraser.
function seedRoadmap(doc, roadmap) {
  const sprintsArr = doc.getArray('sprints')
  if (sprintsArr.length > 0) return
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
