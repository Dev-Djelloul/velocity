import { useState } from 'react'
import { t } from '../lib/i18n'
import { generateTable } from '../lib/serverStorage'
import { generateTableFromPrompt } from '../lib/tableGenerator'
import { IconClipboard, IconSparkle, IconTrash, IconDownload } from './Icons'
import '../styles/GeneratedTable.css'

function toCsv(table) {
  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const lines = [table.columns.map(escape).join(',')]
  table.rows.forEach(row => lines.push(row.map(escape).join(',')))
  return lines.join('\n')
}

export default function GeneratedTable({ lang, plan }) {
  const [prompt, setPrompt] = useState('')
  const [table, setTable] = useState(null)
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    if (!prompt.trim() || loading) return
    setLoading(true)
    try {
      const result = await generateTable(prompt.trim(), plan, lang)
      setTable(result || generateTableFromPrompt(prompt.trim()))
    } finally {
      setLoading(false)
    }
  }

  const updateCell = (rowIdx, colIdx, value) => {
    setTable(prev => {
      const rows = prev.rows.map((r, i) => i === rowIdx ? r.map((c, j) => j === colIdx ? value : c) : r)
      return { ...prev, rows }
    })
  }

  const addRow = () => {
    setTable(prev => ({ ...prev, rows: [...prev.rows, prev.columns.map(() => '')] }))
  }

  const removeRow = (rowIdx) => {
    setTable(prev => ({ ...prev, rows: prev.rows.filter((_, i) => i !== rowIdx) }))
  }

  const removeColumn = (colIdx) => {
    setTable(prev => ({
      ...prev,
      columns: prev.columns.filter((_, i) => i !== colIdx),
      rows: prev.rows.map(r => r.filter((_, i) => i !== colIdx))
    }))
  }

  const exportCsv = () => {
    const blob = new Blob([toCsv(table)], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(table.title || 'table').slice(0, 40)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="generated-table card">
      <div className="generated-table-header">
        <h3><IconClipboard width={16} height={16} /> {t(lang, 'genTable.title')}</h3>
        <p className="generated-table-subtitle">{t(lang, 'genTable.subtitle')}</p>
      </div>

      <form className="generated-table-form" onSubmit={e => { e.preventDefault(); generate() }}>
        <input
          type="text"
          value={prompt}
          placeholder={t(lang, 'genTable.placeholder')}
          onChange={e => setPrompt(e.target.value)}
          disabled={loading}
        />
        <button type="submit" className="btn-primary" disabled={loading}>
          <IconSparkle width={14} height={14} /> {loading ? t(lang, 'genTable.generating') : t(lang, 'genTable.generate')}
        </button>
      </form>

      {table && (
        <div className="generated-table-result">
          <div className="generated-table-scroll">
            <table>
              <thead>
                <tr>
                  {table.columns.map((col, i) => (
                    <th key={i}>
                      <span>{col}</span>
                      <button className="col-remove-btn" onClick={() => removeColumn(i)} title={t(lang, 'genTable.removeColumn')}>×</button>
                    </th>
                  ))}
                  <th className="row-action-col" />
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td key={ci}>
                        <textarea
                          rows={1}
                          value={cell}
                          onChange={e => updateCell(ri, ci, e.target.value)}
                        />
                      </td>
                    ))}
                    <td className="row-action-col">
                      <button className="row-remove-btn" onClick={() => removeRow(ri)} title={t(lang, 'genTable.removeRow')}>
                        <IconTrash width={13} height={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="generated-table-actions">
            <button className="btn-secondary" onClick={addRow}>{t(lang, 'genTable.addRow')}</button>
            <button className="btn-secondary" onClick={exportCsv}>
              <IconDownload width={14} height={14} /> {t(lang, 'genTable.exportCsv')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
