import { useEffect, useState } from 'react'
import { t } from '../lib/i18n'
import { getExportBranding, saveExportBranding } from '../lib/exportBranding'
import { resizeImageToDataUrl } from '../lib/imageResize'
import { IconUpload, IconTrash } from './Icons'
import '../styles/ExportBrandingSection.css'

// Marque personnalisée sur les exports PDF/PPTX (Pro) — le logo vient s'ajouter en évidence
// sur la couverture/clôture du pitch deck et en tête du PDF, le crédit "Généré avec
// VelocityLaunch" reste toujours affiché (voir lib/exportBranding.js pour le détail de ce
// choix). Réglage purement local à cet appareil, comme l'avatar de l'espace personnel.
export default function ExportBrandingSection({ lang, userId, isPro, onRequestUpgrade }) {
  const [branding, setBranding] = useState({ enabled: false, logo: null })

  useEffect(() => {
    if (userId) setBranding(getExportBranding(userId))
  }, [userId])

  const persist = (patch) => {
    const next = { ...branding, ...patch }
    setBranding(next)
    saveExportBranding(userId, next)
  }

  const pickLogo = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const dataUrl = await resizeImageToDataUrl(file, 400)
    persist({ logo: dataUrl, enabled: true })
  }

  const removeLogo = () => persist({ logo: null, enabled: false })

  if (!userId) return null

  return (
    <div className="account-section card">
      <h3>{t(lang, 'settings.brandingTitle')} {!isPro && <span className="export-pro-badge">PRO</span>}</h3>
      <p className="account-security-note">{t(lang, 'settings.brandingBody')}</p>

      {!isPro ? (
        <button className="btn-secondary" onClick={onRequestUpgrade}>{t(lang, 'settings.brandingUpgrade')}</button>
      ) : (
        <>
          {branding.logo && (
            <div className="branding-logo-preview">
              <img src={branding.logo} alt="" />
              <button className="btn-secondary" onClick={removeLogo}><IconTrash width={13} height={13} /> {t(lang, 'settings.brandingRemove')}</button>
            </div>
          )}

          <label className="branding-upload-btn">
            <input type="file" accept="image/*" onChange={pickLogo} hidden />
            <IconUpload width={14} height={14} />
            {branding.logo ? t(lang, 'settings.brandingChange') : t(lang, 'settings.brandingUpload')}
          </label>

          {branding.logo && (
            <div className="settings-row" style={{ marginTop: '0.75rem' }}>
              <div>
                <p className="settings-row-label">{t(lang, 'settings.brandingEnableLabel')}</p>
                <p className="account-security-note">{t(lang, 'settings.brandingEnableBody')}</p>
              </div>
              <button
                className={`settings-switch ${branding.enabled ? 'is-on' : ''}`}
                role="switch"
                aria-checked={branding.enabled}
                onClick={() => persist({ enabled: !branding.enabled })}
              >
                <span className="settings-switch-thumb" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
