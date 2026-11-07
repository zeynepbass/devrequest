const BYTE_UNITS = ['B', 'KB', 'MB', 'GB'] as const

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '0 B'
  }
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), BYTE_UNITS.length - 1)
  const value = bytes / 1024 ** exponent
  const rounded = exponent === 0 ? value.toString() : value.toFixed(value < 10 ? 2 : 1)
  return `${rounded} ${BYTE_UNITS[exponent]}`
}

export function formatDuration(milliseconds: number): string {
  if (!Number.isFinite(milliseconds) || milliseconds < 0) {
    return '0 ms'
  }
  if (milliseconds < 1000) {
    return `${Math.round(milliseconds)} ms`
  }
  return `${(milliseconds / 1000).toFixed(milliseconds < 10_000 ? 2 : 1)} s`
}
