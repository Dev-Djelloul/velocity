import { useState, useEffect } from 'react'
import { t } from '../lib/i18n'
import { saveDraft } from '../lib/draftStorage'
import { IconSave, IconClipboard } from './Icons'
import '../styles/Questionnaire.css'

const DEFAULT_DATA = {
  product: { name: '', stage: 'mvp', category: 'pm', pitch: '', usp: '', targetUser: 'smb' },
  market: { geography: 'global', b2bVsB2c: 'b2b', segment: '', audienceSize: 's', competition: 'moderate' },
  resources: { timelineWeeks: 'w8', budgetEur: 'b5k', teamSize: 'small', rolesPresent: ['product', 'dev'] },
  priorities: { focus: 'acquire', engagement: 'moderate', riskKnown: 'none', successMetric: 'signups' },
  context: ''
}

function loadInitial() {
  try {
    const saved = localStorage.getItem('plp_form')
    return saved ? JSON.parse(saved) : DEFAULT_DATA
  } catch {
    return DEFAULT_DATA
  }
}

function Select({ formData, onChange, section, field, label, options }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={formData[section][field]} onChange={e => onChange(section, field, e.target.value)}>
        {Object.entries(options).map(([key, val]) => (
          <option key={key} value={key}>{val}</option>
        ))}
      </select>
    </label>
  )
}

function Text({ formData, onChange, section, field, label, placeholder, textarea }) {
  return (
    <label className="field">
      <span>{label}</span>
      {textarea ? (
        <textarea rows={3} value={formData[section][field]} placeholder={placeholder}
          onChange={e => onChange(section, field, e.target.value)} />
      ) : (
        <input type="text" value={formData[section][field]} placeholder={placeholder}
          onChange={e => onChange(section, field, e.target.value)} />
      )}
    </label>
  )
}

export default function Questionnaire({ onSubmit, loading, lang, onShowDrafts }) {
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState(loadInitial)
  const [draftSaved, setDraftSaved] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)

  useEffect(() => {
    localStorage.setItem('plp_form', JSON.stringify(formData))
  }, [formData])

  useEffect(() => {
    if (!loading) {
      setLoadingStep(0)
      return
    }
    const steps = t(lang, 'nav.generatingSteps')
    const interval = setInterval(() => setLoadingStep(s => (s + 1) % steps.length), 3500)
    return () => clearInterval(interval)
  }, [loading, lang])

  const handleChange = (section, field, value) => {
    setFormData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }))
  }

  const handleContextChange = (value) => {
    setFormData(prev => ({ ...prev, context: value }))
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

  const handleSaveDraft = () => {
    saveDraft(formData, `Brouillon - ${formData.product.name || 'Sans titre'}`)
    setDraftSaved(true)
    setTimeout(() => setDraftSaved(false), 2000)
  }

  const steps = t(lang, 'steps')

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
            <Text formData={formData} onChange={handleChange} section="product" field="name" label={t(lang, 'product.name')} placeholder={t(lang, 'product.namePh')} />
            <Select formData={formData} onChange={handleChange} section="product" field="stage" label={t(lang, 'product.stage')} options={t(lang, 'product.stageOptions')} />
            <Select formData={formData} onChange={handleChange} section="product" field="category" label={t(lang, 'product.category')} options={t(lang, 'product.categoryOptions')} />
            <Text formData={formData} onChange={handleChange} section="product" field="pitch" label={t(lang, 'product.pitch')} placeholder={t(lang, 'product.pitchPh')} textarea />
            <Text formData={formData} onChange={handleChange} section="product" field="usp" label={t(lang, 'product.usp')} placeholder={t(lang, 'product.uspPh')} />
            <Select formData={formData} onChange={handleChange} section="product" field="targetUser" label={t(lang, 'product.targetUser')} options={t(lang, 'product.targetUserOptions')} />
          </>
        )}

        {step === 1 && (
          <>
            <h2>{t(lang, 'market.title')}</h2>
            <Select formData={formData} onChange={handleChange} section="market" field="geography" label={t(lang, 'market.geography')} options={t(lang, 'market.geographyOptions')} />
            <Select formData={formData} onChange={handleChange} section="market" field="b2bVsB2c" label={t(lang, 'market.b2bVsB2c')} options={t(lang, 'market.b2bVsB2cOptions')} />
            <Text formData={formData} onChange={handleChange} section="market" field="segment" label={t(lang, 'market.segment')} placeholder={t(lang, 'market.segmentPh')} />
            <Select formData={formData} onChange={handleChange} section="market" field="audienceSize" label={t(lang, 'market.audienceSize')} options={t(lang, 'market.audienceSizeOptions')} />
            <Select formData={formData} onChange={handleChange} section="market" field="competition" label={t(lang, 'market.competition')} options={t(lang, 'market.competitionOptions')} />
          </>
        )}

        {step === 2 && (
          <>
            <h2>{t(lang, 'resources.title')}</h2>
            <Select formData={formData} onChange={handleChange} section="resources" field="timelineWeeks" label={t(lang, 'resources.timelineWeeks')} options={t(lang, 'resources.timelineOptions')} />
            <Select formData={formData} onChange={handleChange} section="resources" field="budgetEur" label={t(lang, 'resources.budgetEur')} options={t(lang, 'resources.budgetOptions')} />
            <Select formData={formData} onChange={handleChange} section="resources" field="teamSize" label={t(lang, 'resources.teamSize')} options={t(lang, 'resources.teamSizeOptions')} />
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
            <Select formData={formData} onChange={handleChange} section="priorities" field="focus" label={t(lang, 'priorities.focus')} options={t(lang, 'priorities.focusOptions')} />
            <Select formData={formData} onChange={handleChange} section="priorities" field="engagement" label={t(lang, 'priorities.engagement')} options={t(lang, 'priorities.engagementOptions')} />
            <Select formData={formData} onChange={handleChange} section="priorities" field="riskKnown" label={t(lang, 'priorities.riskKnown')} options={t(lang, 'priorities.riskOptions')} />
            <Select formData={formData} onChange={handleChange} section="priorities" field="successMetric" label={t(lang, 'priorities.successMetric')} options={t(lang, 'priorities.successOptions')} />
            <label className="field">
              <span>{t(lang, 'priorities.context')}</span>
              <textarea rows={3} value={formData.context} placeholder={t(lang, 'priorities.contextPh')}
                onChange={e => handleContextChange(e.target.value)} />
            </label>
          </>
        )}
      </div>

      <div className="button-group">
        <div className="button-group-row">
          <button className="btn-secondary" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
            {t(lang, 'nav.previous')}
          </button>
          <button className="btn-secondary" onClick={handleSaveDraft} title="Sauvegarde en cours...">
            {draftSaved ? '✓ Sauvegardé' : <><IconSave width={14} height={14} /> Continuer plus tard</>}
          </button>
          {onShowDrafts && (
            <button className="btn-secondary" onClick={onShowDrafts}>
              <IconClipboard width={14} height={14} /> Mes brouillons
            </button>
          )}
        </div>
        {step < steps.length - 1 ? (
          <button className="btn-primary" onClick={() => setStep(step + 1)} disabled={!isStepValid()}>
            {t(lang, 'nav.next')}
          </button>
        ) : (
          <div className="generate-block">
            <button className="btn-primary" onClick={() => onSubmit(formData)} disabled={loading}>
              {loading ? t(lang, 'nav.generating') : t(lang, 'nav.generate')}
            </button>
            {loading && (
              <p className="generating-hint">{t(lang, 'nav.generatingSteps')[loadingStep]}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
