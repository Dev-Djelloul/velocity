// Point d'entrée SSR dédié au prérendu (scripts/prerender.mjs), séparé de main.jsx.
// Ne rend QUE les pages marketing publiques (Landing, HowItWorksPage) : elles ne dépendent
// d'aucun contexte (pas d'auth Clerk, pas de router) ni d'API navigateur pendant le rendu,
// ce qui les rend sûres à exécuter côté Node avec renderToString. Le header/footer statiques
// ci-dessous ne sont PAS le header interactif de App.jsx (qui dépend de l'état d'auth) : ils
// servent uniquement de coquille visuelle identique pour les robots et le premier affichage,
// avant que l'hydratation côté client ne remplace tout par l'app réelle.
import { renderToString } from 'react-dom/server'
import Landing from './components/Landing'
import HowItWorksPage from './components/HowItWorksPage'
import Footer from './components/Footer'
import Wordmark from './components/Wordmark'
import './styles/design-system.css'
import './styles/accessibility.css'
import './App.css'

const noop = () => {}

function StaticHeader({ lang }) {
  return (
    <header className="header header-locked-dark">
      <div className="header-top">
        <a className="header-brand-btn" href="/">
          <Wordmark size={34} />
        </a>
        <nav className="header-nav">
          <a className="header-nav-link" href="/#features">{lang === 'fr' ? 'Fonctionnalités' : 'Features'}</a>
          <a className="header-nav-link" href="/comment-ca-marche">{lang === 'fr' ? 'Comment ça marche' : 'How it works'}</a>
        </nav>
        <div className="header-actions">
          <a className="btn-header-cta" href="/inscription">
            {lang === 'fr' ? 'Commencer' : 'Get started'}
          </a>
        </div>
      </div>
    </header>
  )
}

const ROUTES = {
  '/': {
    Component: Landing,
    props: (lang) => ({ lang, onStartClick: noop, onOpenDemo: noop, onDiscoverClick: noop })
  },
  '/comment-ca-marche': {
    Component: HowItWorksPage,
    props: (lang) => ({ lang, onStartClick: noop })
  }
}

export function render(url, lang = 'fr') {
  const route = ROUTES[url]
  if (!route) return null
  const { Component, props } = route
  return renderToString(
    <div className="app">
      <StaticHeader lang={lang} />
      <main>
        <Component {...props(lang)} />
      </main>
      <Footer lang={lang} onOpenModal={noop} onNavigateFeatures={noop} />
    </div>
  )
}
