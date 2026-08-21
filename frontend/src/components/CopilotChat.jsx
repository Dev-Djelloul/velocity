import { useState, useRef, useEffect } from 'react'
import { copilotChat, fetchCopilotConversations, fetchCopilotConversation, pushCopilotConversation, deleteCopilotConversation } from '../lib/serverStorage'
import { t } from '../lib/i18n'
import { formatDateTime } from '../lib/dateFormat'
import { IconX, IconSend, IconTrash, IconCopy, IconCheckCircle, IconMinus, IconChevronDown, IconSearch, IconPlus } from './Icons'
import '../styles/CopilotChat.css'

const NOVA_AVATAR = '/assets/icons/icons8-woman-32.png'

function conversationTitle(messages, lang) {
  const firstUser = messages.find(m => m.role === 'user')
  if (!firstUser) return t(lang, 'copilot.newConversation')
  return firstUser.content.length > 60 ? `${firstUser.content.slice(0, 60)}…` : firstUser.content
}

// Regroupe les fils par récence (façon Cloudflare AI) — Aujourd'hui / 7 derniers jours /
// Plus ancien, calculé côté client sur updatedAt plutôt que côté serveur : la liste est déjà
// légère (pas les messages complets, voir db.listCopilotConversations), pas besoin d'un
// aller-retour dédié juste pour ce découpage.
function groupConversations(list) {
  const now = new Date()
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekAgo = new Date(startToday)
  weekAgo.setDate(weekAgo.getDate() - 7)
  const groups = { today: [], week: [], older: [] }
  for (const c of list) {
    const d = new Date(c.updatedAt)
    if (d >= startToday) groups.today.push(c)
    else if (d >= weekAgo) groups.week.push(c)
    else groups.older.push(c)
  }
  return groups
}

function greeting(lang) {
  const hour = new Date().getHours()
  const period = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'
  return t(lang, 'copilot.greeting')[period]
}

// Copilote IA conversationnel : chat flottant qui laisse l'utilisateur itérer sur son plan
// en langage naturel. Le backend (/copilot/chat) renvoie une réponse conversationnelle et,
// le cas échéant, la valeur complète mise à jour de chaque section du plan concernée —
// appliquées ici via onApplyChanges (fourni par PlanViewer), qui les fait passer par le
// même circuit markChanged()/pendingChanges que toute autre édition : rien n'est jamais
// enregistré silencieusement, l'utilisateur garde la main via le bouton "Enregistrer".
export default function CopilotChat({ plan, lang, userId, onApplyChanges, onHistoryChange, toggleSignal }) {
  const [open, setOpen] = useState(false)
  // Repris depuis plan.copilotHistory (voir updateCopilotHistory dans PlanViewer.jsx) —
  // survit à un rechargement de page ou à un changement de plan, contrairement à un simple
  // état local. Lazy init : ne lit plan.copilotHistory qu'au montage, pas à chaque re-render.
  const [messages, setMessages] = useState(() => plan.copilotHistory || [])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState(null)
  // Fil actif de l'historique multi-conversations (voir backend/migrations/0020) — null tant
  // qu'aucun message n'a encore été envoyé sur ce fil (assigné au premier envoi, voir
  // persistConversation). Un ref miroir évite de recréer persistConversation/send à chaque
  // changement d'id juste pour capturer sa valeur courante dans les closures async.
  const [conversationId, setConversationId] = useState(null)
  const conversationIdRef = useRef(null)
  useEffect(() => { conversationIdRef.current = conversationId }, [conversationId])
  const [historyOpen, setHistoryOpen] = useState(false)
  const [conversations, setConversations] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyQuery, setHistoryQuery] = useState('')
  const listRef = useRef(null)
  const textareaRef = useRef(null)
  const suggestionRefs = useRef([])
  const panelRef = useRef(null)
  const historyRef = useRef(null)

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages, open, busy])

  // Persiste la conversation affichée sur le plan à chaque changement (voir onHistoryChange
  // dans PlanViewer.jsx) — sauf au montage, où `messages` vient déjà de plan.copilotHistory
  // et le resauvegarder serait un aller-retour inutile. plan.copilotHistory n'est plus une
  // "archive" à préserver : depuis l'historique multi-fils (copilot_conversations, voir
  // persistConversation), le fil qu'on quitte est déjà sauvegardé et consultable depuis le
  // panneau d'historique — ce miroir ne sert plus qu'à réafficher au rechargement LE FIL
  // ACTUELLEMENT VISIBLE, vide ou non. Un vidage (fermeture, nouvelle conversation) doit donc
  // se propager normalement, sans quoi le bouton "Fermer" semblait ne rien faire : à la
  // reconnexion, l'ancienne conversation revenait quand même (retour utilisateur).
  const isFirstMessagesRender = useRef(true)
  useEffect(() => {
    if (isFirstMessagesRender.current) { isFirstMessagesRender.current = false; return }
    onHistoryChange?.(messages)
  }, [messages])

  // Fermer (croix) diffère désormais de Réduire (−) : ferme ET repart sur une conversation
  // vierge à la prochaine ouverture — pense "classer cette conversation" (déjà archivée dans
  // l'historique multi-fils), pas "la supprimer".
  const closeAndReset = () => {
    setMessages([])
    setConversationId(null)
    setOpen(false)
  }

  // "+ Nouvelle conversation" (en-tête ou panneau d'historique) : le fil en cours est déjà
  // persisté à chaque échange (voir persistConversation), rien à sauvegarder explicitement
  // ici — juste repartir à vide sur un nouvel id.
  const startNewConversation = () => {
    setMessages([])
    setConversationId(null)
    setHistoryOpen(false)
  }

  // Enregistre le fil courant côté serveur à chaque échange (voir send()) — id généré au
  // premier message plutôt qu'à l'ouverture du panneau, pour ne jamais créer de fils vides
  // en base juste parce que l'utilisateur a ouvert puis refermé Nova sans rien écrire.
  const persistConversation = (msgs) => {
    if (!plan.id || !userId || !msgs.length) return
    let id = conversationIdRef.current
    if (!id) {
      id = crypto.randomUUID()
      conversationIdRef.current = id
      setConversationId(id)
    }
    pushCopilotConversation(userId, plan.id, { id, title: conversationTitle(msgs, lang), messages: msgs })
  }

  const refreshConversations = () => {
    if (!plan.id) return
    setHistoryLoading(true)
    fetchCopilotConversations(plan.id).then(list => {
      setConversations(list || [])
      setHistoryLoading(false)
    })
  }

  useEffect(() => {
    if (historyOpen) refreshConversations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyOpen])

  // Clic en dehors du panneau d'historique déroulé (mais toujours dans la fenêtre Nova) pour
  // le refermer — comme un menu classique, sans avoir à cliquer précisément sur le bouton
  // qui l'a ouvert.
  useEffect(() => {
    if (!historyOpen) return
    const onClickOutside = (e) => {
      if (historyRef.current && !historyRef.current.contains(e.target)) setHistoryOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [historyOpen])

  const openConversation = async (id) => {
    const conv = await fetchCopilotConversation(id)
    if (conv) {
      setMessages(conv.messages || [])
      setConversationId(id)
    }
    setHistoryOpen(false)
  }

  const removeConversation = (id, e) => {
    e.stopPropagation()
    deleteCopilotConversation(userId, id)
    setConversations(prev => prev.filter(c => c.id !== id))
    if (id === conversationId) {
      setMessages([])
      setConversationId(null)
    }
  }

  const filteredGroups = groupConversations(
    historyQuery.trim()
      ? conversations.filter(c => (c.title || '').toLowerCase().includes(historyQuery.trim().toLowerCase()))
      : conversations
  )

  // ⌘K/Ctrl+K est géré au niveau de App.jsx (seul endroit qui sait naviguer vers la page du
  // plan depuis n'importe où dans l'app) — toggleSignal change à chaque pression, on bascule
  // le panneau en réaction plutôt que d'écouter le raccourci ici, ce qui doublerait le
  // basculement quand ce composant est déjà monté. Le premier rendu (toggleSignal=0/undefined)
  // ne doit rien ouvrir.
  const firstToggle = useRef(true)
  useEffect(() => {
    if (firstToggle.current) { firstToggle.current = false; return }
    setOpen(o => !o)
  }, [toggleSignal])

  // Échap referme le panneau localement (n'a de sens que quand il est déjà monté et ouvert).
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  // Focus le champ de saisie à l'ouverture, pour pouvoir taper immédiatement après ⌘K.
  useEffect(() => {
    if (open && textareaRef.current) textareaRef.current.focus()
  }, [open])

  // Sur iOS Safari, un panneau position:fixed dimensionné en vh (voir CopilotChat.css) ne
  // suit pas correctement le clavier virtuel : vh reste basé sur le viewport de mise en page
  // (inchangé par le clavier), donc le panneau se retrouve visuellement écrasé/coupé au lieu
  // d'être repoussé proprement au-dessus (constaté, persiste même après un correctif ciblé
  // sur bottom/height uniquement quand un clavier est détecté — abandonné). Solution plus
  // radicale et fiable : sur mobile, le panneau devient plein écran (voir .copilot-panel en
  // media query) et ses coordonnées (top/left/width/height) sont recalées EN PERMANENCE,
  // tant qu'il est ouvert, sur window.visualViewport — la seule source qui reflète l'espace
  // réellement visible à tout instant (avec ou sans clavier), contrairement à vh/dvh.
  useEffect(() => {
    if (!open) return
    const vv = window.visualViewport
    const panel = panelRef.current
    if (!vv || !panel) return

    const reset = () => {
      panel.style.top = ''
      panel.style.left = ''
      panel.style.width = ''
      panel.style.height = ''
      panel.style.maxHeight = ''
    }

    const update = () => {
      if (window.innerWidth > 640) { reset(); return }
      panel.style.top = `${vv.offsetTop}px`
      panel.style.left = `${vv.offsetLeft}px`
      panel.style.width = `${vv.width}px`
      panel.style.height = `${vv.height}px`
      panel.style.maxHeight = `${vv.height}px`
    }

    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
      reset()
    }
  }, [open])

  const focusSuggestion = (index, total) => {
    const wrapped = (index + total) % total
    suggestionRefs.current[wrapped]?.focus()
  }

  const handleSuggestionKeyDown = (e, index, total) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      focusSuggestion(index + 1, total)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      focusSuggestion(index - 1, total)
    }
  }

  // Auto-grandit avec le contenu jusqu'à une limite (voir max-height en CSS) plutôt qu'un
  // nombre de lignes fixe — plus confortable pour taper une demande un peu détaillée sans
  // que le textarea reste minuscule ni que le panneau entier gonfle sans limite.
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [input])

  const send = async (text) => {
    const value = (text ?? input).trim()
    if (!value || busy) return
    const history = messages.map(m => ({ role: m.role, content: m.content }))
    const afterUser = [...messages, { role: 'user', content: value, createdAt: new Date().toISOString() }]
    setMessages(afterUser)
    setInput('')
    setBusy(true)
    let finalMessages = afterUser
    try {
      const result = await copilotChat(plan, value, history, lang, userId)
      const assistantMsg = !result
        ? { role: 'assistant', content: t(lang, 'copilot.error'), error: true, createdAt: new Date().toISOString() }
        : (() => {
            const changesCount = result.changes?.length || 0
            if (changesCount) onApplyChanges?.(result.changes)
            const note = changesCount ? `${changesCount} ${t(lang, 'copilot.changesApplied')}` : null
            return { role: 'assistant', content: result.reply || '', note, createdAt: new Date().toISOString() }
          })()
      finalMessages = [...afterUser, assistantMsg]
      setMessages(finalMessages)
    } catch {
      finalMessages = [...afterUser, { role: 'assistant', content: t(lang, 'copilot.error'), error: true, createdAt: new Date().toISOString() }]
      setMessages(finalMessages)
    } finally {
      setBusy(false)
      persistConversation(finalMessages)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (!e.shiftKey || e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      send()
    }
  }

  const copyReply = (text, i) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(i)
      setTimeout(() => setCopiedIndex(null), 1500)
    }).catch(() => {})
  }

  const suggestions = t(lang, 'copilot.suggestions')

  return (
    <>
      <button type="button" className="copilot-fab" onClick={() => setOpen(o => !o)} title={t(lang, 'copilot.openTooltip')}>
        <img className="copilot-avatar" src={NOVA_AVATAR} alt="" />
        <span>{t(lang, 'copilot.openButton')}</span>
      </button>

      {open && (
        <div className="copilot-panel" ref={panelRef}>
          <div className="copilot-panel-header" ref={historyRef}>
            <button
              type="button"
              className={`copilot-panel-title copilot-history-toggle ${historyOpen ? 'is-open' : ''}`}
              onClick={() => setHistoryOpen(v => !v)}
            >
              <img className="copilot-avatar" src={NOVA_AVATAR} alt="" />
              <span className="copilot-history-toggle-label">{messages.length ? conversationTitle(messages, lang) : t(lang, 'copilot.title')}</span>
              <IconChevronDown width={13} height={13} className="copilot-history-toggle-chevron" />
            </button>
            <div className="copilot-panel-header-actions">
              {messages.length > 0 && (
                <button type="button" className="copilot-panel-icon-btn" onClick={startNewConversation} title={t(lang, 'copilot.newConversation')} aria-label={t(lang, 'copilot.newConversation')}>
                  <IconPlus width={14} height={14} />
                </button>
              )}
              <button type="button" className="copilot-panel-icon-btn" onClick={() => setOpen(false)} title={t(lang, 'copilot.minimize')} aria-label={t(lang, 'copilot.minimize')}>
                <IconMinus width={14} height={14} />
              </button>
              <button type="button" className="copilot-panel-icon-btn" onClick={closeAndReset} title={t(lang, 'copilot.close')} aria-label={t(lang, 'copilot.close')}>
                <IconX width={16} height={16} />
              </button>
            </div>

            {historyOpen && (
              <div className="copilot-history-panel">
                <div className="copilot-history-search">
                  <IconSearch width={14} height={14} />
                  <input
                    type="text"
                    value={historyQuery}
                    onChange={e => setHistoryQuery(e.target.value)}
                    placeholder={t(lang, 'copilot.historySearchPlaceholder')}
                    autoFocus
                  />
                </div>

                <div className="copilot-history-list">
                  {historyLoading && <p className="copilot-history-empty">{t(lang, 'planVersions.loading')}</p>}
                  {!historyLoading && !conversations.length && (
                    <p className="copilot-history-empty">{t(lang, 'copilot.historyEmpty')}</p>
                  )}
                  {!historyLoading && [
                    ['today', t(lang, 'copilot.historyToday')],
                    ['week', t(lang, 'copilot.historyWeek')],
                    ['older', t(lang, 'copilot.historyOlder')]
                  ].map(([key, label]) => filteredGroups[key].length > 0 && (
                    <div className="copilot-history-group" key={key}>
                      <span className="copilot-history-group-label">{label}</span>
                      {filteredGroups[key].map(c => (
                        <button
                          type="button"
                          key={c.id}
                          className={`copilot-history-item ${c.id === conversationId ? 'is-active' : ''}`}
                          onClick={() => openConversation(c.id)}
                        >
                          <span className="copilot-history-item-title">{c.title || t(lang, 'copilot.newConversation')}</span>
                          <button type="button" className="copilot-history-item-delete" onClick={(e) => removeConversation(c.id, e)} title={t(lang, 'copilot.historyDelete')}>
                            <IconTrash width={12} height={12} />
                          </button>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>

                <button type="button" className="copilot-history-new" onClick={startNewConversation}>
                  <IconPlus width={14} height={14} /> {t(lang, 'copilot.newConversation')}
                </button>
              </div>
            )}
          </div>

          <div className="copilot-messages" ref={listRef}>
            {messages.length === 0 && <div className="copilot-empty-bg" aria-hidden="true" />}
            {messages.length === 0 && (
              <div className="copilot-empty-state">
                <span className="copilot-empty-orb">
                  <img className="copilot-empty-orb-avatar" src={NOVA_AVATAR} alt="" />
                </span>
                <p className="copilot-empty-greeting">{greeting(lang)}</p>
                <p className="copilot-empty">{t(lang, 'copilot.empty')}</p>
                <div className="copilot-suggestions">
                  {Array.isArray(suggestions) && suggestions.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      ref={el => { suggestionRefs.current[i] = el }}
                      className="copilot-suggestion-chip"
                      onClick={() => send(s)}
                      onKeyDown={(e) => handleSuggestionKeyDown(e, i, suggestions.length)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`copilot-msg-row copilot-msg-row-${m.role}`}>
                {m.role === 'assistant' && <img className="copilot-avatar copilot-msg-avatar" src={NOVA_AVATAR} alt="" />}
                <div className={`copilot-msg copilot-msg-${m.role}${m.error ? ' copilot-msg-error' : ''}`}>
                  <p>{m.content}</p>
                  {m.note && <p className="copilot-msg-note">{m.note}</p>}
                  {m.createdAt && <span className="copilot-msg-time">{formatDateTime(m.createdAt, lang)}</span>}
                  {m.role === 'assistant' && !m.error && (
                    <button type="button" className="copilot-msg-copy" onClick={() => copyReply(m.content, i)} title={t(lang, 'copilot.copyReply')}>
                      {copiedIndex === i ? <IconCheckCircle width={12} height={12} /> : <IconCopy width={12} height={12} />}
                      {copiedIndex === i ? t(lang, 'copilot.copied') : t(lang, 'copilot.copyReply')}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {busy && (
              <div className="copilot-msg-row copilot-msg-row-assistant">
                <img className="copilot-avatar copilot-msg-avatar" src={NOVA_AVATAR} alt="" />
                <div className="copilot-msg copilot-msg-assistant copilot-msg-thinking">
                  <span className="copilot-typing-dot" />
                  <span className="copilot-typing-dot" />
                  <span className="copilot-typing-dot" />
                </div>
              </div>
            )}
          </div>

          <div className="copilot-input-row">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t(lang, 'copilot.placeholder')}
              rows={1}
              disabled={busy}
            />
            <button type="button" onClick={() => send()} disabled={busy || !input.trim()} aria-label={t(lang, 'copilot.send')}>
              <IconSend width={16} height={16} />
            </button>
          </div>
          <p className="copilot-input-hint">{t(lang, 'copilot.inputHint')}</p>
        </div>
      )}
    </>
  )
}
