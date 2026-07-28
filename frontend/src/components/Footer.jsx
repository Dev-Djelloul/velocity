import { t } from '../lib/i18n'
import '../styles/Footer.css'

export default function Footer({ lang }) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>VelocityLaunch</h3>
          <p>Générateur intelligent de plan de lancement pour startups</p>
          <div className="social-links">
            <a href="#" aria-label="Twitter">𝕏</a>
            <a href="#" aria-label="LinkedIn">in</a>
            <a href="#" aria-label="GitHub">⚙️</a>
          </div>
        </div>

        <div className="footer-section">
          <h4>Produit</h4>
          <ul>
            <li><a href="#features">Features</a></li>
            <li><a href="#pricing">Tarification</a></li>
            <li><a href="#changelog">Changelog</a></li>
            <li><a href="#roadmap">Roadmap</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Entreprise</h4>
          <ul>
            <li><a href="#about">À propos</a></li>
            <li><a href="#blog">Blog</a></li>
            <li><a href="#careers">Nous rejoindre</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Légal</h4>
          <ul>
            <li><a href="#privacy">Confidentialité</a></li>
            <li><a href="#terms">Conditions</a></li>
            <li><a href="#cookies">Cookies</a></li>
            <li><a href="#status">Status</a></li>
          </ul>
        </div>

        <div className="footer-section footer-cta">
          <h4>Prêt à lancer ?</h4>
          <p>Créez votre plan en 5 minutes</p>
          <button className="btn-footer">Commencer gratuitement</button>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} VelocityLaunch. Tous droits réservés.</p>
        <p>Construit avec ❤️ pour les makers et founders</p>
      </div>
    </footer>
  )
}
