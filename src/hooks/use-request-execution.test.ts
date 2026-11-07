import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { jsonResponse, makeDraft } from '@/test/factories'
import { useRequestExecution } from './use-request-execution'

function deferredFetch() {
  let resolve: (response: Response) => void = () => undefined
  const fetchMock = vi.fn<typeof fetch>(
    (_input, init) =>
      new Promise<Response>((done, reject) => {
        resolve = done
        init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
      }),
  )
  return { fetchMock, resolve: (response: Response) => resolve(response) }
}

describe('useRequestExecution', () => {
  it('moves from loading to success', async () => {
    const { fetchMock, resolve } = deferredFetch()
    vi.stubGlobal('fetch', fetchMock)
    const { result } = renderHook(() => useRequestExecution())

    let pending: ReturnType<typeof result.current.send> | undefined
    act(() => {
      pending = result.current.send(makeDraft())
    })
    expect(result.current.state.status).toBe('loading')

    await act(async () => {
      resolve(jsonResponse({ ok: true }))
      await pending
    })
    expect(result.current.state.status === 'success' && result.current.state.response.status).toBe(200)
  })

  it('ignores duplicate sends while a request is in flight', async () => {
    const { fetchMock, resolve } = deferredFetch()
    vi.stubGlobal('fetch', fetchMock)
    const { result } = renderHook(() => useRequestExecution())

    let first: ReturnType<typeof result.current.send> | undefined
    let second: Awaited<ReturnType<typeof result.current.send>> | undefined
    await act(async () => {
      first = result.current.send(makeDraft())
      second = await result.current.send(makeDraft())
    })

    expect(second).toEqual({ duplicate: true })
    expect(fetchMock).toHaveBeenCalledTimes(1)

    await act(async () => {
      resolve(jsonResponse({}))
      await first
    })
  })

  it('cancels the running request', async () => {
    const { fetchMock } = deferredFetch()
    vi.stubGlobal('fetch', fetchMock)
    const { result } = renderHook(() => useRequestExecution())

    let pending: ReturnType<typeof result.current.send> | undefined
    act(() => {
      pending = result.current.send(makeDraft())
    })
    await act(async () => {
      result.current.cancel()
      await pending
    })

    expect(result.current.state.status === 'error' && result.current.state.error.kind).toBe('aborted')
    expect(result.current.isLoading).toBe(false)
  })

  it('surfaces validation errors without calling fetch', async () => {
    const fetchMock = vi.fn<typeof fetch>()
    vi.stubGlobal('fetch', fetchMock)
    const { result } = renderHook(() => useRequestExecution())

    await act(async () => {
      await result.current.send(makeDraft({ url: 'mailto:someone' }))
    })

    expect(fetchMock).not.toHaveBeenCalled()
    await waitFor(() =>
      expect(result.current.state.status === 'error' && result.current.state.error.kind).toBe('invalid-url'),
    )
  })
})
