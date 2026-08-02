// Couche d'abstraction auth : si VITE_CLERK_PUBLISHABLE_KEY est renseignée, on utilise
// les vrais composants/hooks Clerk. Sinon, on bascule sur une session simulée en local
// (même API : useUser, useAuth, SignedIn, SignedOut, SignInButton, UserButton) pour que
// tout le reste de l'app (header, gating, page compte) fonctionne à l'identique et n'ait
// RIEN à changer le jour où la vraie clé Clerk est branchée.
import { createContext, useContext, useState, useCallback } from 'react'
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

  const openModal = useCallback((onDone) => {
    setAfterSignIn(() => onDone)
    setModalOpen(true)
  }, [])

  return (
    <MockAuthContext.Provider value={{ user, signIn, signOut, openModal }}>
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

export function AuthProvider({ children }) {
  if (isMockAuth) return <MockAuthProvider>{children}</MockAuthProvider>
  return <ClerkProvider publishableKey={CLERK_KEY}>{children}</ClerkProvider>
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
export function useSignIn() {
  if (isMockAuth) {
    const { openModal } = useMockAuthContext()
    return { open: () => openModal() }
  }
  const clerk = useClerk()
  return { open: () => clerk.openSignIn() }
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
