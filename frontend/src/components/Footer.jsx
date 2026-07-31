import { t } from '../lib/i18n'
import Wordmark from './Wordmark'
import { IconGithub, IconLock, IconExternalLink } from './Icons'
import '../styles/Footer.css'

const BLOG_URL = 'https://www.digitalblueskye.com/blog/digital/blogarticles'
const TWITTER_URL = 'https://twitter.com/digitalblueskye'
const LINKEDIN_URL = 'https://www.linkedin.com/in/yellowblueskye/'
const GITHUB_URL = 'https://github.com/Dev-Djelloul'

export default function Footer({ lang, onOpenModal, onNavigateFeatures }) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <Wordmark size={38} />
          <p>Générateur intelligent de plan de lancement pour startups</p>
          <div className="social-links">
            <a href={TWITTER_URL} target="_blank" rel="noopener noreferrer" aria-label="Twitter / X">𝕏</a>
            <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">in</a>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" aria-label="GitHub"><IconGithub width={16} height={16} /></a>
          </div>
        </div>

        <div className="footer-section">
          <h4>Produit</h4>
          <ul>
            <li><button className="footer-link" onClick={onNavigateFeatures}>Fonctionnalités</button></li>
            <li><button className="footer-link" onClick={() => onOpenModal('pricing')}>Tarification</button></li>
            <li><button className="footer-link" onClick={() => onOpenModal('changelog')}>Changelog</button></li>
            <li><button className="footer-link" onClick={() => onOpenModal('roadmap')}>Roadmap</button></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Entreprise</h4>
          <ul>
            <li><button className="footer-link" onClick={() => onOpenModal('about')}>À propos</button></li>
            <li><a href={BLOG_URL} target="_blank" rel="noopener noreferrer">Blog <IconExternalLink width={12} height={12} /></a></li>
            <li><button className="footer-link" onClick={() => onOpenModal('careers')}>Nous rejoindre</button></li>
            <li><button className="footer-link" onClick={() => onOpenModal('contact')}>Contact</button></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Légal</h4>
          <ul>
            <li><button className="footer-link" onClick={() => onOpenModal('privacy')}>Confidentialité</button></li>
            <li><button className="footer-link" onClick={() => onOpenModal('terms')}>Conditions</button></li>
            <li><button className="footer-link" onClick={() => onOpenModal('cookies')}>Cookies</button></li>
            <li><button className="footer-link" onClick={() => onOpenModal('security')}><IconLock width={13} height={13} /> Sécurité</button></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} <span className="footer-brand-highlight">VelocityLaunch</span>. Tous droits réservés.</p>
        <p>Construit avec 🧡 pour les makers et founders</p>
      </div>
    </footer>
  )
}
