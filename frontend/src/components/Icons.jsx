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

export function IconRocket(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3c3 1 5 4 5 8 0 2-1 4-2 5l-3 3-3-3c-1-1-2-3-2-5 0-4 2-7 5-8z" />
      <circle cx="12" cy="10" r="1.6" />
      <path d="M8 16l-2 4M16 16l2 4" />
    </svg>
  )
}
