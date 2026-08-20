import { useState, useEffect, useRef } from 'react'
import { t } from '../lib/i18n'
import { saveDraft } from '../lib/draftStorage'
import { extractText } from '../lib/documentParser'
import { IconSave, IconClipboard, IconUpload, IconTrash, IconFileText } from './Icons'
import '../styles/Questionnaire.css'

const DEFAULT_DATA = {
  product: { name: '', stage: 'mvp', category: 'pm', pitch: '', usp: '', targetUser: 'smb' },
  market: { geography: 'global', b2bVsB2c: 'b2b', segment: '', audienceSize: 's', competition: 'moderate' },
  resources: { timelineWeeks: 'w8', totalBudget: 'b10k', budgetEur: 'b5k', teamSize: 'small', rolesPresent: ['product', 'dev'] },
  priorities: { focus: 'acquire', engagement: 'moderate', riskKnown: 'none', successMetric: 'signups', rulesFlags: [] },
  context: '',
  contextDocument: '',
  contextDocumentName: ''
}

const DOCUMENT_ERROR_KEYS = {
  'file-too-large': 'priorities.contextDocumentErrorTooLarge',
  'unsupported-format': 'priorities.contextDocumentErrorFormat',
  'empty-text': 'priorities.contextDocumentErrorEmpty',
  'extraction-failed': 'priorities.contextDocumentErrorGeneric'
}

// Fusionne avec DEFAULT_DATA (par section) plutôt que de renvoyer les données brutes : un
// brouillon ou un plan sauvegardé avant l'ajout d'un champ (ex: resources.totalBudget) ne
// l'aurait sinon jamais, laissant un <select> sans valeur correspondante.
function mergeWithDefaults(data) {
  if (!data) return DEFAULT_DATA
  return {
    ...DEFAULT_DATA,
    ...data,
    product: { ...DEFAULT_DATA.product, ...data.product },
    market: { ...DEFAULT_DATA.market, ...data.market },
    resources: { ...DEFAULT_DATA.resources, ...data.resources },
    priorities: { ...DEFAULT_DATA.priorities, ...data.priorities }
  }
}

function loadInitial(initialData) {
  if (initialData) return mergeWithDefaults(initialData)
  try {
    const saved = localStorage.getItem('plp_form')
    return saved ? mergeWithDefaults(JSON.parse(saved)) : DEFAULT_DATA
  } catch {
    return DEFAULT_DATA
  }
}

function FieldHelp({ text, glossary, options }) {
  const [show, setShow] = useState(false)
  if (!text && !glossary) return null
  return (
    <span className="field-help-wrap" onMouseLeave={() => setShow(false)}>
      <button
        type="button"
        className="field-help-btn"
        aria-label="Aide"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShow(v => !v) }}
        onMouseEnter={() => setShow(true)}
      >
        i
      </button>
      {show && (
        <div className="field-help-popover" onClick={(e) => { e.preventDefault(); e.stopPropagation() }}>
          {glossary ? (
            <ul>
              {Object.entries(options).map(([key, val]) => glossary[key] && (
                <li key={key}><strong>{val}</strong> — {glossary[key]}</li>
              ))}
            </ul>
          ) : (
            <p>{text}</p>
          )}
        </div>
      )}
    </span>
  )
}

function Select({ formData, onChange, section, field, label, options, glossary, help }) {
  return (
    <label className="field">
      <span className="field-label-row">
        {label}
        <FieldHelp text={help} glossary={glossary} options={options} />
      </span>
      <select value={formData[section][field]} onChange={e => onChange(section, field, e.target.value)}>
        {Object.entries(options).map(([key, val]) => (
          <option key={key} value={key}>{val}</option>
        ))}
      </select>
    </label>
  )
}

// Progression organique façon "trickle" : avance vite au début puis ralentit
// asymptotiquement sans jamais s'arrêter complètement tant que loading est vrai,
// pour donner une sensation de travail réel plutôt qu'un minuteur linéaire fixe.
function nextIncrement(progress) {
  const jitter = 0.6 + Math.random() * 0.8
  if (progress < 20) return 2.4 * jitter
  if (progress < 45) return 1.1 * jitter
  if (progress < 70) return 0.5 * jitter
  if (progress < 88) return 0.2 * jitter
  if (progress < 97) return 0.06 * jitter
  return 0.015 * jitter
}

const STEP_THRESHOLDS = [22, 48, 74, 100]

function Text({ formData, onChange, section, field, label, placeholder, textarea, help }) {
  return (
    <label className="field">
      <span className="field-label-row">
        {label}
        <FieldHelp text={help} />
      </span>
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

export default function Questionnaire({ onSubmit, loading, lang, onShowDrafts, initialData }) {
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState(() => loadInitial(initialData))
  const [draftSaved, setDraftSaved] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [docLoading, setDocLoading] = useState(false)
  const [docError, setDocError] = useState(null)
  const [docTruncated, setDocTruncated] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    localStorage.setItem('plp_form', JSON.stringify(formData))
  }, [formData])

  useEffect(() => {
    if (!loading) {
      setLoadingStep(0)
      return
    }
    const interval = setInterval(() => {
      setLoadingStep(p => Math.min(p + nextIncrement(p), 99.5))
    }, 100)
    return () => clearInterval(interval)
  }, [loading])

  const handleChange = (section, field, value) => {
    setFormData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }))
  }

  const handleContextChange = (value) => {
    setFormData(prev => ({ ...prev, context: value }))
  }

  const handleContextDocumentChange = (value) => {
    setFormData(prev => ({ ...prev, contextDocument: value }))
  }

  const handleDocumentSelect = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // permet de re-sélectionner le même fichier après un retrait
    if (!file) return

    setDocError(null)
    setDocTruncated(false)
    setDocLoading(true)
    try {
      const { text, truncated } = await extractText(file)
      setFormData(prev => ({ ...prev, contextDocument: text, contextDocumentName: file.name }))
      setDocTruncated(truncated)
    } catch (err) {
      setDocError(DOCUMENT_ERROR_KEYS[err.code] || 'priorities.contextDocumentErrorGeneric')
    } finally {
      setDocLoading(false)
    }
  }

  const handleDocumentRemove = () => {
    setFormData(prev => ({ ...prev, contextDocument: '', contextDocumentName: '' }))
    setDocError(null)
    setDocTruncated(false)
  }

  const toggleRole = (role) => {
    setFormData(prev => {
      const roles = prev.resources.rolesPresent.includes(role)
        ? prev.resources.rolesPresent.filter(r => r !== role)
        : [...prev.resources.rolesPresent, role]
      return { ...prev, resources: { ...prev.resources, rolesPresent: roles } }
    })
  }

  const toggleRule = (rule) => {
    setFormData(prev => {
      const current = prev.priorities.rulesFlags || []
      const rulesFlags = current.includes(rule) ? current.filter(r => r !== rule) : [...current, rule]
      return { ...prev, priorities: { ...prev.priorities, rulesFlags } }
    })
  }

  const isStepValid = () => {
    if (step === 0) return formData.product.name.trim() && formData.product.pitch.trim() && formData.product.usp.trim()
    if (step === 1) return formData.market.segment.trim()
    return true
  }

  const handleSaveDraft = () => {
    saveDraft(formData, `${t(lang, 'nav.draftNamePrefix')} - ${formData.product.name || t(lang, 'nav.draftUntitled')}`)
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
            <Text formData={formData} onChange={handleChange} section="product" field="name" label={t(lang, 'product.name')} placeholder={t(lang, 'product.namePh')} help={t(lang, 'product.nameHelp')} />
            <Select formData={formData} onChange={handleChange} section="product" field="stage" label={t(lang, 'product.stage')} options={t(lang, 'product.stageOptions')} glossary={t(lang, 'product.stageGlossary')} />
            <Select formData={formData} onChange={handleChange} section="product" field="category" label={t(lang, 'product.category')} options={t(lang, 'product.categoryOptions')} glossary={t(lang, 'product.categoryGlossary')} />
            <Text formData={formData} onChange={handleChange} section="product" field="pitch" label={t(lang, 'product.pitch')} placeholder={t(lang, 'product.pitchPh')} textarea help={t(lang, 'product.pitchHelp')} />
            <Text formData={formData} onChange={handleChange} section="product" field="usp" label={t(lang, 'product.usp')} placeholder={t(lang, 'product.uspPh')} help={t(lang, 'product.uspHelp')} />
            <Select formData={formData} onChange={handleChange} section="product" field="targetUser" label={t(lang, 'product.targetUser')} options={t(lang, 'product.targetUserOptions')} glossary={t(lang, 'product.targetUserGlossary')} />
          </>
        )}

        {step === 1 && (
          <>
            <h2>{t(lang, 'market.title')}</h2>
            <Select formData={formData} onChange={handleChange} section="market" field="geography" label={t(lang, 'market.geography')} options={t(lang, 'market.geographyOptions')} glossary={t(lang, 'market.geographyGlossary')} />
            <Select formData={formData} onChange={handleChange} section="market" field="b2bVsB2c" label={t(lang, 'market.b2bVsB2c')} options={t(lang, 'market.b2bVsB2cOptions')} glossary={t(lang, 'market.b2bVsB2cGlossary')} />
            <Text formData={formData} onChange={handleChange} section="market" field="segment" label={t(lang, 'market.segment')} placeholder={t(lang, 'market.segmentPh')} help={t(lang, 'market.segmentHelp')} />
            <Select formData={formData} onChange={handleChange} section="market" field="audienceSize" label={t(lang, 'market.audienceSize')} options={t(lang, 'market.audienceSizeOptions')} help={t(lang, 'market.audienceSizeHelp')} />
            <Select formData={formData} onChange={handleChange} section="market" field="competition" label={t(lang, 'market.competition')} options={t(lang, 'market.competitionOptions')} glossary={t(lang, 'market.competitionGlossary')} />
          </>
        )}

        {step === 2 && (
          <>
            <h2>{t(lang, 'resources.title')}</h2>
            <Select formData={formData} onChange={handleChange} section="resources" field="timelineWeeks" label={t(lang, 'resources.timelineWeeks')} options={t(lang, 'resources.timelineOptions')} help={t(lang, 'resources.timelineWeeksHelp')} />
            <Select formData={formData} onChange={handleChange} section="resources" field="totalBudget" label={t(lang, 'resources.totalBudget')} options={t(lang, 'resources.totalBudgetOptions')} help={t(lang, 'resources.totalBudgetHelp')} />
            <Select formData={formData} onChange={handleChange} section="resources" field="budgetEur" label={t(lang, 'resources.budgetEur')} options={t(lang, 'resources.budgetOptions')} help={t(lang, 'resources.budgetEurHelp')} />
            <Select formData={formData} onChange={handleChange} section="resources" field="teamSize" label={t(lang, 'resources.teamSize')} options={t(lang, 'resources.teamSizeOptions')} help={t(lang, 'resources.teamSizeHelp')} />
            <div className="field">
              <span className="field-label-row">
                {t(lang, 'resources.rolesPresent')}
                <FieldHelp text={t(lang, 'resources.rolesPresentHelp')} />
              </span>
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
            <Select formData={formData} onChange={handleChange} section="priorities" field="focus" label={t(lang, 'priorities.focus')} options={t(lang, 'priorities.focusOptions')} glossary={t(lang, 'priorities.focusGlossary')} />
            <Select formData={formData} onChange={handleChange} section="priorities" field="engagement" label={t(lang, 'priorities.engagement')} options={t(lang, 'priorities.engagementOptions')} help={t(lang, 'priorities.engagementHelp')} />
            <Select formData={formData} onChange={handleChange} section="priorities" field="riskKnown" label={t(lang, 'priorities.riskKnown')} options={t(lang, 'priorities.riskOptions')} glossary={t(lang, 'priorities.riskGlossary')} />
            <Select formData={formData} onChange={handleChange} section="priorities" field="successMetric" label={t(lang, 'priorities.successMetric')} options={t(lang, 'priorities.successOptions')} glossary={t(lang, 'priorities.successGlossary')} />
            <div className="field">
              <span className="field-label-row">
                {t(lang, 'priorities.rules')}
                <FieldHelp glossary={t(lang, 'priorities.rulesGlossary')} options={t(lang, 'priorities.rulesOptions')} />
              </span>
              <div className="chip-group">
                {Object.entries(t(lang, 'priorities.rulesOptions')).map(([key, label]) => (
                  <button type="button" key={key}
                    className={`chip ${(formData.priorities.rulesFlags || []).includes(key) ? 'active' : ''}`}
                    onClick={() => toggleRule(key)}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <label className="field">
              <span className="field-label-row">
                {t(lang, 'priorities.context')}
                <FieldHelp text={t(lang, 'priorities.contextHelp')} />
              </span>
              <textarea rows={3} value={formData.context} placeholder={t(lang, 'priorities.contextPh')}
                onChange={e => handleContextChange(e.target.value)} />
            </label>

            <div className="field">
              <span className="field-label-row">
                {t(lang, 'priorities.contextDocument')}
                <FieldHelp text={t(lang, 'priorities.contextDocumentHelp')} />
              </span>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.xlsx,.xlsm,.pptx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                onChange={handleDocumentSelect}
                style={{ display: 'none' }}
              />

              {!formData.contextDocumentName && !docLoading && (
                <button type="button" className="btn-secondary btn-import-document" onClick={() => fileInputRef.current?.click()}>
                  <IconUpload width={14} height={14} /> {t(lang, 'priorities.contextDocumentButton')}
                </button>
              )}

              {!formData.contextDocumentName && !docLoading && (
                <p className="field-hint">{t(lang, 'priorities.contextDocumentAccepted')}</p>
              )}

              {docLoading && (
                <p className="field-hint document-reading">
                  <span className="btn-spinner" aria-hidden="true" /> {t(lang, 'priorities.contextDocumentReading')}
                </p>
              )}

              {docError && <p className="field-error">{t(lang, docError)}</p>}

              {formData.contextDocumentName && !docLoading && (
                <div className="document-imported">
                  <div className="document-imported-header">
                    <span className="document-imported-name">
                      <IconFileText width={14} height={14} /> {formData.contextDocumentName}
                    </span>
                    <div className="document-imported-actions">
                      <button type="button" className="btn-link" onClick={() => fileInputRef.current?.click()}>
                        {t(lang, 'priorities.contextDocumentReplace')}
                      </button>
                      <button type="button" className="btn-link btn-link-danger" onClick={handleDocumentRemove}>
                        <IconTrash width={14} height={14} /> {t(lang, 'priorities.contextDocumentRemove')}
                      </button>
                    </div>
                  </div>
                  {docTruncated && <p className="field-hint">{t(lang, 'priorities.contextDocumentTruncated')}</p>}
                  <textarea
                    rows={5}
                    value={formData.contextDocument || ''}
                    onChange={e => handleContextDocumentChange(e.target.value)}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="button-group">
        <div className={`button-group-row${step === steps.length - 1 ? ' button-group-row-last' : ''}`}>
          <button className="btn-secondary" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
            {t(lang, 'nav.previous')}
          </button>
          <button className="btn-secondary" onClick={handleSaveDraft}>
            {draftSaved ? t(lang, 'nav.draftSaved') : <><IconSave width={14} height={14} /> {t(lang, 'nav.continueLater')}</>}
          </button>
          {onShowDrafts && (
            <button className="btn-secondary" onClick={onShowDrafts}>
              <IconClipboard width={14} height={14} /> {t(lang, 'nav.myDrafts')}
            </button>
          )}
        </div>
        {step < steps.length - 1 ? (
          <button className="btn-primary" onClick={() => setStep(step + 1)} disabled={!isStepValid()}>
            {t(lang, 'nav.next')}
          </button>
        ) : (
          <div className="generate-block">
            <button className="btn-primary btn-generate" onClick={() => onSubmit(formData)} disabled={loading}>
              {loading ? <><span className="btn-spinner" aria-hidden="true" /> {t(lang, 'nav.generating')}</> : t(lang, 'nav.generate')}
            </button>
            {loading && (
              <div className="generating-progress">
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: `${loadingStep}%` }}></div>
                </div>
                <p className="generating-text">
                  {t(lang, 'nav.generatingSteps')[STEP_THRESHOLDS.findIndex(threshold => loadingStep < threshold)]}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
