import { useState } from 'react'
import { t } from '../lib/i18n'
import { fetchWeeklySummary } from '../lib/serverStorage'
import { IconSparkle, IconRotateCw } from './Icons'

// Même avatar que le bouton flottant du copilote Nova sur le plan (CopilotChat.jsx) —
// pas une icône générique, l'image réelle de Nova telle qu'elle apparaît déjà dans l'app.
const NOVA_AVATAR = '/assets/icons/icons8-woman-32.png'

// Résumé exécutif hebdomadaire cross-plans généré à la demande par Nova — pas un rapport
// automatique en tâche de fond (qui coûterait un appel IA à chaque chargement du dashboard,
// pour une majorité d'utilisateurs qui ne le liraient jamais) : un bouton, sur simple
// initiative de l'utilisateur, qui n'envoie que des statistiques déjà agrégées côté client
// (voir buildWeeklyStats dans DashboardHome.jsx), jamais les plans complets.
export default function DashboardWeeklySummary({ userId, lang, stats }) {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const generate = async () => {
    setLoading(true)
    setError(false)
    const res = await fetchWeeklySummary(userId, lang, stats)
    setLoading(false)
    if (res?.summary) setSummary(res.summary)
    else setError(true)
  }

  return (
    <div className="dashboard-widget-card dashboard-nova-card">
      <div className="dashboard-widget-header">
        <IconSparkle width={16} height={16} />
        <h3>{t(lang, 'dashboard.novaSummaryTitle')}</h3>
      </div>

      {!summary && !loading && !error && (
        <p className="dashboard-nova-intro">{t(lang, 'dashboard.novaSummaryIntro')}</p>
      )}
      {error && <p className="dashboard-nova-intro">{t(lang, 'dashboard.novaSummaryError')}</p>}
      {summary && <p className="dashboard-nova-summary">{summary}</p>}

      <button className="btn-secondary dashboard-nova-btn" onClick={generate} disabled={loading}>
        {loading
          ? <><IconRotateCw width={14} height={14} className="dashboard-nova-spin" /> {t(lang, 'dashboard.novaSummaryLoading')}</>
          : <><img src={NOVA_AVATAR} alt="" className="dashboard-nova-btn-avatar" /> {summary ? t(lang, 'dashboard.novaSummaryRegenerate') : t(lang, 'dashboard.novaSummaryCta')}</>}
      </button>
    </div>
  )
}
