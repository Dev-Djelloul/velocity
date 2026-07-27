import { useState, useEffect } from 'react'
import Questionnaire from './components/Questionnaire'
import PlanViewer from './components/PlanViewer'
import { generatePlan } from './lib/planGenerator'
import { t } from './lib/i18n'
import './App.css'

export default function App() {
  const [lang, setLang] = useState(() => localStorage.getItem('plp_lang') || 'fr')
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
      } else {
        await new Promise(r => setTimeout(r, 400))
        setPlan(generatePlan(payload))
      }
    } catch (e) {
      try {
        setPlan(generatePlan(payload))
      } catch {
        setError(t(lang, 'errors.generic'))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-top">
          <div>
            <h1>{t(lang, 'app.title')}</h1>
            <p>{t(lang, 'app.subtitle')}</p>
          </div>
          <div className="lang-toggle">
            <button className={lang === 'fr' ? 'active' : ''} onClick={() => setLang('fr')}>FR</button>
            <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
          </div>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      {!plan ? (
        <Questionnaire onSubmit={handleGenerate} loading={loading} lang={lang} />
      ) : (
        <PlanViewer plan={plan} onReset={() => setPlan(null)} lang={lang} />
      )}
    </div>
  )
}
