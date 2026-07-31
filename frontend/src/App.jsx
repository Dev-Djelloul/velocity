import { useState, useEffect } from 'react'
import Landing from './components/Landing'
import Wordmark from './components/Wordmark'
import { IconClipboard } from './components/Icons'
import Questionnaire from './components/Questionnaire'
import PlanViewer from './components/PlanViewer'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import PlansHistory from './components/PlansHistory'
import DraftsModal from './components/DraftsModal'
import SecurityPage from './components/SecurityPage'
import HowItWorksPage from './components/HowItWorksPage'
import { AboutModal, CareersModal, ContactModal } from './components/CompanyModals'
import { PricingModal, ChangelogModal, RoadmapModal } from './components/ProductModals'
import { PrivacyModal, TermsModal, CookiesModal } from './components/LegalModals'
import { generatePlan } from './lib/planGenerator'
import { t } from './lib/i18n'
import { savePlan, getPlanById, getShareLink } from './lib/planStorage'
import './styles/design-system.css'
import './styles/accessibility.css'
import './App.css'

export default function App() {
  const [lang, setLang] = useState(() => localStorage.getItem('plp_lang') || 'fr')
  const [currentPage, setCurrentPage] = useState('landing') // landing, questionnaire, result
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showHistory, setShowHistory] = useState(false)
  const [showDrafts, setShowDrafts] = useState(false)
  const [activeModal, setActiveModal] = useState(null)

  useEffect(() => {
    localStorage.setItem('plp_lang', lang)
  }, [lang])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const shareId = params.get('share')
    if (shareId) {
      const shared = getShareLink(shareId)
      if (shared?.plan) {
        setPlan(shared.plan)
        setCurrentPage('result')
      }
    }
  }, [])

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
      setPlan(generatedPlan)
      setCurrentPage('result')
    } catch (e) {
      try {
        const generatedPlan = generatePlan(payload)
        savePlan(generatedPlan)
        setPlan(generatedPlan)
        setCurrentPage('result')
      } catch {
        setError(t(lang, 'errors.generic'))
      }
    } finally {
      setLoading(false)
    }
  }

  const handleStartClick = () => {
    setCurrentPage('questionnaire')
    window.scrollTo(0, 0)
  }

  const handleReset = () => {
    setPlan(null)
    setCurrentPage('landing')
    window.scrollTo(0, 0)
  }

  const handleLoadDemo = (demoData) => {
    handleGenerate(demoData)
  }

  const handleLoadFromHistory = (plan) => {
    setPlan(plan)
    setCurrentPage('result')
  }

  const handleLoadDraft = (formData) => {
    // Charge les données du brouillon et retourne au questionnaire
    setCurrentPage('questionnaire')
    // Les données seront chargées dans le composant Questionnaire
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
            <button className="btn-header" onClick={() => setShowHistory(true)} title="Mes plans">
              <IconClipboard width={16} height={16} /> {lang === 'fr' ? 'Plans' : 'Plans'}
            </button>
            <div className="lang-toggle">
              <button className={lang === 'fr' ? 'active' : ''} onClick={() => setLang('fr')}>FR</button>
              <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
            </div>
            <button className="btn-header-cta" onClick={handleStartClick}>
              {lang === 'fr' ? 'Commencer' : 'Get Started'}
            </button>
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
        {currentPage === 'questionnaire' && (
          <Questionnaire onSubmit={handleGenerate} loading={loading} lang={lang} onShowDrafts={() => setShowDrafts(true)} />
        )}
        {currentPage === 'result' && plan && (
          <PlanViewer plan={plan} onReset={handleReset} lang={lang} />
        )}
      </main>

      <Footer lang={lang} onOpenModal={setActiveModal} onNavigateFeatures={() => handleNavAnchor('features')} />

      <ScrollToTop />

      {showHistory && (
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
      {activeModal === 'about' && <AboutModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'careers' && <CareersModal onClose={() => setActiveModal(null)} onContactClick={() => setActiveModal('contact')} />}
      {activeModal === 'contact' && <ContactModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'pricing' && <PricingModal onClose={() => setActiveModal(null)} onContactClick={() => setActiveModal('contact')} />}
      {activeModal === 'changelog' && <ChangelogModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'roadmap' && <RoadmapModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'privacy' && <PrivacyModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'terms' && <TermsModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'cookies' && <CookiesModal onClose={() => setActiveModal(null)} />}
    </div>
  )
}
