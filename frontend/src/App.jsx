import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Landing from './components/Landing'
import DemoModal from './components/DemoModal'
import Wordmark from './components/Wordmark'
import { IconClipboard, IconUser, IconLogin, IconLock, IconSparkle, IconSun, IconMoon, IconSettings, IconLogOut, IconChevronDown, IconUsers, IconCheckCircle, IconPlus, IconBarChart, IconMessageCircle } from './components/Icons'
import InfoModal from './components/InfoModal'
import Questionnaire from './components/Questionnaire'
import PlanViewer from './components/PlanViewer'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import PlansHistory from './components/PlansHistory'
import DraftsModal from './components/DraftsModal'
import SecurityPage from './components/SecurityPage'
import HowItWorksPage from './components/HowItWorksPage'
import AccountPage from './components/AccountPage'
import TeamPage from './components/TeamPage'
import TeamAvatar from './components/TeamAvatar'
import SpacePage from './components/SpacePage'
import AuthPage from './components/AuthPage'
import { AboutModal, CareersModal, ContactModal } from './components/CompanyModals'
import { PricingModal, ChangelogModal, RoadmapModal } from './components/ProductModals'
import { PrivacyModal, TermsModal, CookiesModal } from './components/LegalModals'
import { generatePlan } from './lib/planGenerator'
import { t } from './lib/i18n'
import { savePlan, getAllPlans, getShareLink, setActiveUser as setPlanActiveUser, setActiveTeam as setPlanActiveTeam, setActiveCreator as setPlanActiveCreator, syncPlansFromServer, generateId } from './lib/planStorage'
import { collectRecentComments } from './lib/notifications'
import { getReadIds } from './lib/commentReads'
import { setActiveUser as setDraftActiveUser, syncDraftsFromServer } from './lib/draftStorage'
import { useUser, useAuth, useTeam } from './lib/auth'
import { canGenerate, consumeCredit, remainingCredits, isPro, syncCreditsFromServer } from './lib/creditTracker'
import './styles/design-system.css'
import './styles/accessibility.css'
import './App.css'

const AUTH_ONLY_PAGES = ['questionnaire', 'result', 'account', 'team', 'space']

// Chaque page "logique" de l'app (currentPage) correspond à une vraie URL, indispensable
// pour que Google indexe plusieurs pages distinctes et que les liens soient partageables.
// On garde currentPage comme source de vérité pour toute la logique existante (guards,
// navigation interne...) et on la synchronise avec l'URL dans les deux sens plutôt que de
// réécrire tous les appels à setCurrentPage en navigate() — bien plus sûr sur une app de
// cette taille.
const PAGE_TO_PATH = {
  landing: '/',
  howItWorks: '/comment-ca-marche',
  questionnaire: '/questionnaire',
  result: '/mon-plan',
  account: '/mon-compte',
  team: '/mon-equipe',
  space: '/mon-espace'
}
const PATH_TO_PAGE = {
  '/': 'landing',
  '/comment-ca-marche': 'howItWorks',
  '/connexion': 'auth',
  '/inscription': 'auth',
  '/questionnaire': 'questionnaire',
  '/mon-plan': 'result',
  '/mon-compte': 'account',
  '/mon-equipe': 'team',
  '/mon-espace': 'space'
}

function pathForPage(page, authMode) {
  if (page === 'auth') return authMode === 'signup' ? '/inscription' : '/connexion'
  return PAGE_TO_PATH[page] || '/'
}

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [lang, setLang] = useState(() => localStorage.getItem('plp_lang') || 'fr')
  const [theme, setTheme] = useState(() => localStorage.getItem('plp_theme') || 'dark')
  const [currentPage, setCurrentPage] = useState(() => PATH_TO_PAGE[window.location.pathname] || 'landing')
  const [plan, setPlan] = useState(null)
  const [justGenerated, setJustGenerated] = useState(false)
  const [initialFormData, setInitialFormData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [inviteTicketDismissed, setInviteTicketDismissed] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showDemo, setShowDemo] = useState(false)
  const [showDrafts, setShowDrafts] = useState(false)
  const [activeModal, setActiveModal] = useState(null)
  const [isSharedView, setIsSharedView] = useState(false)
  const [dataVersion, setDataVersion] = useState(0)
  const [authMode, setAuthMode] = useState(() => window.location.pathname === '/connexion' ? 'signin' : 'signup')
  const [authIntent, setAuthIntent] = useState(null)
  const [pendingDemoData, setPendingDemoData] = useState(null)
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [openHeaderMenu, setOpenHeaderMenu] = useState(null) // 'settings' | 'account' | null
  const [showCreateTeam, setShowCreateTeam] = useState(false)
  const [switchingSpace, setSwitchingSpace] = useState(false)
  const [creatingTeam, setCreatingTeam] = useState(false)
  const [pendingNotificationPlanId, setPendingNotificationPlanId] = useState(null)
  const [newTeamName, setNewTeamName] = useState('')
  const headerMenuRef = useRef(null)

  useEffect(() => {
    if (!openHeaderMenu) return
    const handleClickOutside = (e) => {
      if (headerMenuRef.current && !headerMenuRef.current.contains(e.target)) {
        setOpenHeaderMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openHeaderMenu])

  const { isSignedIn, isLoaded, user } = useUser()
  const { userId, signOut } = useAuth()
  const team = useTeam()
  const wasSignedIn = useRef(isSignedIn)

  const goToAuth = (mode, intent = null) => {
    setAuthMode(mode)
    setAuthIntent(intent)
    setCurrentPage('auth')
    window.scrollTo(0, 0)
  }

  useEffect(() => {
    localStorage.setItem('plp_lang', lang)
    window.dispatchEvent(new CustomEvent('plp-langchange', { detail: lang }))
  }, [lang])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('plp_theme', theme)
  }, [theme])

  // Reflète currentPage/authMode dans l'URL (navigation interne -> barre d'adresse).
  useEffect(() => {
    const target = pathForPage(currentPage, authMode)
    if (location.pathname !== target) {
      navigate({ pathname: target, search: location.search }, { replace: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, authMode])

  // Reflète l'URL dans currentPage/authMode (bouton précédent/suivant, lien direct, refresh).
  useEffect(() => {
    const page = PATH_TO_PAGE[location.pathname] || 'landing'
    if (page !== currentPage) setCurrentPage(page)
    if (page === 'auth') {
      const mode = location.pathname === '/connexion' ? 'signin' : 'signup'
      if (mode !== authMode) setAuthMode(mode)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  // Lien d'invitation d'équipe Clerk (__clerk_ticket dans l'URL) : un visiteur non connecté
  // doit atterrir sur le formulaire d'inscription pour que <SignUp> (dans AuthPage) prenne
  // en charge le ticket automatiquement — sans ce routage, l'URL retombe sur la page
  // d'accueil où aucun composant Clerk n'est monté, et le ticket n'est jamais traité.
  useEffect(() => {
    if (!isLoaded || isSignedIn) return
    if (!new URLSearchParams(location.search).has('__clerk_ticket')) return
    if (currentPage !== 'auth') {
      setAuthMode('signup')
      setCurrentPage('auth')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn, location.search])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const shareId = params.get('share')
    if (shareId) {
      (async () => {
        const shared = await getShareLink(shareId)
        if (shared?.plan) {
          setPlan(shared.plan)
          setJustGenerated(false)
          setIsSharedView(true)
          setCurrentPage('result')
        }
      })()
    }
  }, [])

  // Flux demandé : Commencer -> page de connexion dédiée -> atterrit directement sur le
  // formulaire (questionnaire). Un simple "Se connecter" depuis le header ramène vers "Mon
  // compte" par défaut. Détecte toute transition signed-out -> signed-in, et hydrate le cache
  // local (plans/brouillons/crédits) depuis le stockage serveur.
  useEffect(() => {
    if (!isLoaded) return
    if (!wasSignedIn.current && isSignedIn && userId) {
      setPlanActiveUser(userId)
      setDraftActiveUser(userId)
      // La sync des plans est gérée par l'effet dédié ci-dessous (aussi déclenché par un
      // changement d'équipe active) — inutile de la dupliquer ici.
      Promise.all([
        syncDraftsFromServer(userId),
        syncCreditsFromServer(userId)
      ]).then(() => setDataVersion(v => v + 1))
      if (pendingDemoData) {
        loadDemoPlan(pendingDemoData)
        setPendingDemoData(null)
      } else {
        setCurrentPage(authIntent || 'account')
      }
      setAuthIntent(null)
      window.scrollTo(0, 0)
    }
    if (wasSignedIn.current && !isSignedIn) {
      setPlanActiveUser(null)
      setPlanActiveTeam(null)
      setDraftActiveUser(null)
    }
    wasSignedIn.current = isSignedIn
  }, [isSignedIn, isLoaded, userId, authIntent])

  // Resynchronise la liste des plans à chaque changement d'espace actif (personnel <->
  // équipe, ou passage d'une équipe à une autre) — couvre aussi la sync initiale au login,
  // team.teamId valant alors null (espace personnel) le temps que Clerk charge l'org active.
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId || !team.isLoaded) return
    setPlanActiveTeam(team.teamId, team.role, team.teamName)
    setPlanActiveCreator(user?.fullName || user?.firstName || null)
    syncPlansFromServer(userId, team.teamId).then(() => setDataVersion(v => v + 1))
  }, [isLoaded, isSignedIn, userId, team.teamId, team.role, team.teamName, team.isLoaded, user])

  // Retour depuis Stripe Checkout : le webhook a normalement déjà activé le Pro
  // côté serveur, on resynchronise le cache local et on nettoie l'URL.
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId) return
    const params = new URLSearchParams(window.location.search)
    if (params.get('upgraded') !== '1') return
    syncCreditsFromServer(userId).then(() => setDataVersion(v => v + 1))
    params.delete('upgraded')
    const query = params.toString()
    window.history.replaceState({}, '', window.location.pathname + (query ? `?${query}` : ''))
  }, [isLoaded, isSignedIn, userId])

  // Garde-fou : les pages compte/questionnaire/résultat exigent une session active.
  // Inversement, une session déjà active n'a rien à faire sur la page de connexion.
  useEffect(() => {
    if (!isLoaded) return
    if (currentPage === 'result' && isSharedView) return // lien de partage : consultable sans compte
    if (AUTH_ONLY_PAGES.includes(currentPage) && !isSignedIn) {
      setCurrentPage('landing')
    }
    if (currentPage === 'auth' && isSignedIn) {
      setCurrentPage('landing')
    }
  }, [currentPage, isSignedIn, isLoaded, isSharedView])

  // Une démo est un aperçu illustratif, pas un vrai plan : génération locale instantanée
  // (moteur à règles, aucun appel IA), sans consommer de crédit ni polluer "Mes plans".
  const loadDemoPlan = (demoData) => {
    const generatedPlan = generatePlan({ ...demoData, language: lang })
    // Id éphémère (non persisté) pour que la section Agents IA s'affiche aussi en démo
    generatedPlan.id = `demo-${generateId()}`
    setPlan(generatedPlan)
    setJustGenerated(true)
    setIsSharedView(false)
    setCurrentPage('result')
    window.scrollTo(0, 0)
  }

  const handleGenerate = async (data) => {
    setLoading(true)
    setError(null)
    const payload = { ...data, language: lang }
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL
      let generatedPlan
      if (backendUrl) {
        const response = await fetch(backendUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        if (!response.ok) throw new Error('backend error')
        generatedPlan = await response.json()
      } else {
        await new Promise(r => setTimeout(r, 400))
        generatedPlan = generatePlan(payload)
      }
      const savedPlan = savePlan(generatedPlan)
      consumeCredit(userId)
      localStorage.removeItem('plp_form')
      setInitialFormData(null)
      setPlan(savedPlan)
      setJustGenerated(true)
      setIsSharedView(false)
      setCurrentPage('result')
      window.scrollTo(0, 0)
    } catch (e) {
      try {
        const generatedPlan = generatePlan(payload)
        const savedPlan = savePlan(generatedPlan)
        consumeCredit(userId)
        localStorage.removeItem('plp_form')
        setInitialFormData(null)
        setPlan(savedPlan)
        setJustGenerated(true)
        setIsSharedView(false)
        setCurrentPage('result')
        window.scrollTo(0, 0)
      } catch {
        setError(t(lang, 'errors.generic'))
      }
    } finally {
      setLoading(false)
    }
  }

  const handleStartClick = () => {
    if (!isSignedIn) {
      goToAuth('signup', 'questionnaire')
      return
    }
    if (!canGenerate(userId)) {
      setShowLimitModal(true)
      return
    }
    // Départ volontaire d'un nouveau plan : on efface tout brouillon auto-sauvegardé
    // pour ne pas faire réapparaître un ancien formulaire déjà généré.
    localStorage.removeItem('plp_form')
    setInitialFormData(null)
    setCurrentPage('questionnaire')
    window.scrollTo(0, 0)
  }

  const handleReset = () => {
    setPlan(null)
    setJustGenerated(false)
    localStorage.removeItem('plp_form')
    setInitialFormData(null)
    handleStartClick()
  }

  const handleLoadDemo = (demoData) => {
    if (!isSignedIn) {
      setPendingDemoData(demoData)
      goToAuth('signin')
      return
    }
    loadDemoPlan(demoData)
  }

  const handleLoadFromHistory = (loadedPlan) => {
    setPlan(loadedPlan)
    setJustGenerated(false)
    setIsSharedView(false)
    setShowHistory(false)
    setCurrentPage('result')
    window.scrollTo(0, 0)
  }

  // Ouvrir une notification peut demander de changer d'espace actif au préalable (le
  // commentaire peut venir d'une équipe différente de celle affichée) — le changement est
  // asynchrone côté Clerk, donc on mémorise l'id à ouvrir et l'effet ci-dessous prend le
  // relais dès que le nouvel espace est chargé et ses plans resynchronisés.
  const handleOpenNotification = (item) => {
    if (item.spaceId === team.teamId) {
      const found = getAllPlans().find(p => p.id === item.planId)
      if (found) handleLoadFromHistory(found)
      return
    }
    setPendingNotificationPlanId(item.planId)
    team.setActiveTeamId(item.spaceId)
  }

  useEffect(() => {
    if (!pendingNotificationPlanId || !team.isLoaded) return
    const found = getAllPlans().find(p => p.id === pendingNotificationPlanId)
    if (found) {
      handleLoadFromHistory(found)
      setPendingNotificationPlanId(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingNotificationPlanId, team.teamId, team.isLoaded, dataVersion])

  const handleLoadDraft = (formData) => {
    setInitialFormData(formData)
    setCurrentPage('questionnaire')
    window.scrollTo(0, 0)
  }

  const handleNavAnchor = (anchorId) => {
    setCurrentPage('landing')
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.getElementById(anchorId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    })
  }

  const handleShowHowItWorks = () => {
    setCurrentPage('howItWorks')
    window.scrollTo(0, 0)
  }

  const goToAccount = () => {
    setCurrentPage('account')
    window.scrollTo(0, 0)
  }

  const handleCreateTeam = async () => {
    const name = newTeamName.trim()
    // Garde-fou contre les double-soumissions (Entrée + clic, double-clic) : sans lui,
    // chaque appui en trop créait une organisation Clerk distincte côté serveur.
    if (!name || creatingTeam) return
    setCreatingTeam(true)
    try {
      await team.createTeam(name)
      setNewTeamName('')
      setShowCreateTeam(false)
    } finally {
      setCreatingTeam(false)
    }
  }

  const switchSpace = async (id) => {
    setSwitchingSpace(true)
    try {
      await team.setActiveTeamId(id)
    } catch (err) {
      console.error('Échec du changement d\'espace', err)
      setError(lang === 'fr'
        ? "Impossible de changer d'espace pour le moment. Réessaie dans un instant."
        : "Couldn't switch space right now. Please try again.")
    } finally {
      setSwitchingSpace(false)
      setOpenHeaderMenu(null)
    }
  }

  const remaining = isSignedIn ? remainingCredits(userId) : 0
  const pro = isSignedIn && isPro(userId)

  // Juste un indicateur pour le menu (scan local, pas de polling ici) — la page Mon
  // compte interroge elle le serveur au chargement pour la liste à jour.
  const unreadNotifCount = isSignedIn
    ? collectRecentComments(userId, lang).filter(n => !getReadIds(userId).has(n.id)).length
    : 0

  const goToNotifications = () => {
    setCurrentPage('account')
    window.scrollTo(0, 0)
    setTimeout(() => {
      document.getElementById('account-notifications')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
  }

  // Invitation d'équipe ouverte alors qu'une session est déjà active dans ce navigateur
  // (typiquement : on teste le lien d'invitation soi-même, dans le même navigateur que
  // celui qui vient de l'envoyer) — Clerk accepte silencieusement l'invitation pour la
  // session en cours plutôt que de proposer de changer de compte. On le rend visible ici
  // au lieu de laisser l'utilisateur atterrir sans explication sur l'app déjà connectée.
  const showInviteTicketAlert = isSignedIn && !inviteTicketDismissed
    && new URLSearchParams(location.search).has('__clerk_ticket')

  const dismissInviteTicketAlert = () => {
    setInviteTicketDismissed(true)
    const params = new URLSearchParams(window.location.search)
    params.delete('__clerk_ticket')
    params.delete('__clerk_status')
    const query = params.toString()
    window.history.replaceState({}, '', window.location.pathname + (query ? `?${query}` : ''))
  }

  return (
    <div className="app">
      <header className={`header ${currentPage === 'landing' ? 'header-locked-dark' : ''}`}>
        <div className="header-top">
          <button className="header-brand-btn" onClick={() => {
            setCurrentPage('landing')
            window.scrollTo(0, 0)
          }}>
            <Wordmark size={34} animated />
          </button>

          <nav className="header-nav">
            <button className="header-nav-link" onClick={() => handleNavAnchor('features')}>
              {lang === 'fr' ? 'Fonctionnalités' : 'Features'}
            </button>
            <button
              className={`header-nav-link ${currentPage === 'howItWorks' ? 'active' : ''}`}
              onClick={handleShowHowItWorks}
            >
              {lang === 'fr' ? 'Comment ça marche' : 'How it works'}
            </button>
            {!isSignedIn && (
              <button className="header-nav-link" onClick={() => setShowDemo(true)}>
                {lang === 'fr' ? 'Démo' : 'Demo'}
              </button>
            )}
            {!isSignedIn && (
              <button className="btn-header-cta" onClick={handleStartClick}>
                <IconSparkle width={14} height={14} />
                <span className="btn-header-cta-text">{t(lang, 'auth.getStarted')}</span>
              </button>
            )}
          </nav>

          <div className="header-actions" ref={headerMenuRef}>
            {!isSignedIn && (
              <div className="header-menu">
                <button
                  className={`header-icon-btn ${openHeaderMenu === 'settings' ? 'active' : ''}`}
                  onClick={() => setOpenHeaderMenu(m => m === 'settings' ? null : 'settings')}
                  title={lang === 'fr' ? 'Préférences' : 'Preferences'}
                  aria-label={lang === 'fr' ? 'Préférences' : 'Preferences'}
                >
                  <IconSettings width={16} height={16} />
                </button>
                {openHeaderMenu === 'settings' && (
                  <div className="header-dropdown header-dropdown-settings">
                    {currentPage !== 'landing' && (
                      <button
                        className="header-dropdown-item"
                        onClick={() => { setTheme(t => t === 'dark' ? 'light' : 'dark') }}
                      >
                        {theme === 'dark' ? <IconMoon width={16} height={16} /> : <IconSun width={16} height={16} />}
                        {theme === 'dark' ? (lang === 'fr' ? 'Thème clair' : 'Light theme') : (lang === 'fr' ? 'Thème sombre' : 'Dark theme')}
                      </button>
                    )}
                    <div className="header-dropdown-label">{lang === 'fr' ? 'Langue' : 'Language'}</div>
                    <div className="header-dropdown-lang">
                      <button className={lang === 'fr' ? 'active' : ''} onClick={() => setLang('fr')}>FR</button>
                      <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {isSignedIn ? (
              <>
                {/* Switcher d'espace, séparé du compte (même logique que le duo UserButton /
                    OrganizationSwitcher de Clerk) : le compte ne change jamais selon l'espace
                    actif, ça n'a donc pas de sens de les mélanger dans un seul menu. */}
                <div className="header-menu">
                  <button
                    className={`header-space-btn ${openHeaderMenu === 'space' ? 'active' : ''}`}
                    onClick={() => setOpenHeaderMenu(m => m === 'space' ? null : 'space')}
                    title={t(lang, 'team.switcherTitle')}
                  >
                    {team.teamId ? (
                      <TeamAvatar id={team.teamId} name={team.teamName} imageUrl={team.teamImageUrl} className="header-space-btn-avatar" />
                    ) : user?.imageUrl ? (
                      <img className="header-space-avatar header-space-btn-avatar" src={user.imageUrl} alt="" />
                    ) : (
                      <span className="header-space-avatar header-space-btn-avatar header-space-avatar-personal">
                        <IconUser width={12} height={12} />
                      </span>
                    )}
                    <span className="header-space-btn-label">{team.teamId ? team.teamName : t(lang, 'team.personalSpace')}</span>
                    <IconChevronDown width={13} height={13} className="header-avatar-caret" />
                  </button>
                  {openHeaderMenu === 'space' && (
                    <div className="header-dropdown header-space-dropdown">
                      <button
                        className="header-dropdown-item header-dropdown-item-primary"
                        onClick={() => { setOpenHeaderMenu(null); setCurrentPage('space'); window.scrollTo(0, 0) }}
                      >
                        <IconBarChart width={16} height={16} /> {lang === 'fr' ? 'Tableau de bord' : 'Dashboard'}
                      </button>
                      <button className="header-dropdown-item" onClick={() => { setOpenHeaderMenu(null); setShowCreateTeam(true) }}>
                        <IconPlus width={14} height={14} /> {t(lang, 'team.createTeam')}
                      </button>

                      <div className="header-dropdown-label">{t(lang, 'team.switcherTitle')}</div>
                      <button
                        className={`header-space-row ${!team.teamId ? 'is-current' : ''}`}
                        disabled={switchingSpace}
                        onClick={() => switchSpace(null)}
                      >
                        {user?.imageUrl ? (
                          <img className="header-space-avatar" src={user.imageUrl} alt="" />
                        ) : (
                          <span className="header-space-avatar header-space-avatar-personal">
                            <IconUser width={13} height={13} />
                          </span>
                        )}
                        <span className="header-space-name">{t(lang, 'team.personalSpace')}</span>
                        {!team.teamId && <IconCheckCircle width={14} height={14} className="header-space-check" />}
                      </button>
                      {team.myTeams.map(tm => (
                        <div className={`header-space-row-wrap ${team.teamId === tm.id ? 'is-current' : ''}`} key={tm.id}>
                          <button
                            className="header-space-row"
                            disabled={switchingSpace}
                            onClick={() => switchSpace(tm.id)}
                          >
                            <TeamAvatar id={tm.id} name={tm.name} imageUrl={tm.hasImage ? tm.imageUrl : null} />
                            <span className="header-space-name">{tm.name}</span>
                            {team.teamId === tm.id && <IconCheckCircle width={14} height={14} className="header-space-check" />}
                          </button>
                          <button
                            className="header-space-settings-btn"
                            title={lang === 'fr' ? "Paramètres de l'équipe" : 'Team settings'}
                            onClick={() => { team.setActiveTeamId(tm.id); setOpenHeaderMenu(null); setCurrentPage('team'); window.scrollTo(0, 0) }}
                          >
                            <IconSettings width={14} height={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="header-menu">
                  <button
                    className={`header-avatar-btn ${openHeaderMenu === 'account' ? 'active' : ''}`}
                    onClick={() => setOpenHeaderMenu(m => m === 'account' ? null : 'account')}
                    title={t(lang, 'auth.myAccount')}
                  >
                    {user?.imageUrl ? <img src={user.imageUrl} alt="" /> : <IconUser width={16} height={16} />}
                    <IconChevronDown width={13} height={13} className="header-avatar-caret" />
                  </button>
                  {openHeaderMenu === 'account' && (
                    <div className="header-dropdown header-dropdown-account">
                      {!pro && (
                        <div className="header-dropdown-credits-hero">
                          <span className="header-dropdown-credits-value">{remaining}</span>
                          <span className="header-dropdown-credits-caption">{lang === 'fr' ? 'plans restants' : 'plans left'}</span>
                        </div>
                      )}

                      <button className="header-dropdown-item header-dropdown-item-primary" onClick={() => { setOpenHeaderMenu(null); handleStartClick() }}>
                        <IconSparkle width={16} height={16} /> {lang === 'fr' ? 'Créer un plan' : 'Create a plan'}
                      </button>

                      <button className="header-dropdown-item" onClick={() => { setOpenHeaderMenu(null); goToAccount() }}>
                        <IconUser width={16} height={16} /> {t(lang, 'auth.myAccount')}
                      </button>
                      <button className="header-dropdown-item" onClick={() => { setOpenHeaderMenu(null); setShowHistory(true) }}>
                        <IconClipboard width={16} height={16} /> {lang === 'fr' ? 'Mes plans' : 'My plans'}
                      </button>
                      <button className="header-dropdown-item" onClick={() => { setOpenHeaderMenu(null); goToNotifications() }}>
                        <IconMessageCircle width={16} height={16} /> {lang === 'fr' ? 'Notifications' : 'Notifications'}
                        {unreadNotifCount > 0 && <span className="header-dropdown-item-badge">{unreadNotifCount}</span>}
                      </button>
                      <div className="header-dropdown-divider" />

                      {currentPage !== 'landing' && (
                        <button
                          className="header-dropdown-item"
                          onClick={() => { setTheme(t => t === 'dark' ? 'light' : 'dark') }}
                        >
                          {theme === 'dark' ? <IconMoon width={16} height={16} /> : <IconSun width={16} height={16} />}
                          {theme === 'dark' ? (lang === 'fr' ? 'Thème clair' : 'Light theme') : (lang === 'fr' ? 'Thème sombre' : 'Dark theme')}
                        </button>
                      )}
                      <div className="header-dropdown-label">{lang === 'fr' ? 'Langue' : 'Language'}</div>
                      <div className="header-dropdown-lang">
                        <button className={lang === 'fr' ? 'active' : ''} onClick={() => setLang('fr')}>FR</button>
                        <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
                      </div>
                      <div className="header-dropdown-divider" />

                      <button className="header-dropdown-item header-dropdown-item-danger" onClick={() => { setOpenHeaderMenu(null); signOut() }}>
                        <IconLogOut width={16} height={16} /> {t(lang, 'auth.signOut')}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button className="btn-header-signin" onClick={() => goToAuth('signin')} title={t(lang, 'auth.signIn')}>
                <IconLogin width={18} height={18} />
              </button>
            )}
          </div>
        </div>

        {showCreateTeam && (
          <InfoModal
            icon={<IconUsers width={22} height={22} />}
            title={t(lang, 'team.createTeamTitle')}
            onClose={() => setShowCreateTeam(false)}
          >
            <p className="unsaved-changes-body">{t(lang, 'team.createTeamBody')}</p>
            {team.isMock && <p className="team-mock-notice">{t(lang, 'team.mockNotice')}</p>}
            <input
              className="team-create-input"
              type="text"
              value={newTeamName}
              onChange={e => setNewTeamName(e.target.value)}
              placeholder={t(lang, 'team.createTeamNamePlaceholder')}
              autoFocus
              disabled={creatingTeam}
              onKeyDown={e => e.key === 'Enter' && handleCreateTeam()}
            />
            <div className="unsaved-changes-actions">
              <button className="btn-secondary" onClick={() => setShowCreateTeam(false)} disabled={creatingTeam}>
                {t(lang, 'team.createTeamCancel')}
              </button>
              <button className="btn-primary" onClick={handleCreateTeam} disabled={!newTeamName.trim() || creatingTeam}>
                {creatingTeam ? (lang === 'fr' ? 'Création…' : 'Creating…') : t(lang, 'team.createTeamConfirm')}
              </button>
            </div>
          </InfoModal>
        )}
      </header>

      {error && <div className="error-banner">{error}</div>}

      {showInviteTicketAlert && (
        <div className="invite-ticket-banner" role="status">
          <span>
            {lang === 'fr'
              ? `Vous êtes connecté en tant que ${user?.fullName || user?.firstName || 'ce compte'}. Si cette invitation d'équipe est destinée à quelqu'un d'autre, déconnectez-vous avant de l'accepter.`
              : `You're signed in as ${user?.fullName || user?.firstName || 'this account'}. If this team invite is meant for someone else, sign out before accepting it.`}
          </span>
          <div className="invite-ticket-banner-actions">
            <button className="btn-secondary" onClick={signOut}>{t(lang, 'auth.signOut')}</button>
            <button className="btn-secondary" onClick={dismissInviteTicketAlert}>{t(lang, 'export.close')}</button>
          </div>
        </div>
      )}

      <main>
        {currentPage === 'landing' && (
          <Landing lang={lang} onStartClick={handleStartClick} onOpenDemo={() => setShowDemo(true)} onDiscoverClick={handleShowHowItWorks} />
        )}
        {currentPage === 'howItWorks' && (
          <HowItWorksPage lang={lang} onStartClick={handleStartClick} />
        )}
        {currentPage === 'auth' && !isSignedIn && (
          <AuthPage
            mode={authMode}
            lang={lang}
            theme={theme}
            onBack={() => setCurrentPage('landing')}
            onSwitchMode={() => setAuthMode(m => m === 'signup' ? 'signin' : 'signup')}
          />
        )}
        {currentPage === 'questionnaire' && isSignedIn && (
          <Questionnaire onSubmit={handleGenerate} loading={loading} lang={lang} onShowDrafts={() => setShowDrafts(true)} initialData={initialFormData} />
        )}
        {currentPage === 'result' && plan && (isSignedIn || isSharedView) && (
          <PlanViewer key={plan.id || plan.generatedAt} plan={plan} justGenerated={justGenerated} onReset={handleReset} lang={lang} />
        )}
        {currentPage === 'account' && isSignedIn && (
          <AccountPage
            key={dataVersion}
            lang={lang}
            onBack={() => setCurrentPage('landing')}
            onLoadPlan={handleLoadFromHistory}
            onOpenNotification={handleOpenNotification}
          />
        )}
        {currentPage === 'team' && isSignedIn && (
          <TeamPage lang={lang} onBack={() => setCurrentPage('landing')} />
        )}
        {currentPage === 'space' && isSignedIn && (
          <SpacePage
            key={dataVersion}
            lang={lang}
            onBack={() => setCurrentPage('landing')}
            onLoadPlan={handleLoadFromHistory}
            onLoadDraft={handleLoadDraft}
            onCreatePlan={handleStartClick}
            onOpenTeamSettings={() => { setCurrentPage('team'); window.scrollTo(0, 0) }}
            onSeeFullHistory={() => { setCurrentPage('account'); window.scrollTo(0, 0) }}
          />
        )}
      </main>

      <Footer lang={lang} onOpenModal={setActiveModal} onNavigateFeatures={() => handleNavAnchor('features')} />

      <ScrollToTop />

      {showHistory && isSignedIn && (
        <PlansHistory
          lang={lang}
          onLoadPlan={handleLoadFromHistory}
          onClose={() => setShowHistory(false)}
        />
      )}

      {showDemo && (
        <DemoModal
          lang={lang}
          onClose={() => setShowDemo(false)}
          onLoadDemo={(demoData) => {
            setShowDemo(false)
            handleLoadDemo(demoData)
          }}
        />
      )}

      {showDrafts && (
        <DraftsModal
          lang={lang}
          onLoadDraft={handleLoadDraft}
          onClose={() => setShowDrafts(false)}
        />
      )}

      {activeModal === 'security' && <SecurityPage lang={lang} onClose={() => setActiveModal(null)} />}
      {activeModal === 'about' && <AboutModal lang={lang} onClose={() => setActiveModal(null)} />}
      {activeModal === 'careers' && <CareersModal lang={lang} onClose={() => setActiveModal(null)} onContactClick={() => setActiveModal('contact')} />}
      {activeModal === 'contact' && <ContactModal lang={lang} onClose={() => setActiveModal(null)} />}
      {activeModal === 'pricing' && <PricingModal lang={lang} onClose={() => setActiveModal(null)} onContactClick={() => setActiveModal('contact')} />}
      {activeModal === 'changelog' && <ChangelogModal lang={lang} onClose={() => setActiveModal(null)} />}
      {activeModal === 'roadmap' && <RoadmapModal lang={lang} onClose={() => setActiveModal(null)} />}
      {activeModal === 'privacy' && <PrivacyModal lang={lang} onClose={() => setActiveModal(null)} />}
      {activeModal === 'terms' && <TermsModal lang={lang} onClose={() => setActiveModal(null)} />}
      {activeModal === 'cookies' && <CookiesModal lang={lang} onClose={() => setActiveModal(null)} />}

      {showLimitModal && (
        <InfoModal icon={<IconLock width={22} height={22} />} title={t(lang, 'account.limitModalTitle')} onClose={() => setShowLimitModal(false)}>
          <p className="limit-modal-body">{t(lang, 'account.limitModalBody')}</p>
          <div className="limit-modal-actions">
            <button
              className="btn-secondary"
              onClick={() => { setShowLimitModal(false); setCurrentPage('account'); window.scrollTo(0, 0) }}
            >
              {t(lang, 'account.limitModalManage')}
            </button>
            <button
              className="btn-primary"
              onClick={() => { setShowLimitModal(false); setCurrentPage('account'); window.scrollTo(0, 0) }}
            >
              {t(lang, 'account.upgradeCta')}
            </button>
          </div>
        </InfoModal>
      )}
    </div>
  )
}
