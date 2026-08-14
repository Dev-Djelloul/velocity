// Couche d'abstraction auth : si VITE_CLERK_PUBLISHABLE_KEY est renseignée, on utilise
// les vrais composants/hooks Clerk. Sinon, on bascule sur une session simulée en local
// (même API : useUser, useAuth, SignedIn, SignedOut, SignInButton, UserButton) pour que
// tout le reste de l'app (header, gating, page compte) fonctionne à l'identique et n'ait
// RIEN à changer le jour où la vraie clé Clerk est branchée.
import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import {
  ClerkProvider,
  useUser as useClerkUser,
  useAuth as useClerkAuth,
  useClerk,
  SignedIn as ClerkSignedIn,
  SignedOut as ClerkSignedOut,
  SignInButton as ClerkSignInButton,
  UserButton as ClerkUserButton
} from '@clerk/clerk-react'
import { frFR, enUS } from '@clerk/localizations'
import { IconUser } from '../components/Icons'
import '../styles/Auth.css'

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
export const isMockAuth = !CLERK_KEY

const MOCK_PROVIDERS = [
  { key: 'google', label: 'Google', color: '#EA4335' },
  { key: 'github', label: 'GitHub', color: '#F5F5F5' },
  { key: 'twitter', label: 'X / Twitter', color: '#1DA1F2' }
]

const MockAuthContext = createContext(null)

function loadMockUser() {
  try {
    const raw = localStorage.getItem('plp_mock_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function MockAuthProvider({ children }) {
  const [user, setUser] = useState(loadMockUser)
  const [modalOpen, setModalOpen] = useState(false)
  const [afterSignIn, setAfterSignIn] = useState(null)

  const signIn = useCallback((provider) => {
    const fake = {
      id: `mock_${provider}_${Date.now()}`,
      firstName: 'Demo',
      fullName: `Demo (${provider})`,
      primaryEmailAddress: { emailAddress: `demo.${provider}@velocitylaunch.app` },
      imageUrl: null,
      provider
    }
    localStorage.setItem('plp_mock_user', JSON.stringify(fake))
    setUser(fake)
    setModalOpen(false)
    afterSignIn?.()
    setAfterSignIn(null)
  }, [afterSignIn])

  const signOut = useCallback(() => {
    localStorage.removeItem('plp_mock_user')
    setUser(null)
  }, [])

  const updateAvatar = useCallback((dataUrl) => {
    setUser(prev => {
      if (!prev) return prev
      const next = { ...prev, imageUrl: dataUrl }
      localStorage.setItem('plp_mock_user', JSON.stringify(next))
      return next
    })
  }, [])

  const openModal = useCallback((onDone) => {
    setAfterSignIn(() => onDone)
    setModalOpen(true)
  }, [])

  return (
    <MockAuthContext.Provider value={{ user, signIn, signOut, openModal, updateAvatar }}>
      {children}
      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal card mock-auth-modal" onClick={e => e.stopPropagation()}>
            <h3>Connexion (mode démo)</h3>
            <p className="mock-auth-note">
              Aucune clé Clerk n'est configurée — cette connexion est simulée localement.
              Choisis un provider pour continuer :
            </p>
            <div className="mock-auth-providers">
              {MOCK_PROVIDERS.map(p => (
                <button key={p.key} className="mock-auth-provider-btn" onClick={() => signIn(p.key)}>
                  <span className="mock-auth-dot" style={{ background: p.color }} />
                  Continuer avec {p.label}
                </button>
              ))}
            </div>
            <button className="btn-secondary close-btn" onClick={() => setModalOpen(false)}>Annuler</button>
          </div>
        </div>
      )}
    </MockAuthContext.Provider>
  )
}

function useMockAuthContext() {
  const ctx = useContext(MockAuthContext)
  if (!ctx) throw new Error('useMockAuthContext must be used within MockAuthProvider')
  return ctx
}

// Clerk ne traduit pas automatiquement ses libellés avec le sélecteur FR/EN de l'app (ce
// sont deux systèmes de langue indépendants) : on branche les traductions officielles de
// @clerk/localizations ("Continuer avec Google", "Dernière utilisation", placeholders...).
// On écoute l'événement 'plp-langchange' (émis par App.jsx à chaque changement de langue)
// car ClerkProvider est monté au-dessus d'App dans l'arbre React et n'a donc pas accès
// direct à son state.
const CLERK_LOCALIZATIONS = { fr: frFR, en: enUS }

function useAppLang() {
  const [lang, setLang] = useState(() => localStorage.getItem('plp_lang') || 'fr')
  useEffect(() => {
    const handler = (e) => setLang(e.detail)
    window.addEventListener('plp-langchange', handler)
    return () => window.removeEventListener('plp-langchange', handler)
  }, [])
  return lang
}

export function AuthProvider({ children }) {
  const lang = useAppLang()
  if (isMockAuth) return <MockAuthProvider>{children}</MockAuthProvider>
  return (
    <ClerkProvider publishableKey={CLERK_KEY} localization={CLERK_LOCALIZATIONS[lang]}>
      {children}
    </ClerkProvider>
  )
}

export function useUser() {
  if (isMockAuth) {
    const { user } = useMockAuthContext()
    return { isLoaded: true, isSignedIn: !!user, user }
  }
  return useClerkUser()
}

export function useAuth() {
  if (isMockAuth) {
    const { user, signOut } = useMockAuthContext()
    return { isLoaded: true, isSignedIn: !!user, userId: user?.id ?? null, signOut }
  }
  return useClerkAuth()
}

export function SignedIn({ children }) {
  if (isMockAuth) {
    const { user } = useMockAuthContext()
    return user ? children : null
  }
  return <ClerkSignedIn>{children}</ClerkSignedIn>
}

export function SignedOut({ children }) {
  if (isMockAuth) {
    const { user } = useMockAuthContext()
    return user ? null : children
  }
  return <ClerkSignedOut>{children}</ClerkSignedOut>
}

export function SignInButton({ children }) {
  if (isMockAuth) {
    const { openModal } = useMockAuthContext()
    return (
      <span onClick={() => openModal()} style={{ display: 'contents' }}>
        {children}
      </span>
    )
  }
  return <ClerkSignInButton mode="modal">{children}</ClerkSignInButton>
}

// API impérative pour ouvrir la modale de connexion depuis un handler (ex: CTA "Get Started"
// qui n'est pas lui-même un bouton d'auth) — même usage que useClerk().openSignIn() côté réel.
// Expose la liste des providers + l'action de connexion pour un rendu en PLEINE PAGE
// (AuthPage) plutôt qu'en modale — utilisé quand aucune clé Clerk n'est configurée.
// Retourne null en mode réel : AuthPage rend alors <SignIn>/<SignUp> de Clerk directement.
export function useAuthProviders() {
  if (!isMockAuth) return null
  const { signIn } = useMockAuthContext()
  return { providers: MOCK_PROVIDERS, signIn }
}

export function useSignIn() {
  if (isMockAuth) {
    const { openModal } = useMockAuthContext()
    return { open: () => openModal() }
  }
  const clerk = useClerk()
  return { open: () => clerk.openSignIn() }
}

// Même principe que useSignIn, mais ouvre directement l'écran d'inscription —
// utilisé par le CTA "Commencer" destiné aux nouveaux arrivants, distinct du
// bouton "Connexion" du header destiné aux utilisateurs déjà inscrits.
export function useSignUp() {
  if (isMockAuth) {
    const { openModal } = useMockAuthContext()
    return { open: () => openModal() }
  }
  const clerk = useClerk()
  return { open: () => clerk.openSignUp() }
}

// Met à jour la photo de profil — en mode démo, stocke un data URL en local ;
// en mode réel, envoie le blob à Clerk via setProfileImage.
export function useUpdateAvatar() {
  if (isMockAuth) {
    const { updateAvatar } = useMockAuthContext()
    return async (blob) => {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
      updateAvatar(dataUrl)
    }
  }
  const { user } = useClerkUser()
  return async (blob) => {
    await user.setProfileImage({ file: blob })
  }
}

// Ouvre le panneau sécurité/compte natif de Clerk (mot de passe, 2FA, appareils actifs,
// suppression de compte) — utilisé comme section "avancée" à l'intérieur de la page
// Mon compte Velocity, plutôt que comme point d'entrée concurrent dans le header.
// Indisponible en mode démo (pas de backend Clerk).
// Détecte le provider OAuth utilisé pour la connexion ('google' | 'apple' | 'slack' | null)
// — sert à afficher un petit logo à côté de l'identité, purement informatif.
export function useAuthProvider() {
  const { user } = useUser()
  if (isMockAuth) {
    return ['google', 'apple', 'slack'].includes(user?.provider) ? user.provider : null
  }
  const provider = user?.externalAccounts?.[0]?.provider
  return ['google', 'apple', 'slack'].includes(provider) ? provider : null
}

export function useOpenSecurity() {
  if (isMockAuth) return null
  const clerk = useClerk()
  return () => clerk.openUserProfile()
}

export function UserButton() {
  if (isMockAuth) {
    const { user, signOut } = useMockAuthContext()
    if (!user) return null
    return (
      <button className="mock-user-button" onClick={signOut} title="Se déconnecter (démo)">
        {user.imageUrl ? <img src={user.imageUrl} alt="" /> : <IconUser width={16} height={16} />}
      </button>
    )
  }
  return <ClerkUserButton />
}
