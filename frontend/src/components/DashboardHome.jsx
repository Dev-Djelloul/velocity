import { useEffect, useMemo, useState } from 'react'
import { t } from '../lib/i18n'
import { useTeam, useUser, useAuth } from '../lib/auth'
import { getAllPlans, fetchAllPlansAggregated } from '../lib/planStorage'
import { getPersonalSpace } from '../lib/personalSpace'
import { isPro } from '../lib/creditTracker'
import { TEAM_SPACE_LIMITS } from '../lib/pricingTiers'
import { formatFullDateTime } from '../lib/dateFormat'
import { IconPlus, IconUser, IconUsers, IconClipboard, IconClock, IconImage } from './Icons'
import TeamAvatar from './TeamAvatar'
import dashboardBackground from '../../assets/img/dashboard-home-bg.webp'
import '../styles/DashboardHome.css'

function byRecency(a, b) {
  const dateOf = (p) => p.updatedAt || p.savedAt || p.generatedAt || ''
  return dateOf(b).localeCompare(dateOf(a))
}

// Accueil applicatif post-connexion : vue d'ensemble de tous les espaces (personnel +
// équipes) plutôt que d'atterrir directement dans un seul espace ou sur "Mon compte" —
// voir la discussion produit qui a mené à séparer nettement le mode marketing (landing,
// visible déconnecté) du mode application (ce composant, jamais visible déconnecté).
// L'agrégation cross-espaces (compteurs de plans par équipe) est réservée Pro, comme
// partout ailleurs dans l'app (voir AccountPage "Historique de tous les plans") — en
// gratuit, chaque carte reste un simple raccourci sans statistiques.
export default function DashboardHome({ lang, onOpenSpace, onCreatePlan, onOpenAccount, onOpenGallery, onCreateTeam }) {
  const team = useTeam()
  const { user } = useUser()
  const { userId } = useAuth()
  const pro = isPro(userId)
  const personalSpace = getPersonalSpace(userId, lang)
  const [allPlans, setAllPlans] = useState(null)

  const teamIdsKey = (team.myTeams || []).map(tm => tm.id).join(',')
  useEffect(() => {
    if (!userId || !pro) { setAllPlans(null); return }
    const teamIds = teamIdsKey ? teamIdsKey.split(',') : []
    fetchAllPlansAggregated(userId, teamIds).then(setAllPlans)
  }, [userId, pro, teamIdsKey])

  // En gratuit (ou tant que l'agrégation Pro n'a pas encore répondu), on ne connaît que
  // l'espace actuellement actif — voir getAllPlans() dans planStorage.js, scopé au localStorage
  // de cet espace précis.
  const activePlans = useMemo(() => getAllPlans(), [team.teamId])

  const spaceStats = (spaceId) => {
    if (allPlans) {
      const plans = allPlans.filter(p => (p.team_id ?? p.createdSpaceId ?? null) === spaceId)
      const last = plans.reduce((latest, p) => {
        const candidate = p.updatedAt || p.savedAt || p.generatedAt
        return !latest || (candidate && candidate > latest) ? candidate : latest
      }, null)
      return { count: plans.length, last, known: true }
    }
    if (spaceId === (team.teamId ?? null)) {
      const last = activePlans.reduce((latest, p) => {
        const candidate = p.updatedAt || p.savedAt || p.generatedAt
        return !latest || (candidate && candidate > latest) ? candidate : latest
      }, null)
      return { count: activePlans.length, last, known: true }
    }
    return { count: 0, last: null, known: false }
  }

  const teamLimit = pro ? TEAM_SPACE_LIMITS.pro : TEAM_SPACE_LIMITS.free
  const teamLimitReached = (team.myTeams?.length || 0) >= teamLimit

  const firstName = user?.firstName || user?.fullName?.split(' ')[0] || ''

  const spaces = useMemo(() => {
    const personal = { id: null, name: personalSpace.name, avatar: personalSpace.avatar, isTeam: false }
    const teams = (team.myTeams || [])
      .map(tm => ({ id: tm.id, name: tm.name, avatar: tm.hasImage ? tm.imageUrl : null, isTeam: true }))
      .sort((a, b) => a.name.localeCompare(b.name))
    return [personal, ...teams]
  }, [personalSpace.name, personalSpace.avatar, teamIdsKey])

  return (
    <div className="dashboard-home-outer">
      <div className="dashboard-home-bg" style={{ backgroundImage: `url(${dashboardBackground})` }} aria-hidden="true" />
      <div className="dashboard-home">
      <div className="dashboard-home-header">
        <div>
          <h1>{firstName ? t(lang, 'dashboard.greeting')(firstName) : t(lang, 'dashboard.greetingGeneric')}</h1>
          <p>{t(lang, 'dashboard.subtitle')}</p>
        </div>
        <button className="btn-primary dashboard-home-cta" onClick={onCreatePlan}>
          <IconPlus width={16} height={16} />
          {t(lang, 'dashboard.createPlan')}
        </button>
      </div>

      <div className="dashboard-home-grid">
        {spaces.map(space => {
          const isCurrent = (team.teamId ?? null) === space.id
          const stats = spaceStats(space.id)
          return (
            <button
              key={space.id ?? 'personal'}
              className={`dashboard-space-card ${isCurrent ? 'is-current' : ''}`}
              onClick={() => onOpenSpace(space.id)}
            >
              {space.isTeam ? (
                <TeamAvatar id={space.id} name={space.name} imageUrl={space.avatar} className="dashboard-space-avatar" />
              ) : space.avatar ? (
                <img className="dashboard-space-avatar" src={space.avatar} alt="" />
              ) : (
                <span className="dashboard-space-avatar dashboard-space-avatar-personal">
                  <IconUser width={16} height={16} />
                </span>
              )}
              <div className="dashboard-space-info">
                <span className="dashboard-space-name">
                  {space.name}
                  {isCurrent && <span className="dashboard-space-current-badge">{t(lang, 'dashboard.current')}</span>}
                </span>
                {stats.known ? (
                  <span className="dashboard-space-meta">
                    <IconClipboard width={12} height={12} />
                    {t(lang, 'dashboard.planCount')(stats.count)}
                    {stats.last && (
                      <>
                        <span className="dashboard-space-meta-sep">·</span>
                        <IconClock width={12} height={12} />
                        {formatFullDateTime(stats.last, lang)}
                      </>
                    )}
                  </span>
                ) : (
                  <span className="dashboard-space-meta dashboard-space-meta-muted">{t(lang, 'dashboard.openSpace')}</span>
                )}
              </div>
            </button>
          )
        })}

        {!teamLimitReached && (
          <button className="dashboard-space-card dashboard-space-card-new" onClick={onCreateTeam}>
            <span className="dashboard-space-avatar dashboard-space-avatar-new">
              <IconUsers width={16} height={16} />
            </span>
            <div className="dashboard-space-info">
              <span className="dashboard-space-name">{t(lang, 'dashboard.createTeam')}</span>
              <span className="dashboard-space-meta dashboard-space-meta-muted">{t(lang, 'dashboard.createTeamDesc')}</span>
            </div>
          </button>
        )}
      </div>

      <div className="dashboard-home-links">
        <button className="dashboard-home-link" onClick={onOpenAccount}>
          <IconClipboard width={14} height={14} />
          {t(lang, 'dashboard.viewHistory')}
        </button>
        <button className="dashboard-home-link" onClick={onOpenGallery}>
          <IconImage width={14} height={14} />
          {t(lang, 'dashboard.viewGallery')}
        </button>
      </div>
      </div>
    </div>
  )
}
