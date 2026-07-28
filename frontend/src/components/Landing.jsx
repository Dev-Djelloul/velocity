import { useState } from 'react'
import VelocityLaunchLogo from './VelocityLaunchLogo'
import { t } from '../lib/i18n'
import '../styles/Landing.css'

export default function Landing({ lang, onStartClick }) {
  const [hoveredFeature, setHoveredFeature] = useState(null)

  const features = [
    {
      icon: '📋',
      title: 'Plan en 5 minutes',
      desc: 'Répondez à 12 questions et générateur un plan complet'
    },
    {
      icon: '🎯',
      title: 'Roadmap détaillée',
      desc: 'Sprints, stories, efforts et coûts calculés automatiquement'
    },
    {
      icon: '📊',
      title: 'Stratégie Marketing',
      desc: 'Budget alloué par canal avec objectifs et KPIs'
    },
    {
      icon: '📈',
      title: 'KPIs personnalisés',
      desc: 'Métriques de succès adaptées à votre produit'
    },
    {
      icon: '🤖',
      title: 'IA Intelligente',
      desc: 'Recommandations basées sur votre contexte'
    },
    {
      icon: '⚡',
      title: 'Exportable',
      desc: 'PDF, CSV et partage facile avec votre équipe'
    }
  ]

  const stats = [
    { number: '2.5k+', label: 'Plans générés' },
    { number: '4.9★', label: 'Note moyenne' },
    { number: '95%', label: 'Taux de satisfaction' },
    { number: '15min', label: 'Temps moyen' }
  ]

  const testimonials = [
    {
      quote: 'VelocityLaunch m\'a fait gagner 2 jours de planning. Invaluable!',
      author: 'Sarah M.',
      role: 'Founder, FinTech',
      avatar: '👩‍💼'
    },
    {
      quote: 'Le meilleur outil pour structurer un lancement. Très intuitif.',
      author: 'Marc L.',
      role: 'Product Manager, SaaS',
      avatar: '👨‍💼'
    },
    {
      quote: 'Recommended to all founders. Crystal clear roadmaps.',
      author: 'Emma T.',
      role: 'CTO, E-commerce',
      avatar: '👩‍💻'
    }
  ]

  return (
    <div className="landing">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            🚀 Lancez plus vite que jamais
          </div>
          
          <h1 className="hero-title">
            Générez votre plan de lancement
            <span className="hero-highlight"> en 5 minutes</span>
          </h1>
          
          <p className="hero-subtitle">
            Répondez à 12 questions intelligentes et obtenez une roadmap complète,
            une stratégie marketing et des KPIs personnalisés pour votre produit.
          </p>

          <div className="hero-cta-group">
            <button className="btn-cta-primary" onClick={onStartClick}>
              Commencer gratuitement
              <span className="arrow">→</span>
            </button>
            <button className="btn-cta-secondary">
              Voir une démo
            </button>
          </div>

          <p className="hero-footnote">
            ✅ Pas de carte bancaire requise • Résultat instantané • Partageable
          </p>
        </div>

        <div className="hero-visual">
          <div className="hero-card">
            <VelocityLaunchLogo width={80} height={80} animated={true} />
            <div className="hero-card-text">
              <h3>VelocityLaunch</h3>
              <p>Launch Intelligence Platform</p>
            </div>
          </div>
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
      <section className="features-section">
        <div className="section-header">
          <h2>Tout ce dont vous avez besoin</h2>
          <p>Un outil complet pour planifier votre lancement comme un pro</p>
        </div>

        <div className="features-grid">
          {features.map((feature, i) => (
            <div
              key={i}
              className={`feature-card ${hoveredFeature === i ? 'active' : ''}`}
              onMouseEnter={() => setHoveredFeature(i)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="section-header">
          <h2>Comment ça marche</h2>
          <p>3 étapes simples pour votre plan de lancement</p>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Répondez aux questions</h3>
            <p>Décrivez votre produit, votre marché et vos priorités. C'est rapide et intuitif.</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Générateur crée le plan</h3>
            <p>Notre IA analyse vos réponses et génère une stratégie complète en 5 secondes.</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Exportez et lancez</h3>
            <p>Récupérez votre plan en PDF, partagez avec votre équipe et lancez!</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="section-header">
          <h2>Approuvé par les founders</h2>
          <p>Découvrez pourquoi 2500+ entrepreneurs font confiance à VelocityLaunch</p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((testimonial, i) => (
            <div key={i} className="testimonial-card">
              <div className="testimonial-quote">"{testimonial.quote}"</div>
              <div className="testimonial-author">
                <span className="testimonial-avatar">{testimonial.avatar}</span>
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
          <h2>Prêt à gagner 2 jours de planning?</h2>
          <p>Rejoignez 2500+ founders qui font confiance à VelocityLaunch</p>
          <button className="btn-cta-large" onClick={onStartClick}>
            Créer mon plan maintenant
          </button>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="faq-section">
        <div className="section-header">
          <h2>Questions fréquentes</h2>
        </div>

        <div className="faq-grid">
          <div className="faq-card">
            <h4>Combien de temps ça prend?</h4>
            <p>Entre 5 et 15 minutes selon le détail de vos réponses. Vous pouvez aussi sauvegarder et continuer plus tard.</p>
          </div>
          <div className="faq-card">
            <h4>Les données sont-elles sécurisées?</h4>
            <p>100% sécurisées. Chiffrement end-to-end, RGPD compliant, audité régulièrement.</p>
          </div>
          <div className="faq-card">
            <h4>Puis-je modifier mon plan?</h4>
            <p>Oui! Régénérez autant que vous voulez. Vos plans sont sauvegardés (une fois connecté).</p>
          </div>
          <div className="faq-card">
            <h4>Quel format de sortie?</h4>
            <p>PDF interactif, CSV exportable, et accès web. Partageable via lien private.</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <div className="final-cta-content">
          <h2>Lancez votre produit avec confiance</h2>
          <p>Rejoignez les founders qui ont gagné du temps et de la clarté avec VelocityLaunch</p>
          <button className="btn-cta-final" onClick={onStartClick}>
            Commencer gratuitement →
          </button>
        </div>
      </section>
    </div>
  )
}
