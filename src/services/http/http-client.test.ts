import { describe, expect, it, vi } from 'vitest'
import { jsonResponse } from '@/test/factories'
import type { PreparedRequest } from './build-request'
import { executeRequest } from './http-client'

const request: PreparedRequest = {
  url: 'https://api.example.com/items',
  method: 'POST',
  headers: new Headers({ 'content-type': 'application/json' }),
  body: '{"name":"x"}',
}

function clock(...values: number[]) {
  const queue = [...values]
  return () => queue.shift() ?? values.at(-1) ?? 0
}

function hangingFetch(): typeof fetch {
  return (_input, init) =>
    new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
    })
}

describe('executeRequest', () => {
  it('passes method, headers and body to fetch', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ ok: true }))
    await executeRequest(request, { fetchImpl })

    const [url, init] = fetchImpl.mock.calls[0] ?? []
    expect(url).toBe(request.url)
    expect(init).toMatchObject({ method: 'POST', body: '{"name":"x"}', credentials: 'omit', redirect: 'follow' })
    expect(init?.headers).toBe(request.headers)
  })

  it('parses a JSON response with status, headers, size and duration', async () => {
    const body = { id: 7, name: 'Çay' }
    const outcome = await executeRequest(request, {
      fetchImpl: async () => jsonResponse(body, { status: 201, statusText: 'Created', headers: { 'x-trace': 'abc' } }),
      now: clock(100, 342.5),
    })

    expect(outcome.ok).toBe(true)
    if (!outcome.ok) return
    const { response } = outcome
    expect(response.status).toBe(201)
    expect(response.statusText).toBe('Created')
    expect(response.bodyKind).toBe('json')
    expect(JSON.parse(response.bodyText)).toEqual(body)
    expect(response.sizeBytes).toBe(new TextEncoder().encode(JSON.stringify(body)).byteLength)
    expect(response.durationMs).toBe(242.5)
    expect(response.headers).toContainEqual(['x-trace', 'abc'])
  })

  it.each([400, 401, 404, 500])('returns HTTP %d as a response, not an error', async (status) => {
    const outcome = await executeRequest(request, {
      fetchImpl: async () => jsonResponse({ error: 'nope' }, { status }),
    })
    expect(outcome.ok && outcome.response.status).toBe(status)
  })

  it('detects JSON bodies without a JSON content type', async () => {
    const outcome = await executeRequest(request, {
      fetchImpl: async () => new Response('[1,2]', { headers: { 'content-type': 'text/plain' } }),
    })
    expect(outcome.ok && outcome.response.bodyKind).toBe('json')
  })

  it('marks empty and binary bodies', async () => {
    const empty = await executeRequest(request, { fetchImpl: async () => new Response(null, { status: 204 }) })
    expect(empty.ok && empty.response.bodyKind).toBe('empty')

    const binary = await executeRequest(request, {
      fetchImpl: async () =>
        new Response(new Uint8Array([137, 80, 78, 71]), { headers: { 'content-type': 'image/png' } }),
    })
    expect(binary.ok && binary.response.bodyKind).toBe('binary')
    expect(binary.ok && binary.response.sizeBytes).toBe(4)
  })

  it('reports network failures such as CORS rejections', async () => {
    const outcome = await executeRequest(request, {
      fetchImpl: async () => {
        throw new TypeError('Failed to fetch')
      },
      isOnline: () => true,
    })
    expect(!outcome.ok && outcome.error.kind).toBe('network')
    expect(!outcome.ok && outcome.error.hints.join(' ')).toContain('CORS')
  })

  it('reports offline state separately', async () => {
    const outcome = await executeRequest(request, {
      fetchImpl: async () => {
        throw new TypeError('Failed to fetch')
      },
      isOnline: () => false,
    })
    expect(!outcome.ok && outcome.error.kind).toBe('offline')
  })

  it('times out slow requests', async () => {
    vi.useFakeTimers()
    try {
      const pending = executeRequest(request, { fetchImpl: hangingFetch(), timeoutMs: 5000 })
      await vi.advanceTimersByTimeAsync(5000)
      const outcome = await pending
      expect(!outcome.ok && outcome.error.kind).toBe('timeout')
      expect(!outcome.ok && outcome.error.message).toContain('5 seconds')
    } finally {
      vi.useRealTimers()
    }
  })

  it('cancels when the caller aborts', async () => {
    const controller = new AbortController()
    const pending = executeRequest(request, { fetchImpl: hangingFetch(), signal: controller.signal })
    controller.abort()
    const outcome = await pending
    expect(!outcome.ok && outcome.error.kind).toBe('aborted')
  })

  it('does not call fetch when already aborted', async () => {
    const controller = new AbortController()
    controller.abort()
    const fetchImpl = vi.fn<typeof fetch>()
    const outcome = await executeRequest(request, { fetchImpl, signal: controller.signal })
    expect(fetchImpl).not.toHaveBeenCalled()
    expect(!outcome.ok && outcome.error.kind).toBe('aborted')
  })
})
