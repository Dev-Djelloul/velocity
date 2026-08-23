import { useState } from 'react'
import { t } from '../lib/i18n'
import { generateVeille } from '../lib/serverStorage'
import { generateVeilleFallback } from '../lib/veilleFallback'
import { IconRadar, IconSparkle, IconTrendingUp, IconTarget, IconAlertTriangle, IconCompass, IconClipboard } from './Icons'
import LinkCard from './LinkCard'
import '../styles/VeilleCard.css'

export default function VeilleCard({ plan, lang, onVeilleChange, userId }) {
  const [loading, setLoading] = useState(false)
  const veille = plan.veille

  const generate = async () => {
    if (loading) return
    setLoading(true)
    try {
      const result = await generateVeille(plan, lang, userId)
      onVeilleChange(result || generateVeilleFallback(plan, lang))
    } catch {
      onVeilleChange(generateVeilleFallback(plan, lang))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="veille-card card">
      <div className="veille-header">
        <div>
          <h3><IconRadar width={18} height={18} /> {t(lang, 'veille.title')}</h3>
          <p className="veille-subtitle">{t(lang, 'veille.subtitle')}</p>
        </div>
        <button className="btn-ai-generate veille-generate-btn" onClick={generate} disabled={loading}>
          <IconSparkle width={14} height={14} />
          <span className="btn-ai-generate-label">{loading ? t(lang, 'veille.generating') : veille ? t(lang, 'veille.regenerate') : t(lang, 'veille.generate')}</span>
        </button>
      </div>

      {!veille && !loading && (
        <p className="veille-empty">{t(lang, 'veille.empty')}</p>
      )}

      {veille && (
        <div className="veille-body">
          <div className="veille-block veille-competitors">
            <h4><IconTarget width={15} height={15} /> {t(lang, 'veille.competitors')}</h4>
            <div className="veille-competitor-list">
              {veille.competitors?.map((c, i) => (
                <div key={i} className="veille-competitor">
                  <div className="veille-competitor-name">{c.name}</div>
                  <div className="veille-competitor-pos">{c.positioning}</div>
                  <div className="veille-competitor-watch"><span>{t(lang, 'veille.watchLabel')} :</span> {c.watch}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="veille-grid">
            <div className="veille-block">
              <h4><IconTrendingUp width={15} height={15} /> {t(lang, 'veille.trends')}</h4>
              <ul>{veille.trends?.map((x, i) => <li key={i}>{x}</li>)}</ul>
            </div>
            <div className="veille-block">
              <h4><IconCompass width={15} height={15} /> {t(lang, 'veille.signals')}</h4>
              <ul>{veille.signals?.map((x, i) => <li key={i}>{x}</li>)}</ul>
            </div>
            <div className="veille-block veille-opportunities">
              <h4><IconSparkle width={15} height={15} /> {t(lang, 'veille.opportunities')}</h4>
              <ul>{veille.opportunities?.map((x, i) => <li key={i}>{x}</li>)}</ul>
            </div>
            <div className="veille-block veille-threats">
              <h4><IconAlertTriangle width={15} height={15} /> {t(lang, 'veille.threats')}</h4>
              <ul>{veille.threats?.map((x, i) => <li key={i}>{x}</li>)}</ul>
            </div>
          </div>

          <div className="veille-block">
            <h4><IconClipboard width={15} height={15} /> {t(lang, 'veille.sources')}</h4>
            <div className="link-card-grid">
              {veille.sources?.map((x, i) => (
                typeof x === 'string'
                  ? <span key={i} className="veille-source-chip">{x}</span>
                  : <LinkCard key={i} url={x.url} label={x.name} />
              ))}
            </div>
          </div>

          {veille.source && (
            <p className="veille-origin">{veille.source === 'ai' ? t(lang, 'veille.byAi') : t(lang, 'veille.byRules')}</p>
          )}
        </div>
      )}
    </div>
  )
}
