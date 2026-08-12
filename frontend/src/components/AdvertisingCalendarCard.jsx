import { useState } from 'react'
import { t } from '../lib/i18n'
import { generateAdvertising } from '../lib/serverStorage'
import { generateAdvertisingFallback } from '../lib/advertisingFallback'
import { IconMegaphone, IconSparkle, IconDownload } from './Icons'
import '../styles/AdvertisingCalendarCard.css'

function toCsv(campaigns, lang) {
  const headers = lang === 'en'
    ? ['Week', 'Channel', 'Objective', 'Format', 'Audience', 'Budget (€)', 'KPI']
    : ['Semaine', 'Canal', 'Objectif', 'Format', 'Audience', 'Budget (€)', 'KPI']
  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const lines = [headers.map(escape).join(',')]
  campaigns.forEach(c => lines.push([c.week, c.channel, c.objective, c.format, c.audience, c.budget, c.kpi].map(escape).join(',')))
  return lines.join('\n')
}

export default function AdvertisingCalendarCard({ plan, lang, onAdvertisingChange }) {
  const [loading, setLoading] = useState(false)
  const advertising = plan.advertising

  const generate = async () => {
    if (loading) return
    setLoading(true)
    try {
      const result = await generateAdvertising(plan, lang)
      onAdvertisingChange(result || generateAdvertisingFallback(plan, lang))
    } catch {
      onAdvertisingChange(generateAdvertisingFallback(plan, lang))
    } finally {
      setLoading(false)
    }
  }

  const exportCsv = () => {
    const blob = new Blob([toCsv(advertising.campaigns || [], lang)], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'calendrier-publicitaire.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const weeks = advertising
    ? [...new Set((advertising.campaigns || []).map(c => c.week))].sort((a, b) => a - b)
    : []

  return (
    <div className="advertising-card card">
      <div className="advertising-header">
        <div>
          <h3><IconMegaphone width={18} height={18} /> {t(lang, 'advertising.title')}</h3>
          <p className="advertising-subtitle">{t(lang, 'advertising.subtitle')}</p>
        </div>
        <button className="btn-primary advertising-generate-btn" onClick={generate} disabled={loading}>
          <IconSparkle width={14} height={14} />
          {loading ? t(lang, 'advertising.generating') : advertising ? t(lang, 'advertising.regenerate') : t(lang, 'advertising.generate')}
        </button>
      </div>

      {!advertising && !loading && (
        <p className="advertising-empty">{t(lang, 'advertising.empty')}</p>
      )}

      {advertising && (
        <div className="advertising-body">
          {advertising.totalBudget != null && (
            <div className="advertising-total">
              {t(lang, 'advertising.totalBudget')} : <strong>{Number(advertising.totalBudget).toLocaleString()} €</strong>
            </div>
          )}

          {weeks.map(week => (
            <div key={week} className="advertising-week">
              <h4>{t(lang, 'advertising.week')} {week}</h4>
              <div className="advertising-items">
                {(advertising.campaigns || []).filter(c => c.week === week).map((c, i) => (
                  <div key={i} className="advertising-item">
                    <div className="advertising-item-top">
                      <span className="advertising-channel">{c.channel}</span>
                      <span className={`advertising-objective obj-${c.objective}`}>{t(lang, `advertising.objective.${c.objective}`) || c.objective}</span>
                    </div>
                    <div className="advertising-item-format">{c.format}</div>
                    <div className="advertising-item-audience">{c.audience}</div>
                    <div className="advertising-item-foot">
                      <span className="advertising-budget">{Number(c.budget).toLocaleString()} €</span>
                      <span className="advertising-kpi">{c.kpi}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="advertising-actions">
            <button className="btn-secondary" onClick={exportCsv}>
              <IconDownload width={14} height={14} /> {t(lang, 'advertising.exportCsv')}
            </button>
            {advertising.source && (
              <span className="advertising-origin">{advertising.source === 'ai' ? t(lang, 'advertising.byAi') : t(lang, 'advertising.byRules')}</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
