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
          <p>{t(lang, 'footer.tagline')}</p>
          <div className="social-links">
            <a href={TWITTER_URL} target="_blank" rel="noopener noreferrer" aria-label="Twitter / X">𝕏</a>
            <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">in</a>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" aria-label="GitHub"><IconGithub width={16} height={16} /></a>
          </div>
        </div>

        <div className="footer-section">
          <h4>{t(lang, 'footer.product')}</h4>
          <ul>
            <li><button className="footer-link" onClick={onNavigateFeatures}>{t(lang, 'footer.features')}</button></li>
            <li><button className="footer-link" onClick={() => onOpenModal('pricing')}>{t(lang, 'footer.pricing')}</button></li>
            <li><button className="footer-link" onClick={() => onOpenModal('changelog')}>{t(lang, 'footer.changelog')}</button></li>
            <li><button className="footer-link" onClick={() => onOpenModal('roadmap')}>{t(lang, 'footer.roadmap')}</button></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>{t(lang, 'footer.company')}</h4>
          <ul>
            <li><button className="footer-link" onClick={() => onOpenModal('about')}>{t(lang, 'footer.about')}</button></li>
            <li><a href={BLOG_URL} target="_blank" rel="noopener noreferrer">{t(lang, 'footer.blog')} <IconExternalLink width={12} height={12} /></a></li>
            <li><button className="footer-link" onClick={() => onOpenModal('careers')}>{t(lang, 'footer.careers')}</button></li>
            <li><button className="footer-link" onClick={() => onOpenModal('contact')}>{t(lang, 'footer.contact')}</button></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>{t(lang, 'footer.legal')}</h4>
          <ul>
            <li><button className="footer-link" onClick={() => onOpenModal('privacy')}>{t(lang, 'footer.privacy')}</button></li>
            <li><button className="footer-link" onClick={() => onOpenModal('terms')}>{t(lang, 'footer.terms')}</button></li>
            <li><button className="footer-link" onClick={() => onOpenModal('cookies')}>{t(lang, 'footer.cookies')}</button></li>
            <li><button className="footer-link" onClick={() => onOpenModal('security')}><IconLock width={13} height={13} /> {t(lang, 'footer.security')}</button></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} <span className="footer-brand-highlight">VelocityLaunch</span>. {t(lang, 'footer.rightsReserved')}</p>
        <p>{t(lang, 'footer.madeWith')}</p>
      </div>
    </footer>
  )
}
