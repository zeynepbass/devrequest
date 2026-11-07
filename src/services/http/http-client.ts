import type { ExecutionOutcome, HttpResponse } from '@/types/response'
import type { PreparedRequest } from './build-request'
import { createRequestError } from './errors'
import { decodeBody, detectBodyKind } from './parse-response'

export const DEFAULT_TIMEOUT_MS = 30_000

export interface ExecuteOptions {
  signal?: AbortSignal
  timeoutMs?: number
  fetchImpl?: typeof fetch
  now?: () => number
  isOnline?: () => boolean
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && (error.name === 'AbortError' || error.name === 'TimeoutError')
}

export async function executeRequest(
  request: PreparedRequest,
  options: ExecuteOptions = {},
): Promise<ExecutionOutcome> {
  const {
    signal,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    fetchImpl = globalThis.fetch.bind(globalThis),
    now = () => performance.now(),
    isOnline = () => navigator.onLine,
  } = options

  const controller = new AbortController()
  let timedOut = false

  const abortFromCaller = () => controller.abort(signal?.reason)
  if (signal?.aborted) {
    return { ok: false, error: createRequestError('aborted', 'The request was cancelled before it started.') }
  }
  signal?.addEventListener('abort', abortFromCaller, { once: true })

  const timer = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, timeoutMs)

  const startedAt = now()

  try {
    const response = await fetchImpl(request.url, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      signal: controller.signal,
      redirect: 'follow',
      credentials: 'omit',
      cache: 'no-store',
    })

    const buffer = await response.arrayBuffer()
    const durationMs = now() - startedAt
    const contentType = response.headers.get('content-type') ?? ''
    const bodyText = decodeBody(buffer, contentType)

    const result: HttpResponse = {
      url: response.url || request.url,
      redirected: response.redirected,
      status: response.status,
      statusText: response.statusText,
      headers: Array.from(response.headers.entries()),
      contentType,
      bodyKind: detectBodyKind(contentType, bodyText, buffer.byteLength),
      bodyText,
      bodyBlob: new Blob([buffer], { type: contentType || 'application/octet-stream' }),
      sizeBytes: buffer.byteLength,
      durationMs,
      receivedAt: Date.now(),
    }

    return { ok: true, response: result }
  } catch (error) {
    const durationMs = now() - startedAt

    if (timedOut) {
      return {
        ok: false,
        error: createRequestError('timeout', `No response after ${Math.round(timeoutMs / 1000)} seconds.`, {
          durationMs,
        }),
      }
    }
    if (isAbortError(error) || controller.signal.aborted) {
      return { ok: false, error: createRequestError('aborted', 'The request was cancelled.', { durationMs }) }
    }
    if (!isOnline()) {
      return { ok: false, error: createRequestError('offline', 'No network connection was detected.', { durationMs }) }
    }

    const detail = error instanceof Error && error.message ? ` (${error.message})` : ''
    return {
      ok: false,
      error: createRequestError(
        'network',
        `The browser could not complete the request to ${new URL(request.url).host}${detail}.`,
        { durationMs },
      ),
    }
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', abortFromCaller)
  }
}
