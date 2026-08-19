import { useState } from 'react'
import { tLanding } from '../lib/landingI18n'
import { useAiImages } from '../hooks/useImageOptimization'
import { IconCalendar, IconMegaphone, IconBarChart, IconFileText } from './Icons'
import heroImg from '../../assets/img/hiw2-hero-command-center.webp'
import step1Img from '../../assets/img/hiw2-step1-guided-inputs.webp'
import step2Img from '../../assets/img/hiw2-step2-roadmap.webp'
import step3Img from '../../assets/img/hiw2-step3-dashboard-export.webp'
import trustedImg from '../../assets/img/hiw-cta-huddle.webp'
import '../styles/HowItWorksPage.css'

export default function HowItWorksPage({ lang, onStartClick }) {
  const [openFaq, setOpenFaq] = useState(0)
  const images = useAiImages()

  const benefits = [
    { img: images.valueFast, title: tLanding(lang, 'hiw.value1.title'), desc: tLanding(lang, 'hiw.value1.desc') },
    { img: images.valueBrain, title: tLanding(lang, 'hiw.value2.title'), desc: tLanding(lang, 'hiw.value2.desc') },
    { img: images.valueCustom, title: tLanding(lang, 'hiw.value3.title'), desc: tLanding(lang, 'hiw.value3.desc') },
    { img: images.valueActionable, title: tLanding(lang, 'hiw.value4.title'), desc: tLanding(lang, 'hiw.value4.desc') }
  ]

  const steps = [
    { img: step1Img, title: tLanding(lang, 'hiw.step1.title'), desc: tLanding(lang, 'hiw.step1.lead'), detail: tLanding(lang, 'hiw.step1.detail') },
    { img: step2Img, title: tLanding(lang, 'hiw.step2.title'), desc: tLanding(lang, 'hiw.step2.lead'), detail: tLanding(lang, 'hiw.step2.detail') },
    { img: step3Img, title: tLanding(lang, 'hiw.step3.title'), desc: tLanding(lang, 'hiw.step3.lead'), detail: tLanding(lang, 'hiw.step3.detail') }
  ]

  const outputs = [
    { Icon: IconCalendar, title: tLanding(lang, 'hiw.output1.title'), desc: tLanding(lang, 'hiw.output1.desc') },
    { Icon: IconMegaphone, title: tLanding(lang, 'hiw.output2.title'), desc: tLanding(lang, 'hiw.output2.desc') },
    { Icon: IconBarChart, title: tLanding(lang, 'hiw.output3.title'), desc: tLanding(lang, 'hiw.output3.desc') },
    { Icon: IconFileText, title: tLanding(lang, 'hiw.output4.title'), desc: tLanding(lang, 'hiw.output4.desc') }
  ]

  const testimonials = [
    { quote: tLanding(lang, 'testimonials.testimonial1.quote'), author: tLanding(lang, 'testimonials.testimonial1.author'), role: tLanding(lang, 'testimonials.testimonial1.role') },
    { quote: tLanding(lang, 'testimonials.testimonial2.quote'), author: tLanding(lang, 'testimonials.testimonial2.author'), role: tLanding(lang, 'testimonials.testimonial2.role') },
    { quote: tLanding(lang, 'testimonials.testimonial3.quote'), author: tLanding(lang, 'testimonials.testimonial3.author'), role: tLanding(lang, 'testimonials.testimonial3.role') }
  ]

  const initials = (name) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  const faqItems = ['q1', 'q2', 'q3', 'q4'].map(key => ({
    key,
    title: tLanding(lang, `faq.${key}.title`),
    answer: tLanding(lang, `faq.${key}.answer`)
  }))

  return (
    <div className="hiw-page">
      {/* Hero */}
      <section className="hiw-hero">
        <div className="hiw-hero-text">
          <h1>{tLanding(lang, 'hiw.title')}</h1>
          <p className="hiw-subtitle">{tLanding(lang, 'hiw.subtitle')}</p>
          <div className="hiw-hero-cta-group">
            <button className="btn-cta-primary" onClick={onStartClick}>
              {tLanding(lang, 'hiw.heroCta')}
              <span className="arrow">→</span>
            </button>
            <span className="hiw-meta">{tLanding(lang, 'hiw.meta')}</span>
          </div>
        </div>
        <div className="hiw-hero-image">
          <img src={heroImg} alt="" loading="eager" />
        </div>
      </section>

      {/* Benefits */}
      <section className="hiw-values">
        <div className="section-header">
          <h2>{tLanding(lang, 'hiw.valuesTitle')}</h2>
          <p>{tLanding(lang, 'hiw.valuesSubtitle')}</p>
        </div>
        <div className="hiw-values-grid">
          {benefits.map((b, i) => (
            <div key={i} className="hiw-value-card">
              <div className="hiw-value-icon"><img src={b.img} alt="" loading="lazy" /></div>
              <h3>{b.title}</h3>
              <p>{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Steps in detail */}
      <section className="hiw-steps">
        <div className="section-header">
          <h2>{tLanding(lang, 'hiw.workflowTitle')}</h2>
          <p>{tLanding(lang, 'hiw.workflowSubtitle')}</p>
        </div>
        {steps.map((step, i) => (
          <div key={i} className={`hiw-step-row ${i % 2 === 1 ? 'reverse' : ''}`}>
            <div className="hiw-step-image">
              <img src={step.img} alt="" loading="lazy" />
            </div>
            <div className="hiw-step-text">
              <div className="hiw-step-eyebrow">{tLanding(lang, 'hiw.stepLabel')} {i + 1}</div>
              <h3>{step.title}</h3>
              <p className="hiw-step-desc">{step.desc}</p>
              <p className="hiw-step-detail">{step.detail}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Outputs - aperçu de l'expérience */}
      <section className="hiw-gallery">
        <div className="section-header">
          <h2>{tLanding(lang, 'hiw.galleryTitle')}</h2>
          <p>{tLanding(lang, 'hiw.gallerySubtitle')}</p>
        </div>
        <div className="hiw-outputs-grid">
          {outputs.map((o, i) => (
            <div key={i} className="hiw-output-card">
              <div className="hiw-output-icon"><o.Icon width={22} height={22} /></div>
              <h3>{o.title}</h3>
              <p>{o.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trusted / testimonial banner */}
      <section className="hiw-trusted">
        <div className="section-header">
          <h2>{tLanding(lang, 'hiw.trustedTitle')}</h2>
          <p>{tLanding(lang, 'hiw.trustedSubtitle')}</p>
        </div>

        <div className="hiw-trusted-image">
          <img src={trustedImg} alt="Équipe VelocityLaunch en session de travail" loading="lazy" />
        </div>

        <div className="hiw-trusted-cards">
          {testimonials.map((t, i) => (
            <div key={i} className="hiw-trusted-card">
              <p className="hiw-trusted-quote">&ldquo;{t.quote}&rdquo;</p>
              <div className="hiw-trusted-author">
                <span className="hiw-trusted-avatar">{initials(t.author)}</span>
                <div>
                  <div className="hiw-trusted-name">{t.author}</div>
                  <div className="hiw-trusted-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ accordion */}
      <section className="hiw-faq" id="faq">
        <div className="section-header">
          <h2>{tLanding(lang, 'hiw.faqTitle')}</h2>
        </div>
        <div className="hiw-faq-list">
          {faqItems.map((item, i) => (
            <div key={item.key} className={`hiw-faq-item ${openFaq === i ? 'open' : ''}`}>
              <button className="hiw-faq-question" onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                <span>{item.title}</span>
                <span className="hiw-faq-chevron">⌄</span>
              </button>
              {openFaq === i && <p className="hiw-faq-answer">{item.answer}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section
        className="hiw-final-cta"
        style={{ backgroundImage: 'url("/assets/ai-images/cinematic-photo-of-a-focused-tech-founder-working-.png")' }}
      >
        <div className="hiw-final-cta-content">
          <h2>{tLanding(lang, 'hiw.ctaTitle')}</h2>
          <p>{tLanding(lang, 'hiw.ctaSubtitle')}</p>
          <button className="btn-cta-primary" onClick={onStartClick}>
            {tLanding(lang, 'hiw.ctaButton')}
            <span className="arrow">→</span>
          </button>
        </div>
      </section>
    </div>
  )
}
