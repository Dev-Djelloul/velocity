import { useState } from 'react'
import { t } from '../lib/i18n'
import { getAllPlans } from '../lib/planStorage'
import { getAllDrafts } from '../lib/draftStorage'
import { downloadBlob } from '../lib/pdfExport'
import { useUser, useOpenSecurity, isMockAuth, useAuth } from '../lib/auth'

// Export RGPD (toutes les données locales à ce compte : plans, brouillons, préférences)
// et suppression de compte. En mode réel, la suppression passe par le panneau natif
// Clerk (seul endroit habilité à supprimer un compte + ses données d'auth) ; en mode
// démo (pas de backend Clerk), on efface simplement la session simulée en local.
export default function PrivacySection({ lang, userId }) {
  const { user } = useUser()
  const openSecurity = useOpenSecurity()
  const { signOut } = useAuth()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const exportAllData = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      account: {
        id: userId,
        email: user?.primaryEmailAddress?.emailAddress || null,
        name: user?.fullName || null
      },
      plans: getAllPlans(),
      drafts: getAllDrafts(),
      preferences: {
        lang: localStorage.getItem('plp_lang'),
        theme: localStorage.getItem('plp_theme'),
        timezone: localStorage.getItem('plp_timezone'),
        dateFormat: localStorage.getItem('plp_date_format'),
        currency: localStorage.getItem('plp_currency'),
        fontSize: localStorage.getItem('plp_font_size'),
        highContrast: localStorage.getItem('plp_high_contrast'),
        reduceMotion: localStorage.getItem('plp_reduce_motion')
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    downloadBlob(blob, `velocitylaunch-mes-donnees-${Date.now()}.json`)
  }

  const deleteAccountMock = () => {
    localStorage.clear()
    signOut?.()
    setConfirmDelete(false)
  }

  return (
    <div className="account-section card">
      <h3>{t(lang, 'settings.privacyTitle')}</h3>

      <div className="settings-row">
        <div>
          <p className="settings-row-label">{t(lang, 'settings.exportDataLabel')}</p>
          <p className="account-security-note">{t(lang, 'settings.exportDataBody')}</p>
        </div>
        <button className="btn-secondary" onClick={exportAllData}>{t(lang, 'settings.exportDataCta')}</button>
      </div>

      <div className="settings-row">
        <div>
          <p className="settings-row-label">{t(lang, 'settings.deleteAccountLabel')}</p>
          <p className="account-security-note">{t(lang, 'settings.deleteAccountBody')}</p>
        </div>
        {isMockAuth ? (
          confirmDelete ? (
            <div className="settings-toggle-group">
              <button className="btn-danger" onClick={deleteAccountMock}>{t(lang, 'settings.deleteAccountConfirm')}</button>
              <button className="btn-secondary" onClick={() => setConfirmDelete(false)}>{t(lang, 'settings.deleteAccountCancel')}</button>
            </div>
          ) : (
            <button className="btn-danger" onClick={() => setConfirmDelete(true)}>{t(lang, 'settings.deleteAccountCta')}</button>
          )
        ) : (
          <button className="btn-danger" onClick={openSecurity}>{t(lang, 'settings.deleteAccountCta')}</button>
        )}
      </div>
    </div>
  )
}
