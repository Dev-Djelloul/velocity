import { useState } from 'react'
import DemoModal from './DemoModal'
import { IconClipboard, IconTarget, IconBarChart, IconTrendingUp, IconSparkle, IconDownload } from './Icons'
import { t } from '../lib/i18n'
import { tLanding } from '../lib/landingI18n'
import { useImageOptimization, useScrollReveal, useAiImages } from '../hooks/useImageOptimization'
import '../styles/Landing.css'

export default function Landing({ lang, onStartClick, onLoadDemo, onDiscoverClick }) {
  const [hoveredFeature, setHoveredFeature] = useState(null)
  const [showDemo, setShowDemo] = useState(false)
  const images = useAiImages()
  const heroImage = useImageOptimization(images.heroIsometric)
  const { ref: statsRef, isVisible: statsVisible } = useScrollReveal()

  const features = [
    {
      Icon: IconClipboard,
      title: tLanding(lang, 'features.plan5min.title'),
      desc: tLanding(lang, 'features.plan5min.desc')
    },
    {
      Icon: IconTarget,
      title: tLanding(lang, 'features.roadmap.title'),
      desc: tLanding(lang, 'features.roadmap.desc')
    },
    {
      Icon: IconBarChart,
      title: tLanding(lang, 'features.marketing.title'),
      desc: tLanding(lang, 'features.marketing.desc')
    },
    {
      Icon: IconTrendingUp,
      title: tLanding(lang, 'features.kpis.title'),
      desc: tLanding(lang, 'features.kpis.desc')
    },
    {
      Icon: IconSparkle,
      title: tLanding(lang, 'features.ai.title'),
      desc: tLanding(lang, 'features.ai.desc')
    },
    {
      Icon: IconDownload,
      title: tLanding(lang, 'features.export.title'),
      desc: tLanding(lang, 'features.export.desc')
    }
  ]

  const stats = [
    { number: '2.5k+', label: tLanding(lang, 'stats.generated') },
    { number: '4.9★', label: tLanding(lang, 'stats.rating') },
    { number: '95%', label: tLanding(lang, 'stats.satisfaction') },
    { number: '15min', label: tLanding(lang, 'stats.avgTime') }
  ]

  return (
    <div className="landing">
      {/* Hero Section - Amélioré avec Image IA */}
      <section className="hero hero-enhanced">
        <div className="hero-background">
          <div className="hero-gradient-overlay" />
          <img
            src={images.heroIsometric}
            alt="VelocityLaunch Hero"
            className={`hero-image ${heroImage.imageClass}`}
            loading="eager"
          />
        </div>

        <div className="hero-content hero-content-enhanced">
          <div className="hero-badge hero-badge-animated">
            <span className="hero-badge-dot" />
            {tLanding(lang, 'hero.badge')}
          </div>

          <h1 className="hero-title hero-title-animated">
            {tLanding(lang, 'hero.title')}
            <span className="hero-highlight"> {tLanding(lang, 'hero.titleHighlight')}</span>
          </h1>

          <p className="hero-subtitle hero-subtitle-animated">
            {tLanding(lang, 'hero.subtitle')}
          </p>

          <div className="hero-cta-group hero-cta-animated">
            <button className="btn-cta-primary btn-cta-primary-enhanced" onClick={onStartClick}>
              {tLanding(lang, 'hero.ctaPrimary')}
              <span className="arrow">→</span>
            </button>
            <button className="btn-cta-secondary btn-cta-secondary-enhanced" onClick={onDiscoverClick}>
              {tLanding(lang, 'hero.ctaSecondary')}
            </button>
          </div>

          <p className="hero-footnote hero-footnote-animated">
            {tLanding(lang, 'hero.footnote')}
            {' '}•{' '}
            <button className="link-demo" onClick={() => setShowDemo(true)}>
              {tLanding(lang, 'hero.demoLink')}
            </button>
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          {stats.map((stat, i) => (
            <div key={i} className="stat-card">
              <div className="stat-number">{stat.number}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section" id="features">
        <div className="section-header">
          <h2>{tLanding(lang, 'features.title')}</h2>
          <p>{tLanding(lang, 'features.subtitle')}</p>
        </div>

        <div className="features-grid">
          {features.map((feature, i) => (
            <div
              key={i}
              className={`feature-card ${hoveredFeature === i ? 'active' : ''}`}
              onMouseEnter={() => setHoveredFeature(i)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              <div className="feature-icon"><feature.Icon width={24} height={24} /></div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Product Preview - 3 vues distinctes de l'interface */}
      <section className="product-preview" id="product-preview">
        <div className="section-header">
          <h2>{lang === 'fr' ? 'Aperçu du produit' : 'Product Preview'}</h2>
          <p>{lang === 'fr' ? 'Roadmap, sprints et pilotage exécutif' : 'Roadmap, sprints and executive overview'}</p>
        </div>

        <div className="preview-grid">
          <div className="preview-card">
            <img src={images.productPreview1} alt="Roadmap et sprint Kanban" loading="lazy" />
            <div className="preview-card-caption">
              <span>{lang === 'fr' ? 'Roadmap & Sprint' : 'Roadmap & Sprint'}</span>
            </div>
          </div>
          <div className="preview-card">
            <img src={images.productPreview3} alt="Analytics et widgets" loading="lazy" />
            <div className="preview-card-caption">
              <span>{lang === 'fr' ? 'Analytics' : 'Analytics'}</span>
            </div>
          </div>
          <div className="preview-card">
            <img src={images.productPreview4} alt="Gantt et suivi de vélocité" loading="lazy" />
            <div className="preview-card-caption">
              <span>{lang === 'fr' ? 'Gantt & Vélocité' : 'Gantt & Velocity'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works" id="how-it-works">
        <div className="section-header">
          <h2>{tLanding(lang, 'howItWorks.title')}</h2>
          <p>{tLanding(lang, 'howItWorks.subtitle')}</p>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>{tLanding(lang, 'howItWorks.step1.title')}</h3>
            <p>{tLanding(lang, 'howItWorks.step1.desc')}</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>{tLanding(lang, 'howItWorks.step2.title')}</h3>
            <p>{tLanding(lang, 'howItWorks.step2.desc')}</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>{tLanding(lang, 'howItWorks.step3.title')}</h3>
            <p>{tLanding(lang, 'howItWorks.step3.desc')}</p>
          </div>
        </div>

        <button className="link-demo how-it-works-link" onClick={onDiscoverClick}>
          {lang === 'fr' ? 'Voir le guide complet' : 'See the full guide'}
          <span className="arrow">→</span>
        </button>
      </section>

      {/* Industries & Use Cases */}
      <section className="industries-section" id="industries">
        <div className="section-header">
          <h2>{lang === 'fr' ? 'Pour tous les secteurs' : 'For Every Industry'}</h2>
          <p>{lang === 'fr' ? 'VelocityLaunch s\'adapte à votre domaine d\'activité' : 'VelocityLaunch adapts to your industry'}</p>
        </div>

        <div className="industries-container">
          <img
            src={images.industriesSaas}
            alt="SaaS, E-commerce, FinTech, MarTech"
            className="industries-image"
            loading="lazy"
          />
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="section-header">
          <h2>{tLanding(lang, 'testimonials.title')}</h2>
          <p>{tLanding(lang, 'testimonials.subtitle')}</p>
        </div>

        {images.teamFounders && (
          <div className="testimonials-hero-image">
            <img
              src={images.teamFounders}
              alt="Founders celebrating"
              loading="lazy"
            />
          </div>
        )}

      </section>

      {/* CTA Section - Mid Page */}
      <section className="cta-mid-section">
        <div className="cta-content">
          <h2>{tLanding(lang, 'ctaMid.title')}</h2>
          <p>{tLanding(lang, 'ctaMid.subtitle')}</p>
          <button className="btn-cta-large" onClick={onStartClick}>
            {tLanding(lang, 'ctaMid.button')}
          </button>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="faq-section">
        <div className="section-header">
          <h2>{tLanding(lang, 'faq.title')}</h2>
        </div>

        <div className="faq-grid">
          <div className="faq-card">
            <h4>{tLanding(lang, 'faq.q1.title')}</h4>
            <p>{tLanding(lang, 'faq.q1.answer')}</p>
          </div>
          <div className="faq-card">
            <h4>{tLanding(lang, 'faq.q2.title')}</h4>
            <p>{tLanding(lang, 'faq.q2.answer')}</p>
          </div>
          <div className="faq-card">
            <h4>{tLanding(lang, 'faq.q3.title')}</h4>
            <p>{tLanding(lang, 'faq.q3.answer')}</p>
          </div>
          <div className="faq-card">
            <h4>{tLanding(lang, 'faq.q4.title')}</h4>
            <p>{tLanding(lang, 'faq.q4.answer')}</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <div className="final-cta-content">
          <h2>{tLanding(lang, 'finalCta.title')}</h2>
          <p>{tLanding(lang, 'finalCta.subtitle')}</p>
          <button className="btn-cta-final" onClick={onStartClick}>
            {tLanding(lang, 'finalCta.button')}
          </button>
        </div>
      </section>

      {showDemo && (
        <DemoModal
          lang={lang}
          onClose={() => setShowDemo(false)}
          onLoadDemo={(demoData) => {
            if (onLoadDemo) onLoadDemo(demoData)
            else console.log('Demo data:', demoData)
          }}
        />
      )}
    </div>
  )
}
