import { useState } from 'react'
import { useSignIn } from '@clerk/clerk-react'
import { t } from '../lib/i18n'
import { IconArrowLeft } from './Icons'

// Flux "mot de passe oublié" autonome (pas le widget <SignIn/> de Clerk) : Clerk n'affiche
// son propre lien "Mot de passe oublié ?" qu'une fois le champ mot de passe déjà rempli
// (comportement du composant, pas un bug de style), ce qui le rend invisible tant qu'on n'a
// pas commencé à taper — contrairement à Cloudflare où il est visible dès l'arrivée sur la
// page. On construit donc ce flux à la main avec l'API bas niveau signIn.create /
// attemptFirstFactor (strategy 'reset_password_email_code'), toujours accessible en un clic.
export default function ForgotPasswordFlow({ lang, onBack }) {
  const { isLoaded, signIn, setActive } = useSignIn()
  const [step, setStep] = useState('request') // request | reset
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const sendCode = async (e) => {
    e.preventDefault()
    if (!isLoaded || busy) return
    setBusy(true)
    setError('')
    try {
      await signIn.create({ strategy: 'reset_password_email_code', identifier: email })
      setStep('reset')
    } catch (err) {
      setError(err?.errors?.[0]?.longMessage || t(lang, 'auth.forgotError'))
    } finally {
      setBusy(false)
    }
  }

  const submitReset = async (e) => {
    e.preventDefault()
    if (!isLoaded || busy) return
    setBusy(true)
    setError('')
    try {
      const result = await signIn.attemptFirstFactor({ strategy: 'reset_password_email_code', code, password })
      if (result.status === 'complete') {
        // Déclenche la session active : App.jsx détecte isSignedIn et quitte la page
        // d'auth tout seul, pas besoin de navigation explicite ici.
        await setActive({ session: result.createdSessionId })
      } else {
        // Statut intermédiaire (ex: 2FA requise) — hors scope de ce flux minimal, on
        // renvoie vers la connexion classique plutôt que de bloquer silencieusement.
        setError(t(lang, 'auth.forgotNeeds2fa'))
      }
    } catch (err) {
      setError(err?.errors?.[0]?.longMessage || t(lang, 'auth.forgotError'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-forgot">
      <button type="button" className="auth-back-btn auth-forgot-back" onClick={onBack}>
        <IconArrowLeft width={16} height={16} /> {t(lang, 'auth.backToSignIn')}
      </button>

      <h2 className="auth-forgot-title">{t(lang, 'auth.forgotTitle')}</h2>

      {step === 'request' ? (
        <form onSubmit={sendCode} className="auth-forgot-form">
          <p className="auth-forgot-subtitle">{t(lang, 'auth.forgotSubtitle')}</p>
          <input
            type="email"
            required
            autoFocus
            placeholder={t(lang, 'auth.emailPlaceholder')}
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="auth-forgot-input"
          />
          {error && <p className="auth-forgot-error">{error}</p>}
          <button type="submit" className="auth-forgot-submit" disabled={busy || !email}>
            {busy ? t(lang, 'auth.sending') : t(lang, 'auth.sendCode')}
          </button>
        </form>
      ) : (
        <form onSubmit={submitReset} className="auth-forgot-form">
          <p className="auth-forgot-subtitle">{t(lang, 'auth.forgotCodeSent')(email)}</p>
          <input
            type="text"
            inputMode="numeric"
            required
            autoFocus
            placeholder={t(lang, 'auth.codePlaceholder')}
            value={code}
            onChange={e => setCode(e.target.value)}
            className="auth-forgot-input"
          />
          <input
            type="password"
            required
            placeholder={t(lang, 'auth.newPasswordPlaceholder')}
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="auth-forgot-input"
          />
          {error && <p className="auth-forgot-error">{error}</p>}
          <button type="submit" className="auth-forgot-submit" disabled={busy || !code || !password}>
            {busy ? t(lang, 'auth.sending') : t(lang, 'auth.resetPassword')}
          </button>
        </form>
      )}
    </div>
  )
}
