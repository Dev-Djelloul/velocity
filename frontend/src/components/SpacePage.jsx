import { useMemo, useState } from 'react'
import { t } from '../lib/i18n'
import { useTeam, useUser, useAuth } from '../lib/auth'
import { getAllPlans, deletePlan, duplicatePlan, toggleFavorite } from '../lib/planStorage'
import { getAllDrafts, deleteDraft, renameDraft } from '../lib/draftStorage'
import { formatFullDateTime } from '../lib/dateFormat'
import { getPersonalSpace, savePersonalSpace, blobToDataUrl } from '../lib/personalSpace'
import { IconArrowLeft, IconUsers, IconUser, IconClipboard, IconCoin, IconClock, IconPlus, IconTrash, IconSettings, IconAlertTriangle, IconSave, IconPencil, IconCopy, IconImage } from './Icons'
import { teamColor } from './TeamAvatar'
import AvatarPicker from './AvatarPicker'
import InfoModal from './InfoModal'
import '../styles/SpacePage.css'
import '../styles/GalleryPage.css'

// Combien de plans "récents" afficher dans l'espace personnel — un aperçu rapide, pas un
// archivage complet (celui-ci reste dans "Mon compte" → Historique de tous les plans).
const RECENT_PLANS_LIMIT = 5

function byRecency(a, b) {
  const dateOf = (p) => p.updatedAt || p.savedAt || p.generatedAt || ''
  return dateOf(b).localeCompare(dateOf(a))
}

// Page dédiée à l'espace actif (personnel ou équipe), pour piloter ce qu'il contient sans
// repasser par "Mon compte" à chaque fois — celui-ci reste focalisé sur l'identité/les
// crédits et sert désormais d'historique complet de tous les plans de l'espace, pendant
// que cette page ne montre que les derniers plans actifs (personnel) ou le tableau de bord
// partagé (équipe).
export default function SpacePage({ lang, onBack, onLoadPlan, onLoadDraft, onCreatePlan, onOpenTeamSettings, onSeeFullHistory, onOpenHistory, onOpenGallery, onPersonalSpaceChange }) {
  const team = useTeam()
  const { user } = useUser()
  const { userId } = useAuth()
  const isTeam = !!team.teamId
  const [plans, setPlans] = useState(getAllPlans)
  const [drafts, setDrafts] = useState(isTeam ? [] : getAllDrafts)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteDraftTarget, setDeleteDraftTarget] = useState(null)
  const [renameDraftTarget, setRenameDraftTarget] = useState(null)
  const [draftEditValue, setDraftEditValue] = useState('')
  const [personalSpace, setPersonalSpace] = useState(() => getPersonalSpace(userId, lang))
  const [showEditPersonal, setShowEditPersonal] = useState(false)
  const [showPersonalAvatarPicker, setShowPersonalAvatarPicker] = useState(false)
  const [editName, setEditName] = useState('')

  const openEditPersonal = () => {
    setEditName(personalSpace.name)
    setShowEditPersonal(true)
  }

  const saveEditPersonal = () => {
    const next = { ...personalSpace, name: editName.trim() || personalSpace.name }
    savePersonalSpace(userId, next)
    setPersonalSpace(next)
    setShowEditPersonal(false)
    onPersonalSpaceChange?.()
  }

  const savePersonalAvatar = async (blob) => {
    const dataUrl = await blobToDataUrl(blob)
    const next = { ...personalSpace, avatar: dataUrl }
    savePersonalSpace(userId, next)
    setPersonalSpace(next)
    onPersonalSpaceChange?.()
  }

  const sortedPlans = useMemo(() => [...plans].sort(byRecency), [plans])
  const visiblePlans = isTeam ? sortedPlans : sortedPlans.slice(0, RECENT_PLANS_LIMIT)

  const stats = useMemo(() => {
    if (!isTeam) return null
    const lastActivity = plans.reduce((latest, p) => {
      const candidate = p.changeLog?.[0]?.date || p.updatedAt || p.savedAt || p.generatedAt
      if (!candidate) return latest
      return !latest || candidate > latest ? candidate : latest
    }, null)
    const totalBudget = plans.reduce((sum, p) => sum + (p.marketing?.totalBudget || 0), 0)
    return {
      planCount: plans.length,
      memberCount: team.members?.length || 0,
      lastActivity,
      totalBudget
    }
  }, [isTeam, plans, team.members])

  const confirmDelete = () => {
    deletePlan(deleteTarget.id)
    setPlans(getAllPlans())
    setDeleteTarget(null)
  }

  const handleDuplicate = (plan) => {
    const copy = duplicatePlan(plan, lang)
    setPlans(getAllPlans())
    onLoadPlan(copy)
  }

  const handleToggleFavorite = (e, plan) => {
    e.stopPropagation()
    toggleFavorite(plan)
    setPlans(getAllPlans())
  }

  // Modale dédiée plutôt qu'édition inline dans la carte : account-list-item-main est un
  // <button> (clic = charger le brouillon), et un <input> imbriqué dedans se comporte de
  // façon peu fiable selon les navigateurs (même problème déjà rencontré et corrigé pour le
  // renommage des plans dans la galerie — voir GalleryPage.jsx).
  const openRenameDraft = (draft) => {
    setRenameDraftTarget(draft)
    setDraftEditValue(draft.name)
  }

  const commitRenameDraft = () => {
    const trimmed = draftEditValue.trim()
    if (trimmed && trimmed !== renameDraftTarget.name) {
      renameDraft(renameDraftTarget.id, trimmed)
      setDrafts(getAllDrafts())
    }
    setRenameDraftTarget(null)
  }

  const confirmDeleteDraft = () => {
    deleteDraft(deleteDraftTarget.id)
    setDrafts(getAllDrafts())
    setDeleteDraftTarget(null)
  }

  return (
    <div className="space-page">
      <div className="space-page-header">
        <button className="team-back-btn" onClick={onBack}>
          <IconArrowLeft width={16} height={16} /> {t(lang, 'auth.backToHome')}
        </button>
        <div className="space-page-title">
          {isTeam ? (
            team.teamImageUrl ? (
              <img className="space-page-avatar" src={team.teamImageUrl} alt="" />
            ) : (
              <span className="space-page-avatar" style={{ background: teamColor(team.teamId) }}>
                {(team.teamName || '?').trim().charAt(0).toUpperCase()}
              </span>
            )
          ) : personalSpace.avatar ? (
            <img className="space-page-avatar" src={personalSpace.avatar} alt="" />
          ) : user?.imageUrl ? (
            <img className="space-page-avatar" src={user.imageUrl} alt="" />
          ) : (
            <span className="space-page-avatar space-page-avatar-personal"><IconUser width={20} height={20} /></span>
          )}
          <div>
            <h1>{isTeam ? team.teamName : personalSpace.name}</h1>
            <p>{isTeam
              ? (lang === 'fr' ? 'Espace équipe · partagé avec tous les membres' : 'Team space · shared with every member')
              : (lang === 'fr' ? 'Espace personnel · visible par vous seul' : 'Personal space · only visible to you')}</p>
          </div>
          {!isTeam && (
            <button className="space-page-edit-btn" onClick={openEditPersonal} title={lang === 'fr' ? "Personnaliser l'espace" : 'Customize space'}>
              <IconPencil width={14} height={14} />
            </button>
          )}
        </div>
        {isTeam && (
          <button className="btn-secondary space-page-settings-btn" onClick={onOpenTeamSettings}>
            <IconSettings width={14} height={14} /> {t(lang, 'team.membersTitle')}
          </button>
        )}
      </div>

      {isTeam && stats && (
        <div className="space-dashboard">
          <div className="space-dashboard-tile">
            <span className="space-dashboard-icon"><IconClipboard width={16} height={16} /></span>
            <span className="space-dashboard-value">{stats.planCount}</span>
            <span className="space-dashboard-label">{lang === 'fr' ? 'Plans partagés' : 'Shared plans'}</span>
          </div>
          <div className="space-dashboard-tile">
            <span className="space-dashboard-icon"><IconUsers width={16} height={16} /></span>
            <span className="space-dashboard-value">{stats.memberCount}</span>
            <span className="space-dashboard-label">{lang === 'fr' ? 'Membres' : 'Members'}</span>
          </div>
          <div className="space-dashboard-tile">
            <span className="space-dashboard-icon"><IconCoin width={16} height={16} /></span>
            <span className="space-dashboard-value">{stats.totalBudget.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')}€</span>
            <span className="space-dashboard-label">{lang === 'fr' ? 'Budget cumulé' : 'Combined budget'}</span>
          </div>
          <div className="space-dashboard-tile">
            <span className="space-dashboard-icon"><IconClock width={16} height={16} /></span>
            <span className="space-dashboard-value space-dashboard-value-sm">
              {stats.lastActivity ? formatFullDateTime(stats.lastActivity, lang) : (lang === 'fr' ? 'Aucune' : 'None')}
            </span>
            <span className="space-dashboard-label">{lang === 'fr' ? 'Dernière activité' : 'Last activity'}</span>
          </div>
        </div>
      )}

      <div className="space-page-section card">
        <div className="space-page-section-head">
          <h3><IconClipboard width={16} height={16} /> {isTeam
            ? (lang === 'fr' ? 'Plans partagés' : 'Shared plans')
            : (lang === 'fr' ? 'Derniers plans actifs' : 'Recently active plans')}</h3>
          <button className="btn-primary space-page-new-btn" onClick={onCreatePlan}>
            <IconPlus width={14} height={14} /> {t(lang, 'sidebar.createPlan')}
          </button>
        </div>
        {visiblePlans.length === 0 ? (
          <p className="account-empty">{t(lang, 'account.noPlans')}</p>
        ) : (
          <div className="account-list">
            {visiblePlans.map(p => (
              <div key={p.id} className="account-list-item">
                <button className="account-list-item-main has-thumb" onClick={() => onLoadPlan(p)}>
                  {p.coverImage
                    ? <img src={p.coverImage} alt="" className="account-list-item-thumb" />
                    : <div className="account-list-item-thumb account-list-item-thumb-placeholder" aria-hidden="true" />}
                  <div className="account-list-item-text">
                    <span className="account-list-item-name">
                      {p.product?.name}
                      {(p.isDemo || p.id?.startsWith('demo-')) && <span className="plan-demo-badge">{lang === 'fr' ? 'Démo' : 'Demo'}</span>}
                    </span>
                    <span className="account-list-item-meta">{p.classification}</span>
                    <span className="plan-origin-tag">
                      <span className={`plan-origin-dot ${p.createdSpaceId ? 'is-team' : 'is-personal'}`} />
                      {p.createdSpaceId ? (p.createdSpaceName || t(lang, 'team.myTeams')) : t(lang, 'team.personalSpace')}
                      {p.createdByName && ` · ${p.createdByName}`}
                      {' · '}{formatFullDateTime(p.updatedAt || p.savedAt, lang)}
                    </span>
                  </div>
                </button>
                <button
                  className={`account-list-item-favorite ${p.isFavorite ? 'is-favorite' : ''}`}
                  onClick={(e) => handleToggleFavorite(e, p)}
                  title={p.isFavorite ? t(lang, 'gallery.favoriteRemove') : t(lang, 'gallery.favoriteAdd')}
                >
                  {p.isFavorite ? '⭐' : '☆'}
                </button>
                <button className="account-list-item-move" onClick={() => handleDuplicate(p)} title={t(lang, 'plans.duplicate')}>
                  <IconCopy width={14} height={14} />
                </button>
                <button className="account-list-item-delete" onClick={() => setDeleteTarget(p)} title="Delete">
                  <IconTrash width={14} height={14} />
                </button>
              </div>
            ))}
          </div>
        )}
        {!isTeam && sortedPlans.length > 0 && (
          <button className="space-page-see-all" onClick={onSeeFullHistory}>
            {lang === 'fr' ? "Voir l'historique complet →" : 'See full history →'}
          </button>
        )}
      </div>

      {!isTeam && (
        <button className="space-page-section card space-page-gallery-link" onClick={onOpenHistory}>
          <IconClipboard width={18} height={18} />
          <div>
            <h3>{lang === 'fr' ? 'Mes plans' : 'My plans'}</h3>
            <p>{lang === 'fr' ? 'Recherchez, partagez ou dupliquez n\'importe lequel de vos plans.' : 'Search, share or duplicate any of your plans.'}</p>
          </div>
        </button>
      )}

      {!isTeam && (
        <button className="space-page-section card space-page-gallery-link" onClick={onOpenGallery}>
          <IconImage width={18} height={18} />
          <div>
            <h3>{t(lang, 'gallery.title')}</h3>
            <p>{t(lang, 'gallery.subtitle')}</p>
          </div>
        </button>
      )}

      {!isTeam && (
        <div className="space-page-section card">
          <div className="space-page-section-head">
            <h3><span className="space-page-icon-accent"><IconSave width={18} height={18} /></span> {t(lang, 'account.draftsSectionTitle')}</h3>
          </div>
          {drafts.length === 0 ? (
            <p className="space-page-plain-note">{t(lang, 'account.noDrafts')}</p>
          ) : (
            <div className="account-list">
              {drafts.map(d => (
                <div key={d.id} className="account-list-item">
                  <button className="account-list-item-main" onClick={() => onLoadDraft(d.data)}>
                    <span className="account-list-item-name">{d.name}</span>
                  </button>
                  <button className="account-list-item-move" onClick={() => openRenameDraft(d)} title={lang === 'fr' ? 'Renommer' : 'Rename'}>
                    <IconPencil width={14} height={14} />
                  </button>
                  <button className="account-list-item-delete" onClick={() => setDeleteDraftTarget(d)} title="Delete">
                    <IconTrash width={14} height={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showEditPersonal && (
        <InfoModal
          icon={<IconPencil width={22} height={22} />}
          title={lang === 'fr' ? "Personnaliser l'espace" : 'Customize space'}
          onClose={() => setShowEditPersonal(false)}
        >
          <div className="space-edit-avatar-row">
            {personalSpace.avatar ? (
              <img className="space-edit-avatar-preview" src={personalSpace.avatar} alt="" />
            ) : (
              <span className="space-edit-avatar-preview space-page-avatar-personal"><IconUser width={20} height={20} /></span>
            )}
            <button className="btn-secondary" onClick={() => setShowPersonalAvatarPicker(true)}>
              {lang === 'fr' ? "Changer l'avatar" : 'Change avatar'}
            </button>
          </div>
          <label className="space-edit-label">{lang === 'fr' ? "Nom de l'espace" : 'Space name'}</label>
          <input
            className="team-create-input"
            type="text"
            value={editName}
            onChange={e => setEditName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && saveEditPersonal()}
            autoFocus
          />
          <div className="unsaved-changes-actions">
            <button className="btn-secondary" onClick={() => setShowEditPersonal(false)}>{t(lang, 'plans.cancel')}</button>
            <button className="btn-primary" onClick={saveEditPersonal} disabled={!editName.trim()}>{t(lang, 'app.save')}</button>
          </div>
        </InfoModal>
      )}

      {showPersonalAvatarPicker && (
        <AvatarPicker
          lang={lang}
          title={lang === 'fr' ? "Avatar de l'espace personnel" : 'Personal space avatar'}
          onSave={savePersonalAvatar}
          onClose={() => setShowPersonalAvatarPicker(false)}
        />
      )}

      {deleteTarget && (
        <div className="confirm-modal-backdrop" onClick={() => setDeleteTarget(null)}>
          <div className="confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="confirm-modal-icon"><IconAlertTriangle width={22} height={22} /></div>
            <h3>{t(lang, 'plans.deleteConfirmTitle')}</h3>
            <p><strong>{deleteTarget.product?.name || t(lang, 'plans.defaultPlanName')}</strong> {t(lang, 'plans.deleteConfirmSuffix')}</p>
            <div className="confirm-modal-actions">
              <button className="btn-secondary" onClick={() => setDeleteTarget(null)}>{t(lang, 'plans.cancel')}</button>
              <button className="btn-danger" onClick={confirmDelete}>{t(lang, 'plans.delete')}</button>
            </div>
          </div>
        </div>
      )}

      {renameDraftTarget && (
        <div className="confirm-modal-backdrop" onClick={() => setRenameDraftTarget(null)}>
          <div className="confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="confirm-modal-icon"><IconPencil width={22} height={22} /></div>
            <h3>{lang === 'fr' ? 'Renommer le brouillon' : 'Rename draft'}</h3>
            <input
              type="text"
              className="gallery-rename-input"
              value={draftEditValue}
              autoFocus
              onChange={(e) => setDraftEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); commitRenameDraft() }
                if (e.key === 'Escape') { e.preventDefault(); setRenameDraftTarget(null) }
              }}
            />
            <div className="confirm-modal-actions">
              <button className="btn-secondary" onClick={() => setRenameDraftTarget(null)}>{t(lang, 'plans.cancel')}</button>
              <button className="btn-primary" onClick={commitRenameDraft} disabled={!draftEditValue.trim()}>{t(lang, 'app.save')}</button>
            </div>
          </div>
        </div>
      )}

      {deleteDraftTarget && (
        <div className="confirm-modal-backdrop" onClick={() => setDeleteDraftTarget(null)}>
          <div className="confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="confirm-modal-icon"><IconAlertTriangle width={22} height={22} /></div>
            <h3>{t(lang, 'plans.deleteDraftConfirmTitle')}</h3>
            <p><strong>{deleteDraftTarget.name || t(lang, 'plans.defaultDraftName')}</strong> {t(lang, 'plans.deleteDraftConfirmSuffix')}</p>
            <div className="confirm-modal-actions">
              <button className="btn-secondary" onClick={() => setDeleteDraftTarget(null)}>{t(lang, 'plans.cancel')}</button>
              <button className="btn-danger" onClick={confirmDeleteDraft}>{t(lang, 'plans.delete')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
