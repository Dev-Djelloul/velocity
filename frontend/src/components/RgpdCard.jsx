import { useState } from 'react'
import { t } from '../lib/i18n'
import { generateRgpd } from '../lib/serverStorage'
import { generateRgpdFallback } from '../lib/rgpdFallback'
import { IconLock, IconSparkle, IconCheckCircle, IconAlertTriangle, IconExternalLink } from './Icons'
import '../styles/RgpdCard.css'

export default function RgpdCard({ plan, lang, onRgpdChange, userId }) {
  const [loading, setLoading] = useState(false)
  const rgpd = plan.rgpd

  const generate = async () => {
    if (loading) return
    setLoading(true)
    try {
      const result = await generateRgpd(plan, lang, userId)
      onRgpdChange(result || generateRgpdFallback(plan, lang))
    } catch {
      onRgpdChange(generateRgpdFallback(plan, lang))
    } finally {
      setLoading(false)
    }
  }

  const toggleItem = (idx) => {
    const checklist = rgpd.checklist.map((it, i) => i === idx ? { ...it, done: !it.done } : it)
    onRgpdChange({ ...rgpd, checklist })
  }

  const doneCount = rgpd ? (rgpd.checklist || []).filter(i => i.done).length : 0
  const total = rgpd ? (rgpd.checklist || []).length : 0

  return (
    <div className="rgpd-card card">
      <div className="rgpd-header">
        <div>
          <h3><IconLock width={18} height={18} /> {t(lang, 'rgpd.title')}</h3>
          <p className="rgpd-subtitle">{t(lang, 'rgpd.subtitle')}</p>
        </div>
        <button className="btn-ai-generate rgpd-generate-btn" onClick={generate} disabled={loading}>
          <IconSparkle width={14} height={14} />
          <span className="btn-ai-generate-label">{loading ? t(lang, 'rgpd.generating') : rgpd ? t(lang, 'rgpd.regenerate') : t(lang, 'rgpd.generate')}</span>
        </button>
      </div>

      {!rgpd && !loading && (
        <p className="rgpd-empty">{t(lang, 'rgpd.empty')}</p>
      )}

      {rgpd && (
        <div className="rgpd-body">
          <p className="rgpd-applicability"><IconAlertTriangle width={15} height={15} /> {rgpd.applicability}</p>

          <div className="rgpd-block">
            <div className="rgpd-block-head">
              <h4><IconCheckCircle width={15} height={15} /> {t(lang, 'rgpd.checklist')}</h4>
              <span className="rgpd-progress">{doneCount}/{total}</span>
            </div>
            {total > 0 && (
              <div className="rgpd-progress-bar">
                <div className="rgpd-progress-fill" style={{ width: `${(doneCount / total) * 100}%` }} />
              </div>
            )}
            <ul className="rgpd-checklist">
              {(rgpd.checklist || []).map((it, i) => (
                <li key={i} className={it.done ? 'done' : ''}>
                  <label>
                    <input type="checkbox" checked={!!it.done} onChange={() => toggleItem(i)} />
                    <span className="rgpd-check-item">{it.item}</span>
                    <span className={`rgpd-priority prio-${it.priority}`}>{t(lang, `rgpd.priority.${it.priority}`) || it.priority}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <div className="rgpd-block">
            <h4>{t(lang, 'rgpd.register')}</h4>
            <div className="rgpd-table-scroll">
              <table className="rgpd-table">
                <thead>
                  <tr>
                    <th>{t(lang, 'rgpd.data')}</th>
                    <th>{t(lang, 'rgpd.purpose')}</th>
                    <th>{t(lang, 'rgpd.basis')}</th>
                  </tr>
                </thead>
                <tbody>
                  {(rgpd.register || []).map((r, i) => (
                    <tr key={i}>
                      <td>{r.data}</td>
                      <td>{r.purpose}</td>
                      <td>{r.basis}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {rgpd.recommendations?.length > 0 && (
            <div className="rgpd-block">
              <h4>{t(lang, 'rgpd.recommendations')}</h4>
              <ul className="rgpd-reco">
                {rgpd.recommendations.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}

          <div className="rgpd-block">
            <h4>{t(lang, 'rgpd.officialResources')}</h4>
            <p className="rgpd-resources-subtitle">{t(lang, 'rgpd.officialResourcesSubtitle')}</p>
            <div className="rgpd-resources-list">
              {t(lang, 'rgpd.resources').map((r, i) => (
                <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className="rgpd-resource-link">
                  <IconExternalLink width={13} height={13} />
                  <span>{r.label}</span>
                </a>
              ))}
            </div>
          </div>

          <p className="rgpd-disclaimer">{t(lang, 'rgpd.disclaimer')}</p>
          {rgpd.source && (
            <p className="rgpd-origin">{rgpd.source === 'ai' ? t(lang, 'rgpd.byAi') : t(lang, 'rgpd.byRules')}</p>
          )}
        </div>
      )}
    </div>
  )
}
