import { useState, useRef, useEffect } from 'react'
import { t } from '../lib/i18n'
import InfoModal from './InfoModal'
import { IconUsers, IconCheckCircle, IconPlus, IconShield } from './Icons'
import '../styles/TeamSwitcher.css'

// Switcher d'espace (personnel <-> équipe) dans le header. Rendu identique en mode Clerk
// réel et en mode démo (voir lib/auth.jsx useTeam()) — même composant, seule la donnée
// derrière change, pour ne jamais avoir à maintenir deux UI différentes.
export default function TeamSwitcher({ lang, team, onManageTeam }) {
  const [open, setOpen] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [teamName, setTeamName] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const currentLabel = team.teamId ? team.teamName : t(lang, 'team.personalSpace')

  const handleCreate = () => {
    const name = teamName.trim()
    if (!name) return
    team.createTeam(name)
    setTeamName('')
    setShowCreate(false)
    setOpen(false)
  }

  return (
    <div className="header-menu" ref={ref}>
      <button
        className={`header-team-btn ${open ? 'active' : ''}`}
        onClick={() => setOpen(v => !v)}
        title={t(lang, 'team.switcherTitle')}
      >
        <IconUsers width={15} height={15} />
        <span className="header-team-label">{currentLabel}</span>
      </button>

      {open && (
        <div className="header-dropdown header-team-dropdown">
          <button
            className={`header-dropdown-item ${!team.teamId ? 'is-current' : ''}`}
            onClick={() => { team.setActiveTeamId(null); setOpen(false) }}
          >
            {!team.teamId && <IconCheckCircle width={14} height={14} />}
            <span>{t(lang, 'team.personalSpace')}</span>
          </button>

          {!!team.myTeams?.length && (
            <>
              <div className="header-dropdown-label">{t(lang, 'team.myTeams')}</div>
              {team.myTeams.map(tm => (
                <button
                  key={tm.id}
                  className={`header-dropdown-item ${team.teamId === tm.id ? 'is-current' : ''}`}
                  onClick={() => { team.setActiveTeamId(tm.id); setOpen(false) }}
                >
                  {team.teamId === tm.id && <IconCheckCircle width={14} height={14} />}
                  <span>{tm.name}</span>
                </button>
              ))}
            </>
          )}

          {team.teamId && (
            <button className="header-dropdown-item" onClick={() => { setOpen(false); onManageTeam?.() }}>
              <IconShield width={14} height={14} /> {t(lang, 'team.membersTitle')}
            </button>
          )}
          <div className="header-dropdown-divider" />
          <button className="header-dropdown-item" onClick={() => setShowCreate(true)}>
            <IconPlus width={14} height={14} /> {t(lang, 'team.createTeam')}
          </button>
        </div>
      )}

      {showCreate && (
        <InfoModal
          icon={<IconUsers width={22} height={22} />}
          title={t(lang, 'team.createTeamTitle')}
          onClose={() => setShowCreate(false)}
        >
          <p className="unsaved-changes-body">{t(lang, 'team.createTeamBody')}</p>
          {team.isMock && <p className="team-mock-notice">{t(lang, 'team.mockNotice')}</p>}
          <input
            className="team-create-input"
            type="text"
            value={teamName}
            onChange={e => setTeamName(e.target.value)}
            placeholder={t(lang, 'team.createTeamNamePlaceholder')}
            autoFocus
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
          />
          <div className="unsaved-changes-actions">
            <button className="btn-secondary" onClick={() => setShowCreate(false)}>
              {t(lang, 'team.createTeamCancel')}
            </button>
            <button className="btn-primary" onClick={handleCreate} disabled={!teamName.trim()}>
              {t(lang, 'team.createTeamConfirm')}
            </button>
          </div>
        </InfoModal>
      )}
    </div>
  )
}
