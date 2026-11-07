import type { RequestDraft } from '@/types/http'
import type { RequestError } from '@/types/response'
import { validateJson } from '@/utils/json'
import { validateUrl } from '@/utils/url'
import { createRequestError } from './errors'

export interface PreparedRequest {
  url: string
  method: RequestDraft['method']
  headers: Headers
  body?: string
}

export type BuildRequestResult = { ok: true; request: PreparedRequest } | { ok: false; error: RequestError }

const HEADER_NAME_PATTERN = /^[!#$%&'*+\-.^_`|~\dA-Za-z]+$/

const DEFAULT_CONTENT_TYPE = {
  json: 'application/json',
  text: 'text/plain;charset=UTF-8',
} as const

function isLocalHost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]'
}

export function canSendBody(method: RequestDraft['method']): boolean {
  return method !== 'GET'
}

export function buildRequest(draft: RequestDraft, pageProtocol: string): BuildRequestResult {
  const validation = validateUrl(draft.url)
  if (!validation.ok) {
    return { ok: false, error: createRequestError('invalid-url', validation.message) }
  }

  const target = validation.url
  if (pageProtocol === 'https:' && target.protocol === 'http:' && !isLocalHost(target.hostname)) {
    return {
      ok: false,
      error: createRequestError('mixed-content', `${target.origin} cannot be called from a secure page.`),
    }
  }

  const headers = new Headers()
  for (const entry of draft.headers) {
    const name = entry.key.trim()
    if (!entry.enabled || !name) {
      continue
    }
    if (!HEADER_NAME_PATTERN.test(name)) {
      return {
        ok: false,
        error: createRequestError('invalid-header', `"${name}" is not a valid header name.`),
      }
    }
    try {
      headers.append(name, entry.value)
    } catch {
      return {
        ok: false,
        error: createRequestError('invalid-header', `The value of "${name}" contains characters that are not allowed.`),
      }
    }
  }

  let body: string | undefined
  if (canSendBody(draft.method) && draft.body.mode !== 'none') {
    body = draft.body[draft.body.mode]
    if (draft.body.mode === 'json') {
      const validation = validateJson(body)
      if (!validation.valid) {
        const location = validation.line ? ` (line ${validation.line}, column ${validation.column ?? 1})` : ''
        return { ok: false, error: createRequestError('invalid-body', `${validation.message}${location}.`) }
      }
    }
    if (!headers.has('content-type')) {
      headers.set('content-type', DEFAULT_CONTENT_TYPE[draft.body.mode])
    }
  }

  return {
    ok: true,
    request: { url: target.toString(), method: draft.method, headers, body },
  }
}
