import { useState } from 'react'
import { t } from '../lib/i18n'
import { generateTableFromPrompt } from '../lib/tableGenerator'
import { IconClipboard, IconSparkle } from './Icons'
import '../styles/GeneratedTable.css'

export default function GeneratedTable({ lang }) {
  const [prompt, setPrompt] = useState('')
  const [table, setTable] = useState(null)

  const generate = () => {
    if (!prompt.trim()) return
    setTable(generateTableFromPrompt(prompt.trim()))
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
        />
        <button type="submit" className="btn-primary"><IconSparkle width={14} height={14} /> {t(lang, 'genTable.generate')}</button>
      </form>

      {table && (
        <div className="generated-table-result">
          <div className="generated-table-scroll">
            <table>
              <thead>
                <tr>{table.columns.map((col, i) => <th key={i}>{col}</th>)}</tr>
              </thead>
              <tbody>
                {table.rows.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td key={ci}>
                        <input value={cell} onChange={e => updateCell(ri, ci, e.target.value)} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="btn-secondary" onClick={addRow}>{t(lang, 'genTable.addRow')}</button>
        </div>
      )}
    </div>
  )
}
