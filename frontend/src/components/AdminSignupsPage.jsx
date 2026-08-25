import { useEffect, useState } from 'react'
import { formatFullDateTime } from '../lib/dateFormat'
import { IconArrowLeft, IconUsers, IconRotateCw, IconLock } from './Icons'
import '../styles/AccountPage.css'
import '../styles/AdminSignupsPage.css'

const BASE = import.meta.env.VITE_BACKEND_URL
// Persisté en sessionStorage (pas localStorage) : le secret ne doit pas survivre au-delà
// de l'onglet ouvert — outil interne réservé au fondateur, jamais destiné à rester en
// clair sur la machine entre deux visites.
const SECRET_STORAGE_KEY = 'plp_admin_secret'

function channelLabel(entry, lang) {
  if (entry.utm_source) {
    const parts = [entry.utm_source, entry.utm_medium, entry.utm_campaign].filter(Boolean)
    return parts.join(' / ')
  }
  if (entry.referrer) return entry.referrer
  return lang === 'fr' ? 'Direct' : 'Direct'
}

function providerLabel(provider, lang) {
  const normalizedProvider = provider?.toLowerCase().replace(/^oauth_/, '')
  const labels = {
    google: 'Google',
    apple: 'Apple',
    slack: 'Slack',
    github: 'GitHub',
    email: lang === 'fr' ? 'Email' : 'Email'
  }
  return labels[normalizedProvider] || provider || (lang === 'fr' ? 'Inconnu' : 'Unknown')
}

// Page interne (jamais liée dans la nav) qui remplace la lecture brute de
// /admin/attribution en curl par un vrai tableau — voir backend/src/workers/api.js. Le
// secret est demandé une fois par onglet, jamais codé en dur ni transmis ailleurs qu'à
// cet appel.
export default function AdminSignupsPage({ lang, onBack }) {
  const [secret, setSecret] = useState(() => sessionStorage.getItem(SECRET_STORAGE_KEY) || '')
  const [secretInput, setSecretInput] = useState('')
  const [entries, setEntries] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const load = async (s) => {
    if (!BASE || !s) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${BASE}/admin/attribution?secret=${encodeURIComponent(s)}`)
      if (res.status === 401) {
        sessionStorage.removeItem(SECRET_STORAGE_KEY)
        setSecret('')
        setError(lang === 'fr' ? 'Secret incorrect.' : 'Wrong secret.')
        return
      }
      if (!res.ok) {
        setError(lang === 'fr' ? 'Erreur serveur, réessaie plus tard.' : 'Server error, try again later.')
        return
      }
      setEntries(await res.json())
    } catch {
      setError(lang === 'fr' ? 'Impossible de contacter le serveur.' : 'Could not reach the server.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (secret) load(secret)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const submitSecret = (e) => {
    e.preventDefault()
    if (!secretInput.trim()) return
    sessionStorage.setItem(SECRET_STORAGE_KEY, secretInput.trim())
    setSecret(secretInput.trim())
    load(secretInput.trim())
  }

  return (
    <div className="account-page-outer">
      <div className="account-page account-page-inner admin-signups-page">
        <button className="account-back-btn" onClick={onBack}>
          <IconArrowLeft width={16} height={16} /> {lang === 'fr' ? 'Retour' : 'Back'}
        </button>

        <h2 className="settings-page-title"><IconUsers width={20} height={20} /> {lang === 'fr' ? 'Inscriptions' : 'Signups'}</h2>

        {!secret ? (
          <div className="account-section card admin-signups-gate">
            <p className="account-empty"><IconLock width={14} height={14} /> {lang === 'fr' ? 'Accès protégé — entre le secret admin.' : 'Protected access — enter the admin secret.'}</p>
            <form onSubmit={submitSecret} className="admin-signups-gate-form">
              <input
                type="password"
                value={secretInput}
                onChange={e => setSecretInput(e.target.value)}
                placeholder={lang === 'fr' ? 'ADMIN_SECRET' : 'ADMIN_SECRET'}
                autoFocus
              />
              <button type="submit" className="btn-primary">{lang === 'fr' ? 'Valider' : 'Confirm'}</button>
            </form>
            {error && <p className="admin-signups-error">{error}</p>}
          </div>
        ) : (
          <div className="account-section card">
            <h3 className="account-section-title-row">
              <span>{lang === 'fr' ? `Nouveaux inscrits (${entries?.length ?? '…'})` : `New signups (${entries?.length ?? '…'})`}</span>
              <button className="account-clear-btn" onClick={() => load(secret)} disabled={loading}>
                <IconRotateCw width={13} height={13} /> {lang === 'fr' ? 'Rafraîchir' : 'Refresh'}
              </button>
            </h3>

            {error && <p className="admin-signups-error">{error}</p>}

            {!entries?.length ? (
              !error && <p className="account-empty">{lang === 'fr' ? 'Aucune inscription pour le moment.' : 'No signups yet.'}</p>
            ) : (
              <div className="admin-signups-table-wrap">
                <table className="admin-signups-table">
                  <thead>
                    <tr>
                      <th>{lang === 'fr' ? 'Personne' : 'Person'}</th>
                      <th>{lang === 'fr' ? 'Email' : 'Email'}</th>
                      <th>{lang === 'fr' ? 'Connexion' : 'Sign-in'}</th>
                      <th>{lang === 'fr' ? 'Canal' : 'Channel'}</th>
                      <th>{lang === 'fr' ? 'Page d\'atterrissage' : 'Landing page'}</th>
                      <th>{lang === 'fr' ? 'Inscrit·e le' : 'Signed up'}</th>
                      <th>{lang === 'fr' ? 'Dernière connexion' : 'Last sign-in'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map(entry => (
                      <tr key={entry.user_id}>
                        <td data-label={lang === 'fr' ? 'Personne' : 'Person'}>
                          <span className="admin-signups-person">
                            {entry.avatarUrl ? <img src={entry.avatarUrl} alt="" /> : <IconUsers width={16} height={16} />}
                            <span>{entry.name || <span className="admin-signups-muted">{entry.user_id}</span>}</span>
                          </span>
                        </td>
                        <td>{entry.email || <span className="admin-signups-muted">{entry.user_id}</span>}</td>
                        <td>{providerLabel(entry.provider, lang)}</td>
                        <td>{channelLabel(entry, lang)}</td>
                        <td>{entry.landing_page || <span className="admin-signups-muted">—</span>}</td>
                        <td>{formatFullDateTime(entry.created_at, lang)}</td>
                        <td>{entry.lastSignInAt ? formatFullDateTime(entry.lastSignInAt, lang) : <span className="admin-signups-muted">—</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
