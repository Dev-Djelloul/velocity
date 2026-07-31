import { useState } from 'react'
import DemoModal from './DemoModal'
import { IconClipboard, IconTarget, IconBarChart, IconTrendingUp, IconSparkle, IconDownload } from './Icons'
import { t } from '../lib/i18n'
import { tLanding } from '../lib/landingI18n'
import '../styles/Landing.css'

export default function Landing({ lang, onStartClick, onLoadDemo, onDiscoverClick }) {
  const [hoveredFeature, setHoveredFeature] = useState(null)
  const [showDemo, setShowDemo] = useState(false)

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

  const testimonials = [
    {
      quote: tLanding(lang, 'testimonials.testimonial1.quote'),
      author: tLanding(lang, 'testimonials.testimonial1.author'),
      role: tLanding(lang, 'testimonials.testimonial1.role')
    },
    {
      quote: tLanding(lang, 'testimonials.testimonial2.quote'),
      author: tLanding(lang, 'testimonials.testimonial2.author'),
      role: tLanding(lang, 'testimonials.testimonial2.role')
    },
    {
      quote: tLanding(lang, 'testimonials.testimonial3.quote'),
      author: tLanding(lang, 'testimonials.testimonial3.author'),
      role: tLanding(lang, 'testimonials.testimonial3.role')
    }
  ]

  const initials = (name) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="landing">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            {tLanding(lang, 'hero.badge')}
          </div>

          <h1 className="hero-title">
            {tLanding(lang, 'hero.title')}
            <span className="hero-highlight"> {tLanding(lang, 'hero.titleHighlight')}</span>
          </h1>

          <p className="hero-subtitle">
            {tLanding(lang, 'hero.subtitle')}
          </p>

          <div className="hero-cta-group">
            <button className="btn-cta-primary" onClick={onStartClick}>
              {tLanding(lang, 'hero.ctaPrimary')}
              <span className="arrow">→</span>
            </button>
            <button className="btn-cta-secondary" onClick={onDiscoverClick}>
              {tLanding(lang, 'hero.ctaSecondary')}
            </button>
          </div>

          <p className="hero-footnote">
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

      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="section-header">
          <h2>{tLanding(lang, 'testimonials.title')}</h2>
          <p>{tLanding(lang, 'testimonials.subtitle')}</p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((testimonial, i) => (
            <div key={i} className="testimonial-card">
              <div className="testimonial-quote">"{testimonial.quote}"</div>
              <div className="testimonial-author">
                <span className="testimonial-avatar">{initials(testimonial.author)}</span>
                <div>
                  <div className="testimonial-name">{testimonial.author}</div>
                  <div className="testimonial-role">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
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
