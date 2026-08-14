import { useState, useEffect, useRef } from 'react'
import { t } from '../lib/i18n'
import { generateTable } from '../lib/serverStorage'
import { generateTableFromPrompt } from '../lib/tableGenerator'
import { IconClipboard, IconSparkle, IconTrash, IconDownload, IconBarChart } from './Icons'
import '../styles/GeneratedTable.css'

function toCsv(table) {
  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const lines = [table.columns.map(escape).join(',')]
  table.rows.forEach(row => lines.push(row.map(escape).join(',')))
  return lines.join('\n')
}

// Une table à 2 colonnes dont toutes les valeurs de la 2e sont numériques (une fois
// nettoyées des €/%/espaces) se prête à un graphique — on le génère automatiquement
// à partir des vraies données renvoyées par l'IA, plutôt que de deviner à l'aveugle.
function parseNumeric(raw) {
  const cleaned = String(raw ?? '').replace(/[^\d,.-]/g, '').replace(',', '.')
  if (!cleaned) return null
  const value = Number(cleaned)
  return Number.isFinite(value) ? value : null
}

function extractChartData(table) {
  if (!table || table.columns?.length !== 2 || !table.rows?.length) return null
  const values = table.rows.map(row => parseNumeric(row[1]))
  if (values.some(v => v === null)) return null
  return {
    label: table.columns[0],
    valueLabel: table.columns[1],
    bars: table.rows.map((row, i) => ({ label: row[0], value: values[i] }))
  }
}

function autoResize(el) {
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

export default function GeneratedTable({ lang, plan }) {
  const [prompt, setPrompt] = useState('')
  const [table, setTable] = useState(null)
  const [loading, setLoading] = useState(false)
  const [tried, setTried] = useState(false)
  const tableRef = useRef(null)

  const suggestions = t(lang, 'genTable.suggestions') || []

  // Les cellules doivent s'adapter à leur contenu dès l'affichage (données IA
  // souvent longues) et pas seulement quand l'utilisateur tape — sinon le texte
  // reste tronqué tant qu'on n'a pas glissé le petit poignée de redimensionnement.
  useEffect(() => {
    if (!tableRef.current) return
    tableRef.current.querySelectorAll('textarea').forEach(autoResize)
  }, [table])

  const generate = async (q) => {
    const value = q ?? prompt
    if (!value.trim() || loading) return
    setPrompt(value)
    setLoading(true)
    setTried(true)
    try {
      const result = await generateTable(value.trim(), plan, lang)
      setTable(result || generateTableFromPrompt(value.trim()))
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

  const chart = extractChartData(table)
  const chartMax = chart ? Math.max(...chart.bars.map(b => b.value), 1) : 1

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
        <button type="submit" className="btn-ai-generate" disabled={loading || !prompt.trim()}>
          <IconSparkle width={14} height={14} /> <span className="btn-ai-generate-label">{loading ? t(lang, 'genTable.generating') : t(lang, 'genTable.generate')}</span>
        </button>
      </form>

      <div className="generated-table-suggestions">
        <span className="generated-table-suggestions-title">{t(lang, 'genTable.suggestionsTitle')}</span>
        <div className="generated-table-chips">
          {suggestions.map((s, i) => (
            <button key={i} type="button" className="chip" onClick={() => generate(s)} disabled={loading}>{s}</button>
          ))}
        </div>
      </div>

      {!table && tried && !loading && (
        <p className="generated-table-empty">{t(lang, 'genTable.empty')}</p>
      )}

      {table && (
        <div className="generated-table-result">
          {chart && (
            <div className="generated-table-chart">
              <div className="generated-table-chart-title"><IconBarChart width={13} height={13} /> {table.title}</div>
              <div className="generated-table-chart-bars">
                {chart.bars.map((b, i) => (
                  <div key={i} className="gt-chart-row">
                    <span className="gt-chart-label">{b.label}</span>
                    <div className="gt-chart-track">
                      <div className="gt-chart-fill" style={{ width: `${(b.value / chartMax) * 100}%` }} />
                    </div>
                    <span className="gt-chart-value">{b.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <p className="generated-table-chart-note">{t(lang, 'genTable.autoChartNote')}</p>
            </div>
          )}

          <div className="generated-table-scroll" ref={tableRef}>
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
                          onChange={e => { autoResize(e.target); updateCell(ri, ci, e.target.value) }}
                          ref={autoResize}
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
