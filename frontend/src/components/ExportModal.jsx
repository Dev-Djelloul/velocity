import { t } from '../lib/i18n'
import { exportJSON, exportCSV, exportPDF, exportPPTX, exportImage } from '../lib/pdfExport'
import { exportGithubIssues, exportJira } from '../lib/issueExport'
import '../styles/ExportModal.css'

export default function ExportModal({ plan, lang, onClose, captureRef }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal card" onClick={e => e.stopPropagation()}>
        <h3>{t(lang, 'export.title')}</h3>
        <div className="modal-actions">
          <button className="btn-primary" onClick={() => exportPDF(plan, lang)}>{t(lang, 'export.pdf')}</button>
          <button className="btn-primary" onClick={() => exportPPTX(plan, lang)}>{t(lang, 'export.pptx')}</button>
          <button className="btn-primary" onClick={() => exportCSV(plan, lang)}>{t(lang, 'export.csv')}</button>
          <button className="btn-secondary" onClick={() => exportJSON(plan)}>{t(lang, 'export.json')}</button>
          <button className="btn-secondary" onClick={() => exportImage(captureRef?.current, plan)}>{t(lang, 'export.image')}</button>
          <button className="btn-secondary" onClick={() => exportGithubIssues(plan)}>{t(lang, 'export.github')}</button>
          <button className="btn-secondary" onClick={() => exportJira(plan)}>{t(lang, 'export.jira')}</button>
        </div>
        <button className="btn-secondary close-btn" onClick={onClose}>{t(lang, 'export.close')}</button>
      </div>
    </div>
  )
}
