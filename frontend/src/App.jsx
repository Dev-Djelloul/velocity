import { useState, useEffect } from 'react'
import Landing from './components/Landing'
import Questionnaire from './components/Questionnaire'
import PlanViewer from './components/PlanViewer'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import { generatePlan } from './lib/planGenerator'
import { t } from './lib/i18n'
import './styles/design-system.css'
import './App.css'

export default function App() {
  const [lang, setLang] = useState(() => localStorage.getItem('plp_lang') || 'fr')
  const [currentPage, setCurrentPage] = useState('landing') // landing, questionnaire, result
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    localStorage.setItem('plp_lang', lang)
  }, [lang])

  const handleGenerate = async (data) => {
    setLoading(true)
    setError(null)
    const payload = { ...data, language: lang }
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL
      if (backendUrl) {
        const response = await fetch(backendUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        if (!response.ok) throw new Error('backend error')
        setPlan(await response.json())
        setCurrentPage('result')
      } else {
        await new Promise(r => setTimeout(r, 400))
        setPlan(generatePlan(payload))
        setCurrentPage('result')
      }
    } catch (e) {
      try {
        setPlan(generatePlan(payload))
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
          <div className="lang-toggle">
            <button className={lang === 'fr' ? 'active' : ''} onClick={() => setLang('fr')}>FR</button>
            <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
          </div>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <main>
        {currentPage === 'landing' && (
          <Landing lang={lang} onStartClick={handleStartClick} />
        )}
        {currentPage === 'questionnaire' && (
          <Questionnaire onSubmit={handleGenerate} loading={loading} lang={lang} />
        )}
        {currentPage === 'result' && plan && (
          <PlanViewer plan={plan} onReset={handleReset} lang={lang} />
        )}
      </main>

      <Footer lang={lang} />
      
      <ScrollToTop />
    </div>
  )
}
