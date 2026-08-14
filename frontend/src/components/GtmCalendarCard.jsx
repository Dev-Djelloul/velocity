import { useState } from 'react'
import { t } from '../lib/i18n'
import { generateEditorial, generateAdvertising } from '../lib/serverStorage'
import { generateEditorialFallback } from '../lib/editorialFallback'
import { generateAdvertisingFallback } from '../lib/advertisingFallback'
import { IconCalendar, IconSparkle, IconDownload, IconMegaphone } from './Icons'
import '../styles/GtmCalendarCard.css'

function editorialToCsv(items, lang) {
  const headers = lang === 'en'
    ? ['Week', 'Channel', 'Format', 'Title', 'Angle', 'CTA']
    : ['Semaine', 'Canal', 'Format', 'Titre', 'Angle', 'CTA']
  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const lines = [headers.map(escape).join(',')]
  items.forEach(it => lines.push([it.week, it.channel, it.format, it.title, it.angle, it.cta].map(escape).join(',')))
  return lines.join('\n')
}

// Brief de campagne prêt à copier dans le gestionnaire de pub de chaque plateforme
// (Meta Ads Manager, Google Ads, LinkedIn Campaign Manager...) — pas un format d'import
// natif garanti (chaque plateforme a son propre schéma), mais toutes les infos utiles
// déjà organisées : nom de campagne suggéré, dates réelles, budget, statut brouillon.
function weekStartDate(planStartDate, week) {
  const base = new Date(planStartDate || Date.now())
  // Ancre en UTC (pas setHours local) pour éviter qu'un fuseau horaire décale la date
  // d'un jour lors de la reconversion en ISO — sensible ici car c'est la date affichée
  // telle quelle dans le brief de campagne.
  const start = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate()))
  start.setUTCDate(start.getUTCDate() + Math.max(0, (week || 1) - 1) * 7)
  return start
}

function isoDate(date) {
  return date.toISOString().slice(0, 10)
}

function suggestedCampaignName(productName, c) {
  const objective = c.objective ? c.objective.charAt(0).toUpperCase() + c.objective.slice(1) : ''
  return [productName, c.channel, `S${c.week}`, objective].filter(Boolean).join(' - ')
}

function advertisingToCsv(campaigns, lang, planStartDate, productName) {
  const headers = lang === 'en'
    ? ['Campaign Name', 'Platform', 'Objective', 'Ad Format', 'Target Audience', 'Budget (€)', 'Start Date', 'End Date', 'Primary KPI', 'Status']
    : ['Nom de campagne', 'Plateforme', 'Objectif', 'Format', 'Audience cible', 'Budget (€)', 'Début', 'Fin', 'KPI principal', 'Statut']
  const status = lang === 'en' ? 'Draft' : 'Brouillon'
  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const lines = [headers.map(escape).join(',')]
  campaigns.forEach(c => {
    const start = weekStartDate(planStartDate, c.week)
    const end = new Date(start)
    end.setUTCDate(end.getUTCDate() + 6)
    lines.push([
      suggestedCampaignName(productName, c), c.channel, c.objective, c.format, c.audience, c.budget,
      isoDate(start), isoDate(end), c.kpi, status
    ].map(escape).join(','))
  })
  return lines.join('\n')
}

function downloadCsv(content, filename) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function GtmCalendarCard({ plan, lang, onEditorialChange, onAdvertisingChange }) {
  const [loadingContent, setLoadingContent] = useState(false)
  const [loadingPaid, setLoadingPaid] = useState(false)
  const editorial = plan.editorial
  const advertising = plan.advertising
  const hasAny = !!editorial || !!advertising
  const loading = loadingContent || loadingPaid

  const generateContent = async () => {
    setLoadingContent(true)
    try {
      const result = await generateEditorial(plan, lang)
      onEditorialChange(result || generateEditorialFallback(plan, lang))
    } catch {
      onEditorialChange(generateEditorialFallback(plan, lang))
    } finally {
      setLoadingContent(false)
    }
  }

  const generatePaid = async () => {
    setLoadingPaid(true)
    try {
      const result = await generateAdvertising(plan, lang)
      onAdvertisingChange(result || generateAdvertisingFallback(plan, lang))
    } catch {
      onAdvertisingChange(generateAdvertisingFallback(plan, lang))
    } finally {
      setLoadingPaid(false)
    }
  }

  const generateAll = async () => {
    if (loading) return
    await Promise.all([generateContent(), generatePaid()])
  }

  const weeks = [...new Set([
    ...((editorial?.items || []).map(i => i.week)),
    ...((advertising?.campaigns || []).map(c => c.week))
  ])].sort((a, b) => a - b)

  return (
    <div className="gtm-card card">
      <div className="gtm-header">
        <div>
          <h3><IconCalendar width={18} height={18} /> {t(lang, 'gtm.title')}</h3>
          <p className="gtm-subtitle">{t(lang, 'gtm.subtitle')}</p>
        </div>
        <button className="btn-primary gtm-generate-btn" onClick={generateAll} disabled={loading}>
          <IconSparkle width={14} height={14} />
          {loading ? t(lang, 'gtm.generating') : t(lang, 'gtm.generateAll')}
        </button>
      </div>

      {!hasAny && !loading && (
        <p className="gtm-empty">{t(lang, 'gtm.empty')}</p>
      )}

      {hasAny && (
        <div className="gtm-body">
          {advertising?.totalBudget != null && (
            <div className="gtm-total-budget">
              {t(lang, 'gtm.totalPaidBudget')} : <strong>{Number(advertising.totalBudget).toLocaleString()} €</strong>
            </div>
          )}

          {weeks.map(week => (
            <div key={week} className="gtm-week">
              <h4 className="gtm-week-title">{t(lang, 'gtm.week')} {week}</h4>
              <div className="gtm-week-grid">
                <div className="gtm-lane gtm-lane-content">
                  <div className="gtm-lane-label">
                    <IconCalendar width={13} height={13} /> {t(lang, 'gtm.content')}
                  </div>
                  {(editorial?.items || []).filter(i => i.week === week).length === 0 && (
                    <p className="gtm-lane-empty">{t(lang, 'gtm.contentEmpty')}</p>
                  )}
                  {(editorial?.items || []).filter(i => i.week === week).map((it, i) => (
                    <div key={i} className="gtm-item gtm-item-content">
                      <div className="gtm-item-top">
                        <span className="gtm-item-channel">{it.channel}</span>
                        <span className="gtm-item-format">{it.format}</span>
                      </div>
                      <div className="gtm-item-title">{it.title}</div>
                      <div className="gtm-item-angle">{it.angle}</div>
                      <div className="gtm-item-cta">{t(lang, 'editorial.cta')} : {it.cta}</div>
                    </div>
                  ))}
                </div>

                <div className="gtm-lane gtm-lane-paid">
                  <div className="gtm-lane-label">
                    <IconMegaphone width={13} height={13} /> {t(lang, 'gtm.paid')}
                  </div>
                  {(advertising?.campaigns || []).filter(c => c.week === week).length === 0 && (
                    <p className="gtm-lane-empty">{t(lang, 'gtm.paidEmpty')}</p>
                  )}
                  {(advertising?.campaigns || []).filter(c => c.week === week).map((c, i) => (
                    <div key={i} className="gtm-item gtm-item-paid">
                      <div className="gtm-item-top">
                        <span className="gtm-item-channel">{c.channel}</span>
                        <span className={`gtm-item-objective obj-${c.objective}`}>{t(lang, `advertising.objective.${c.objective}`) || c.objective}</span>
                      </div>
                      <div className="gtm-item-format">{c.format}</div>
                      <div className="gtm-item-audience">{c.audience}</div>
                      <div className="gtm-item-foot">
                        <span className="gtm-item-budget">{Number(c.budget).toLocaleString()} €</span>
                        <span className="gtm-item-kpi">{c.kpi}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <div className="gtm-actions">
            <button className="btn-secondary" onClick={generateContent} disabled={loading}>
              <IconSparkle width={13} height={13} /> {t(lang, 'gtm.regenerateContent')}
            </button>
            <button className="btn-secondary" onClick={generatePaid} disabled={loading}>
              <IconSparkle width={13} height={13} /> {t(lang, 'gtm.regeneratePaid')}
            </button>
            {editorial && (
              <button className="btn-secondary" onClick={() => downloadCsv(editorialToCsv(editorial.items || [], lang), 'calendrier-editorial.csv')}>
                <IconDownload width={13} height={13} /> {t(lang, 'gtm.exportContentCsv')}
              </button>
            )}
            {advertising && (
              <button
                className="btn-secondary"
                onClick={() => downloadCsv(advertisingToCsv(advertising.campaigns || [], lang, plan.planStartDate || plan.generatedAt, plan.product?.name), 'brief-campagnes-publicitaires.csv')}
                title={t(lang, 'gtm.exportPaidCsvHint')}
              >
                <IconDownload width={13} height={13} /> {t(lang, 'gtm.exportPaidCsv')}
              </button>
            )}
          </div>
          {advertising && <p className="gtm-export-hint">{t(lang, 'gtm.exportPaidCsvHint')}</p>}
        </div>
      )}
    </div>
  )
}
