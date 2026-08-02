import { useState, useEffect, useRef } from 'react'
import Landing from './components/Landing'
import Wordmark from './components/Wordmark'
import { IconClipboard, IconHome, IconUser } from './components/Icons'
import Questionnaire from './components/Questionnaire'
import PlanViewer from './components/PlanViewer'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import PlansHistory from './components/PlansHistory'
import DraftsModal from './components/DraftsModal'
import SecurityPage from './components/SecurityPage'
import HowItWorksPage from './components/HowItWorksPage'
import AccountPage from './components/AccountPage'
import { AboutModal, CareersModal, ContactModal } from './components/CompanyModals'
import { PricingModal, ChangelogModal, RoadmapModal } from './components/ProductModals'
import { PrivacyModal, TermsModal, CookiesModal } from './components/LegalModals'
import { generatePlan } from './lib/planGenerator'
import { t } from './lib/i18n'
import { savePlan, getShareLink, setActiveUser as setPlanActiveUser, syncPlansFromServer } from './lib/planStorage'
import { setActiveUser as setDraftActiveUser, syncDraftsFromServer } from './lib/draftStorage'
import { useUser, useAuth, useSignIn, UserButton } from './lib/auth'
import { canGenerate, consumeCredit, remainingCredits, isPro, syncCreditsFromServer } from './lib/creditTracker'
import './styles/design-system.css'
import './styles/accessibility.css'
import './App.css'

const AUTH_ONLY_PAGES = ['questionnaire', 'result', 'account']

export default function App() {
  const [lang, setLang] = useState(() => localStorage.getItem('plp_lang') || 'fr')
  const [currentPage, setCurrentPage] = useState('landing') // landing, questionnaire, result, howItWorks, account
  const [plan, setPlan] = useState(null)
  const [justGenerated, setJustGenerated] = useState(false)
  const [initialFormData, setInitialFormData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showHistory, setShowHistory] = useState(false)
  const [showDrafts, setShowDrafts] = useState(false)
  const [activeModal, setActiveModal] = useState(null)
  const [isSharedView, setIsSharedView] = useState(false)
  const [dataVersion, setDataVersion] = useState(0)

  const { isSignedIn, isLoaded } = useUser()
  const { userId, signOut } = useAuth()
  const { open: openSignIn } = useSignIn()
  const wasSignedIn = useRef(isSignedIn)

  useEffect(() => {
    localStorage.setItem('plp_lang', lang)
  }, [lang])

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

  // Flux demandé : Get Started -> connexion -> atterrit sur "Mon compte" -> l'utilisateur
  // revient ensuite lui-même vers la génération. Détecte toute transition signed-out -> signed-in,
  // et hydrate le cache local (plans/brouillons/crédits) depuis le stockage serveur.
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
      setCurrentPage('account')
      window.scrollTo(0, 0)
    }
    if (wasSignedIn.current && !isSignedIn) {
      setPlanActiveUser(null)
      setDraftActiveUser(null)
    }
    wasSignedIn.current = isSignedIn
  }, [isSignedIn, isLoaded, userId])

  // Garde-fou : les pages compte/questionnaire/résultat exigent une session active.
  useEffect(() => {
    if (!isLoaded) return
    if (currentPage === 'result' && isSharedView) return // lien de partage : consultable sans compte
    if (AUTH_ONLY_PAGES.includes(currentPage) && !isSignedIn) {
      setCurrentPage('landing')
    }
  }, [currentPage, isSignedIn, isLoaded, isSharedView])

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
      savePlan(generatedPlan)
      consumeCredit(userId)
      setPlan(generatedPlan)
      setJustGenerated(true)
      setIsSharedView(false)
      setCurrentPage('result')
      window.scrollTo(0, 0)
    } catch (e) {
      try {
        const generatedPlan = generatePlan(payload)
        savePlan(generatedPlan)
        consumeCredit(userId)
        setPlan(generatedPlan)
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
      openSignIn()
      return
    }
    if (!canGenerate(userId)) {
      setCurrentPage('account')
      window.scrollTo(0, 0)
      return
    }
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
      openSignIn()
      return
    }
    handleGenerate(demoData)
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
      <header className="header">
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
          </nav>

          <div className="header-actions">
            {isSignedIn && (
              <>
                {!pro && (
                  <span className="header-credits-badge">{remaining}/3 {lang === 'fr' ? 'plans' : 'plans'}</span>
                )}
                <button className="btn-header" onClick={() => setShowHistory(true)} title={t(lang, 'account.plansSectionTitle')}>
                  <IconClipboard width={16} height={16} /> {lang === 'fr' ? 'Plans' : 'Plans'}
                </button>
              </>
            )}
            <div className="lang-toggle">
              <button className={lang === 'fr' ? 'active' : ''} onClick={() => setLang('fr')}>FR</button>
              <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
            </div>
            {isSignedIn ? (
              <>
                <button className="btn-header" onClick={goToAccount} title={t(lang, 'auth.myAccount')}>
                  <IconUser width={16} height={16} />
                </button>
                <UserButton />
              </>
            ) : (
              <button className="btn-header-cta" onClick={handleStartClick}>
                {t(lang, 'auth.getStarted')}
              </button>
            )}
          </div>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <main>
        {currentPage === 'landing' && (
          <Landing lang={lang} onStartClick={handleStartClick} onLoadDemo={handleLoadDemo} onDiscoverClick={handleShowHowItWorks} />
        )}
        {currentPage === 'howItWorks' && (
          <HowItWorksPage lang={lang} onStartClick={handleStartClick} />
        )}
        {currentPage === 'questionnaire' && isSignedIn && (
          <Questionnaire onSubmit={handleGenerate} loading={loading} lang={lang} onShowDrafts={() => setShowDrafts(true)} initialData={initialFormData} />
        )}
        {currentPage === 'result' && plan && (isSignedIn || isSharedView) && (
          <PlanViewer plan={plan} justGenerated={justGenerated} onReset={handleReset} lang={lang} />
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
    </div>
  )
}
