// Attend qu'une connexion OAuth (via popup) aboutisse, en pollant le statut.
// Partagé entre ExportModal (export page Notion/Jira) et BacklogCard (sync Notion par story).
export function waitForConnection(statusFn, userId, popup) {
  return new Promise((resolve) => {
    let elapsed = 0
    const timer = setInterval(async () => {
      elapsed += 2000
      const status = await statusFn(userId)
      if (status?.connected) {
        clearInterval(timer)
        try { popup && popup.close() } catch { /* cross-origin */ }
        resolve(true)
      } else if (elapsed >= 120000 || (popup && popup.closed)) {
        clearInterval(timer)
        resolve(false)
      }
    }, 2000)
  })
}
