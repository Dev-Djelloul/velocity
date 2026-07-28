import { useState } from 'react'
import { t } from '../lib/i18n'
import '../styles/DemoModal.css'

export default function DemoModal({ onClose, onLoadDemo, lang }) {
  const [selectedDemo, setSelectedDemo] = useState(null)

  const demos = [
    {
      id: 'saas',
      title: 'SaaS B2B',
      desc: 'Plateforme de gestion pour PME',
      icon: '💼'
    },
    {
      id: 'ecommerce',
      title: 'E-commerce',
      desc: 'Boutique en ligne de vêtements',
      icon: '👕'
    },
    {
      id: 'mobile',
      title: 'Application Mobile',
      desc: 'App de productivité pour équipes',
      icon: '📱'
    },
    {
      id: 'ai',
      title: 'Plateforme IA',
      desc: 'SaaS avec IA générative',
      icon: '🤖'
    }
  ]

  const handleLoadDemo = (demoId) => {
    const demoData = {
      product: {
        name: demoId === 'saas' ? 'WorkFlow Pro' : demoId === 'ecommerce' ? 'StyleHub' : demoId === 'mobile' ? 'TaskFlow' : 'AI Assistant Hub',
        stage: 'mvp',
        category: 'pm',
        pitch: 'Produit innovant pour le marché moderne',
        usp: 'Meilleure solution sur le marché avec IA',
        targetUser: 'smb'
      },
      market: {
        geography: 'europe',
        b2bVsB2c: demoId === 'ecommerce' ? 'b2c' : 'b2b',
        segment: demoId === 'saas' ? 'PME en France' : demoId === 'ecommerce' ? 'Fashion millennials' : demoId === 'mobile' ? 'Équipes distribuées' : 'Entreprises tech',
        audienceSize: demoId === 'saas' ? 'm' : 'l',
        competition: 'moderate'
      },
      resources: {
        timelineWeeks: 'w12',
        budgetEur: demoId === 'ai' ? 'b50k' : 'b10k',
        teamSize: 'medium',
        rolesPresent: ['product', 'dev', 'design', 'marketing']
      },
      priorities: {
        focus: 'acquire',
        engagement: 'high',
        riskKnown: 'some',
        successMetric: 'signups'
      }
    }

    onLoadDemo(demoData)
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="demo-modal card" onClick={e => e.stopPropagation()}>
        <div className="demo-modal-header">
          <h2>Voir les exemples</h2>
          <p>Choisissez un exemple pour voir un plan généré automatiquement</p>
        </div>

        <div className="demo-grid">
          {demos.map(demo => (
            <button
              key={demo.id}
              className={`demo-card ${selectedDemo === demo.id ? 'selected' : ''}`}
              onClick={() => setSelectedDemo(demo.id)}
            >
              <div className="demo-icon">{demo.icon}</div>
              <h3>{demo.title}</h3>
              <p>{demo.desc}</p>
            </button>
          ))}
        </div>

        <div className="demo-actions">
          <button className="btn-secondary" onClick={onClose}>{t(lang, 'export.close')}</button>
          <button
            className="btn-primary"
            disabled={!selectedDemo}
            onClick={() => handleLoadDemo(selectedDemo)}
          >
            Charger cet exemple
          </button>
        </div>
      </div>
    </div>
  )
}
