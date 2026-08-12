import { useState } from 'react'
import { t } from '../lib/i18n'
import { generateEditorial } from '../lib/serverStorage'
import { generateEditorialFallback } from '../lib/editorialFallback'
import { IconCalendar, IconSparkle, IconDownload } from './Icons'
import '../styles/EditorialCalendarCard.css'

function toCsv(items, lang) {
  const headers = lang === 'en'
    ? ['Week', 'Channel', 'Format', 'Title', 'Angle', 'CTA']
    : ['Semaine', 'Canal', 'Format', 'Titre', 'Angle', 'CTA']
  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const lines = [headers.map(escape).join(',')]
  items.forEach(it => lines.push([it.week, it.channel, it.format, it.title, it.angle, it.cta].map(escape).join(',')))
  return lines.join('\n')
}

export default function EditorialCalendarCard({ plan, lang, onEditorialChange }) {
  const [loading, setLoading] = useState(false)
  const editorial = plan.editorial

  const generate = async () => {
    if (loading) return
    setLoading(true)
    try {
      const result = await generateEditorial(plan, lang)
      onEditorialChange(result || generateEditorialFallback(plan, lang))
    } catch {
      onEditorialChange(generateEditorialFallback(plan, lang))
    } finally {
      setLoading(false)
    }
  }

  const exportCsv = () => {
    const blob = new Blob([toCsv(editorial.items || [], lang)], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'calendrier-editorial.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const weeks = editorial
    ? [...new Set((editorial.items || []).map(i => i.week))].sort((a, b) => a - b)
    : []

  return (
    <div className="editorial-card card">
      <div className="editorial-header">
        <div>
          <h3><IconCalendar width={18} height={18} /> {t(lang, 'editorial.title')}</h3>
          <p className="editorial-subtitle">{t(lang, 'editorial.subtitle')}</p>
        </div>
        <button className="btn-primary editorial-generate-btn" onClick={generate} disabled={loading}>
          <IconSparkle width={14} height={14} />
          {loading ? t(lang, 'editorial.generating') : editorial ? t(lang, 'editorial.regenerate') : t(lang, 'editorial.generate')}
        </button>
      </div>

      {!editorial && !loading && (
        <p className="editorial-empty">{t(lang, 'editorial.empty')}</p>
      )}

      {editorial && (
        <div className="editorial-body">
          {weeks.map(week => (
            <div key={week} className="editorial-week">
              <h4>{t(lang, 'editorial.week')} {week}</h4>
              <div className="editorial-items">
                {(editorial.items || []).filter(i => i.week === week).map((it, i) => (
                  <div key={i} className="editorial-item">
                    <div className="editorial-item-top">
                      <span className="editorial-channel">{it.channel}</span>
                      <span className="editorial-format">{it.format}</span>
                    </div>
                    <div className="editorial-item-title">{it.title}</div>
                    <div className="editorial-item-angle">{it.angle}</div>
                    <div className="editorial-item-cta">{t(lang, 'editorial.cta')} : {it.cta}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="editorial-actions">
            <button className="btn-secondary" onClick={exportCsv}>
              <IconDownload width={14} height={14} /> {t(lang, 'editorial.exportCsv')}
            </button>
            {editorial.source && (
              <span className="editorial-origin">{editorial.source === 'ai' ? t(lang, 'editorial.byAi') : t(lang, 'editorial.byRules')}</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
