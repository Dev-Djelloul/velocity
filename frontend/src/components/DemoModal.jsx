import { useState } from 'react'
import { t } from '../lib/i18n'
import { IconBriefcase, IconShoppingBag, IconSmartphone, IconSparkle } from './Icons'
import '../styles/DemoModal.css'

export default function DemoModal({ onClose, onLoadDemo, lang }) {
  const [selectedDemo, setSelectedDemo] = useState(null)

  const demos = [
    {
      id: 'saas',
      title: 'SaaS B2B',
      desc: 'Gestion de projet pour PME',
      Icon: IconBriefcase
    },
    {
      id: 'ecommerce',
      title: 'E-commerce',
      desc: 'Mode éco-responsable, pré-lancement',
      Icon: IconShoppingBag
    },
    {
      id: 'mobile',
      title: 'Application Mobile',
      desc: 'Automatisation pour équipes distribuées',
      Icon: IconSmartphone
    },
    {
      id: 'ai',
      title: 'Plateforme IA',
      desc: 'Copilote data pour entreprises',
      Icon: IconSparkle
    }
  ]

  const DEMO_DATA = {
    saas: {
      product: {
        name: 'WorkFlow Pro',
        stage: 'mvp',
        category: 'pm',
        pitch: "WorkFlow Pro centralise la gestion de projet, le suivi du temps et la collaboration d'équipe dans une seule interface, pour remplacer la dizaine d'outils que jonglent aujourd'hui les PME.",
        usp: 'Migration en 1 clic depuis Trello, Asana ou Monday — toutes les données importées en moins de 10 minutes.',
        targetUser: 'smb'
      },
      market: {
        geography: 'eu',
        b2bVsB2c: 'b2b',
        segment: 'PME de 10 à 50 salariés en France et Belgique',
        audienceSize: 'm',
        competition: 'moderate'
      },
      resources: {
        timelineWeeks: 'w12',
        budgetEur: 'b10k',
        teamSize: 'medium',
        rolesPresent: ['product', 'dev', 'design', 'marketing']
      },
      priorities: {
        focus: 'acquire',
        engagement: 'high',
        riskKnown: 'some',
        successMetric: 'signups'
      }
    },
    ecommerce: {
      product: {
        name: 'StyleHub',
        stage: 'prelaunch',
        category: 'other',
        pitch: 'StyleHub est une boutique en ligne de prêt-à-porter éco-responsable, avec des pièces produites à la demande pour éviter le surstock et le gaspillage textile.',
        usp: 'Production à la demande avec un atelier français partenaire : zéro stock dormant, livraison en 5 jours, retours gratuits.',
        targetUser: 'niche'
      },
      market: {
        geography: 'france',
        b2bVsB2c: 'b2c',
        segment: 'Femmes 22-35 ans sensibles à la mode responsable',
        audienceSize: 's',
        competition: 'high'
      },
      resources: {
        timelineWeeks: 'w8',
        budgetEur: 'b5k',
        teamSize: 'small',
        rolesPresent: ['product', 'marketing', 'design']
      },
      priorities: {
        focus: 'acquire',
        engagement: 'moderate',
        riskKnown: 'budget',
        successMetric: 'signups'
      }
    },
    mobile: {
      product: {
        name: 'TaskFlow',
        stage: 'mvp',
        category: 'automation',
        pitch: "TaskFlow automatise la répartition des tâches et les rappels entre membres d'une équipe distribuée, directement depuis Slack et Teams, sans changer d'outil.",
        usp: 'Assignation automatique des tâches selon la charge de travail réelle de chaque membre, recalculée en temps réel.',
        targetUser: 'enterprise'
      },
      market: {
        geography: 'global',
        b2bVsB2c: 'b2b',
        segment: 'Équipes distribuées de 20 à 200 personnes, tech et scale-ups',
        audienceSize: 'l',
        competition: 'moderate'
      },
      resources: {
        timelineWeeks: 'w26',
        budgetEur: 'b25k',
        teamSize: 'large',
        rolesPresent: ['product', 'dev', 'design', 'marketing']
      },
      priorities: {
        focus: 'retain',
        engagement: 'high',
        riskKnown: 'notready',
        successMetric: 'retention'
      }
    },
    ai: {
      product: {
        name: 'AI Assistant Hub',
        stage: 'growing',
        category: 'analytics',
        pitch: "AI Assistant Hub connecte les données de l'entreprise à un copilote IA capable de répondre aux questions métier et de générer des rapports automatiquement.",
        usp: 'Connecteurs natifs vers Salesforce, HubSpot et Snowflake — aucune donnée ne quitte votre infrastructure.',
        targetUser: 'enterprise'
      },
      market: {
        geography: 'global',
        b2bVsB2c: 'b2b',
        segment: 'Directions data et opérations, entreprises tech de 200+ salariés',
        audienceSize: 'm',
        competition: 'high'
      },
      resources: {
        timelineWeeks: 'w12',
        budgetEur: 'b50k',
        teamSize: 'large',
        rolesPresent: ['product', 'dev', 'design', 'marketing']
      },
      priorities: {
        focus: 'monetize',
        engagement: 'moderate',
        riskKnown: 'pmf',
        successMetric: 'arr'
      }
    }
  }

  const handleLoadDemo = (demoId) => {
    onLoadDemo(DEMO_DATA[demoId])
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
              <div className="demo-icon"><demo.Icon width={22} height={22} /></div>
              <h3>{demo.title}</h3>
              <p>{demo.desc}</p>
            </button>
          ))}
        </div>

        <div className="demo-actions">
          <button className="btn-secondary" onClick={onClose}>{t(lang, 'export.close')}</button>
          <button
            className="btn-demo-load"
            disabled={!selectedDemo}
            onClick={() => handleLoadDemo(selectedDemo)}
          >
            <span className="btn-demo-load-text">Charger cet exemple</span>
          </button>
        </div>
      </div>
    </div>
  )
}
