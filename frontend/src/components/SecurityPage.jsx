import { t } from '../lib/i18n'
import '../styles/SecurityPage.css'

export default function SecurityPage({ lang, onClose }) {
  return (
    <div className="security-modal-backdrop" onClick={onClose}>
      <div className="security-modal card" onClick={e => e.stopPropagation()}>
        <button className="close-modal-btn" onClick={onClose}>×</button>

        <div className="security-content">
          <h1>🔒 Sécurité et Confidentialité</h1>

          <section>
            <h2>Protégez vos données</h2>
            <p>Chez VelocityLaunch, la sécurité de vos données est notre priorité absolue. Nous mettons en place les meilleures pratiques pour protéger vos informations.</p>
          </section>

          <section>
            <h2>🔐 Chiffrement End-to-End</h2>
            <p>Toutes les données transmises entre votre navigateur et nos serveurs sont chiffrées en utilisant le protocole HTTPS avec TLS 1.2 ou supérieur. Vos plans ne peuvent être interceptés.</p>
          </section>

          <section>
            <h2>📋 Conformité RGPD</h2>
            <p>VelocityLaunch est entièrement conforme au Règlement Général sur la Protection des Données (RGPD) de l'UE.</p>
            <ul>
              <li><strong>Droit d'accès:</strong> Vous pouvez accéder à tous vos données générées</li>
              <li><strong>Droit à l'oubli:</strong> Vous pouvez demander la suppression complète de vos données</li>
              <li><strong>Portabilité:</strong> Vous pouvez exporter vos plans à tout moment</li>
              <li><strong>Transparence:</strong> Nous vous informons exactement de comment vos données sont utilisées</li>
            </ul>
          </section>

          <section>
            <h2>💾 Stockage Local</h2>
            <p>Par défaut, vos plans sont stockés localement dans votre navigateur (localStorage). Nous ne conservons aucune donnée sur nos serveurs sans votre consentement explicite.</p>
          </section>

          <section>
            <h2>🔍 Pas de Tracking Invasif</h2>
            <p>Nous utilisons uniquement Google Analytics pour comprendre l'utilisation globale du service. Nous ne trackons pas les données personnelles ou le contenu de vos plans.</p>
          </section>

          <section>
            <h2>🛡️ Sécurité de l'Infrastructure</h2>
            <ul>
              <li>Hébergement sur Cloudflare Workers avec sauvegardes automatiques</li>
              <li>Audit de sécurité régulier par des experts externes</li>
              <li>Prévention des attaques DDoS et injection SQL</li>
              <li>Certificats SSL/TLS à jour et validés</li>
            </ul>
          </section>

          <section>
            <h2>📱 Partage Sécurisé</h2>
            <p>Lorsque vous partagez un plan via lien privé:</p>
            <ul>
              <li>Un ID unique et non devinable est généré</li>
              <li>Le lien expire automatiquement après 30 jours</li>
              <li>Seuls ceux ayant le lien peuvent accéder</li>
              <li>Les liens sont lecture seule</li>
            </ul>
          </section>

          <section>
            <h2>❓ Questions?</h2>
            <p>Pour toute question concernant votre confidentialité, contactez-nous à <strong>security@velocitylaunch.app</strong></p>
          </section>

          <div className="security-badge">
            <p>✅ Nous nous engageons à protéger votre vie privée</p>
          </div>
        </div>

        <button className="btn-secondary" onClick={onClose}>Fermer</button>
      </div>
    </div>
  )
}
