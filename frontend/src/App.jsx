import { useState, useEffect, useRef } from 'react'
import Landing from './components/Landing'
import DemoModal from './components/DemoModal'
import Wordmark from './components/Wordmark'
import { IconClipboard, IconHome, IconUser, IconLogin, IconLock, IconSparkle, IconSun, IconMoon } from './components/Icons'
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
import AuthPage from './components/AuthPage'
import { AboutModal, CareersModal, ContactModal } from './components/CompanyModals'
import { PricingModal, ChangelogModal, RoadmapModal } from './components/ProductModals'
import { PrivacyModal, TermsModal, CookiesModal } from './components/LegalModals'
import { generatePlan } from './lib/planGenerator'
import { t } from './lib/i18n'
import { savePlan, getShareLink, setActiveUser as setPlanActiveUser, syncPlansFromServer, generateId } from './lib/planStorage'
import { setActiveUser as setDraftActiveUser, syncDraftsFromServer } from './lib/draftStorage'
import { useUser, useAuth } from './lib/auth'
import { canGenerate, consumeCredit, remainingCredits, isPro, syncCreditsFromServer } from './lib/creditTracker'
import './styles/design-system.css'
import './styles/accessibility.css'
import './App.css'

const AUTH_ONLY_PAGES = ['questionnaire', 'result', 'account']

export default function App() {
  const [lang, setLang] = useState(() => localStorage.getItem('plp_lang') || 'fr')
  const [theme, setTheme] = useState(() => localStorage.getItem('plp_theme') || 'dark')
  const [currentPage, setCurrentPage] = useState('landing') // landing, questionnaire, result, howItWorks, account
  const [plan, setPlan] = useState(null)
  const [justGenerated, setJustGenerated] = useState(false)
  const [initialFormData, setInitialFormData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showHistory, setShowHistory] = useState(false)
  const [showDemo, setShowDemo] = useState(false)
  const [showDrafts, setShowDrafts] = useState(false)
  const [activeModal, setActiveModal] = useState(null)
  const [isSharedView, setIsSharedView] = useState(false)
  const [dataVersion, setDataVersion] = useState(0)
  const [authMode, setAuthMode] = useState('signup')
  const [authIntent, setAuthIntent] = useState(null)
  const [pendingDemoData, setPendingDemoData] = useState(null)
  const [showLimitModal, setShowLimitModal] = useState(false)

  const { isSignedIn, isLoaded, user } = useUser()
  const { userId, signOut } = useAuth()
  const wasSignedIn = useRef(isSignedIn)

  const goToAuth = (mode, intent = null) => {
    setAuthMode(mode)
    setAuthIntent(intent)
    setCurrentPage('auth')
    window.scrollTo(0, 0)
  }

  useEffect(() => {
    localStorage.setItem('plp_lang', lang)
  }, [lang])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('plp_theme', theme)
  }, [theme])

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
      Promise.all([
        syncPlansFromServer(userId),
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
      setDraftActiveUser(null)
    }
    wasSignedIn.current = isSignedIn
  }, [isSignedIn, isLoaded, userId, authIntent])

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

  const remaining = isSignedIn ? remainingCredits(userId) : 0
  const pro = isSignedIn && isPro(userId)

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
            <button
              className="header-home-btn"
              aria-label={lang === 'fr' ? 'Accueil' : 'Home'}
              title={lang === 'fr' ? 'Accueil' : 'Home'}
              onClick={() => {
                setCurrentPage('landing')
                window.scrollTo(0, 0)
              }}
            >
              <IconHome width={20} height={20} />
            </button>
            <button className="header-nav-link" onClick={() => handleNavAnchor('features')}>
              {lang === 'fr' ? 'Fonctionnalités' : 'Features'}
            </button>
            <button
              className={`header-nav-link ${currentPage === 'howItWorks' ? 'active' : ''}`}
              onClick={handleShowHowItWorks}
            >
              {lang === 'fr' ? 'Comment ça marche' : 'How it works'}
            </button>
            <button className="btn-header-cta" onClick={handleStartClick}>
              {t(lang, 'auth.getStarted')}
            </button>
          </nav>

          <div className="header-actions">
            <button className="btn-header btn-header-demo" onClick={() => setShowDemo(true)} title={lang === 'fr' ? 'Voir une démo' : 'Watch a demo'}>
              <IconSparkle width={16} height={16} /> {lang === 'fr' ? 'Voir une démo' : 'Watch a demo'}
            </button>
            {isSignedIn && (
              <>
                <button className="btn-header btn-header-gradient-border" onClick={() => setShowHistory(true)} title={t(lang, 'account.plansSectionTitle')}>
                  <IconClipboard width={16} height={16} /> {lang === 'fr' ? 'Mes plans' : 'My plans'}
                </button>
                {!pro && (
                  <span className="header-credits-badge">{remaining} {lang === 'fr' ? 'plans restants' : 'plans left'}</span>
                )}
              </>
            )}
            {currentPage !== 'landing' && (
              <button
                className="theme-toggle"
                onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
                title={theme === 'dark' ? (lang === 'fr' ? 'Passer au thème clair' : 'Switch to light theme') : (lang === 'fr' ? 'Passer au thème sombre' : 'Switch to dark theme')}
              >
                {theme === 'dark' ? <IconMoon width={16} height={16} /> : <IconSun width={16} height={16} />}
              </button>
            )}
            <div className="lang-toggle">
              <button className={lang === 'fr' ? 'active' : ''} onClick={() => setLang('fr')}>FR</button>
              <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
            </div>
            {isSignedIn ? (
              <button className="header-avatar-btn" onClick={goToAccount} title={t(lang, 'auth.myAccount')}>
                {user?.imageUrl ? <img src={user.imageUrl} alt="" /> : <IconUser width={16} height={16} />}
              </button>
            ) : (
              <button className="btn-header-signin" onClick={() => goToAuth('signin')} title={t(lang, 'auth.signIn')}>
                <IconLogin width={18} height={18} />
              </button>
            )}
          </div>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

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
            onLoadDraft={handleLoadDraft}
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
