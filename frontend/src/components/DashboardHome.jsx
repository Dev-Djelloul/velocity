import { cloneElement, useEffect, useMemo, useState } from 'react'
import { t } from '../lib/i18n'
import { useTeam, useUser, useAuth } from '../lib/auth'
import { getAllPlans, fetchAllPlansAggregated } from '../lib/planStorage'
import { getPersonalSpace } from '../lib/personalSpace'
import { isPro } from '../lib/creditTracker'
import { TEAM_SPACE_LIMITS } from '../lib/pricingTiers'
import { formatDateNumericShort } from '../lib/dateFormat'
import { IconPlus, IconUser, IconClipboard, IconClock, IconImage } from './Icons'
import TeamAvatar from './TeamAvatar'
import dashboardBackground from '../../assets/img/dashboard-home-bg.webp'
import dashboardBackgroundMobile from '../../assets/img/dashboard-home-bg-mobile.webp'
import createTeamImage from '../../assets/img/hiw-hero-tablets-purple.webp'
import '../styles/TeamPresenceAvatars.css'
import '../styles/DashboardHome.css'

function byRecency(a, b) {
  const dateOf = (p) => p.updatedAt || p.savedAt || p.generatedAt || ''
  return dateOf(b).localeCompare(dateOf(a))
}

// Dégradé partagé pour les icônes de la carte d'espace ACTUEL (mode clair) — même
// technique que InfoModal.jsx : stroke="currentColor" est posé sur la balise <svg>
// elle-même (voir Icons.jsx, objet `base`) et hérité par tous les <path> enfants sans
// qu'ils la redéfinissent, donc remplacer le stroke une seule fois ici colore l'icône
// entière, quelle que soit l'icône. Un seul <defs> suffit (id fixe, pas plusieurs cartes
// "actuelles" affichées à la fois).
function IconGradientDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <linearGradient id="dashboard-icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9184d9" />
          <stop offset="40%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function gradientIcon(icon) {
  return cloneElement(icon, { stroke: 'url(#dashboard-icon-gradient)' })
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
      return { count: plans.length, last, known: true, plans }
    }
    if (spaceId === (team.teamId ?? null)) {
      const last = activePlans.reduce((latest, p) => {
        const candidate = p.updatedAt || p.savedAt || p.generatedAt
        return !latest || (candidate && candidate > latest) ? candidate : latest
      }, null)
      return { count: activePlans.length, last, known: true, plans: activePlans }
    }
    return { count: 0, last: null, known: false, plans: [] }
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
      <IconGradientDefs />
      <div
        className="dashboard-home-bg"
        style={{
          '--dashboard-bg-desktop': `url(${dashboardBackground})`,
          '--dashboard-bg-mobile': `url(${dashboardBackgroundMobile})`
        }}
        aria-hidden="true"
      />
      <div className="dashboard-home">
      <div className="dashboard-home-header">
        <h1>{firstName ? t(lang, 'dashboard.greeting')(firstName) : t(lang, 'dashboard.greetingGeneric')}</h1>
        <p>{t(lang, 'dashboard.subtitle')}</p>
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
              <div className="dashboard-space-card-media">
                {space.isTeam ? (
                  <TeamAvatar id={space.id} name={space.name} imageUrl={space.avatar} className="dashboard-space-avatar" />
                ) : space.avatar ? (
                  <img className="dashboard-space-avatar" src={space.avatar} alt="" />
                ) : (
                  <span className="dashboard-space-avatar dashboard-space-avatar-personal">
                    {isCurrent ? gradientIcon(<IconUser width={22} height={22} />) : <IconUser width={22} height={22} />}
                  </span>
                )}
              </div>
              <div className="dashboard-space-card-body">
              <div className="dashboard-space-info">
                <span className="dashboard-space-name">
                  {space.name}
                  {isCurrent && <span className="dashboard-space-current-badge">{t(lang, 'dashboard.current')}</span>}
                </span>
                {stats.known ? (
                  <>
                    <span className="dashboard-space-meta">
                      {stats.last && (
                        <>
                          {isCurrent ? gradientIcon(<IconClock width={12} height={12} />) : <IconClock width={12} height={12} />}
                          {formatDateNumericShort(stats.last, lang)}
                        </>
                      )}
                    </span>
                    {!!stats.plans.length && (
                      <div className="members-presence-row dashboard-space-plans-row">
                        {stats.plans.slice(0, 6).map(p => (
                          <span
                            key={p.id}
                            className="plans-preview-thumb avatar-tooltip"
                            data-tooltip={`Plan : ${p.product?.name || (lang === 'fr' ? 'Sans titre' : 'Untitled')}`}
                          >
                            {p.coverImage
                              ? <img src={p.coverImage} alt="" />
                              : <span className="plans-preview-fallback" aria-hidden="true" />}
                          </span>
                        ))}
                        {stats.plans.length > 6 && <span className="team-presence-more">+{stats.plans.length - 6}</span>}
                      </div>
                    )}
                    <p className="dashboard-space-summary">
                      {t(lang, space.isTeam ? 'dashboard.planSummaryTeam' : 'dashboard.planSummaryPersonal')(stats.count)}
                    </p>
                  </>
                ) : (
                  <span className="dashboard-space-meta dashboard-space-meta-muted">{t(lang, 'dashboard.openSpace')}</span>
                )}
              </div>
              </div>
            </button>
          )
        })}

        {!teamLimitReached && (
          <button className="dashboard-space-card dashboard-space-card-new" onClick={onCreateTeam}>
            <div className="dashboard-space-card-media">
              <img className="dashboard-space-avatar" src={createTeamImage} alt="" />
            </div>
            <div className="dashboard-space-card-body">
            <div className="dashboard-space-info">
              <span className="dashboard-space-name">{t(lang, 'dashboard.createTeam')}</span>
              <span className="dashboard-space-meta dashboard-space-meta-muted">{t(lang, 'dashboard.createTeamDesc')}</span>
            </div>
            </div>
          </button>
        )}
      </div>

      <div className="dashboard-home-links">
        <button className="dashboard-home-link" onClick={onOpenAccount}>
          <span className="dashboard-home-link-icon"><IconClipboard width={13} height={13} /></span>
          {t(lang, 'dashboard.viewHistory')}
        </button>
        <button className="dashboard-home-link" onClick={onOpenGallery}>
          <span className="dashboard-home-link-icon"><IconImage width={13} height={13} /></span>
          {t(lang, 'dashboard.viewGallery')}
        </button>
      </div>
      </div>
    </div>
  )
}
