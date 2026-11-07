export interface QueryPair {
  key: string
  value: string
}

interface UrlParts {
  base: string
  query: string
  hash: string
}

export function splitUrl(url: string): UrlParts {
  const hashIndex = url.indexOf('#')
  const withoutHash = hashIndex === -1 ? url : url.slice(0, hashIndex)
  const hash = hashIndex === -1 ? '' : url.slice(hashIndex)
  const queryIndex = withoutHash.indexOf('?')

  if (queryIndex === -1) {
    return { base: withoutHash, query: '', hash }
  }

  return {
    base: withoutHash.slice(0, queryIndex),
    query: withoutHash.slice(queryIndex + 1),
    hash,
  }
}

export function extractQueryParams(url: string): QueryPair[] {
  const { query } = splitUrl(url)
  if (!query) {
    return []
  }

  return Array.from(new URLSearchParams(query), ([key, value]) => ({ key, value }))
}

export function applyQueryParams(url: string, params: QueryPair[]): string {
  const { base, hash } = splitUrl(url)
  const search = new URLSearchParams()

  for (const { key, value } of params) {
    if (key.trim()) {
      search.append(key, value)
    }
  }

  const query = search.toString()
  return `${base}${query ? `?${query}` : ''}${hash}`
}

const SCHEME_PATTERN = /^[a-z][a-z\d+.-]*:\/\//i
const LOCAL_HOST_PATTERN = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?(\/|$|\?)/i

export function normalizeUrl(input: string): string {
  const trimmed = input.trim()
  if (!trimmed || SCHEME_PATTERN.test(trimmed)) {
    return trimmed
  }

  const scheme = LOCAL_HOST_PATTERN.test(trimmed) ? 'http' : 'https'
  return `${scheme}://${trimmed}`
}

export type UrlValidationResult = { ok: true; url: URL } | { ok: false; message: string }

export function validateUrl(input: string): UrlValidationResult {
  const normalized = normalizeUrl(input)

  if (!normalized) {
    return { ok: false, message: 'Enter a URL to send the request to.' }
  }

  let parsed: URL
  try {
    parsed = new URL(normalized)
  } catch {
    return { ok: false, message: `"${input.trim()}" is not a valid URL.` }
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { ok: false, message: `Unsupported protocol "${parsed.protocol}". Use http or https.` }
  }

  if (!parsed.hostname) {
    return { ok: false, message: 'The URL is missing a host name.' }
  }

  return { ok: true, url: parsed }
}
