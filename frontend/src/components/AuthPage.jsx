import { useState } from 'react'
import { SignIn, SignUp } from '@clerk/clerk-react'
import { t } from '../lib/i18n'
import { isMockAuth, useAuthProviders } from '../lib/auth'
import { getAttribution } from '../lib/attribution'
import Wordmark from './Wordmark'
import { IconArrowLeft } from './Icons'
import ForgotPasswordFlow from './ForgotPasswordFlow'
import authVisual from '../../assets/img/hiw-step1-brainstorm.webp'
import '../styles/AuthPage.css'

// Thème Clerk aligné sur le design system du site (fond transparent, accents violets) —
// on masque le footer natif de Clerk ("Already have an account?") pour ne garder qu'un
// seul lien de bascule signin/signup, celui rendu par AuthPage elle-même. Les couleurs de
// texte/fond des champs sont dérivées du thème clair/sombre de l'app : Clerk ne suit pas
// automatiquement nos tokens CSS, donc un thème clair avec des variables restées sombres
// rendait le texte illisible (blanc sur blanc).
function getClerkAppearance(theme) {
  const isLight = theme === 'light'
  return {
    variables: {
      colorPrimary: '#9184d9',
      colorBackground: 'transparent',
      colorText: isLight ? '#1a1f2e' : '#e9e9ed',
      colorTextSecondary: isLight ? '#5a5f6e' : '#a3a3ad',
      colorInputBackground: isLight ? 'rgba(15, 20, 30, 0.04)' : 'rgba(20, 22, 30, 0.6)',
      colorInputText: isLight ? '#1a1f2e' : '#e9e9ed',
      colorNeutral: isLight ? '#1a1f2e' : '#e9e9ed',
      borderRadius: '10px',
      fontFamily: 'inherit'
    },
    elements: {
      rootBox: { width: '100%' },
      card: { background: 'transparent', boxShadow: 'none', padding: 0, width: '100%' },
      cardBox: { width: '100%' },
      socialButtonsRoot: { width: '100%' },
      socialButtons: { width: '100%', justifyContent: 'center', gap: '0.6rem' },
      badge: {
        background: '#06b6d4',
        color: '#04141a',
        border: 'none',
        fontWeight: 600
      },
      // Vraie classe du badge "Utilisé la dernière fois" au-dessus du dernier provider
      // OAuth utilisé (confirmé par inspection DOM : cl-lastAuthenticationStrategyBadge,
      // distincte de cl-badge qui ne le couvrait pas).
      lastAuthenticationStrategyBadge: {
        background: '#06b6d4',
        color: '#04141a',
        border: 'none',
        fontWeight: 600
      },
      footer: { display: 'none' },
      header: { display: 'none' }
    }
  }
}

export default function AuthPage({ mode, onSwitchMode, onBack, lang, theme, onOpenModal }) {
  const isSignUp = mode === 'signup'
  const mock = useAuthProviders()
  const clerkAppearance = getClerkAppearance(theme)
  const [showForgot, setShowForgot] = useState(false)

  return (
    <div className="auth-page">
      <div className="auth-page-content">
        <div className="auth-page-background">
          <div className="auth-page-gradient-overlay" />
        </div>

        <div className="auth-page-card">
          {showForgot ? (
            <>
              <div className="auth-page-brand"><Wordmark size={30} /></div>
              <ForgotPasswordFlow lang={lang} onBack={() => setShowForgot(false)} />
            </>
          ) : (
            <>
              <button className="auth-back-btn" onClick={onBack}>
                <IconArrowLeft width={16} height={16} /> {t(lang, 'auth.backToHome')}
              </button>

              <div className="auth-page-brand"><Wordmark size={30} /></div>

              <h1 className="auth-page-title">
                {isSignUp ? t(lang, 'auth.signUpTitle') : t(lang, 'auth.signInTitle')}
              </h1>
              <p className="auth-page-subtitle">
                {isSignUp ? t(lang, 'auth.signUpSubtitle') : t(lang, 'auth.signInSubtitle')}
              </p>

              {isMockAuth ? (
                <div className="auth-provider-list">
                  {mock.providers.map(p => (
                    <button key={p.key} className="auth-provider-btn" onClick={() => mock.signIn(p.key)}>
                      <span className="auth-provider-dot" style={{ background: p.color }} />
                      {t(lang, 'auth.continueWith')} {p.label}
                    </button>
                  ))}
                  <p className="auth-mock-note">{t(lang, 'auth.demoModeNotice')}</p>
                </div>
              ) : (
                <div className="auth-clerk-widget">
                  {isSignUp
                    // unsafeMetadata : canal d'acquisition capturé à la première visite
                    // (lib/attribution.js), transmis à notre webhook Clerk (user.created)
                    // pour savoir d'où vient chaque inscription (retour utilisateur : aucun
                    // moyen de le savoir après coup pour les testeurs déjà inscrits).
                    ? <SignUp routing="virtual" appearance={clerkAppearance} unsafeMetadata={getAttribution()} />
                    : <SignIn routing="virtual" appearance={clerkAppearance} />}
                </div>
              )}

              {/* Toujours visible, contrairement au lien natif de Clerk qui n'apparaît
                  qu'une fois le champ mot de passe rempli (voir ForgotPasswordFlow.jsx) —
                  ici dès l'arrivée sur la page, comme sur la page Cloudflare qui a inspiré
                  cette refonte. */}
              {!isSignUp && !isMockAuth && (
                <button type="button" className="auth-forgot-trigger" onClick={() => setShowForgot(true)}>
                  {t(lang, 'auth.forgotLink')}
                </button>
              )}

              <button className="auth-switch-btn" onClick={onSwitchMode}>
                {isSignUp ? t(lang, 'auth.switchToSignIn') : t(lang, 'auth.switchToSignUp')}
              </button>
            </>
          )}

          {!showForgot && onOpenModal && (
            <p className="auth-legal-notice">
              {t(lang, 'auth.byContinuing')}{' '}
              <button type="button" className="auth-legal-link" onClick={() => onOpenModal('terms')}>{t(lang, 'modals.terms.title')}</button>,{' '}
              {t(lang, 'auth.ourFem')} <button type="button" className="auth-legal-link" onClick={() => onOpenModal('privacy')}>{t(lang, 'modals.privacy.title')}</button>{' '}
              {t(lang, 'auth.and')} <button type="button" className="auth-legal-link" onClick={() => onOpenModal('cookies')}>{t(lang, 'modals.cookies.title')}</button>.
            </p>
          )}
        </div>
      </div>

      <div className="auth-page-visual">
        <img src={authVisual} alt="" className="auth-page-visual-bg" aria-hidden="true" />
        <img src={authVisual} alt="" className="auth-page-visual-img" />
        <div className="auth-page-visual-scrim" />
      </div>
    </div>
  )
}
