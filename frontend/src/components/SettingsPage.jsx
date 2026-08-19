import { t } from '../lib/i18n'
import { IconArrowLeft, IconSun, IconMoon, IconClock, IconSettings } from './Icons'
import '../styles/AccountPage.css'
import '../styles/SettingsPage.css'

// Sélection volontairement restreinte à des fuseaux courants plutôt que la liste IANA
// complète (~400 entrées) — largement suffisant pour une équipe qui veut juste fixer un
// fuseau de référence, sans noyer l'utilisateur dans un menu interminable.
const COMMON_TIMEZONES = [
  'Europe/Paris', 'Europe/London', 'Europe/Madrid', 'Europe/Berlin', 'Europe/Lisbon',
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'America/Sao_Paulo',
  'Africa/Algiers', 'Africa/Casablanca', 'Africa/Cairo',
  'Asia/Dubai', 'Asia/Kolkata', 'Asia/Shanghai', 'Asia/Tokyo', 'Asia/Singapore',
  'Australia/Sydney', 'Pacific/Auckland', 'UTC'
]

export default function SettingsPage({
  lang, theme, onToggleTheme, onChangeLang, timezone, onChangeTimezone,
  reduceMotion, onToggleReduceMotion, fontSize, onChangeFontSize,
  highContrast, onToggleHighContrast, dateFormat, onChangeDateFormat,
  currency, onChangeCurrency, onBack
}) {
  return (
    <div className="account-page">
      <button className="account-back-btn" onClick={onBack}>
        <IconArrowLeft width={16} height={16} /> {t(lang, 'settings.backToApp')}
      </button>

      <h2 className="settings-page-title"><IconSettings width={20} height={20} /> {t(lang, 'settings.title')}</h2>

      <div className="account-section card">
        <h3>{t(lang, 'settings.accessibilityTitle')}</h3>

        <div className="settings-row">
          <div>
            <p className="settings-row-label">{t(lang, 'settings.fontSizeLabel')}</p>
            <p className="account-security-note">{t(lang, 'settings.fontSizeBody')}</p>
          </div>
          <div className="settings-toggle-group">
            <button className={fontSize === 'normal' ? 'active' : ''} onClick={() => onChangeFontSize('normal')}>{t(lang, 'settings.fontSizeNormal')}</button>
            <button className={fontSize === 'large' ? 'active' : ''} onClick={() => onChangeFontSize('large')}>{t(lang, 'settings.fontSizeLarge')}</button>
            <button className={fontSize === 'xlarge' ? 'active' : ''} onClick={() => onChangeFontSize('xlarge')}>{t(lang, 'settings.fontSizeXLarge')}</button>
          </div>
        </div>

        <div className="settings-row">
          <div>
            <p className="settings-row-label">{t(lang, 'settings.highContrastLabel')}</p>
            <p className="account-security-note">{t(lang, 'settings.highContrastBody')}</p>
          </div>
          <button
            className={`settings-switch ${highContrast ? 'is-on' : ''}`}
            role="switch"
            aria-checked={highContrast}
            onClick={onToggleHighContrast}
          >
            <span className="settings-switch-thumb" />
          </button>
        </div>

        <div className="settings-row">
          <div>
            <p className="settings-row-label">{t(lang, 'settings.reduceMotionLabel')}</p>
            <p className="account-security-note">{t(lang, 'settings.reduceMotionBody')}</p>
          </div>
          <button
            className={`settings-switch ${reduceMotion ? 'is-on' : ''}`}
            role="switch"
            aria-checked={reduceMotion}
            onClick={onToggleReduceMotion}
          >
            <span className="settings-switch-thumb" />
          </button>
        </div>
      </div>

      <div className="account-section card">
        <h3>{t(lang, 'settings.languageTitle')}</h3>
        <p className="account-security-note">{t(lang, 'settings.languageBody')}</p>
        <div className="settings-toggle-group">
          <button className={lang === 'fr' ? 'active' : ''} onClick={() => onChangeLang('fr')}>FR</button>
          <button className={lang === 'en' ? 'active' : ''} onClick={() => onChangeLang('en')}>EN</button>
        </div>
      </div>

      <div className="account-section card">
        <h3><IconClock width={16} height={16} /> {t(lang, 'settings.timezoneTitle')}</h3>
        <p className="account-security-note">{t(lang, 'settings.timezoneBody')}</p>
        <select
          className="settings-select"
          value={timezone}
          onChange={(e) => onChangeTimezone(e.target.value)}
        >
          <option value="auto">{t(lang, 'settings.timezoneAuto')}</option>
          {COMMON_TIMEZONES.map(tz => (
            <option key={tz} value={tz}>{tz.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      <div className="account-section card">
        <h3>{t(lang, 'settings.formatsTitle')}</h3>

        <div className="settings-row">
          <div>
            <p className="settings-row-label">{t(lang, 'settings.dateFormatLabel')}</p>
            <p className="account-security-note">{t(lang, 'settings.dateFormatBody')}</p>
          </div>
          <select className="settings-select" value={dateFormat} onChange={(e) => onChangeDateFormat(e.target.value)}>
            <option value="auto">{t(lang, 'settings.dateFormatAuto')}</option>
            <option value="dmy">{t(lang, 'settings.dateFormatDMY')}</option>
            <option value="mdy">{t(lang, 'settings.dateFormatMDY')}</option>
          </select>
        </div>

        <div className="settings-row">
          <div>
            <p className="settings-row-label">{t(lang, 'settings.currencyLabel')}</p>
            <p className="account-security-note">{t(lang, 'settings.currencyBody')}</p>
          </div>
          <select className="settings-select" value={currency} onChange={(e) => onChangeCurrency(e.target.value)}>
            <option value="EUR">EUR (€)</option>
            <option value="USD">USD ($)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>
      </div>

      <div className="account-section card">
        <h3>{t(lang, 'settings.appearanceTitle')}</h3>
        <div className="settings-row">
          <div>
            <p className="settings-row-label">{t(lang, 'settings.themeLabel')}</p>
          </div>
          <div className="settings-toggle-group">
            <button className={theme === 'dark' ? 'active' : ''} onClick={() => theme !== 'dark' && onToggleTheme()}>
              <IconMoon width={14} height={14} /> {t(lang, 'settings.themeDark')}
            </button>
            <button className={theme === 'light' ? 'active' : ''} onClick={() => theme !== 'light' && onToggleTheme()}>
              <IconSun width={14} height={14} /> {t(lang, 'settings.themeLight')}
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}
