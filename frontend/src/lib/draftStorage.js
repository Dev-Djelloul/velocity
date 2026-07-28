const DRAFTS_KEY = 'plp_drafts'

export function saveDraft(formData, draftName = 'Brouillon') {
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

  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts))
  return draft
}

export function getAllDrafts() {
  try {
    const stored = localStorage.getItem(DRAFTS_KEY)
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
  const drafts = getAllDrafts()
  const filtered = drafts.filter(d => d.id !== id)
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(filtered))
}

export function renameDraft(id, newName) {
  const drafts = getAllDrafts()
  const draft = drafts.find(d => d.id === id)
  if (draft) {
    draft.name = newName
    draft.updatedAt = new Date().toISOString()
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts))
  }
  return draft
}

export function generateId() {
  return Math.random().toString(36).substr(2, 9)
}
