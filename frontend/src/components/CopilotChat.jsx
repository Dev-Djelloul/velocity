import { useState, useRef, useEffect } from 'react'
import { copilotChat } from '../lib/serverStorage'
import { t } from '../lib/i18n'
import { IconX, IconSend, IconTrash, IconCopy, IconCheckCircle, IconMinus } from './Icons'
import '../styles/CopilotChat.css'

const NOVA_AVATAR = '/assets/icons/icons8-woman-32.png'

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
  const listRef = useRef(null)
  const textareaRef = useRef(null)
  const suggestionRefs = useRef([])

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages, open, busy])

  // Persiste la conversation sur le plan à chaque échange (voir onHistoryChange dans
  // PlanViewer.jsx) — sauf au montage, où `messages` vient déjà de plan.copilotHistory et le
  // resauvegarder serait un aller-retour inutile.
  const isFirstMessagesRender = useRef(true)
  useEffect(() => {
    if (isFirstMessagesRender.current) { isFirstMessagesRender.current = false; return }
    onHistoryChange?.(messages)
  }, [messages])

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
    setMessages(prev => [...prev, { role: 'user', content: value }])
    setInput('')
    setBusy(true)
    try {
      const result = await copilotChat(plan, value, history, lang, userId)
      if (!result) {
        setMessages(prev => [...prev, { role: 'assistant', content: t(lang, 'copilot.error'), error: true }])
        return
      }
      const changesCount = result.changes?.length || 0
      if (changesCount) onApplyChanges?.(result.changes)
      const note = changesCount
        ? `${changesCount} ${t(lang, 'copilot.changesApplied')}`
        : null
      setMessages(prev => [...prev, { role: 'assistant', content: result.reply || '', note }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: t(lang, 'copilot.error'), error: true }])
    } finally {
      setBusy(false)
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
        <div className="copilot-panel">
          <div className="copilot-panel-header">
            <div className="copilot-panel-title">
              <img className="copilot-avatar" src={NOVA_AVATAR} alt="" />
              <span>{t(lang, 'copilot.title')}</span>
            </div>
            <div className="copilot-panel-header-actions">
              {messages.length > 0 && (
                <button type="button" className="copilot-panel-icon-btn" onClick={() => setMessages([])} title={t(lang, 'copilot.newConversation')} aria-label={t(lang, 'copilot.newConversation')}>
                  <IconTrash width={14} height={14} />
                </button>
              )}
              <button type="button" className="copilot-panel-icon-btn" onClick={() => setOpen(false)} title={t(lang, 'copilot.minimize')} aria-label={t(lang, 'copilot.minimize')}>
                <IconMinus width={14} height={14} />
              </button>
              <button type="button" className="copilot-panel-icon-btn" onClick={() => setOpen(false)} aria-label={t(lang, 'copilot.close')}>
                <IconX width={16} height={16} />
              </button>
            </div>
          </div>

          <div className="copilot-messages" ref={listRef}>
            {messages.length === 0 && (
              <div className="copilot-empty-state">
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
