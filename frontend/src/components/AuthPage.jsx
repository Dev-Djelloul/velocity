import { SignIn, SignUp } from '@clerk/clerk-react'
import { t } from '../lib/i18n'
import { isMockAuth, useAuthProviders } from '../lib/auth'
import Wordmark from './Wordmark'
import { IconArrowLeft } from './Icons'
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

export default function AuthPage({ mode, onSwitchMode, onBack, lang, theme }) {
  const isSignUp = mode === 'signup'
  const mock = useAuthProviders()
  const clerkAppearance = getClerkAppearance(theme)

  return (
    <div className="auth-page">
      <div className="auth-page-content">
        <div className="auth-page-background">
          <div className="auth-page-gradient-overlay" />
        </div>

        <div className="auth-page-card">
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
                ? <SignUp routing="virtual" appearance={clerkAppearance} />
                : <SignIn routing="virtual" appearance={clerkAppearance} />}
            </div>
          )}

          <button className="auth-switch-btn" onClick={onSwitchMode}>
            {isSignUp ? t(lang, 'auth.switchToSignIn') : t(lang, 'auth.switchToSignUp')}
          </button>
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
