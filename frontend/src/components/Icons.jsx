const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round'
}

export function IconClock(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  )
}

export function IconTarget(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </svg>
  )
}

export function IconBarChart(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 20V10M12 20V4M20 20v-7" />
    </svg>
  )
}

export function IconTrendingUp(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 16l5-5 4 4 7-8" />
      <path d="M14 7h6v6" />
    </svg>
  )
}

export function IconSparkle(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
    </svg>
  )
}

export function IconDownload(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 4v11m0 0l-4-4m4 4l4-4" />
      <path d="M5 19h14" />
    </svg>
  )
}

export function IconBriefcase(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="8" width="18" height="11" rx="2" />
      <path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  )
}

export function IconShoppingBag(props) {
  return (
    <svg {...base} {...props}>
      <path d="M6 8h12l-1 12H7L6 8z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  )
}

export function IconSmartphone(props) {
  return (
    <svg {...base} {...props}>
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <path d="M11 18h2" />
    </svg>
  )
}

export function IconClipboard(props) {
  return (
    <svg {...base} {...props}>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
      <path d="M9 11h6M9 15h6" />
    </svg>
  )
}

export function IconPencil(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 20l1-4L16 5l3 3L8 19l-4 1z" />
    </svg>
  )
}

export function IconLock(props) {
  return (
    <svg {...base} {...props}>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  )
}

export function IconShield(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
    </svg>
  )
}

export function IconSearch(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  )
}

export function IconHelpCircle(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.9.4-1.5 1-1.5 2.2" />
      <path d="M12 17h.01" />
    </svg>
  )
}

export function IconCheckCircle(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.5l2.3 2.3L16 10" />
    </svg>
  )
}

export function IconAlertTriangle(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 4l9 16H3z" />
      <path d="M12 10v4M12 17h.01" />
    </svg>
  )
}

export function IconUser(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c1.5-4 5-5.5 7-5.5s5.5 1.5 7 5.5" />
    </svg>
  )
}

export function IconCoin(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 15.5c.5.6 1.4 1 2.5 1 1.7 0 3-1 3-2.3 0-2.6-5-1-5-3.5 0-1.3 1.3-2.2 3-2.2 1.1 0 2 .4 2.5 1" />
      <path d="M12 7v10" />
    </svg>
  )
}

export function IconSave(props) {
  return (
    <svg {...base} {...props}>
      <path d="M5 4h11l3 3v13H5z" />
      <path d="M8 4v6h8V4M8 21v-7h8v7" />
    </svg>
  )
}

export function IconGithub(props) {
  return (
    <svg {...base} {...props}>
      <path d="M9 19c-4 1.2-4-2-6-2m12 4v-3.4c0-1 .3-1.6.7-2C12.6 15.2 15 14 15 10.5c0-1.1-.4-2-1-2.7.1-.3.4-1.4-.1-2.8 0 0-.9-.3-3 1a10 10 0 0 0-5.4 0c-2.1-1.3-3-1-3-1-.5 1.4-.2 2.5-.1 2.8-.6.7-1 1.6-1 2.7 0 3.5 2.4 4.7 5.3 5.1-.4.3-.7.9-.8 1.8m0 4V17" />
    </svg>
  )
}

export function IconHeart(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 20s-7-4.4-9.3-9C1.3 7.8 3 5 6 5c1.8 0 3.2 1 4 2.3C10.8 6 12.2 5 14 5c3 0 4.7 2.8 3.3 6-2.3 4.6-9.3 9-9.3 9z" />
    </svg>
  )
}

export function IconMail(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M4 6.5l8 6 8-6" />
    </svg>
  )
}

export function IconCompass(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9l-2 6-6 2 2-6z" />
    </svg>
  )
}

export function IconTag(props) {
  return (
    <svg {...base} {...props}>
      <path d="M11 4h6a2 2 0 0 1 2 2v6l-8.5 8.5a1.5 1.5 0 0 1-2 0L4 16a1.5 1.5 0 0 1 0-2z" />
      <circle cx="15.5" cy="8.5" r="1.2" />
    </svg>
  )
}

export function IconFileText(props) {
  return (
    <svg {...base} {...props}>
      <path d="M7 3h7l4 4v14H7z" />
      <path d="M14 3v4h4M9 12h6M9 16h6" />
    </svg>
  )
}

export function IconCookie(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3a9 9 0 1 0 9 9c-1.7 0-3-1.3-3-3-2 0-3.5-1.5-3.5-3.5-1.7 0-3-1.3-3-3-.2 0 .3.5.5.5z" />
      <circle cx="9" cy="14" r="1" fill="currentColor" stroke="none" />
      <circle cx="13" cy="17" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="12.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function IconSend(props) {
  return (
    <svg {...base} {...props}>
      <path d="M21 3L10.5 13.5M21 3l-7 18-4-8-8-4z" />
    </svg>
  )
}

export function IconExternalLink(props) {
  return (
    <svg {...base} {...props}>
      <path d="M9 18H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
      <path d="M14 4h6v6M20 4l-9 9" />
    </svg>
  )
}

export function IconCopy(props) {
  return (
    <svg {...base} {...props}>
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
  )
}

export function IconCircleDot(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function IconChevronLeft(props) {
  return (
    <svg {...base} {...props}>
      <path d="M15 5l-7 7 7 7" />
    </svg>
  )
}

export function IconChevronRight(props) {
  return (
    <svg {...base} {...props}>
      <path d="M9 5l7 7-7 7" />
    </svg>
  )
}

export function IconChevronUp(props) {
  return (
    <svg {...base} {...props}>
      <path d="M5 15l7-7 7 7" />
    </svg>
  )
}

export function IconChevronDown(props) {
  return (
    <svg {...base} {...props}>
      <path d="M5 9l7 7 7-7" />
    </svg>
  )
}

export function IconCalendar(props) {
  return (
    <svg {...base} {...props}>
      <rect x="4" y="5" width="16" height="16" rx="2" />
      <path d="M4 10h16M8 3v4M16 3v4" />
    </svg>
  )
}

export function IconArrowLeft(props) {
  return (
    <svg {...base} {...props}>
      <path d="M19 12H5M5 12l6-6M5 12l6 6" />
    </svg>
  )
}

export function IconTrash(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
    </svg>
  )
}

export function IconCreditCard(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M3 10h18M6 15h4" />
    </svg>
  )
}

export function IconRocket(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3c3 1 5 4 5 8 0 2-1 4-2 5l-3 3-3-3c-1-1-2-3-2-5 0-4 2-7 5-8z" />
      <circle cx="12" cy="10" r="1.6" />
      <path d="M8 16l-2 4M16 16l2 4" />
    </svg>
  )
}

export function IconHome(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 11.5L12 4l8 7.5" />
      <path d="M6 10v9a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1v-9" />
    </svg>
  )
}

export function IconUpload(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 16V4M12 4l-4 4M12 4l4 4" />
      <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
    </svg>
  )
}

export function IconProviderGoogle(props) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.09A11.99 11.99 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.63H1.26A11.99 11.99 0 0 0 0 12c0 1.94.46 3.77 1.26 5.37l4.01-3.09z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.26 6.63l4.01 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
    </svg>
  )
}

export function IconProviderApple(props) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path fill="currentColor" d="M16.36 1.43c0 1.14-.42 2.2-1.24 3.05-.99 1.04-2.2 1.64-3.5 1.53-.15-1.13.4-2.28 1.2-3.09.87-.9 2.28-1.55 3.44-1.6.02.04.06.07.1.11z M20.6 17.15c-.5 1.16-1.1 2.25-1.83 3.28-.98 1.4-2 2.79-3.5 2.82-1.44.03-1.91-.86-3.55-.86-1.65 0-2.17.83-3.54.89-1.44.06-2.55-1.5-3.54-2.9-2.02-2.87-3.57-8.12-1.5-11.66.99-1.7 2.83-2.79 4.78-2.83 1.4-.03 2.72.94 3.55.94.84 0 2.42-1.16 4.08-.99.7.03 2.65.28 3.9 2.14-.1.06-2.33 1.36-2.31 4.08.03 3.24 2.85 4.32 2.88 4.34-.02.06-.44 1.51-1.42 2.75z" />
    </svg>
  )
}

export function IconProviderSlack(props) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path fill="#36C5F0" d="M9 15.3a2.1 2.1 0 1 1-2.1-2.1H9v2.1z" />
      <path fill="#36C5F0" d="M10.05 15.3a2.1 2.1 0 1 1 4.2 0v5.25a2.1 2.1 0 1 1-4.2 0V15.3z" />
      <path fill="#2EB67D" d="M8.7 9a2.1 2.1 0 1 1 2.1-2.1V9H8.7z" />
      <path fill="#2EB67D" d="M8.7 10.05a2.1 2.1 0 1 1 0 4.2H3.45a2.1 2.1 0 1 1 0-4.2H8.7z" />
      <path fill="#ECB22E" d="M15 8.7a2.1 2.1 0 1 1 2.1 2.1H15V8.7z" />
      <path fill="#ECB22E" d="M13.95 8.7a2.1 2.1 0 1 1-4.2 0V3.45a2.1 2.1 0 1 1 4.2 0V8.7z" />
      <path fill="#E01E5A" d="M15.3 15a2.1 2.1 0 1 1-2.1 2.1V15h2.1z" />
      <path fill="#E01E5A" d="M15.3 13.95a2.1 2.1 0 1 1 0-4.2h5.25a2.1 2.1 0 1 1 0 4.2H15.3z" />
    </svg>
  )
}

export function IconPlus(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function IconLogin(props) {
  return (
    <svg {...base} {...props}>
      <path d="M11 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5" />
      <path d="M15 8l4 4-4 4" />
      <path d="M19 12H9" />
    </svg>
  )
}
