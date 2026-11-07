import { describe, expect, it } from 'vitest'
import { createEntry, makeDraft } from '@/test/factories'
import type { HistoryEntry } from './history-schema'
import { HISTORY_LIMIT, HISTORY_STORAGE_KEY, loadHistory, saveHistory } from './history-storage'
import { restoreRequest, sanitizeRequest } from './sanitize'

function entry(id: string, url = `https://a.dev/${id}`): HistoryEntry {
  return {
    id,
    savedAt: 1_700_000_000_000,
    request: sanitizeRequest(makeDraft({ url })),
    result: { ok: true, status: 200, durationMs: 12 },
  }
}

describe('history storage', () => {
  it('round-trips entries through localStorage', () => {
    const entries = [entry('a'), entry('b')]
    saveHistory(entries)
    expect(loadHistory()).toEqual(entries)
  })

  it('caps the number of stored entries', () => {
    saveHistory(Array.from({ length: HISTORY_LIMIT + 5 }, (_, index) => entry(String(index))))
    expect(loadHistory()).toHaveLength(HISTORY_LIMIT)
  })

  it('removes the key when history is cleared', () => {
    saveHistory([entry('a')])
    saveHistory([])
    expect(window.localStorage.getItem(HISTORY_STORAGE_KEY)).toBeNull()
  })

  it.each([
    ['malformed JSON', '{oops'],
    ['wrong shape', JSON.stringify({ version: 1, entries: [{ id: 1 }] })],
    ['unknown version', JSON.stringify({ version: 99, entries: [] })],
  ])('ignores %s', (_label, raw) => {
    window.localStorage.setItem(HISTORY_STORAGE_KEY, raw)
    expect(loadHistory()).toEqual([])
  })
})

describe('sanitizeRequest', () => {
  const draft = makeDraft({
    method: 'POST',
    url: 'https://user:pass@api.dev/items?api_key=s3cret&page=2',
    params: [createEntry({ key: 'api_key', value: 's3cret' }), createEntry({ key: 'page', value: '2' })],
    headers: [
      createEntry({ key: 'Authorization', value: 'Bearer abc' }),
      createEntry({ key: 'X-Api-Key', value: 'k' }),
      createEntry({ key: 'Accept', value: 'application/json' }),
    ],
    body: { mode: 'json', json: '{"a":1}', text: '' },
    auth: { type: 'basic', username: 'zeynep', password: 'hunter2' },
  })

  it('never persists credentials', () => {
    const stored = sanitizeRequest(draft)
    const serialized = JSON.stringify(stored)

    for (const secret of ['hunter2', 'zeynep', 's3cret', 'Bearer abc', 'user:pass']) {
      expect(serialized).not.toContain(secret)
    }
    expect(stored.authType).toBe('basic')
    expect(stored.url).toBe('https://api.dev/items?api_key=&page=2')
    expect(stored.headers.find((header) => header.key === 'Accept')?.value).toBe('application/json')
  })

  it('restores a request with empty credentials', () => {
    const restored = restoreRequest(sanitizeRequest(draft))
    expect(restored.auth).toEqual({ type: 'basic', username: '', password: '' })
    expect(restored.body).toEqual(draft.body)
    expect(restored.method).toBe('POST')
  })
})
