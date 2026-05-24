export function formatRelativeTime(dateValue: string, nowMs = Date.now()) {
  const timestamp = new Date(dateValue).getTime()
  if (Number.isNaN(timestamp)) {
    return "UNKNOWN"
  }

  const diffMs = nowMs - timestamp
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60_000))

  if (diffMinutes < 60) {
    return `${diffMinutes}M AGO`
  }

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) {
    return `${diffHours}H AGO`
  }

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 30) {
    return `${diffDays}D AGO`
  }

  const diffMonths = Math.floor(diffDays / 30)
  if (diffMonths < 12) {
    return `${diffMonths}MO AGO`
  }

  return `${Math.floor(diffMonths / 12)}Y AGO`
}
