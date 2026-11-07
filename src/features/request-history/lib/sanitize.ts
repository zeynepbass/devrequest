import type { AuthConfig } from '@/types/auth'
import type { KeyValueEntry, RequestDraft } from '@/types/http'
import { applyQueryParams } from '@/utils/url'
import type { StoredRequest } from './history-schema'

const SENSITIVE_HEADERS = new Set([
  'authorization',
  'proxy-authorization',
  'cookie',
  'x-api-key',
  'x-auth-token',
  'x-access-token',
  'x-csrf-token',
])

const SENSITIVE_PARAMS = new Set([
  'access_token',
  'api_key',
  'apikey',
  'auth',
  'client_secret',
  'id_token',
  'password',
  'refresh_token',
  'secret',
  'token',
])

function redact(entries: KeyValueEntry[], sensitive: ReadonlySet<string>): KeyValueEntry[] {
  return entries.map((entry) => (sensitive.has(entry.key.trim().toLowerCase()) ? { ...entry, value: '' } : entry))
}

function stripUrlCredentials(url: string): string {
  return url.replace(/^([a-z][a-z\d+.-]*:\/\/)[^/?#@]*@/i, '$1')
}

export function sanitizeRequest(draft: RequestDraft): StoredRequest {
  const params = redact(draft.params, SENSITIVE_PARAMS)
  const url = applyQueryParams(
    stripUrlCredentials(draft.url),
    params.filter((entry) => entry.enabled),
  )

  return {
    method: draft.method,
    url,
    params,
    headers: redact(draft.headers, SENSITIVE_HEADERS),
    body: { ...draft.body },
    authType: draft.auth.type,
  }
}

function emptyAuth(type: StoredRequest['authType']): AuthConfig {
  switch (type) {
    case 'none':
      return { type: 'none' }
    case 'bearer':
      return { type: 'bearer', token: '' }
    case 'basic':
      return { type: 'basic', username: '', password: '' }
  }
}

export function restoreRequest(stored: StoredRequest): RequestDraft {
  return {
    method: stored.method,
    url: stored.url,
    params: stored.params.map((entry) => ({ ...entry })),
    headers: stored.headers.map((entry) => ({ ...entry })),
    body: { ...stored.body },
    auth: emptyAuth(stored.authType),
  }
}
