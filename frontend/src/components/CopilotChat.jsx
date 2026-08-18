import { useState, useRef, useEffect } from 'react'
import { copilotChat } from '../lib/serverStorage'
import { t } from '../lib/i18n'
import { IconMessageCircle, IconX, IconSend, IconSparkle } from './Icons'
import '../styles/CopilotChat.css'

// Copilote IA conversationnel : chat flottant qui laisse l'utilisateur itérer sur son plan
// en langage naturel. Le backend (/copilot/chat) renvoie une réponse conversationnelle et,
// le cas échéant, la valeur complète mise à jour de chaque section du plan concernée —
// appliquées ici via onApplyChanges (fourni par PlanViewer), qui les fait passer par le
// même circuit markChanged()/pendingChanges que toute autre édition : rien n'est jamais
// enregistré silencieusement, l'utilisateur garde la main via le bouton "Enregistrer".
export default function CopilotChat({ plan, lang, userId, onApplyChanges }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const listRef = useRef(null)

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages, open])

  const send = async () => {
    const text = input.trim()
    if (!text || busy) return
    const history = messages.map(m => ({ role: m.role, content: m.content }))
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setInput('')
    setBusy(true)
    try {
      const result = await copilotChat(plan, text, history, lang, userId)
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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <>
      <button type="button" className="copilot-fab" onClick={() => setOpen(o => !o)}>
        <IconMessageCircle width={20} height={20} />
        <span>{t(lang, 'copilot.openButton')}</span>
      </button>

      {open && (
        <div className="copilot-panel">
          <div className="copilot-panel-header">
            <div className="copilot-panel-title">
              <IconSparkle width={16} height={16} />
              <span>{t(lang, 'copilot.title')}</span>
            </div>
            <button type="button" className="copilot-panel-close" onClick={() => setOpen(false)} aria-label={t(lang, 'copilot.close')}>
              <IconX width={16} height={16} />
            </button>
          </div>
          <p className="copilot-panel-subtitle">{t(lang, 'copilot.subtitle')}</p>

          <div className="copilot-messages" ref={listRef}>
            {messages.length === 0 && (
              <p className="copilot-empty">{t(lang, 'copilot.empty')}</p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`copilot-msg copilot-msg-${m.role}${m.error ? ' copilot-msg-error' : ''}`}>
                <p>{m.content}</p>
                {m.note && <p className="copilot-msg-note">{m.note}</p>}
              </div>
            ))}
            {busy && <div className="copilot-msg copilot-msg-assistant copilot-msg-thinking">{t(lang, 'copilot.thinking')}</div>}
          </div>

          <div className="copilot-input-row">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t(lang, 'copilot.placeholder')}
              rows={2}
              disabled={busy}
            />
            <button type="button" onClick={send} disabled={busy || !input.trim()} aria-label={t(lang, 'copilot.send')}>
              <IconSend width={16} height={16} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
