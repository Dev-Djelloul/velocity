import { downloadBlob, slug } from './pdfExport'

function pad(n) {
  return String(n).padStart(2, '0')
}

function icsDate(date) {
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`
}

function icsDateTime(date) {
  return `${icsDate(date)}T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}Z`
}

function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

// Échappement texte requis par RFC 5545 (iCalendar).
function escapeText(s) {
  return String(s || '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

// events: [{ id, date: Date, title, description? }] — tous en événements "journée entière".
export function exportCalendarICS(plan, events, lang) {
  const now = new Date()
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//VelocityLaunch//FR', 'CALSCALE:GREGORIAN']

  events.forEach(ev => {
    lines.push('BEGIN:VEVENT')
    lines.push(`UID:${ev.id}-${icsDate(ev.date)}@velocitylaunch`)
    lines.push(`DTSTAMP:${icsDateTime(now)}`)
    lines.push(`DTSTART;VALUE=DATE:${icsDate(ev.date)}`)
    lines.push(`DTEND;VALUE=DATE:${icsDate(addDays(ev.date, 1))}`)
    lines.push(`SUMMARY:${escapeText(ev.title)}`)
    if (ev.description) lines.push(`DESCRIPTION:${escapeText(ev.description)}`)
    lines.push('END:VEVENT')
  })

  lines.push('END:VCALENDAR')
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' })
  downloadBlob(blob, `${slug(plan?.product?.name)}-calendrier.ics`)
}
