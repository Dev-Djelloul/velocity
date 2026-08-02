import { useState } from 'react'
import { useUpdateAvatar } from '../lib/auth'
import { t } from '../lib/i18n'
import { IconUpload } from './Icons'
import '../styles/AvatarPicker.css'

const PRESETS = [
  { emoji: '🚀', bg: '#7c5cff' },
  { emoji: '⚡', bg: '#f5a623' },
  { emoji: '🦊', bg: '#e8674a' },
  { emoji: '🐙', bg: '#2fb5a3' },
  { emoji: '🌈', bg: '#e253a6' },
  { emoji: '🦄', bg: '#9b6bff' },
  { emoji: '🐼', bg: '#4a90d9' },
  { emoji: '🌵', bg: '#4caf6e' },
  { emoji: '🍕', bg: '#f2545b' },
  { emoji: '🎯', bg: '#3b6fd6' },
  { emoji: '🌙', bg: '#5c5cff' },
  { emoji: '🔥', bg: '#ff7a45' }
]

function renderAvatarBlob(emoji, bg) {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = bg
  ctx.beginPath()
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
  ctx.fill()
  ctx.font = `${size * 0.56}px "Apple Color Emoji","Segoe UI Emoji",sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(emoji, size / 2, size / 2 + size * 0.04)
  return new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
}

export default function AvatarPicker({ lang, onClose }) {
  const updateAvatar = useUpdateAvatar()
  const [saving, setSaving] = useState(null)

  const pick = async (preset) => {
    setSaving(preset.emoji)
    try {
      const blob = await renderAvatarBlob(preset.emoji, preset.bg)
      await updateAvatar(blob)
      onClose()
    } finally {
      setSaving(null)
    }
  }

  const pickFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSaving('upload')
    try {
      await updateAvatar(file)
      onClose()
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal card avatar-picker" onClick={e => e.stopPropagation()}>
        <h3>{t(lang, 'account.avatarTitle')}</h3>
        <div className="avatar-picker-grid">
          {PRESETS.map(p => (
            <button
              key={p.emoji}
              className="avatar-picker-item"
              style={{ background: p.bg }}
              disabled={saving !== null}
              onClick={() => pick(p)}
              title={p.emoji}
            >
              {saving === p.emoji ? <span className="avatar-picker-spinner" /> : p.emoji}
            </button>
          ))}
        </div>
        <label className="avatar-picker-upload">
          <input type="file" accept="image/*" onChange={pickFile} disabled={saving !== null} hidden />
          {saving === 'upload' ? <span className="avatar-picker-spinner" /> : <IconUpload width={14} height={14} />}
          {t(lang, 'account.avatarUpload')}
        </label>
        <button className="btn-secondary close-btn" onClick={onClose}>{t(lang, 'export.close')}</button>
      </div>
    </div>
  )
}
