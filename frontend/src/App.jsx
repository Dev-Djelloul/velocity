import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Landing from './components/Landing'
import DemoModal from './components/DemoModal'
import Wordmark from './components/Wordmark'
import { IconClipboard, IconUser, IconLogin, IconLock, IconSparkle, IconSun, IconMoon, IconSettings, IconLogOut, IconChevronDown, IconUsers, IconCheckCircle, IconPlus, IconBarChart, IconMessageCircle, IconMenu, IconX, IconLink } from './components/Icons'
import InfoModal from './components/InfoModal'
import createTeamBanner from '../assets/img/hiw-hero-tablets-purple.webp'
import Questionnaire from './components/Questionnaire'
import PlanViewer from './components/PlanViewer'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import PlansHistory from './components/PlansHistory'
import DraftsModal from './components/DraftsModal'
import SecurityPage from './components/SecurityPage'
import HowItWorksPage from './components/HowItWorksPage'
import PrivacyPage from './components/PrivacyPage'
import GalleryPage from './components/GalleryPage'
import AccountPage from './components/AccountPage'
import NotificationsPage from './components/NotificationsPage'
import IntegrationsPage from './components/IntegrationsPage'
import TeamPage from './components/TeamPage'
import PlanVersionsPage from './components/PlanVersionsPage'
import PlanFinancialReportPage from './components/PlanFinancialReportPage'
import TeamAvatar from './components/TeamAvatar'
import SpacePage from './components/SpacePage'
import DashboardHome from './components/DashboardHome'
import SettingsPage from './components/SettingsPage'
import AuthPage from './components/AuthPage'
import { AboutModal, CareersModal, ContactModal } from './components/CompanyModals'
import { PricingModal, ChangelogModal, RoadmapModal, FeaturesModal } from './components/ProductModals'
import { PrivacyModal, TermsModal, CookiesModal } from './components/LegalModals'
import { generatePlan } from './lib/planGenerator'
import { t } from './lib/i18n'
import { savePlan, getAllPlans, getShareLink, duplicatePlan, setActiveUser as setPlanActiveUser, setActiveTeam as setPlanActiveTeam, setActiveCreator as setPlanActiveCreator, syncPlansFromServer, generateId } from './lib/planStorage'
import { collectRecentComments } from './lib/notifications'
import { getReadIds } from './lib/commentReads'
import { getPersonalSpace } from './lib/personalSpace'
import { setActiveUser as setDraftActiveUser, syncDraftsFromServer } from './lib/draftStorage'
import { getTimezone, setTimezone as persistTimezone } from './lib/dateFormat'
import { hasPreferencesConsent } from './lib/cookieConsent'
import { PREFERENCES_GRANTED_EVENT } from './lib/preferenceStorage'
import { useUser, useAuth, useTeam } from './lib/auth'
import { canGenerate, consumeCredit, remainingCredits, isPro, syncCreditsFromServer } from './lib/creditTracker'
import { TEAM_SPACE_LIMITS } from './lib/pricingTiers'
import NotificationBell from './components/NotificationBell'
import TeamPresenceAvatars from './components/TeamPresenceAvatars'
import CookieConsentBanner from './components/CookieConsentBanner'
import AppLoader from './components/AppLoader'
import './styles/design-system.css'
import './styles/accessibility.css'
import './App.css'

const AUTH_ONLY_PAGES = ['dashboard', 'questionnaire', 'result', 'account', 'team', 'space', 'gallery', 'settings', 'notifications', 'integrations']

// Chaque page "logique" de l'app (currentPage) correspond à une vraie URL, indispensable
// pour que Google indexe plusieurs pages distinctes et que les liens soient partageables.
// On garde currentPage comme source de vérité pour toute la logique existante (guards,
// navigation interne...) et on la synchronise avec l'URL dans les deux sens plutôt que de
// réécrire tous les appels à setCurrentPage en navigate() — bien plus sûr sur une app de
// cette taille.
const PAGE_TO_PATH = {
  landing: '/',
  dashboard: '/accueil',
  howItWorks: '/comment-ca-marche',
  privacy: '/confidentialite',
  questionnaire: '/questionnaire',
  result: '/mon-plan',
  'plan-versions': '/mon-plan/versions',
  'plan-financial-report': '/mon-plan/rapport-financier',
  account: '/mon-compte',
  team: '/mon-equipe',
  space: '/mon-espace',
  gallery: '/ma-galerie',
  settings: '/parametres',
  notifications: '/notifications',
  integrations: '/integrations'
}
const PATH_TO_PAGE = {
  '/': 'landing',
  '/accueil': 'dashboard',
  '/comment-ca-marche': 'howItWorks',
  '/confidentialite': 'privacy',
  '/connexion': 'auth',
  '/inscription': 'auth',
  '/questionnaire': 'questionnaire',
  '/mon-plan': 'result',
  '/mon-plan/versions': 'plan-versions',
  '/mon-plan/rapport-financier': 'plan-financial-report',
  '/mon-compte': 'account',
  '/mon-equipe': 'team',
  '/mon-espace': 'space',
  '/ma-galerie': 'gallery',
  '/notifications': 'notifications',
  '/parametres': 'settings',
  '/integrations': 'integrations'
}

// URL "jolie" pour le partage (/s/:shareId) — interceptée côté Cloudflare Pages Functions
// (voir frontend/functions/) pour injecter des meta og:* correctes avant que les robots des
// réseaux sociaux (qui n'exécutent jamais le JS) ne lisent le HTML. Le reste de la logique de
// chargement (même appel serveur que ?share=) est géré ici, côté client, comme pour un
// utilisateur normal.
function parsePrettyShareUrl(pathname) {
  const shareMatch = pathname.match(/^\/s\/([^/]+)$/)
  if (shareMatch) return { type: 'share', id: shareMatch[1] }
  return null
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
  const [timezone, setTimezone] = useState(() => getTimezone())
  const [reduceMotion, setReduceMotion] = useState(() => localStorage.getItem('plp_reduce_motion') === '1')
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('plp_font_size') || 'normal')
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('plp_high_contrast') === '1')
  const [dateFormat, setDateFormat] = useState(() => localStorage.getItem('plp_date_format') || 'auto')
  const [currency, setCurrency] = useState(() => localStorage.getItem('plp_currency') || 'EUR')
  const [currentPage, setCurrentPage] = useState(() => (
    parsePrettyShareUrl(window.location.pathname) ? 'result' : (PATH_TO_PAGE[window.location.pathname] || 'landing')
  ))
  const [plan, setPlan] = useState(null)
  const [novaToggle, setNovaToggle] = useState(0)
  const [justGenerated, setJustGenerated] = useState(false)
  const [initialFormData, setInitialFormData] = useState(null)
  // Questionnaire lit initialData une seule fois, dans un useState paresseux — sans key qui
  // change, charger un brouillon alors qu'on est déjà sur la page questionnaire ne remonte pas
  // le composant et le brouillon ne s'affiche jamais (currentPage restant "questionnaire", ce
  // n'est pas un changement de page qui le remonterait naturellement).
  const [questionnaireKey, setQuestionnaireKey] = useState(0)
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
  const [authIntent, setAuthIntent] = useState(() => sessionStorage.getItem('plp_auth_intent') || null)
  // Persistés en sessionStorage (pas juste en state React) car les boutons OAuth (Google/
  // Apple/Slack) de <SignIn/> font une vraie redirection de page — le navigateur quitte
  // complètement l'app le temps de l'auth chez le provider, ce qui remettrait sinon ces
  // states à zéro au retour et ferait atterrir l'utilisateur sur "Mon compte" au lieu du
  // plan démo/dupliqué qu'il avait demandé avant de se connecter.
  const [pendingDemoData, setPendingDemoDataState] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('plp_pending_demo') || 'null') } catch { return null }
  })
  const setPendingDemoData = (data) => {
    setPendingDemoDataState(data)
    if (data) sessionStorage.setItem('plp_pending_demo', JSON.stringify(data))
    else sessionStorage.removeItem('plp_pending_demo')
  }
  const [pendingDuplicatePlan, setPendingDuplicatePlanState] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('plp_pending_duplicate') || 'null') } catch { return null }
  })
  const setPendingDuplicatePlan = (plan) => {
    setPendingDuplicatePlanState(plan)
    if (plan) sessionStorage.setItem('plp_pending_duplicate', JSON.stringify(plan))
    else sessionStorage.removeItem('plp_pending_duplicate')
  }
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [pendingAccountAction, setPendingAccountAction] = useState(null) // 'plans' | 'upgrade' | null
  const [openHeaderMenu, setOpenHeaderMenu] = useState(null) // 'settings' | 'account' | null
  // Repliée par défaut : ne montre que l'espace actif, pour laisser "Tableau de bord" et
  // "Créer une équipe" visibles sans avoir à faire défiler la liste complète des espaces
  // (qui peut vite s'allonger avec plusieurs équipes).
  const [spaceListExpanded, setSpaceListExpanded] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [showCreateTeam, setShowCreateTeam] = useState(false)
  const [switchingSpace, setSwitchingSpace] = useState(false)
  const [creatingTeam, setCreatingTeam] = useState(false)
  const [pendingNotificationPlanId, setPendingNotificationPlanId] = useState(null)
  const [pendingNotificationAnchor, setPendingNotificationAnchor] = useState(null)
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

  useEffect(() => {
    setMobileNavOpen(false)
  }, [currentPage])

  // ⌘K/Ctrl+K global : bascule Nova depuis n'importe quelle page de l'app, pas seulement
  // depuis la vue du plan où le panneau est monté. S'il n'y a pas de plan chargé, Nova n'a
  // rien à commenter — on ignore silencieusement plutôt que d'ouvrir un panneau vide.
  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        if (!plan) return
        setCurrentPage(p => p === 'result' ? p : 'result')
        setNovaToggle(t => t + 1)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [plan])

  const { isSignedIn, isLoaded, user } = useUser()
  const { userId, signOut } = useAuth()
  const team = useTeam()
  const wasSignedIn = useRef(isSignedIn)

  // Délai minimum d'affichage du loader : Clerk résout parfois isLoaded quasi instantanément
  // (session déjà en cache), ce qui faisait clignoter l'écran de chargement au lieu de se
  // voir — un minimum le rend bien visible et intentionnel plutôt qu'un flash. Réduit de 3s
  // à 2s (retour utilisateur : trop long).
  const [loaderMinDelayDone, setLoaderMinDelayDone] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setLoaderMinDelayDone(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  const goToAuth = (mode, intent = null) => {
    setAuthMode(mode)
    setAuthIntent(intent)
    if (intent) sessionStorage.setItem('plp_auth_intent', intent)
    else sessionStorage.removeItem('plp_auth_intent')
    setCurrentPage('auth')
    window.scrollTo(0, 0)
  }

  // localStorage.setItem conditionné au consentement "Préférences" (bannière cookies) sur
  // les 8 effets ci-dessous : sans accord, un changement de thème/langue/fuseau/accessibilité
  // reste actif pour la session en cours (l'état React continue de piloter l'UI normalement)
  // mais ne survit pas à un rechargement — repart sur les valeurs par défaut à la prochaine
  // visite. Voir CookieConsentBanner.jsx (purge sur refus explicite) et l'effet plus bas
  // (persistance immédiate sur accord, sans attendre un nouveau changement).
  useEffect(() => {
    if (hasPreferencesConsent()) localStorage.setItem('plp_lang', lang)
    window.dispatchEvent(new CustomEvent('plp-langchange', { detail: lang }))
  }, [lang])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    if (hasPreferencesConsent()) localStorage.setItem('plp_theme', theme)
  }, [theme])

  useEffect(() => {
    if (hasPreferencesConsent()) persistTimezone(timezone)
  }, [timezone])

  // Un changement de fuseau horaire fait dans un autre onglet (même origine) ne met à jour
  // que le localStorage de cet onglet-là — sans ce listener, un onglet resté ouvert depuis
  // avant le changement continue d'afficher les dates dans l'ancien fuseau (typiquement
  // "auto", donc l'heure de Paris pour un utilisateur en France) jusqu'à un rechargement
  // complet. L'event "storage" ne se déclenche jamais dans l'onglet à l'origine du
  // changement, donc pas de conflit avec l'effet de persistance ci-dessus.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'plp_timezone') setTimezone(e.newValue || 'auto')
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.reduceMotion = reduceMotion ? 'true' : 'false'
    if (hasPreferencesConsent()) localStorage.setItem('plp_reduce_motion', reduceMotion ? '1' : '0')
  }, [reduceMotion])

  useEffect(() => {
    document.documentElement.dataset.fontSize = fontSize
    if (hasPreferencesConsent()) localStorage.setItem('plp_font_size', fontSize)
  }, [fontSize])

  useEffect(() => {
    document.documentElement.dataset.highContrast = highContrast ? 'true' : 'false'
    if (hasPreferencesConsent()) localStorage.setItem('plp_high_contrast', highContrast ? '1' : '0')
  }, [highContrast])

  useEffect(() => {
    if (hasPreferencesConsent()) localStorage.setItem('plp_date_format', dateFormat)
  }, [dateFormat])

  useEffect(() => {
    if (hasPreferencesConsent()) localStorage.setItem('plp_currency', currency)
  }, [currency])

  // Consentement "Préférences" tout juste accordé (voir CookieConsentBanner.jsx) : persiste
  // immédiatement l'état courant plutôt que d'attendre que l'utilisateur change activement
  // un réglage après coup — sinon la session en cours au moment de l'accord ne serait jamais
  // sauvegardée si rien n'est retouché ensuite.
  useEffect(() => {
    const onGranted = () => {
      localStorage.setItem('plp_lang', lang)
      localStorage.setItem('plp_theme', theme)
      persistTimezone(timezone)
      localStorage.setItem('plp_reduce_motion', reduceMotion ? '1' : '0')
      localStorage.setItem('plp_font_size', fontSize)
      localStorage.setItem('plp_high_contrast', highContrast ? '1' : '0')
      localStorage.setItem('plp_date_format', dateFormat)
      localStorage.setItem('plp_currency', currency)
    }
    window.addEventListener(PREFERENCES_GRANTED_EVENT, onGranted)
    return () => window.removeEventListener(PREFERENCES_GRANTED_EVENT, onGranted)
  }, [lang, theme, timezone, reduceMotion, fontSize, highContrast, dateFormat, currency])

  // Reflète currentPage/authMode dans l'URL (navigation interne -> barre d'adresse) — sauf
  // si on est arrivé sur une URL "jolie" de partage (/s/:id, /p/:id) : on la laisse telle
  // quelle dans la barre d'adresse (utile si l'utilisateur la recopie), plutôt que de la
  // remplacer par /mon-plan dès que currentPage passe à 'result'.
  useEffect(() => {
    if (parsePrettyShareUrl(location.pathname) && currentPage === 'result') return
    const target = pathForPage(currentPage, authMode)
    if (location.pathname !== target) {
      navigate({ pathname: target, search: location.search }, { replace: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, authMode])

  // Reflète l'URL dans currentPage/authMode (bouton précédent/suivant, lien direct, refresh).
  useEffect(() => {
    const page = parsePrettyShareUrl(location.pathname) ? 'result' : (PATH_TO_PAGE[location.pathname] || 'landing')
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
    const pretty = parsePrettyShareUrl(window.location.pathname)
    const shareId = params.get('share') || (pretty?.type === 'share' ? pretty.id : null)
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
      } else if (pendingDuplicatePlan) {
        // Repris après inscription : voir handleDuplicateReadOnlyPlan ci-dessous —
        // dupliquer un plan partagé en lecture seule nécessite un compte.
        const copy = duplicatePlan(pendingDuplicatePlan, lang)
        handleLoadFromHistory(copy)
        setPendingDuplicatePlan(null)
      } else {
        setCurrentPage(authIntent || 'dashboard')
      }
      setAuthIntent(null)
      sessionStorage.removeItem('plp_auth_intent')
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
  // Dépend de userDisplayName (primitif) plutôt que de l'objet `user` de Clerk : ce dernier
  // change de référence à chaque rafraîchissement de token (indépendamment de tout vrai
  // changement d'espace), ce qui redéclenchait cet effet et donc syncPlansFromServer —
  // syncPlansFromServer ÉCRASE tout le cache local avec la version serveur, ce qui pouvait
  // effacer une modification locale toute récente (ex. toggle "Ajouter à la galerie") si son
  // envoi au serveur (fire-and-forget, voir savePlan/pushPlan) n'avait pas encore été commité
  // au moment où ce resync repartait.
  const userDisplayName = user?.fullName || user?.firstName || null
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId || !team.isLoaded) return
    setPlanActiveTeam(team.teamId, team.role, team.teamName)
    setPlanActiveCreator(userDisplayName)
    syncPlansFromServer(userId, team.teamId).then(() => setDataVersion(v => v + 1))
  }, [isLoaded, isSignedIn, userId, team.teamId, team.role, team.teamName, team.isLoaded, userDisplayName])

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
      setCurrentPage('dashboard')
    }
    // Une fois connecté, "/" (landing marketing) n'a plus de raison d'être affiché — évite
    // de mélanger le produit d'entrée (démo, pitch, pricing) avec le produit une fois
    // connecté, qui a son propre accueil (voir DashboardHome). Le logo du header renvoie
    // ici vers 'dashboard' quand connecté (voir plus bas), donc ce cas ne couvre que les
    // accès directs à "/" (lien externe, historique navigateur, retour arrière).
    if (currentPage === 'landing' && isSignedIn) {
      setCurrentPage('dashboard')
    }
  }, [currentPage, isSignedIn, isLoaded, isSharedView])

  // Une démo est un aperçu illustratif, pas un vrai plan : génération locale instantanée
  // (moteur à règles, aucun appel IA), sans consommer de crédit ni polluer "Mes plans".
  const loadDemoPlan = (demoData) => {
    const generatedPlan = generatePlan({ ...demoData, language: lang })
    // Id éphémère (non persisté) pour que la section Agents IA s'affiche aussi en démo
    generatedPlan.id = `demo-${generateId()}`
    // Marqueur qui survit à un "Enregistrer" explicite de l'utilisateur (contrairement à
    // l'id ci-dessus, dont le préfixe seul ne suffit pas à distinguer une démo dans les
    // listes de plans une fois sauvegardée) — sert à afficher le badge "Démo".
    generatedPlan.isDemo = true
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

  // Depuis la carte "Bibliothèque de versions" de l'espace d'équipe (voir SpacePage.jsx) :
  // même chargement qu'ouvrir un plan depuis l'historique, mais on atterrit directement sur
  // la comparaison plutôt que sur le plan lui-même.
  const handleCompareVersions = (loadedPlan) => {
    setPlan(loadedPlan)
    setJustGenerated(false)
    setIsSharedView(false)
    setCurrentPage('plan-versions')
    window.scrollTo(0, 0)
  }

  // Depuis "Budget cumulé" de l'espace d'équipe (voir SpacePage.jsx) : même mécanisme que
  // handleCompareVersions, mais vers une vraie page dédiée au rapport financier plutôt
  // qu'une modale — demandé explicitement.
  const handleOpenFinancialReport = (loadedPlan) => {
    setPlan(loadedPlan)
    setJustGenerated(false)
    setIsSharedView(false)
    setCurrentPage('plan-financial-report')
    window.scrollTo(0, 0)
  }

  // "Dupliquer pour modifier" depuis un plan partagé en lecture seule (voir PlanViewer
  // readOnly) — copier dans son propre compte est la seule façon d'en repartir, pas
  // d'édition en place sur le plan de quelqu'un d'autre. Sans compte, on redirige vers
  // l'inscription et on reprend l'action juste après (voir pendingDuplicatePlan plus haut).
  const handleDuplicateReadOnlyPlan = (sourcePlan) => {
    if (!isSignedIn) {
      setPendingDuplicatePlan(sourcePlan)
      goToAuth('signup', 'result')
      return
    }
    const copy = duplicatePlan(sourcePlan, lang)
    handleLoadFromHistory(copy)
  }

  // Ouvrir une notification peut demander de changer d'espace actif au préalable (le
  // commentaire peut venir d'une équipe différente de celle affichée) — le changement est
  // asynchrone côté Clerk, donc on mémorise l'id à ouvrir et l'effet ci-dessous prend le
  // relais dès que le nouvel espace est chargé et ses plans resynchronisés.
  // Certains types de notification pointent vers une section précise du plan plutôt que
  // sa première page (ex: une édition collaborative concerne la roadmap, pas le résumé
  // exécutif) — sinon "cliquer la notif" et "ouvrir le plan depuis l'historique" reviennent
  // au même, alors que la notif promet d'amener directement à l'endroit concerné.
  const sectionAnchorForNotification = (item) => (item.type === 'roadmap_collab' ? 'section-roadmap' : null)

  const handleOpenNotification = (item) => {
    const anchor = sectionAnchorForNotification(item)
    if (item.spaceId === team.teamId) {
      const found = getAllPlans().find(p => p.id === item.planId)
      if (found) {
        handleLoadFromHistory(found)
        if (anchor) requestAnimationFrame(() => requestAnimationFrame(() => scrollToAnchor(anchor)))
      }
      return
    }
    setPendingNotificationPlanId(item.planId)
    setPendingNotificationAnchor(anchor)
    team.setActiveTeamId(item.spaceId)
  }

  useEffect(() => {
    if (!pendingNotificationPlanId || !team.isLoaded) return
    const found = getAllPlans().find(p => p.id === pendingNotificationPlanId)
    if (found) {
      handleLoadFromHistory(found)
      if (pendingNotificationAnchor) requestAnimationFrame(() => requestAnimationFrame(() => scrollToAnchor(pendingNotificationAnchor)))
      setPendingNotificationPlanId(null)
      setPendingNotificationAnchor(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingNotificationPlanId, team.teamId, team.isLoaded, dataVersion])

  // "Historique de tous les plans" (Mon compte) regroupe tous les espaces — cliquer sur un
  // plan qui n'appartient pas à l'espace actif doit d'abord y basculer (même mécanisme de
  // changement différé que handleOpenNotification ci-dessus).
  const handleOpenPlanFromHistory = (plan) => {
    if ((plan.team_id || null) === (team.teamId || null)) {
      handleLoadFromHistory(plan)
      return
    }
    setPendingNotificationPlanId(plan.id)
    team.setActiveTeamId(plan.team_id || null)
  }

  const handleLoadDraft = (formData) => {
    setInitialFormData(formData)
    setQuestionnaireKey(k => k + 1)
    setCurrentPage('questionnaire')
    window.scrollTo(0, 0)
  }

  // Défile jusqu'à l'ancre, puis corrige une fois après 500ms : une image encore en cours de
  // chargement au-dessus de la section (hero, témoignages...) peut décaler toute la mise en
  // page pendant l'animation "smooth", faisant s'arrêter le scroll net avant la bonne place —
  // le symptôme "je tombe presque au bon endroit mais jamais pile" vient de là.
  const scrollToAnchor = (anchorId) => {
    const scroll = () => document.getElementById(anchorId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    scroll()
    setTimeout(scroll, 500)
  }

  const handleNavAnchor = (anchorId) => {
    // Si la section existe déjà sur la page affichée (ex: #faq présent à la fois sur
    // l'accueil et sur "Comment ça marche"), on y scrolle sans changer de page — sinon
    // on force un retour à l'accueil, seule page à porter les autres ancres (#features...).
    if (document.getElementById(anchorId)) {
      scrollToAnchor(anchorId)
      return
    }
    setCurrentPage('landing')
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToAnchor(anchorId)
      })
    })
  }

  const handleShowHowItWorks = () => {
    setCurrentPage('howItWorks')
    window.scrollTo(0, 0)
  }

  // Retour vers l'accueil plutôt que le Dashboard : cette page est publique (URL requise
  // par les stores d'apps pour la politique de confidentialité), visitée aussi bien par un
  // robot de vérification que par un visiteur non connecté.
  const handleBackFromLegal = () => {
    setCurrentPage('landing')
    window.scrollTo(0, 0)
  }

  const goToAccount = () => {
    setCurrentPage('account')
    window.scrollTo(0, 0)
  }

  const goToSettings = () => {
    setCurrentPage('settings')
    window.scrollTo(0, 0)
  }

  const goToIntegrations = () => {
    setCurrentPage('integrations')
    window.scrollTo(0, 0)
  }

  // Point d'entrée unique vers la modal Pro depuis n'importe où dans l'app (limite de
  // plans atteinte, export/intégration réservée à Pro…) — toujours "Mon compte" avec la
  // modal auto-ouverte, voir pendingAction dans AccountPage.jsx.
  const goToUpgrade = () => {
    setShowLimitModal(false)
    setPendingAccountAction('upgrade')
    setCurrentPage('account')
    window.scrollTo(0, 0)
  }

  const handleCreateTeam = async () => {
    const name = newTeamName.trim()
    // Garde-fou contre les double-soumissions (Entrée + clic, double-clic) : sans lui,
    // chaque appui en trop créait une organisation Clerk distincte côté serveur. Le
    // contrôle de la limite d'espaces se fait normalement en amont (bouton désactivé /
    // modal d'upsell), ce check n'est qu'une seconde barrière défensive.
    if (!name || creatingTeam || teamLimitReached) return
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

  // Depuis une carte du dashboard d'accueil : bascule l'espace actif (comme le switcher du
  // header) PUIS navigue vers sa page dédiée — switchSpace seul ne change pas currentPage,
  // volontairement neutre pour rester utilisable depuis n'importe quelle page via le header.
  const openSpace = async (id) => {
    await switchSpace(id)
    setCurrentPage('space')
    window.scrollTo(0, 0)
  }

  const remaining = isSignedIn ? remainingCredits(userId) : 0
  const pro = isSignedIn && isPro(userId)

  // Compte les espaces dont l'utilisateur est déjà membre (team.myTeams), pas seulement
  // ceux qu'il a créés — un compte qui a rejoint des équipes via invitation ne devrait pas
  // pouvoir en créer indéfiniment d'autres en plus sous prétexte qu'il ne les a pas "créées".
  const teamLimit = pro ? TEAM_SPACE_LIMITS.pro : TEAM_SPACE_LIMITS.free
  const teamLimitReached = (team.myTeams?.length || 0) >= teamLimit

  // Juste un indicateur pour le menu (scan local, pas de polling ici) — la page Mon
  // compte interroge elle le serveur au chargement pour la liste à jour. Réservé à Pro
  // (voir tarification), comme le flux de notifications lui-même.
  const unreadNotifCount = isSignedIn && pro
    ? collectRecentComments(userId, lang).filter(n => !getReadIds(userId).has(n.id)).length
    : 0

  const personalSpaceName = isSignedIn ? getPersonalSpace(userId, lang).name : t(lang, 'team.personalSpace')

  const goToNotifications = () => {
    setCurrentPage('notifications')
    window.scrollTo(0, 0)
  }

  // Invitation d'équipe ouverte alors qu'une session est déjà active dans ce navigateur
  // (typiquement : on teste le lien d'invitation soi-même, dans le même navigateur que
  // celui qui vient de l'envoyer) — Clerk accepte silencieusement l'invitation pour la
  // session en cours plutôt que de proposer de changer de compte. On le rend visible ici
  // au lieu de laisser l'utilisateur atterrir sans explication sur l'app déjà connectée.
  const showInviteTicketAlert = isSignedIn && !inviteTicketDismissed
    && new URLSearchParams(location.search).has('__clerk_ticket')

  // Écran de chargement plein écran tant que Clerk n'a pas déterminé l'état de session —
  // évite un flash (landing affichée puis remplacée par le dashboard, ou l'inverse) au
  // premier chargement. Placé après tous les hooks (aucun hook plus bas dans le composant)
  // pour rester valide vis-à-vis des règles des hooks malgré ce retour anticipé.
  if (!isLoaded || !loaderMinDelayDone) return <AppLoader />

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
      {/* Page d'auth en plein écran façon Cloudflare/Stripe : ni nav ni footer du site,
          juste la carte de connexion — évite la distraction et le double branding. */}
      {currentPage !== 'auth' && (
      <header className={`header ${currentPage === 'landing' ? 'header-locked-dark' : ''}`}>
        <div className="header-top">
          <button className="header-brand-btn" onClick={() => {
            setCurrentPage(isSignedIn ? 'dashboard' : 'landing')
            window.scrollTo(0, 0)
          }}>
            <Wordmark size={34} animated />
          </button>

          {/* Le hamburger ne fait qu'ouvrir/fermer .header-nav, dont tous les liens sont
              réservés aux visiteurs non connectés (nav marketing : Fonctionnalités, Comment
              ça marche...) — pour un utilisateur connecté, .header-nav est vide et le bouton
              n'ouvre plus rien. Toute la navigation utile a été déplacée ailleurs dans le
              header (cloche, bascule d'espace, menu compte) lors de la refonte. */}
          {!isSignedIn && (
            <button
              className={`header-hamburger-btn ${mobileNavOpen ? 'active' : ''}`}
              onClick={() => setMobileNavOpen(o => !o)}
              title={lang === 'fr' ? 'Menu' : 'Menu'}
              aria-label={lang === 'fr' ? 'Menu' : 'Menu'}
              aria-expanded={mobileNavOpen}
            >
              {mobileNavOpen ? <IconX width={20} height={20} /> : <IconMenu width={20} height={20} />}
            </button>
          )}

          {!isSignedIn && (
            <nav className={`header-nav ${mobileNavOpen ? 'is-open' : ''}`}>
              <button className="header-nav-link" onClick={() => { setMobileNavOpen(false); handleNavAnchor('features') }}>
                {lang === 'fr' ? 'Fonctionnalités' : 'Features'}
              </button>
              <button
                className={`header-nav-link ${currentPage === 'howItWorks' ? 'active' : ''}`}
                onClick={() => { setMobileNavOpen(false); handleShowHowItWorks() }}
              >
                {lang === 'fr' ? 'Comment ça marche' : 'How it works'}
              </button>
              <button className="header-nav-link" onClick={() => { setMobileNavOpen(false); handleNavAnchor('faq') }}>
                FAQ
              </button>
              <button className="header-nav-link" onClick={() => { setMobileNavOpen(false); setShowDemo(true) }}>
                {lang === 'fr' ? 'Démo' : 'Demo'}
              </button>
              <button className="btn-header-cta" onClick={() => { setMobileNavOpen(false); handleStartClick() }}>
                <IconSparkle width={14} height={14} />
                <span className="btn-header-cta-text">{t(lang, 'auth.getStarted')}</span>
              </button>
            </nav>
          )}

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
                <NotificationBell userId={userId} lang={lang} onOpen={handleOpenNotification} />
                <div className="header-menu">
                  <button
                    className={`header-space-btn ${openHeaderMenu === 'space' ? 'active' : ''}`}
                    onClick={() => setOpenHeaderMenu(m => m === 'space' ? null : 'space')}
                    title={t(lang, 'team.switcherTitle')}
                  >
                    {team.teamId ? (
                      <TeamAvatar id={team.teamId} name={team.teamName} imageUrl={team.teamImageUrl} className="header-space-btn-avatar" />
                    ) : getPersonalSpace(userId, lang).avatar ? (
                      <img className="header-space-avatar header-space-btn-avatar" src={getPersonalSpace(userId, lang).avatar} alt="" />
                    ) : user?.imageUrl ? (
                      <img className="header-space-avatar header-space-btn-avatar" src={user.imageUrl} alt="" />
                    ) : (
                      <span className="header-space-avatar header-space-btn-avatar header-space-avatar-personal">
                        <IconUser width={12} height={12} />
                      </span>
                    )}
                    <span className="header-space-btn-label">{team.teamId ? team.teamName : personalSpaceName}</span>
                    <IconChevronDown width={13} height={13} className="header-avatar-caret" />
                  </button>
                  {openHeaderMenu === 'space' && (
                    <div className="header-dropdown header-space-dropdown">
                      <button
                        type="button"
                        className="header-dropdown-label header-space-list-toggle"
                        onClick={() => setSpaceListExpanded(v => !v)}
                        aria-expanded={spaceListExpanded}
                      >
                        {t(lang, 'team.switcherTitle')}
                        <IconChevronDown width={13} height={13} className={`header-space-list-caret ${spaceListExpanded ? 'is-open' : ''}`} />
                      </button>

                      {!spaceListExpanded && (
                        team.teamId ? (
                          <div className="header-space-row-wrap is-current">
                            <span className="header-space-row header-space-row-static">
                              <TeamAvatar id={team.teamId} name={team.teamName} imageUrl={team.teamImageUrl} />
                              <span className="header-space-name">{team.teamName}</span>
                              <TeamPresenceAvatars teamId={team.teamId} lang={lang} excludeUserId={userId} />
                              <IconCheckCircle width={14} height={14} className="header-space-check" />
                            </span>
                          </div>
                        ) : (
                          <span className="header-space-row header-space-row-static is-current">
                            {getPersonalSpace(userId, lang).avatar ? (
                              <img className="header-space-avatar" src={getPersonalSpace(userId, lang).avatar} alt="" />
                            ) : user?.imageUrl ? (
                              <img className="header-space-avatar" src={user.imageUrl} alt="" />
                            ) : (
                              <span className="header-space-avatar header-space-avatar-personal">
                                <IconUser width={13} height={13} />
                              </span>
                            )}
                            <span className="header-space-name">{personalSpaceName}</span>
                            <IconCheckCircle width={14} height={14} className="header-space-check" />
                          </span>
                        )
                      )}

                      {spaceListExpanded && (
                        <>
                      <button
                        className={`header-space-row ${!team.teamId ? 'is-current' : ''}`}
                        disabled={switchingSpace}
                        onClick={() => switchSpace(null)}
                      >
                        {getPersonalSpace(userId, lang).avatar ? (
                          <img className="header-space-avatar" src={getPersonalSpace(userId, lang).avatar} alt="" />
                        ) : user?.imageUrl ? (
                          <img className="header-space-avatar" src={user.imageUrl} alt="" />
                        ) : (
                          <span className="header-space-avatar header-space-avatar-personal">
                            <IconUser width={13} height={13} />
                          </span>
                        )}
                        <span className="header-space-name">{personalSpaceName}</span>
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
                        </>
                      )}

                      <div className="header-dropdown-divider" />

                      <button
                        className="header-dropdown-item"
                        onClick={() => { setOpenHeaderMenu(null); setCurrentPage('space'); window.scrollTo(0, 0) }}
                      >
                        <IconBarChart width={14} height={14} /> {lang === 'fr' ? 'Tableau de bord' : 'Dashboard'}
                      </button>
                      <button className="header-dropdown-item" onClick={() => { setOpenHeaderMenu(null); setShowCreateTeam(true) }}>
                        <IconPlus width={14} height={14} /> {t(lang, 'team.createTeam')}
                      </button>
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
                      <button className="header-dropdown-item" onClick={() => { setOpenHeaderMenu(null); goToNotifications() }}>
                        <IconMessageCircle width={16} height={16} /> {lang === 'fr' ? 'Notifications' : 'Notifications'}
                        {unreadNotifCount > 0 && <span className="header-dropdown-item-badge">{unreadNotifCount}</span>}
                      </button>
                      <button className="header-dropdown-item" onClick={() => { setOpenHeaderMenu(null); goToIntegrations() }}>
                        <IconLink width={16} height={16} /> {lang === 'fr' ? 'Intégrations' : 'Integrations'}
                      </button>
                      <button className="header-dropdown-item" onClick={() => { setOpenHeaderMenu(null); goToSettings() }}>
                        <IconSettings width={16} height={16} /> {t(lang, 'settings.title')}
                      </button>
                      <div className="header-dropdown-divider" />

                      <button className="header-dropdown-item header-dropdown-item-danger" onClick={() => { setOpenHeaderMenu(null); signOut() }}>
                        <IconLogOut width={16} height={16} /> {t(lang, 'auth.signOut')}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button className="btn-header-signin" onClick={() => goToAuth('signin')}>
                <IconLogin width={16} height={16} />
                <span>{t(lang, 'auth.signIn')}</span>
              </button>
            )}
          </div>
        </div>

        {showCreateTeam && (
          <InfoModal
            icon={<IconUsers width={22} height={22} />}
            title={t(lang, 'team.createTeamTitle')}
            onClose={() => setShowCreateTeam(false)}
            banner={createTeamBanner}
          >
            {teamLimitReached ? (
              <>
                <p className="unsaved-changes-body">
                  {pro
                    ? t(lang, 'team.limitReachedPro')(teamLimit)
                    : t(lang, 'team.limitReachedFree')(teamLimit)}
                </p>
                <div className="unsaved-changes-actions">
                  <button className="btn-secondary" onClick={() => setShowCreateTeam(false)}>
                    {t(lang, 'team.createTeamCancel')}
                  </button>
                  {!pro && (
                    <button className="btn-primary" onClick={() => { setShowCreateTeam(false); goToUpgrade() }}>
                      {t(lang, 'account.upgradeCta')}
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
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
              </>
            )}
          </InfoModal>
        )}
      </header>
      )}

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
        {currentPage === 'privacy' && (
          <PrivacyPage lang={lang} onBack={handleBackFromLegal} />
        )}
        {currentPage === 'gallery' && isSignedIn && (
          <GalleryPage key={dataVersion} lang={lang} onOpenPlan={handleLoadFromHistory} />
        )}
        {currentPage === 'auth' && !isSignedIn && (
          <AuthPage
            mode={authMode}
            lang={lang}
            theme={theme}
            onBack={() => setCurrentPage('landing')}
            onSwitchMode={() => setAuthMode(m => m === 'signup' ? 'signin' : 'signup')}
            onOpenModal={setActiveModal}
          />
        )}
        {currentPage === 'questionnaire' && isSignedIn && (
          <Questionnaire key={questionnaireKey} onSubmit={handleGenerate} loading={loading} lang={lang} onShowDrafts={() => setShowDrafts(true)} initialData={initialFormData} />
        )}
        {currentPage === 'result' && plan && (isSignedIn || isSharedView) && (
          <PlanViewer
            key={plan.id || plan.generatedAt}
            plan={plan}
            justGenerated={justGenerated}
            onReset={handleReset}
            lang={lang}
            isPro={pro}
            onRequestUpgrade={goToUpgrade}
            readOnly={isSharedView}
            onDuplicateReadOnly={handleDuplicateReadOnlyPlan}
            novaToggle={novaToggle}
            onCompareVersions={() => { setCurrentPage('plan-versions'); window.scrollTo(0, 0) }}
          />
        )}
        {currentPage === 'plan-versions' && plan && isSignedIn && (
          <PlanVersionsPage
            plan={plan}
            lang={lang}
            onBack={() => { setCurrentPage('result'); window.scrollTo(0, 0) }}
          />
        )}
        {currentPage === 'plan-financial-report' && plan && isSignedIn && (
          <PlanFinancialReportPage
            plan={plan}
            lang={lang}
            userId={userId}
            onBack={() => { setCurrentPage('result'); window.scrollTo(0, 0) }}
          />
        )}
        {currentPage === 'dashboard' && isSignedIn && (
          <DashboardHome
            key={dataVersion}
            lang={lang}
            onOpenSpace={openSpace}
            onCreatePlan={handleStartClick}
            onOpenAccount={goToAccount}
            onOpenGallery={() => { setCurrentPage('gallery'); window.scrollTo(0, 0) }}
            onCreateTeam={() => setShowCreateTeam(true)}
            onLoadPlan={handleOpenPlanFromHistory}
            onOpenActivity={handleOpenNotification}
          />
        )}
        {currentPage === 'account' && isSignedIn && (
          <AccountPage
            key={dataVersion}
            lang={lang}
            onBack={() => setCurrentPage('dashboard')}
            onLoadPlan={handleOpenPlanFromHistory}
            onCreateTeam={() => setShowCreateTeam(true)}
            pendingAction={pendingAccountAction}
            onConsumeAction={() => setPendingAccountAction(null)}
          />
        )}
        {currentPage === 'notifications' && isSignedIn && (
          <NotificationsPage
            key={dataVersion}
            lang={lang}
            onBack={() => setCurrentPage('dashboard')}
            onOpenNotification={handleOpenNotification}
          />
        )}
        {currentPage === 'team' && isSignedIn && (
          <TeamPage lang={lang} onBack={() => setCurrentPage('dashboard')} />
        )}
        {currentPage === 'space' && isSignedIn && (
          <SpacePage
            key={dataVersion}
            lang={lang}
            onBack={() => setCurrentPage('dashboard')}
            onLoadPlan={handleLoadFromHistory}
            onLoadDraft={handleLoadDraft}
            onCreatePlan={handleStartClick}
            onOpenTeamSettings={() => { setCurrentPage('team'); window.scrollTo(0, 0) }}
            onSeeFullHistory={() => { setCurrentPage('account'); window.scrollTo(0, 0) }}
            onOpenHistory={() => setShowHistory(true)}
            onOpenGallery={() => { setCurrentPage('gallery'); window.scrollTo(0, 0) }}
            onPersonalSpaceChange={() => setDataVersion(v => v + 1)}
            onCompareVersions={handleCompareVersions}
            onOpenFinancialReport={handleOpenFinancialReport}
          />
        )}
        {currentPage === 'settings' && isSignedIn && (
          <SettingsPage
            lang={lang}
            theme={theme}
            onToggleTheme={() => setTheme(th => th === 'dark' ? 'light' : 'dark')}
            onChangeLang={setLang}
            timezone={timezone}
            onChangeTimezone={setTimezone}
            reduceMotion={reduceMotion}
            onToggleReduceMotion={() => setReduceMotion(r => !r)}
            fontSize={fontSize}
            onChangeFontSize={setFontSize}
            highContrast={highContrast}
            onToggleHighContrast={() => setHighContrast(h => !h)}
            dateFormat={dateFormat}
            onChangeDateFormat={setDateFormat}
            currency={currency}
            onChangeCurrency={setCurrency}
            onBack={() => setCurrentPage('dashboard')}
          />
        )}
        {currentPage === 'integrations' && isSignedIn && (
          <IntegrationsPage
            lang={lang}
            userId={userId}
            onBack={() => setCurrentPage('dashboard')}
          />
        )}
      </main>

      {currentPage !== 'auth' && (
        <Footer lang={lang} onOpenModal={setActiveModal} />
      )}

      <ScrollToTop />

      {currentPage === 'landing' && (
        <CookieConsentBanner lang={lang} onOpenPolicy={() => setActiveModal('cookies')} />
      )}

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
      {activeModal === 'pricing' && (
        <PricingModal
          lang={lang}
          onClose={() => setActiveModal(null)}
          onContactClick={() => setActiveModal('contact')}
          currentTierId={pro ? 'pro' : 'free'}
          onSelectPro={() => {
            if (isSignedIn) goToUpgrade()
            else goToAuth('signup')
          }}
        />
      )}
      {activeModal === 'changelog' && <ChangelogModal lang={lang} onClose={() => setActiveModal(null)} />}
      {activeModal === 'roadmap' && <RoadmapModal lang={lang} onClose={() => setActiveModal(null)} />}
      {activeModal === 'features' && <FeaturesModal lang={lang} onClose={() => setActiveModal(null)} />}
      {activeModal === 'privacy' && <PrivacyModal lang={lang} onClose={() => setActiveModal(null)} />}
      {activeModal === 'terms' && <TermsModal lang={lang} onClose={() => setActiveModal(null)} />}
      {activeModal === 'cookies' && <CookiesModal lang={lang} onClose={() => setActiveModal(null)} />}

      {showLimitModal && (
        <InfoModal icon={<IconLock width={22} height={22} />} title={t(lang, 'account.limitModalTitle')} onClose={() => setShowLimitModal(false)}>
          <p className="limit-modal-body">{t(lang, 'account.limitModalBody')}</p>
          <div className="limit-modal-actions">
            <button
              className="btn-secondary"
              onClick={() => { setShowLimitModal(false); setPendingAccountAction('plans'); setCurrentPage('account'); window.scrollTo(0, 0) }}
            >
              {t(lang, 'account.limitModalManage')}
            </button>
            <button
              className="btn-primary"
              onClick={goToUpgrade}
            >
              {t(lang, 'account.upgradeCta')}
            </button>
          </div>
        </InfoModal>
      )}
    </div>
  )
}
