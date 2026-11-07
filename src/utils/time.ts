const DIVISIONS: Array<{ amount: number; unit: Intl.RelativeTimeFormatUnit }> = [
  { amount: 60, unit: 'second' },
  { amount: 60, unit: 'minute' },
  { amount: 24, unit: 'hour' },
  { amount: 7, unit: 'day' },
  { amount: 4.345, unit: 'week' },
  { amount: 12, unit: 'month' },
  { amount: Number.POSITIVE_INFINITY, unit: 'year' },
]

const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto', style: 'short' })

export function formatRelativeTime(timestamp: number, now = Date.now()): string {
  let duration = (timestamp - now) / 1000
  if (Math.abs(duration) < 10) {
    return 'just now'
  }
  for (const division of DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return formatter.format(Math.round(duration), division.unit)
    }
    duration /= division.amount
  }
  return formatter.format(Math.round(duration), 'year')
}
