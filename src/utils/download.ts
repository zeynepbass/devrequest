const EXTENSION_BY_KIND: Record<string, string> = {
  json: 'json',
  html: 'html',
  xml: 'xml',
  text: 'txt',
  empty: 'txt',
  binary: 'bin',
}

function getLastPathSegment(url: string): string {
  try {
    const { pathname, hostname } = new URL(url)
    return pathname.split('/').filter(Boolean).at(-1) ?? hostname
  } catch {
    return ''
  }
}

export function createDownloadName(url: string, kind: string): string {
  const extension = EXTENSION_BY_KIND[kind] ?? 'txt'
  const segment = getLastPathSegment(url)
  const base = segment.replace(/\.[a-z\d]+$/i, '').replace(/[^\w.-]+/g, '-').slice(0, 60) || 'response'
  return `${base}.${extension}`
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const href = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = href
  anchor.download = fileName
  anchor.rel = 'noopener'
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(href), 0)
}
