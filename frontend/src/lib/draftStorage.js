import { fetchDrafts, pushDraft, removeDraft } from './serverStorage'

let activeUserId = null

export function setActiveUser(userId) {
  activeUserId = userId
}

// Clé scopée par utilisateur (même principe que creditTracker.js / planStorage.js) —
// sans ça, tous les comptes connectés sur ce navigateur partagent les mêmes brouillons.
function draftsKey(userId) {
  return `plp_drafts_${userId}`
}

export function saveDraft(formData, draftName = 'Brouillon') {
  if (!activeUserId) return null
  const drafts = getAllDrafts()
  const draftId = formData.id || generateId()
  const draft = {
    id: draftId,
    name: draftName,
    data: formData,
    savedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  const existing = drafts.findIndex(d => d.id === draftId)
  if (existing >= 0) {
    drafts[existing] = draft
  } else {
    drafts.push(draft)
  }

  localStorage.setItem(draftsKey(activeUserId), JSON.stringify(drafts))
  pushDraft(activeUserId, draft)
  return draft
}

// Hydrate le cache local depuis le serveur (multi-appareil) — appelé au login.
// Écrase toujours le cache local (même si le serveur renvoie une liste vide) pour
// qu'un nouveau compte ne se retrouve jamais avec les brouillons d'un compte précédent.
export async function syncDraftsFromServer(userId) {
  const serverDrafts = await fetchDrafts(userId)
  localStorage.setItem(draftsKey(userId), JSON.stringify(serverDrafts || []))
}

export function getAllDrafts() {
  if (!activeUserId) return []
  try {
    const stored = localStorage.getItem(draftsKey(activeUserId))
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function getDraftById(id) {
  const drafts = getAllDrafts()
  return drafts.find(d => d.id === id)
}

export function deleteDraft(id) {
  if (!activeUserId) return
  const drafts = getAllDrafts()
  const filtered = drafts.filter(d => d.id !== id)
  localStorage.setItem(draftsKey(activeUserId), JSON.stringify(filtered))
  removeDraft(activeUserId, id)
}

export function renameDraft(id, newName) {
  if (!activeUserId) return null
  const drafts = getAllDrafts()
  const draft = drafts.find(d => d.id === id)
  if (draft) {
    draft.name = newName
    draft.updatedAt = new Date().toISOString()
    localStorage.setItem(draftsKey(activeUserId), JSON.stringify(drafts))
    pushDraft(activeUserId, draft)
  }
  return draft
}

export function generateId() {
  return Math.random().toString(36).substr(2, 9)
}
