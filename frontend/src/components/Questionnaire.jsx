import { useState, useEffect } from 'react'
import { t } from '../lib/i18n'
import '../styles/Questionnaire.css'

const DEFAULT_DATA = {
  product: { name: '', stage: 'mvp', category: 'pm', pitch: '', usp: '', targetUser: 'smb' },
  market: { geography: 'global', b2bVsB2c: 'b2b', segment: '', audienceSize: 's', competition: 'moderate' },
  resources: { timelineWeeks: 'w8', budgetEur: 'b5k', teamSize: 'small', rolesPresent: ['product', 'dev'] },
  priorities: { focus: 'acquire', engagement: 'moderate', riskKnown: 'none', successMetric: 'signups' }
}

function loadInitial() {
  try {
    const saved = localStorage.getItem('plp_form')
    return saved ? JSON.parse(saved) : DEFAULT_DATA
  } catch {
    return DEFAULT_DATA
  }
}

export default function Questionnaire({ onSubmit, loading, lang }) {
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState(loadInitial)

  useEffect(() => {
    localStorage.setItem('plp_form', JSON.stringify(formData))
  }, [formData])

  const handleChange = (section, field, value) => {
    setFormData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }))
  }

  const toggleRole = (role) => {
    setFormData(prev => {
      const roles = prev.resources.rolesPresent.includes(role)
        ? prev.resources.rolesPresent.filter(r => r !== role)
        : [...prev.resources.rolesPresent, role]
      return { ...prev, resources: { ...prev.resources, rolesPresent: roles } }
    })
  }

  const isStepValid = () => {
    if (step === 0) return formData.product.name.trim() && formData.product.pitch.trim() && formData.product.usp.trim()
    if (step === 1) return formData.market.segment.trim()
    return true
  }

  const steps = t(lang, 'steps')

  const Select = ({ section, field, label, options }) => (
    <label className="field">
      <span>{label}</span>
      <select value={formData[section][field]} onChange={e => handleChange(section, field, e.target.value)}>
        {Object.entries(options).map(([key, val]) => (
          <option key={key} value={key}>{val}</option>
        ))}
      </select>
    </label>
  )

  const Text = ({ section, field, label, placeholder, textarea }) => (
    <label className="field">
      <span>{label}</span>
      {textarea ? (
        <textarea rows={3} value={formData[section][field]} placeholder={placeholder}
          onChange={e => handleChange(section, field, e.target.value)} />
      ) : (
        <input type="text" value={formData[section][field]} placeholder={placeholder}
          onChange={e => handleChange(section, field, e.target.value)} />
      )}
    </label>
  )

  return (
    <div className="questionnaire-container card">
      <div className="progress-bar">
        {steps.map((label, i) => (
          <div key={i} className={`step ${i === step ? 'active' : i < step ? 'completed' : ''}`}>
            <span className="step-num">{i + 1}</span>
            <span className="step-label">{label}</span>
          </div>
        ))}
      </div>

      <div className="form-section">
        {step === 0 && (
          <>
            <h2>{t(lang, 'product.title')}</h2>
            <Text section="product" field="name" label={t(lang, 'product.name')} placeholder={t(lang, 'product.namePh')} />
            <Select section="product" field="stage" label={t(lang, 'product.stage')} options={t(lang, 'product.stageOptions')} />
            <Select section="product" field="category" label={t(lang, 'product.category')} options={t(lang, 'product.categoryOptions')} />
            <Text section="product" field="pitch" label={t(lang, 'product.pitch')} placeholder={t(lang, 'product.pitchPh')} textarea />
            <Text section="product" field="usp" label={t(lang, 'product.usp')} placeholder={t(lang, 'product.uspPh')} />
            <Select section="product" field="targetUser" label={t(lang, 'product.targetUser')} options={t(lang, 'product.targetUserOptions')} />
          </>
        )}

        {step === 1 && (
          <>
            <h2>{t(lang, 'market.title')}</h2>
            <Select section="market" field="geography" label={t(lang, 'market.geography')} options={t(lang, 'market.geographyOptions')} />
            <Select section="market" field="b2bVsB2c" label={t(lang, 'market.b2bVsB2c')} options={t(lang, 'market.b2bVsB2cOptions')} />
            <Text section="market" field="segment" label={t(lang, 'market.segment')} placeholder={t(lang, 'market.segmentPh')} />
            <Select section="market" field="audienceSize" label={t(lang, 'market.audienceSize')} options={t(lang, 'market.audienceSizeOptions')} />
            <Select section="market" field="competition" label={t(lang, 'market.competition')} options={t(lang, 'market.competitionOptions')} />
          </>
        )}

        {step === 2 && (
          <>
            <h2>{t(lang, 'resources.title')}</h2>
            <Select section="resources" field="timelineWeeks" label={t(lang, 'resources.timelineWeeks')} options={t(lang, 'resources.timelineOptions')} />
            <Select section="resources" field="budgetEur" label={t(lang, 'resources.budgetEur')} options={t(lang, 'resources.budgetOptions')} />
            <Select section="resources" field="teamSize" label={t(lang, 'resources.teamSize')} options={t(lang, 'resources.teamSizeOptions')} />
            <div className="field">
              <span>{t(lang, 'resources.rolesPresent')}</span>
              <div className="chip-group">
                {Object.entries(t(lang, 'resources.roles')).map(([key, label]) => (
                  <button type="button" key={key}
                    className={`chip ${formData.resources.rolesPresent.includes(key) ? 'active' : ''}`}
                    onClick={() => toggleRole(key)}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2>{t(lang, 'priorities.title')}</h2>
            <Select section="priorities" field="focus" label={t(lang, 'priorities.focus')} options={t(lang, 'priorities.focusOptions')} />
            <Select section="priorities" field="engagement" label={t(lang, 'priorities.engagement')} options={t(lang, 'priorities.engagementOptions')} />
            <Select section="priorities" field="riskKnown" label={t(lang, 'priorities.riskKnown')} options={t(lang, 'priorities.riskOptions')} />
            <Select section="priorities" field="successMetric" label={t(lang, 'priorities.successMetric')} options={t(lang, 'priorities.successOptions')} />
          </>
        )}
      </div>

      <div className="button-group">
        <button className="btn-secondary" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
          {t(lang, 'nav.previous')}
        </button>
        {step < steps.length - 1 ? (
          <button className="btn-primary" onClick={() => setStep(step + 1)} disabled={!isStepValid()}>
            {t(lang, 'nav.next')}
          </button>
        ) : (
          <button className="btn-primary" onClick={() => onSubmit(formData)} disabled={loading}>
            {loading ? t(lang, 'nav.generating') : t(lang, 'nav.generate')}
          </button>
        )}
      </div>
    </div>
  )
}
