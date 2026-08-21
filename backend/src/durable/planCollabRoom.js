import * as Y from 'yjs'
import { getPlan, getPlanOwnerAndTeam, createNotification } from '../lib/db'
import { listOrganizationMembers } from '../lib/clerk'

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
    this.planId = null
    this.ownerId = null
    this.teamId = null
    this.lang = 'fr'
    this.pendingEditors = new Map() // userId -> name (Map, pas Set : il faut les deux)
    this.pendingDetails = [] // textes précis (diffRoadmapItems côté client) accumulés depuis le dernier envoi
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
    this.sessions.set(server, { id: clientId, name: '', avatar: null, color: '', section: null, userId: null })

    server.addEventListener('message', (evt) => this.handleMessage(server, evt.data))
    const cleanup = () => this.handleClose(server)
    server.addEventListener('close', cleanup)
    server.addEventListener('error', cleanup)

    server.send(JSON.stringify({ type: 'init', id: clientId, update: Array.from(Y.encodeStateAsUpdate(this.doc)) }))
    this.broadcastPresence()

    return new Response(null, { status: 101, webSocket: client })
  }

  async hydrate(planId) {
    this.planId = planId || this.planId
    if (this.hydrated) return this.hydrated
    this.hydrated = (async () => {
      if (planId && this.env.DB) {
        try {
          const owner = await getPlanOwnerAndTeam(this.env, planId)
          this.ownerId = owner.userId
          this.teamId = owner.teamId
          const plan = await getPlan(this.env, planId)
          this.lang = plan?.language || 'fr'
          const stored = await this.state.storage.get('ydoc')
          if (stored) {
            Y.applyUpdate(this.doc, new Uint8Array(stored))
          } else if (plan?.roadmap?.sprints) {
            seedRoadmap(this.doc, plan.roadmap)
          }
        } catch { /* amorçage best-effort : une roadmap vide se remplira au premier edit */ }
      }
    })()
    return this.hydrated
  }

  handleMessage(ws, raw) {
    let msg
    try { msg = JSON.parse(raw) } catch { return }
    if (msg.type === 'ping') {
      try { ws.send(JSON.stringify({ type: 'pong' })) } catch { /* la socket sera nettoyée au close */ }
    } else if (msg.type === 'update') {
      try {
        Y.applyUpdate(this.doc, new Uint8Array(msg.update))
      } catch { return }
      const session = this.sessions.get(ws)
      const editorName = msg.name || session?.name || null
      const editorUserId = msg.userId || session?.userId || null
      this.relay(ws, { type: 'update', update: msg.update, name: editorName })
      // Un simple nom ne suffit pas à exclure l'auteur·e de la notification qu'il/elle
      // vient de déclencher (deux personnes peuvent partager un prénom) : on garde le
      // vrai userId Clerk, envoyé avec chaque update (voir frontend/src/lib/collab.js).
      if (editorUserId) this.pendingEditors.set(editorUserId, editorName || editorUserId)
      if (msg.detail && !this.pendingDetails.includes(msg.detail)) this.pendingDetails.push(msg.detail)
      this.schedulePersist()
    } else if (msg.type === 'presence') {
      const session = this.sessions.get(ws)
      if (session) {
        session.name = msg.name || session.name
        session.avatar = msg.avatar || null
        session.color = msg.color || session.color
        session.section = msg.section || null
        session.userId = msg.userId || session.userId
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
      this.notifyOwnerOfEdits()
    }, PERSIST_DEBOUNCE_MS)
  }

  // Une seule notification groupée par rafale d'édits (pas une par update Yjs, ce qui
  // spammerait pour une simple frappe continue), envoyée à tout le monde SAUF les
  // auteur·es identifié·es par leur vrai userId — jamais juste "le propriétaire du plan" :
  // sur un plan d'équipe, `user_id` (colonne plans) ne désigne qu'un membre arbitraire
  // (souvent qui a créé le plan), pas "la bonne personne à notifier" pour les autres
  // membres qui éditent aussi ce même plan. Volontairement pas conditionné à "au moins
  // deux sessions connectées en ce moment" : c'est justement quand le/la destinataire
  // n'est plus là pour voir l'édition en direct que la notification lui est utile.
  async notifyOwnerOfEdits() {
    const editors = [...this.pendingEditors.entries()] // [userId, name][]
    const details = this.pendingDetails.slice(0, 4)
    this.pendingEditors.clear()
    this.pendingDetails = []
    if (!editors.length || !this.env.DB) return
    const editorIds = new Set(editors.map(([id]) => id))
    const names = editors.slice(0, 3).map(([, name]) => name).join(', ') + (editors.length > 3 ? '…' : '')
    const title = this.lang === 'en' ? `${names} edited the roadmap` : `${names} a modifié la roadmap`
    // Même texte que le panneau Historique (voir diffRoadmapItems côté client) plutôt
    // qu'un générique "a modifié la roadmap" — le détail concret de ce qui a changé.
    const detail = details.length ? details.join(' · ') : null

    let recipients = []
    if (this.teamId) {
      try {
        const members = await listOrganizationMembers(this.env, this.teamId)
        recipients = members.map(m => m.userId).filter(id => !editorIds.has(id))
      } catch { /* Clerk indisponible : repli sur le propriétaire ci-dessous */ }
    }
    if (!recipients.length && this.ownerId && !editorIds.has(this.ownerId)) {
      recipients = [this.ownerId]
    }
    if (!recipients.length) return

    try {
      await Promise.all(recipients.map(userId => createNotification(this.env, {
        userId,
        type: 'roadmap_collab',
        title,
        detail,
        planId: this.planId,
        teamId: this.teamId
      })))
    } catch (e) { console.log(`[collab-notify] createNotification failed: ${e.message}`) }
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
