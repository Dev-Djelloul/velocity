import { useMemo, useState } from 'react'
import { t } from '../lib/i18n'
import { useTeam } from '../lib/auth'
import { getAllPlans, deletePlan } from '../lib/planStorage'
import { formatFullDateTime } from '../lib/dateFormat'
import { IconArrowLeft, IconUsers, IconUser, IconClipboard, IconBarChart, IconCoin, IconClock, IconPlus, IconTrash, IconSettings, IconAlertTriangle } from './Icons'
import '../styles/SpacePage.css'

// Page dédiée à l'espace actif (personnel ou équipe), pour piloter ce qu'il contient sans
// repasser par "Mon compte" à chaque fois — celui-ci reste focalisé sur l'identité/les
// crédits, pas sur le contenu d'un espace de travail donné.
export default function SpacePage({ lang, onBack, onLoadPlan, onCreatePlan, onOpenTeamSettings }) {
  const team = useTeam()
  const isTeam = !!team.teamId
  const [plans, setPlans] = useState(getAllPlans)
  const [deleteTarget, setDeleteTarget] = useState(null)

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

  return (
    <div className="space-page">
      <div className="space-page-header">
        <button className="team-back-btn" onClick={onBack}>
          <IconArrowLeft width={16} height={16} /> {t(lang, 'auth.backToHome')}
        </button>
        <div className="space-page-title">
          {isTeam ? (
            <span className="space-page-avatar">{(team.teamName || '?').trim().charAt(0).toUpperCase()}</span>
          ) : (
            <span className="space-page-avatar space-page-avatar-personal"><IconUser width={20} height={20} /></span>
          )}
          <div>
            <h1>{isTeam ? team.teamName : t(lang, 'team.personalSpace')}</h1>
            <p>{isTeam
              ? (lang === 'fr' ? 'Espace équipe · partagé avec tous les membres' : 'Team space · shared with every member')
              : (lang === 'fr' ? 'Espace personnel · visible par vous seul' : 'Personal space · only visible to you')}</p>
          </div>
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
          <h3><IconClipboard width={16} height={16} /> {lang === 'fr' ? 'Plans' : 'Plans'}</h3>
          <button className="btn-primary space-page-new-btn" onClick={onCreatePlan}>
            <IconPlus width={14} height={14} /> {t(lang, 'sidebar.createPlan')}
          </button>
        </div>
        {plans.length === 0 ? (
          <p className="account-empty">{t(lang, 'account.noPlans')}</p>
        ) : (
          <div className="account-list">
            {plans.map(p => (
              <div key={p.id} className="account-list-item">
                <button className="account-list-item-main" onClick={() => onLoadPlan(p)}>
                  <span className="account-list-item-name">{p.product?.name}</span>
                  <span className="account-list-item-meta">{p.classification}</span>
                </button>
                <button className="account-list-item-delete" onClick={() => setDeleteTarget(p)} title="Delete">
                  <IconTrash width={14} height={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {!isTeam && (
        <div className="space-page-section card space-page-upsell">
          <IconBarChart width={20} height={20} />
          <div>
            <h3>{lang === 'fr' ? 'Envie de collaborer ?' : 'Want to collaborate?'}</h3>
            <p>{lang === 'fr'
              ? 'Crée une équipe pour partager tes plans, commenter et assigner des tâches à plusieurs.'
              : 'Create a team to share your plans, comment and assign tasks with others.'}</p>
          </div>
        </div>
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
    </div>
  )
}
