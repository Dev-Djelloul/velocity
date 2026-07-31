import InfoModal from './InfoModal'
import { IconTag, IconFileText, IconCompass, IconMail } from './Icons'

export function PricingModal({ onClose, onContactClick }) {
  return (
    <InfoModal icon={<IconTag width={26} height={26} />} title="Tarification" onClose={onClose} wide>
      <section>
        <p>VelocityLaunch est gratuit pendant la beta. Pas de carte bancaire, pas de limite cachée sur les fonctionnalités principales.</p>
      </section>

      <div className="pricing-grid">
        <div className="pricing-card active">
          <div className="pricing-badge">Actuel</div>
          <h3>Beta gratuite</h3>
          <div className="pricing-amount">0€</div>
          <ul>
            <li>Plans de lancement illimités</li>
            <li>Questionnaire complet FR / EN</li>
            <li>Roadmap, stratégie marketing et KPIs générés</li>
            <li>Export PDF et CSV</li>
            <li>Partage par lien privé</li>
            <li>Brouillons sauvegardés localement</li>
          </ul>
        </div>

        <div className="pricing-card">
          <div className="pricing-badge soon">Bientôt</div>
          <h3>Pro</h3>
          <div className="pricing-amount">À venir</div>
          <ul>
            <li>Historique et sauvegarde cloud</li>
            <li>Espaces d'équipe collaboratifs</li>
            <li>Templates sectoriels avancés</li>
            <li>Intégrations (Notion, Slack…)</li>
          </ul>
          <button className="btn-secondary" onClick={onContactClick}>
            <IconMail width={16} height={16} /> Me prévenir
          </button>
        </div>
      </div>
    </InfoModal>
  )
}

const CHANGELOG = [
  {
    date: '31 juillet 2026',
    title: 'Nouvelle identité visuelle',
    items: [
      'Wordmark et logo authentiques, cohérents sur tout le site',
      'Nouveau header et hero avec le design system VelocityLaunch',
      'Page "Comment ça marche" dédiée avec galerie et FAQ',
      'Sections claires de la page d\'accueil basculées en thème violet',
      'Nettoyage complet des icônes emoji au profit d\'icônes vectorielles'
    ]
  },
  {
    date: '28 juillet 2026',
    title: 'Refonte UX/UI et accessibilité',
    items: [
      'Refonte complète de la page d\'accueil (hero, features, témoignages, FAQ)',
      'Traduction anglaise complète de l\'interface',
      'Contraste renforcé pour la conformité WCAG',
      'Contenu des plans générés localisé selon la langue choisie'
    ]
  },
  {
    date: 'Lancement initial',
    title: 'VelocityLaunch MVP',
    items: [
      'Questionnaire produit / marché / ressources / priorités',
      'Génération automatique de roadmap par sprints',
      'Stratégie marketing et KPIs personnalisés',
      'Export PDF et CSV, partage par lien',
      'Déploiement sur Cloudflare Workers'
    ]
  }
]

export function ChangelogModal({ onClose }) {
  return (
    <InfoModal icon={<IconFileText width={26} height={26} />} title="Changelog" onClose={onClose}>
      {CHANGELOG.map((entry, i) => (
        <section key={i}>
          <h2>{entry.title}</h2>
          <p className="changelog-date">{entry.date}</p>
          <ul>
            {entry.items.map((item, j) => <li key={j}>{item}</li>)}
          </ul>
        </section>
      ))}
    </InfoModal>
  )
}

const ROADMAP = [
  {
    label: 'Disponible',
    items: ['Questionnaire guidé 12 questions', 'Roadmap générée par sprints', 'Stratégie marketing et KPIs', 'Export PDF / CSV', 'Partage par lien privé', 'FR / EN']
  },
  {
    label: 'En cours',
    items: ['Tableau de bord de suivi post-lancement', 'Comparateur A/B test intégré', 'Modèles de plan par secteur']
  },
  {
    label: 'Envisagé',
    items: ['Comptes et espaces d\'équipe', 'Intégrations Notion / Slack', 'API publique', 'Historique cloud synchronisé']
  }
]

export function RoadmapModal({ onClose }) {
  return (
    <InfoModal icon={<IconCompass width={26} height={26} />} title="Roadmap" onClose={onClose} wide>
      <section>
        <p>Un aperçu honnête de ce qui existe déjà et de ce qui s'en vient. Cette roadmap évolue avec les retours des premiers utilisateurs.</p>
      </section>
      <div className="roadmap-columns">
        {ROADMAP.map((col, i) => (
          <div key={i} className="roadmap-column">
            <h3>{col.label}</h3>
            <ul>
              {col.items.map((item, j) => <li key={j}>{item}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </InfoModal>
  )
}
