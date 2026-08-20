import { useState } from 'react'
import { t } from '../lib/i18n'
import { resizeImageToDataUrl } from '../lib/imageResize'
import { IconUpload, IconLink, IconTrash } from './Icons'
import '../styles/CoverPicker.css'

// Sélecteur de couverture façon Notion (onglets Galerie/Charger/Lien) — remplace l'ancien
// choix limité à des avatars ronds (AvatarPicker, pensé pour un avatar de compte/équipe,
// pas pour une bannière pleine largeur) et surtout permet de supprimer une couverture déjà
// posée, ce qu'aucune des deux versions précédentes ne permettait.
const SWATCHES = [
  { key: 'brand', css: 'linear-gradient(135deg, #9184d9 0%, #6366f1 55%, #06b6d4 100%)' },
  { key: 'sunset', css: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)' },
  { key: 'ocean', css: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' },
  { key: 'forest', css: 'linear-gradient(135deg, #22c55e 0%, #0ea5e9 100%)' },
  { key: 'berry', css: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' },
  { key: 'gold', css: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' },
  { key: 'slate', css: 'linear-gradient(135deg, #334155 0%, #64748b 100%)' },
  { key: 'mint', css: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)' },
  { key: 'violet', css: '#6366f1' },
  { key: 'coral', css: '#f97316' },
  { key: 'teal', css: '#0d9488' },
  { key: 'rose', css: '#e11d48' },
  { key: 'ink', css: '#141922' },
  { key: 'graphite', css: '#374151' }
]

// Rend le swatch (couleur unie ou dégradé CSS) en image bitmap 1600x400 — même format que la
// bannière réelle — pour que le stockage reste uniforme (une simple string coverImage,
// data URL ou URL externe) quelle que soit la façon dont la couverture a été choisie.
function renderSwatch(css) {
  const w = 1600
  const h = 400
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  const gradientMatch = css.match(/linear-gradient\(135deg,\s*(#[0-9a-f]+)\s*[\d%]*,\s*(?:(#[0-9a-f]+)\s*[\d%]*,\s*)?(#[0-9a-f]+)\s*[\d%]*\)/i)
  if (gradientMatch) {
    const grad = ctx.createLinearGradient(0, 0, w, h)
    const stops = [gradientMatch[1], gradientMatch[2], gradientMatch[3]].filter(Boolean)
    stops.forEach((color, i) => grad.addColorStop(i / (stops.length - 1), color))
    ctx.fillStyle = grad
  } else {
    ctx.fillStyle = css
  }
  ctx.fillRect(0, 0, w, h)
  return canvas.toDataURL('image/jpeg', 0.9)
}

export default function CoverPicker({ lang, onChange, onClose, hasCover, title, removeLabel }) {
  const [tab, setTab] = useState('gallery')
  const [linkInput, setLinkInput] = useState('')
  const [uploading, setUploading] = useState(false)

  const pickSwatch = (css) => {
    onChange(renderSwatch(css))
    onClose()
  }

  const pickFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const dataUrl = await resizeImageToDataUrl(file, 1600)
      onChange(dataUrl)
      onClose()
    } finally {
      setUploading(false)
    }
  }

  const submitLink = () => {
    const trimmed = linkInput.trim()
    if (!trimmed) return
    onChange(trimmed)
    onClose()
  }

  const removeCover = () => {
    onChange(null)
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal card cover-picker" onClick={e => e.stopPropagation()}>
        <h3>{title || t(lang, 'app.coverImageTitle')}</h3>

        <div className="cover-picker-tabs">
          <button className={tab === 'gallery' ? 'active' : ''} onClick={() => setTab('gallery')}>{t(lang, 'app.coverTabGallery')}</button>
          <button className={tab === 'upload' ? 'active' : ''} onClick={() => setTab('upload')}>{t(lang, 'app.coverTabUpload')}</button>
          <button className={tab === 'link' ? 'active' : ''} onClick={() => setTab('link')}>{t(lang, 'app.coverTabLink')}</button>
        </div>

        {tab === 'gallery' && (
          <div className="cover-picker-swatches">
            {SWATCHES.map(s => (
              <button key={s.key} className="cover-swatch" style={{ background: s.css }} onClick={() => pickSwatch(s.css)} title={s.key} />
            ))}
          </div>
        )}

        {tab === 'upload' && (
          <div className="cover-picker-upload">
            <label className="cover-picker-upload-btn">
              <input type="file" accept="image/*" onChange={pickFile} disabled={uploading} hidden />
              {uploading ? <span className="cover-picker-spinner" /> : <IconUpload width={16} height={16} />}
              {t(lang, 'app.coverUploadCta')}
            </label>
          </div>
        )}

        {tab === 'link' && (
          <div className="cover-picker-link">
            <div className="cover-picker-link-row">
              <IconLink width={15} height={15} />
              <input
                type="url"
                placeholder="https://…"
                value={linkInput}
                onChange={e => setLinkInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submitLink()}
              />
            </div>
            <button className="btn-secondary" onClick={submitLink} disabled={!linkInput.trim()}>{t(lang, 'app.coverLinkSubmit')}</button>
          </div>
        )}

        <div className="cover-picker-footer">
          {hasCover && (
            <button className="cover-picker-remove" onClick={removeCover}>
              <IconTrash width={13} height={13} /> {removeLabel || t(lang, 'app.coverRemove')}
            </button>
          )}
          <button className="btn-secondary" onClick={onClose}>{t(lang, 'export.close')}</button>
        </div>
      </div>
    </div>
  )
}
