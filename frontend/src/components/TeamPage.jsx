import { OrganizationProfile } from '@clerk/clerk-react'
import { t } from '../lib/i18n'
import { useTeam, isMockAuth } from '../lib/auth'
import { IconArrowLeft, IconUsers, IconShield, IconUser } from './Icons'
import '../styles/TeamPage.css'

// Thème Clerk aligné sur le design system, même principe que AuthPage — mais ici le
// composant garde son propre fond de carte (contrairement au formulaire de connexion) :
// OrganizationProfile est un panneau à onglets (Général/Membres/Danger), il a besoin de
// sa propre surface visible plutôt que de se fondre dans la page.
const clerkAppearance = {
  variables: {
    colorPrimary: '#9184d9',
    colorBackground: '#141922',
    colorText: '#e9e9ed',
    colorTextSecondary: '#a3a3ad',
    colorInputBackground: 'rgba(20, 22, 30, 0.6)',
    colorInputText: '#e9e9ed',
    borderRadius: '10px',
    fontFamily: 'inherit'
  }
}

export default function TeamPage({ lang, onBack }) {
  const team = useTeam()

  return (
    <div className="team-page">
      <div className="team-page-header">
        <button className="team-back-btn" onClick={onBack}>
          <IconArrowLeft width={16} height={16} /> {t(lang, 'auth.backToHome')}
        </button>
        <div className="team-page-title">
          <IconUsers width={22} height={22} />
          <div>
            <h1>{team.teamName || t(lang, 'team.membersTitle')}</h1>
            {team.teamId && <p>{team.isAdmin ? t(lang, 'team.roleAdmin') : t(lang, 'team.roleMember')}</p>}
          </div>
        </div>
      </div>

      {!team.teamId && (
        <div className="team-page-empty card">
          <p>{t(lang, 'team.noTeamActive')}</p>
        </div>
      )}

      {team.teamId && isMockAuth && (
        <div className="team-page-mock card">
          <p className="team-mock-notice">{t(lang, 'team.mockNotice')}</p>
          <h3>{t(lang, 'team.membersTitle')}</h3>
          <ul className="team-mock-members">
            {(team.members || []).map(member => (
              <li key={member.id} className="team-mock-member">
                <span className="team-mock-member-icon"><IconUser width={16} height={16} /></span>
                <span className="team-mock-member-name">{member.name}</span>
                <span className={`team-mock-member-role ${member.role === 'org:admin' ? 'admin' : ''}`}>
                  {member.role === 'org:admin' ? <IconShield width={12} height={12} /> : null}
                  {member.role === 'org:admin' ? t(lang, 'team.roleAdmin') : t(lang, 'team.roleMember')}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {team.teamId && !isMockAuth && (
        <div className="team-page-clerk">
          <OrganizationProfile routing="virtual" appearance={clerkAppearance} />
        </div>
      )}
    </div>
  )
}
