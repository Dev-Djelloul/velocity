import { SignIn, SignUp } from '@clerk/clerk-react'
import { t } from '../lib/i18n'
import { isMockAuth, useAuthProviders } from '../lib/auth'
import Wordmark from './Wordmark'
import { IconArrowLeft } from './Icons'
import '../styles/AuthPage.css'

// Thème Clerk aligné sur le design system du site (fond transparent, accents violets) —
// on masque le footer natif de Clerk ("Already have an account?") pour ne garder qu'un
// seul lien de bascule signin/signup, celui rendu par AuthPage elle-même.
const clerkAppearance = {
  variables: {
    colorPrimary: '#9184d9',
    colorBackground: 'transparent',
    colorText: '#e9e9ed',
    colorTextSecondary: '#a3a3ad',
    colorInputBackground: 'rgba(20, 22, 30, 0.6)',
    colorInputText: '#e9e9ed',
    colorNeutral: '#e9e9ed',
    borderRadius: '10px',
    fontFamily: 'inherit'
  },
  elements: {
    rootBox: { width: '100%' },
    card: { background: 'transparent', boxShadow: 'none', padding: 0, width: '100%' },
    cardBox: { width: '100%' },
    socialButtonsRoot: { width: '100%' },
    socialButtons: { width: '100%', justifyContent: 'center' },
    socialButtonsIconButton: { flex: '1 1 0' },
    footer: { display: 'none' },
    header: { display: 'none' }
  }
}

export default function AuthPage({ mode, onSwitchMode, onBack, lang }) {
  const isSignUp = mode === 'signup'
  const mock = useAuthProviders()

  return (
    <div className="auth-page">
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
  )
}
