import { cloneElement, useEffect, useMemo, useState } from 'react'
import { t } from '../lib/i18n'
import { useTeam, useUser, useAuth } from '../lib/auth'
import { getAllPlans, fetchAllPlansAggregated } from '../lib/planStorage'
import { getPersonalSpace } from '../lib/personalSpace'
import { isPro } from '../lib/creditTracker'
import { TEAM_SPACE_LIMITS } from '../lib/pricingTiers'
import { formatDateNumericShort } from '../lib/dateFormat'
import { IconPlus, IconUser, IconClipboard, IconClock, IconImage, IconSparkle, IconCalendar, IconChevronRight, IconLayoutGrid, IconGauge, IconFlame, IconCloudSun } from './Icons'
import TeamAvatar from './TeamAvatar'
import DashboardCalendar from './DashboardCalendar'
import DashboardActivityFeed from './DashboardActivityFeed'
import DashboardWeeklySummary from './DashboardWeeklySummary'
import DashboardWidgetGrid from './DashboardWidgetGrid'
import DashboardWidgetLibrary from './DashboardWidgetLibrary'
import HoverTooltip from './HoverTooltip'
import { loadWidgetLayout, saveWidgetLayout } from '../lib/dashboardWidgets'
import { getDailyTip } from '../lib/dailyTips'
import { getUpcomingDeadlines, daysUntil } from '../lib/upcomingDeadlines'
import { fetchDailyTip } from '../lib/serverStorage'
import { computePortfolioHealth } from '../lib/portfolioHealth'
import { recordVisitAndGetStreak } from '../lib/streakTracker'
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
export default function DashboardHome({ lang, onOpenSpace, onCreatePlan, onOpenAccount, onOpenGallery, onCreateTeam, onLoadPlan, onOpenActivity }) {
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

  // Conseil du jour généré par IA côté serveur (voir /tip-of-the-day, régénéré toutes les
  // 15 minutes) — la liste statique locale (dailyTips.js) ne sert plus que de secours si le
  // backend n'est pas configuré ou injoignable, pour ne jamais laisser le bandeau vide. Le
  // ré-appel périodique permet au bandeau de se mettre à jour sans recharger la page.
  const [aiTip, setAiTip] = useState(null)
  useEffect(() => {
    let cancelled = false
    const load = () => fetchDailyTip().then(r => { if (!cancelled) setAiTip(r) })
    load()
    const interval = setInterval(load, 15 * 60 * 1000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [])
  const dailyTip = aiTip ? (lang === 'en' ? aiTip.tipEn : aiTip.tipFr) : getDailyTip(lang)

  const deadlines = useMemo(() => getUpcomingDeadlines(allPlans || activePlans), [allPlans, activePlans])

  // Statistiques agrégées envoyées à Nova pour le résumé hebdomadaire (voir
  // DashboardWeeklySummary.jsx) — jamais les plans complets, seulement des chiffres déjà
  // disponibles côté client (comptage de stories par statut, échéances déjà calculées).
  const weeklyStats = useMemo(() => {
    const pool = allPlans || activePlans
    let done = 0, inProgress = 0, todo = 0
    pool.forEach(p => {
      (p.roadmap?.sprints || []).forEach(sp => {
        (sp.stories || []).forEach(s => {
          if (s.status === 'done') done++
          else if (s.status === 'in_progress') inProgress++
          else todo++
        })
      })
    })
    return {
      planCount: pool.length,
      storiesDone: done,
      storiesInProgress: inProgress,
      storiesTodo: todo,
      upcomingDeadlines: deadlines.slice(0, 5).map(d => ({
        name: d.name, kind: d.kind, daysUntil: daysUntil(d.date)
      }))
    }
  }, [allPlans, activePlans, deadlines])

  // Dernier plan touché, tous espaces confondus (personnel + équipes, quand l'agrégation
  // Pro est disponible ; sinon juste l'espace actif) — pour la carte "Reprendre" qui évite
  // à l'utilisateur de rouvrir son espace puis chercher le bon plan dans la liste.
  const lastUsedPlan = useMemo(() => {
    const pool = allPlans || activePlans
    if (!pool.length) return null
    return pool.slice().sort(byRecency)[0]
  }, [allPlans, activePlans])

  const deadlineWhen = (isoDate) => {
    const n = daysUntil(isoDate)
    if (n === 0) return t(lang, 'dashboard.deadlinesToday')
    if (n === 1) return t(lang, 'dashboard.deadlinesTomorrow')
    return t(lang, 'dashboard.deadlinesInDays')(n)
  }

  // Jour + mois abrégés (ex: "lun. 25 août") plutôt qu'un format numérique — se lit
  // directement comme une case du calendrier au-dessus, plus facile à repérer d'un coup
  // d'œil que "25/08/26" (retour utilisateur : pouvoir s'y référer directement).
  const deadlineDateLabel = (isoDate) => new Date(isoDate).toLocaleDateString(
    lang === 'fr' ? 'fr-FR' : 'en-US',
    { weekday: 'short', day: 'numeric', month: 'short' }
  )

  // Urgence par code couleur sur le badge — imminent (aujourd'hui/demain) en rouge, cette
  // semaine en ambre, plus loin dans la couleur neutre d'origine. Un simple "Dans X jours"
  // wa noyé sans hiérarchie visuelle entre "demain" et "dans 3 semaines" (retour
  // utilisateur : "à toi d'innover").
  const deadlineUrgency = (isoDate) => {
    const n = daysUntil(isoDate)
    if (n <= 1) return 'urgent'
    if (n <= 7) return 'soon'
    return 'later'
  }

  const deadlineKind = (d) => d.kind === 'sprint'
    ? t(lang, 'dashboard.deadlinesKindSprint')(d.sprintId)
    : t(lang, 'dashboard.deadlinesKindLaunch')

  const spaces = useMemo(() => {
    const personal = { id: null, name: personalSpace.name, avatar: personalSpace.avatar, isTeam: false }
    const teams = (team.myTeams || [])
      .map(tm => ({ id: tm.id, name: tm.name, avatar: tm.hasImage ? tm.imageUrl : null, isTeam: true }))
      .sort((a, b) => a.name.localeCompare(b.name))
    return [personal, ...teams]
  }, [personalSpace.name, personalSpace.avatar, teamIdsKey])

  // Plans avec couverture (tous espaces confondus) pour le widget "Galerie publique" — le
  // nombre de vignettes affichées suit la taille choisie par l'utilisateur pour ce widget
  // (voir GALLERY_COUNT_BY_SIZE) plutôt qu'un nombre fixe qui gâcherait l'espace en Grand
  // ou déborderait en Petit.
  const galleryPlans = useMemo(() => (allPlans || activePlans).filter(p => p.coverImage), [allPlans, activePlans])

  // Tous les plans par ordre de dernière activité, pour le widget "Voir tout l'historique"
  // — même tri que "Reprendre" (byRecency) et même principe d'adapter le nombre de lignes
  // à la taille du widget.
  const recentPlans = useMemo(() => (allPlans || activePlans).slice().sort(byRecency), [allPlans, activePlans])

  const lastUsedPlanSpaceName = lastUsedPlan
    ? (spaces.find(s => s.id === (lastUsedPlan.team_id ?? lastUsedPlan.createdSpaceId ?? null))?.name || personalSpace.name)
    : null

  // Streak de jours d'activité consécutifs (widget "Streak", masqué par défaut — voir
  // WIDGET_DEFAULT_HIDDEN) — un seul enregistrement par ouverture du Dashboard, aucun appel
  // serveur.
  const [streak, setStreak] = useState({ count: 0 })
  useEffect(() => { if (userId) setStreak(recordVisitAndGetStreak(userId)) }, [userId])

  const portfolioHealth = useMemo(() => computePortfolioHealth(weeklyStats), [weeklyStats])

  const [libraryOpen, setLibraryOpen] = useState(false)

  // Ids de tous les widgets potentiellement affichables à cet instant — dérivés (jamais
  // figés) car certains n'existent que sous condition (résumé Nova réservé Pro, "Reprendre"
  // seulement s'il y a un dernier plan, une carte par espace réellement présent, "Créer une
  // équipe" tant que la limite n'est pas atteinte). Sert à la fois à charger/persister la
  // disposition (dashboardWidgets.js) et à savoir quels widgets un id de la bibliothèque
  // (widgetCatalog.js) peut réellement être ajouté ou retiré.
  const availableWidgetIds = useMemo(() => [
    'calendar', 'deadlines', 'activity',
    ...(pro ? ['nova'] : []),
    ...(lastUsedPlan ? ['resume'] : []),
    ...spaces.map(space => `space:${space.id ?? 'personal'}`),
    ...(!teamLimitReached ? ['newTeam'] : []),
    'history', 'gallery',
    'portfolioHealth', 'streak', 'businessWeather'
  ], [pro, lastUsedPlan, spaces, teamLimitReached])

  const widgetDefaults = {
    order: ['calendar', 'deadlines', 'activity', 'nova', 'resume', 'newTeam', 'history', 'gallery', 'portfolioHealth', 'streak', 'businessWeather'],
    sizes: {
      calendar: 'large', deadlines: 'medium', activity: 'medium', nova: 'medium',
      resume: 'small', newTeam: 'medium', history: 'small', gallery: 'small',
      portfolioHealth: 'small', streak: 'small', businessWeather: 'small'
    },
    // Widgets tout juste ajoutés au catalogue par une mise à jour du produit : masqués tant
    // que l'utilisateur ne les ajoute pas lui-même via la bibliothèque ("+").
    hidden: ['portfolioHealth', 'streak', 'businessWeather']
  }

  const widgetIdsKey = availableWidgetIds.slice().sort().join(',')
  const [widgetLayout, setWidgetLayout] = useState(() => loadWidgetLayout(userId, availableWidgetIds, widgetDefaults))
  useEffect(() => {
    setWidgetLayout(loadWidgetLayout(userId, availableWidgetIds, widgetDefaults))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, widgetIdsKey])

  const persistWidgetLayout = (next) => {
    setWidgetLayout(next)
    saveWidgetLayout(userId, next)
  }

  return (
    <div className="dashboard-home-outer">
      <IconGradientDefs />
      <div className="dashboard-tip-ticker">
        <div className="dashboard-tip-ticker-track">
          <span className="dashboard-tip-ticker-item">
            {gradientIcon(<IconSparkle width={14} height={14} />)}
            {dailyTip}
          </span>
          <span className="dashboard-tip-ticker-item" aria-hidden="true">
            {gradientIcon(<IconSparkle width={14} height={14} />)}
            {dailyTip}
          </span>
        </div>
      </div>
      <div
        className="dashboard-home-bg"
        style={{
          '--dashboard-bg-desktop': `url(${dashboardBackground})`,
          '--dashboard-bg-mobile': `url(${dashboardBackgroundMobile})`
        }}
        aria-hidden="true"
      />
      <div className="dashboard-home">
      {/* "Bonjour X" en tout premier, avant les widgets — demandé explicitement. Un seul
          message continu (nom + aperçu du jour + rappel du plan + encouragement) plutôt
          que trois phrases empilées séparément. */}
      <div className="dashboard-home-header">
        <h1>
          {firstName ? (
            <>
              {t(lang, 'dashboard.greetingPrefix')} <span className="dashboard-greeting-name">{firstName}</span>
              {t(lang, 'dashboard.greetingCombinedRest')(t(lang, pro ? 'dashboard.planLabelPro' : 'dashboard.planLabelFree'))}
            </>
          ) : (
            t(lang, 'dashboard.greetingCombinedGeneric')(t(lang, pro ? 'dashboard.planLabelPro' : 'dashboard.planLabelFree'))
          )}
        </h1>
        <div className="dashboard-home-header-actions">
          {userId && (
            <button
              type="button"
              className="dashboard-widgets-btn"
              onClick={() => setLibraryOpen(true)}
              aria-label={t(lang, 'dashboard.addWidgets')}
              title={t(lang, 'dashboard.addWidgets')}
            >
              <IconLayoutGrid width={18} height={18} />
            </button>
          )}
          <button className="btn-primary dashboard-home-cta" onClick={onCreatePlan}>
            <IconPlus width={16} height={16} />
            {t(lang, 'dashboard.createPlan')}
          </button>
        </div>
      </div>

      {/* Widgets façon macOS : déplaçables (glisser-déposer) et redimensionnables (clic
          droit → Petit/Moyen/Grand), disposition mémorisée par utilisateur. Toute la page
          est désormais composée de widgets — calendrier, échéances, activité, résumé Nova,
          reprise, une carte par espace (personnel + équipes), "Créer une équipe",
          "Historique" et "Galerie publique" — plutôt que seulement les cartes du haut
          (retour utilisateur). Activité toujours visible ; résumé Nova réservé Pro (même
          restriction que l'agrégation cross-espaces dont ses statistiques dérivent) ;
          "Reprendre" seulement s'il existe un dernier plan touché. */}
      {userId && (
        <DashboardWidgetGrid
          lang={lang}
          layout={widgetLayout}
          onLayoutChange={persistWidgetLayout}
          mandatoryIds={['calendar', 'resume']}
          widgets={{
            calendar: <DashboardCalendar lang={lang} deadlines={deadlines} plans={allPlans || activePlans} onOpenPlan={onLoadPlan} />,
            deadlines: (
              <div className="dashboard-widget-card dashboard-deadlines-card">
                <div className="dashboard-widget-header">
                  {gradientIcon(<IconCalendar width={16} height={16} />)}
                  <h3>{t(lang, 'dashboard.deadlinesTitle')}</h3>
                </div>
                {deadlines.length === 0 ? (
                  <p className="dashboard-deadlines-empty">{t(lang, 'dashboard.deadlinesEmpty')}</p>
                ) : (
                  <ul className="dashboard-deadlines-list">
                    {deadlines.map(d => (
                      <li key={d.id}>
                        {/* Toute la ligne cliquable — redirige directement vers le plan concerné,
                            même logique que le popover du jour dans le calendrier au-dessus, pour
                            ne pas avoir à repasser par une carte d'espace ou l'historique. */}
                        <button
                          type="button"
                          className="dashboard-deadline-row"
                          onClick={() => onLoadPlan?.(d.plan)}
                          disabled={!d.plan || !onLoadPlan}
                        >
                          {/* Vignette discrète du plan (quand il en a une) pour distinguer les
                              échéances entre plusieurs plans d'un coup d'œil, sans avoir à lire le
                              nom en entier — même logique que les aperçus de plans des cartes
                              d'espace juste en dessous. */}
                          <span className="dashboard-deadline-thumb">
                            {d.coverImage
                              ? <img src={d.coverImage} alt="" />
                              : <span className="dashboard-deadline-thumb-fallback" aria-hidden="true" />}
                          </span>
                          <span className="dashboard-deadline-info">
                            <span className="dashboard-deadline-name">{d.name || t(lang, 'dashboard.deadlinesUntitled')}</span>
                            <span className="dashboard-deadline-kind">{deadlineKind(d)}</span>
                            {/* Date exacte, pour s'y référer directement sur le calendrier
                                au-dessus — le badge "Dans X jours" seul ne dit pas quel jour. */}
                            <span className="dashboard-deadline-date">{deadlineDateLabel(d.date)}</span>
                          </span>
                          <span className={`dashboard-deadline-when is-${deadlineUrgency(d.date)}`}>{deadlineWhen(d.date)}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ),
            activity: <DashboardActivityFeed userId={userId} lang={lang} onOpen={onOpenActivity} />,
            ...(pro ? { nova: <DashboardWeeklySummary userId={userId} lang={lang} stats={weeklyStats} /> } : {}),
            ...(lastUsedPlan ? {
              resume: (
                <button className="dashboard-resume-square" onClick={() => onLoadPlan?.(lastUsedPlan)}>
                  {lastUsedPlan.coverImage
                    ? <img src={lastUsedPlan.coverImage} alt="" className="dashboard-resume-square-bg" />
                    : <span className="dashboard-resume-square-bg dashboard-resume-square-fallback" aria-hidden="true" />}
                  <span className="dashboard-resume-square-overlay">
                    <span className="dashboard-resume-square-label">{t(lang, 'dashboard.resumeLabel')}</span>
                    <span className="dashboard-resume-square-name">{lastUsedPlan.product?.name || t(lang, 'plans.untitled')}</span>
                    <span className="dashboard-resume-square-space">
                      {lastUsedPlanSpaceName}
                      <IconChevronRight width={14} height={14} />
                    </span>
                  </span>
                </button>
              )
            } : {}),

            // Une carte d'espace = un widget (personnel + chaque équipe), plutôt qu'une
            // grille séparée à part de la disposition déplaçable.
            ...Object.fromEntries(spaces.map(space => {
              const isCurrent = (team.teamId ?? null) === space.id
              const stats = spaceStats(space.id)
              return [`space:${space.id ?? 'personal'}`, (
                <button
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
                      <span className="dashboard-space-name-text">{space.name}</span>
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
                              <HoverTooltip
                                key={p.id}
                                className="plans-preview-thumb"
                                label={`Plan : ${p.product?.name || (lang === 'fr' ? 'Sans titre' : 'Untitled')}`}
                              >
                                {p.coverImage
                                  ? <img src={p.coverImage} alt="" />
                                  : <span className="plans-preview-fallback" aria-hidden="true" />}
                              </HoverTooltip>
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
              )]
            })),

            ...(!teamLimitReached ? {
              newTeam: (
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
              )
            } : {}),

            // Fonctions plutôt que nœuds statiques : le contenu s'adapte à la taille
            // choisie par l'utilisateur pour ce widget (voir DashboardWidgetGrid).
            history: (size) => {
              const rows = { small: 3, medium: 6, large: 10 }[size] || 6
              return (
                <div className="dashboard-widget-card dashboard-history-widget">
                  <button className="dashboard-widget-header dashboard-widget-header-link" onClick={onOpenAccount}>
                    <IconClipboard width={16} height={16} />
                    <h3>{t(lang, 'dashboard.viewHistory')}</h3>
                  </button>
                  {recentPlans.length === 0 ? (
                    <p className="dashboard-history-empty">{t(lang, 'dashboard.historyEmpty')}</p>
                  ) : (
                    <ul className="dashboard-history-list">
                      {recentPlans.slice(0, rows).map(p => (
                        <li key={p.id}>
                          <button className="dashboard-history-row" onClick={() => onLoadPlan?.(p)}>
                            <span className="dashboard-history-thumb">
                              {p.coverImage
                                ? <img src={p.coverImage} alt="" />
                                : <span className="dashboard-history-thumb-fallback" aria-hidden="true" />}
                            </span>
                            <span className="dashboard-history-name">{p.product?.name || t(lang, 'plans.untitled')}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            },
            gallery: (size) => {
              const count = { small: 4, medium: 8, large: 16 }[size] || 8
              return (
                <div className="dashboard-widget-card dashboard-gallery-widget">
                  <button className="dashboard-widget-header dashboard-widget-header-link" onClick={onOpenGallery}>
                    <IconImage width={16} height={16} />
                    <h3>{t(lang, 'dashboard.viewGallery')}</h3>
                  </button>
                  {galleryPlans.length === 0 ? (
                    <p className="dashboard-history-empty">{t(lang, 'dashboard.galleryEmpty')}</p>
                  ) : (
                    <div className="dashboard-gallery-grid">
                      {galleryPlans.slice(0, count).map(p => (
                        <HoverTooltip
                          as="button"
                          key={p.id}
                          className="dashboard-gallery-thumb"
                          label={p.product?.name || t(lang, 'plans.untitled')}
                          onClick={() => onLoadPlan?.(p)}
                        >
                          <img src={p.coverImage} alt="" />
                        </HoverTooltip>
                      ))}
                    </div>
                  )}
                </div>
              )
            },

            // Trois nouveaux widgets (voir widgetCatalog.js) : masqués par défaut, ajoutés
            // via la bibliothèque de widgets ("+"). Dérivés des mêmes statistiques déjà
            // agrégées pour le résumé Nova / les échéances — aucune donnée ni appel
            // supplémentaire.
            portfolioHealth: (
              <div className="dashboard-widget-card dashboard-portfolio-health-widget">
                <div className="dashboard-widget-header">
                  {gradientIcon(<IconGauge width={16} height={16} />)}
                  <h3>{t(lang, 'dashboard.portfolioHealthTitle')}</h3>
                </div>
                <div className={`dashboard-health-gauge is-${portfolioHealth.level}`}>
                  <svg viewBox="0 0 100 56" className="dashboard-health-gauge-svg">
                    <path d="M6 50a44 44 0 0 1 88 0" fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="10" strokeLinecap="round" />
                    <path
                      d="M6 50a44 44 0 0 1 88 0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${(portfolioHealth.score / 100) * 138} 138`}
                    />
                  </svg>
                  <span className="dashboard-health-gauge-score">{portfolioHealth.score}%</span>
                </div>
                <p className="dashboard-health-label">{t(lang, `dashboard.portfolioHealthLevel.${portfolioHealth.level}`)}</p>
                <p className="dashboard-health-sub">{t(lang, 'dashboard.portfolioHealthUrgent')(portfolioHealth.urgentCount)}</p>
              </div>
            ),
            streak: (
              <div className="dashboard-widget-card dashboard-streak-widget">
                <div className="dashboard-widget-header">
                  {gradientIcon(<IconFlame width={16} height={16} />)}
                  <h3>{t(lang, 'dashboard.streakTitle')}</h3>
                </div>
                <div className="dashboard-streak-body">
                  {gradientIcon(<IconFlame width={32} height={32} />)}
                  <span className="dashboard-streak-count">{t(lang, 'dashboard.streakDays')(streak.count)}</span>
                </div>
                <p className="dashboard-health-sub">{t(lang, 'dashboard.streakSubtitle')}</p>
              </div>
            ),
            businessWeather: (
              <div className={`dashboard-widget-card dashboard-weather-widget is-${portfolioHealth.level}`}>
                <div className="dashboard-widget-header">
                  {gradientIcon(<IconCloudSun width={16} height={16} />)}
                  <h3>{t(lang, 'dashboard.businessWeatherTitle')}</h3>
                </div>
                <div className="dashboard-weather-body">
                  {gradientIcon(<IconCloudSun width={32} height={32} />)}
                  <span className="dashboard-weather-label">{t(lang, `dashboard.businessWeatherLevel.${portfolioHealth.level}`)}</span>
                </div>
              </div>
            )
          }}
        />
      )}

      {libraryOpen && (
        <DashboardWidgetLibrary
          lang={lang}
          availableIds={availableWidgetIds}
          hidden={widgetLayout.hidden || []}
          pro={pro}
          onAdd={(id) => persistWidgetLayout({ ...widgetLayout, hidden: (widgetLayout.hidden || []).filter(h => h !== id) })}
          onRemove={(id) => persistWidgetLayout({ ...widgetLayout, hidden: [...new Set([...(widgetLayout.hidden || []), id])] })}
          onClose={() => setLibraryOpen(false)}
        />
      )}
      </div>
    </div>
  )
}
