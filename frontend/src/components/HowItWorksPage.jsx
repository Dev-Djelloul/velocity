import { useState } from 'react'
import { tLanding } from '../lib/landingI18n'
import { useAiImages, useScrollReveal } from '../hooks/useImageOptimization'
import heroImg from '../../assets/img/hiw-hero-tablets-purple.webp'
import step1Img from '../../assets/img/hiw-step1-brainstorm.webp'
import step2Img from '../../assets/img/hiw-step2-dashboard.webp'
import step3Img from '../../assets/img/hiw-step3-export.webp'
import ctaImg from '../../assets/img/hiw-cta-huddle.webp'
import galleryAiCourse from '../../assets/img/hiw-gallery-ai-course.webp'
import galleryPresentation from '../../assets/img/hiw-gallery-presentation.webp'
import galleryTeamTable from '../../assets/img/hiw-gallery-team-table.webp'
import galleryFlowchart from '../../assets/img/hiw-gallery-flowchart.webp'
import galleryMoodboard from '../../assets/img/hiw-gallery-moodboard.webp'
import galleryCrowd from '../../assets/img/hiw-gallery-crowd.webp'
import '../styles/HowItWorksPage.css'

export default function HowItWorksPage({ lang, onStartClick }) {
  const [openFaq, setOpenFaq] = useState(0)
  const images = useAiImages()
  const { ref: valuesRef, isVisible: valuesVisible } = useScrollReveal()

  const values = [
    { img: images.valueFast, title: tLanding(lang, 'hiw.value1.title'), desc: tLanding(lang, 'hiw.value1.desc') },
    { img: images.valueBrain, title: tLanding(lang, 'hiw.value2.title'), desc: tLanding(lang, 'hiw.value2.desc') },
    { img: images.valueCustom, title: tLanding(lang, 'hiw.value3.title'), desc: tLanding(lang, 'hiw.value3.desc') },
    { img: images.valueActionable, title: tLanding(lang, 'hiw.value4.title'), desc: tLanding(lang, 'hiw.value4.desc') }
  ]

  const steps = [
    { img: step1Img, title: tLanding(lang, 'howItWorks.step1.title'), desc: tLanding(lang, 'howItWorks.step1.desc'), detail: tLanding(lang, 'hiw.step1detail') },
    { img: step2Img, title: tLanding(lang, 'howItWorks.step2.title'), desc: tLanding(lang, 'howItWorks.step2.desc'), detail: tLanding(lang, 'hiw.step2detail') },
    { img: step3Img, title: tLanding(lang, 'howItWorks.step3.title'), desc: tLanding(lang, 'howItWorks.step3.desc'), detail: tLanding(lang, 'hiw.step3detail') }
  ]

  const gallery = [galleryAiCourse, galleryPresentation, galleryTeamTable, galleryFlowchart, galleryMoodboard, galleryCrowd]

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
      {/* Article Header */}
      <section className="hiw-hero">
        <div className="hiw-hero-text">
          <div className="hiw-eyebrow">{tLanding(lang, 'hiw.eyebrow')}</div>
          <h1>{tLanding(lang, 'hiw.title')}</h1>
          <p className="hiw-subtitle">{tLanding(lang, 'hiw.subtitle')}</p>
          <p className="hiw-meta">{tLanding(lang, 'hiw.meta')}</p>
        </div>
        <div className="hiw-hero-image">
          <img src={heroImg} alt="" loading="eager" />
        </div>
      </section>

      {/* Value props */}
      <section className="hiw-values" ref={valuesRef}>
        <div className="section-header">
          <h2>{tLanding(lang, 'hiw.valuesTitle')}</h2>
          <p>{tLanding(lang, 'hiw.valuesSubtitle')}</p>
        </div>
        <div className="hiw-values-grid">
          {values.map((v, i) => (
            <div key={i} className={`hiw-value-card ${valuesVisible ? 'animated' : ''}`} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="hiw-value-icon">
                <img src={v.img} alt="" loading="lazy" />
              </div>
              <h3>{v.title}</h3>
              <p>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Steps in detail */}
      <section className="hiw-steps">
        {steps.map((step, i) => (
          <div key={i} className={`hiw-step-row ${i % 2 === 1 ? 'reverse' : ''}`}>
            <div className="hiw-step-image">
              <img src={step.img} alt="" loading="lazy" />
            </div>
            <div className="hiw-step-text">
              <div className="hiw-step-number">{i + 1}</div>
              <h3>{step.title}</h3>
              <p className="hiw-step-desc">{step.desc}</p>
              <p className="hiw-step-detail">{step.detail}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Gallery */}
      <section className="hiw-gallery">
        <div className="section-header">
          <h2>{tLanding(lang, 'hiw.galleryTitle')}</h2>
          <p>{tLanding(lang, 'hiw.gallerySubtitle')}</p>
        </div>
        <div className="hiw-gallery-grid">
          {gallery.map((src, i) => (
            <div key={i} className="hiw-gallery-item">
              <img src={src} alt="" loading="lazy" />
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
        <div className="hiw-trusted-panel">
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
          <div className="hiw-trusted-image">
            <img src={ctaImg} alt="" loading="lazy" />
          </div>
        </div>
      </section>

      {/* FAQ accordion */}
      <section className="hiw-faq">
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
      <section className="hiw-final-cta">
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
