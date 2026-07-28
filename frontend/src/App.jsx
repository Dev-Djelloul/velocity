import { useState, useEffect } from 'react'
import Landing from './components/Landing'
import Questionnaire from './components/Questionnaire'
import PlanViewer from './components/PlanViewer'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import PlansHistory from './components/PlansHistory'
import DraftsModal from './components/DraftsModal'
import SecurityPage from './components/SecurityPage'
import { generatePlan } from './lib/planGenerator'
import { t } from './lib/i18n'
import { savePlan, getPlanById, getShareLink } from './lib/planStorage'
import './styles/design-system.css'
import './App.css'

export default function App() {
  const [lang, setLang] = useState(() => localStorage.getItem('plp_lang') || 'fr')
  const [currentPage, setCurrentPage] = useState('landing') // landing, questionnaire, result
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showHistory, setShowHistory] = useState(false)
  const [showSecurity, setShowSecurity] = useState(false)
  const [showDrafts, setShowDrafts] = useState(false)

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

  return (
    <div className="app">
      <header className="header">
        <div className="header-top">
          <div className="header-brand">
            <div className="brand-logo">
              🚀
            </div>
            <div>
              <h1>VelocityLaunch</h1>
            </div>
          </div>
          <div className="header-actions">
            <button className="btn-header" onClick={() => setShowHistory(true)} title="Mes plans">
              📋 Plans
            </button>
            <div className="lang-toggle">
              <button className={lang === 'fr' ? 'active' : ''} onClick={() => setLang('fr')}>FR</button>
              <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
            </div>
          </div>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <main>
        {currentPage === 'landing' && (
          <Landing lang={lang} onStartClick={handleStartClick} onLoadDemo={handleLoadDemo} />
        )}
        {currentPage === 'questionnaire' && (
          <Questionnaire onSubmit={handleGenerate} loading={loading} lang={lang} onShowDrafts={() => setShowDrafts(true)} />
        )}
        {currentPage === 'result' && plan && (
          <PlanViewer plan={plan} onReset={handleReset} lang={lang} />
        )}
      </main>

      <Footer lang={lang} onShowSecurity={() => setShowSecurity(true)} />

      <ScrollToTop />

      {showHistory && (
        <PlansHistory
          lang={lang}
          onLoadPlan={handleLoadFromHistory}
          onClose={() => setShowHistory(false)}
        />
      )}

      {showSecurity && (
        <SecurityPage
          lang={lang}
          onClose={() => setShowSecurity(false)}
        />
      )}

      {showDrafts && (
        <DraftsModal
          lang={lang}
          onLoadDraft={handleLoadDraft}
          onClose={() => setShowDrafts(false)}
        />
      )}
    </div>
  )
}
