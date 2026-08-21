import { useEffect, useMemo, useState } from 'react'
import { t } from '../lib/i18n'
import { fetchPlanVersions, fetchPlanVersion } from '../lib/serverStorage'
import { diffPlanVersions } from '../lib/planVersionDiff'
import { formatFullDateTime } from '../lib/dateFormat'
import { IconArrowLeft, IconClock, IconPlus, IconTrash, IconTarget, IconSparkle } from './Icons'
import '../styles/TeamPage.css'
import '../styles/PlanVersionsPage.css'
import planVersionsBackground from '../../assets/img/hiw-gallery-team-table.webp'

function versionLabel(version, lang) {
  const date = formatFullDateTime(version.createdAt, lang)
  return version.productName ? `${version.productName} — ${date}` : date
}

// Bibliothèque "avant/après" : compare deux instantanés du même plan, un par sauvegarde
// (voir db.snapshotPlanVersion côté backend, déclenché à chaque POST /plans). Par défaut,
// la plus ancienne version connue contre la plus récente — le cas d'usage le plus courant
// ("qu'est-ce qui a changé depuis le début ?") — modifiable via les deux sélecteurs.
export default function PlanVersionsPage({ plan, lang, onBack }) {
  const [versions, setVersions] = useState(null)
  const [fromId, setFromId] = useState(null)
  const [toId, setToId] = useState(null)
  const [fromData, setFromData] = useState(null)
  const [toData, setToData] = useState(null)
  const [loadingDiff, setLoadingDiff] = useState(false)

  useEffect(() => {
    if (!plan?.id) return
    fetchPlanVersions(plan.id).then(list => {
      const sorted = [...(list || [])].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      setVersions(sorted)
      if (sorted.length >= 2) {
        setFromId(sorted[0].id)
        setToId(sorted[sorted.length - 1].id)
      }
    })
  }, [plan?.id])

  useEffect(() => {
    if (!fromId || !toId) return
    setLoadingDiff(true)
    Promise.all([fetchPlanVersion(fromId), fetchPlanVersion(toId)]).then(([from, to]) => {
      setFromData(from?.data || null)
      setToData(to?.data || null)
      setLoadingDiff(false)
    })
  }, [fromId, toId])

  const diff = useMemo(() => {
    if (!fromData || !toData) return null
    return diffPlanVersions(fromData, toData, lang)
  }, [fromData, toData, lang])

  return (
    <div className="plan-versions-page-outer">
      <div className="plan-versions-page-bg" style={{ backgroundImage: `url(${planVersionsBackground})` }} aria-hidden="true" />
      <div className="plan-versions-page-inner">
      <div className="plan-versions-page">
      <div className="plan-versions-header">
        <button className="team-back-btn" onClick={onBack}>
          <IconArrowLeft width={16} height={16} /> {t(lang, 'planVersions.back')}
        </button>
        <div className="plan-versions-title">
          <IconClock width={22} height={22} />
          <div>
            <h1>{t(lang, 'planVersions.title')}</h1>
            <p>{plan?.product?.name || t(lang, 'plans.untitled')}</p>
          </div>
        </div>
      </div>

      {versions === null && <p className="plan-versions-empty">{t(lang, 'planVersions.loading')}</p>}

      {versions?.length === 0 && (
        <p className="plan-versions-empty">{t(lang, 'planVersions.none')}</p>
      )}

      {versions?.length === 1 && (
        <p className="plan-versions-empty">{t(lang, 'planVersions.onlyOne')}</p>
      )}

      {versions?.length >= 2 && (
        <>
          <div className="plan-versions-picker card">
            <label>
              <span>{t(lang, 'planVersions.fromLabel')}</span>
              <select value={fromId || ''} onChange={e => setFromId(e.target.value)}>
                {versions.map(v => (
                  <option key={v.id} value={v.id}>{versionLabel(v, lang)}</option>
                ))}
              </select>
            </label>
            <span className="plan-versions-arrow">→</span>
            <label>
              <span>{t(lang, 'planVersions.toLabel')}</span>
              <select value={toId || ''} onChange={e => setToId(e.target.value)}>
                {versions.map(v => (
                  <option key={v.id} value={v.id}>{versionLabel(v, lang)}</option>
                ))}
              </select>
            </label>
          </div>

          {loadingDiff && <p className="plan-versions-empty">{t(lang, 'planVersions.loading')}</p>}

          {diff && !loadingDiff && (
            <div className="plan-versions-diff">
              {diff.classification.old !== diff.classification.new && (
                <div className="plan-versions-section card">
                  <h3>{t(lang, 'planVersions.classification')}</h3>
                  <p className="plan-versions-value-change">
                    <span className="is-old">{diff.classification.old || '—'}</span>
                    <span className="plan-versions-value-arrow">→</span>
                    <span className="is-new">{diff.classification.new || '—'}</span>
                  </p>
                </div>
              )}

              {diff.marketingBudget.old !== diff.marketingBudget.new && (
                <div className="plan-versions-section card">
                  <h3>{t(lang, 'planVersions.marketingBudget')}</h3>
                  <p className="plan-versions-value-change">
                    <span className="is-old">{diff.marketingBudget.old != null ? `${diff.marketingBudget.old.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')} €` : '—'}</span>
                    <span className="plan-versions-value-arrow">→</span>
                    <span className="is-new">{diff.marketingBudget.new != null ? `${diff.marketingBudget.new.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')} €` : '—'}</span>
                  </p>
                </div>
              )}

              <div className="plan-versions-section card">
                <h3><IconTarget width={16} height={16} /> {t(lang, 'planVersions.roadmap')}</h3>
                {!diff.roadmap.added.length && !diff.roadmap.removed.length && !diff.roadmap.changed.length ? (
                  <p className="plan-versions-no-change">{t(lang, 'planVersions.noChange')}</p>
                ) : (
                  <ul className="plan-versions-change-list">
                    {diff.roadmap.added.map(s => (
                      <li key={`add-${s.id}`} className="is-added">
                        <IconPlus width={12} height={12} /> {s.title}
                      </li>
                    ))}
                    {diff.roadmap.removed.map(s => (
                      <li key={`rm-${s.id}`} className="is-removed">
                        <IconTrash width={12} height={12} /> {s.title}
                      </li>
                    ))}
                    {diff.roadmap.changed.map(item => (
                      <li key={item.key}>{item.detail}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="plan-versions-section card">
                <h3>{t(lang, 'planVersions.kpis')}</h3>
                {!diff.kpis.length ? (
                  <p className="plan-versions-no-change">{t(lang, 'planVersions.noChange')}</p>
                ) : (
                  <ul className="plan-versions-change-list">
                    {diff.kpis.map(item => <li key={item.key}>{item.detail}</li>)}
                  </ul>
                )}
              </div>

              <div className="plan-versions-section card">
                <h3>{t(lang, 'planVersions.personas')}</h3>
                {!diff.personas.added.length && !diff.personas.removed.length && !diff.personas.changed.length ? (
                  <p className="plan-versions-no-change">{t(lang, 'planVersions.noChange')}</p>
                ) : (
                  <ul className="plan-versions-change-list">
                    {diff.personas.added.map(p => (
                      <li key={`add-${p.name}`} className="is-added">
                        <IconPlus width={12} height={12} /> {p.name}
                      </li>
                    ))}
                    {diff.personas.removed.map(p => (
                      <li key={`rm-${p.name}`} className="is-removed">
                        <IconTrash width={12} height={12} /> {p.name}
                      </li>
                    ))}
                    {diff.personas.changed.map(item => (
                      <li key={item.key}>{item.detail}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="plan-versions-section card">
                <h3>{t(lang, 'planVersions.financials')}</h3>
                {!diff.financials.length ? (
                  <p className="plan-versions-no-change">{t(lang, 'planVersions.noChange')}</p>
                ) : (
                  <ul className="plan-versions-change-list">
                    {diff.financials.map(item => <li key={item.key}>{item.detail}</li>)}
                  </ul>
                )}
              </div>

              {diff.executiveSummary.old !== diff.executiveSummary.new && (diff.executiveSummary.old || diff.executiveSummary.new) && (
                <div className="plan-versions-section card">
                  <h3><IconSparkle width={16} height={16} /> {t(lang, 'planVersions.executiveSummary')}</h3>
                  <div className="plan-versions-summary-compare">
                    <p className="is-old">{diff.executiveSummary.old || '—'}</p>
                    <p className="is-new">{diff.executiveSummary.new || '—'}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
      </div>
      </div>
    </div>
  )
}
