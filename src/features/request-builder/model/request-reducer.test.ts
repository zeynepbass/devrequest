import { describe, expect, it } from 'vitest'
import { makeDraft } from '@/test/factories'
import type { RequestDraft } from '@/types/http'
import { createEmptyDraft } from './request-draft'
import { requestReducer, type RequestAction } from './request-reducer'

function run(state: RequestDraft, ...actions: RequestAction[]): RequestDraft {
  return actions.reduce(requestReducer, state)
}

describe('requestReducer', () => {
  it('changes the HTTP method', () => {
    expect(run(createEmptyDraft(), { type: 'set-method', method: 'DELETE' }).method).toBe('DELETE')
  })

  describe('query parameter sync', () => {
    it('parses parameters typed into the URL', () => {
      const state = run(createEmptyDraft(), { type: 'set-url', url: 'https://a.dev/p?page=2&q=hi%20there' })
      expect(state.params.map(({ key, value, enabled }) => ({ key, value, enabled }))).toEqual([
        { key: 'page', value: '2', enabled: true },
        { key: 'q', value: 'hi there', enabled: true },
      ])
    })

    it('keeps row ids stable while the URL is edited', () => {
      const first = run(createEmptyDraft(), { type: 'set-url', url: 'https://a.dev/?page=1' })
      const second = run(first, { type: 'set-url', url: 'https://a.dev/?page=12' })
      expect(second.params[0]?.id).toBe(first.params[0]?.id)
    })

    it('writes table edits back into the URL', () => {
      let state = run(createEmptyDraft(), { type: 'set-url', url: 'https://a.dev/search#results' })
      state = run(state, { type: 'add-entry', collection: 'params' })
      const id = state.params[0]?.id ?? ''
      state = run(
        state,
        { type: 'update-entry', collection: 'params', id, patch: { key: 'q' } },
        { type: 'update-entry', collection: 'params', id, patch: { value: 'a b' } },
      )
      expect(state.url).toBe('https://a.dev/search?q=a+b#results')
    })

    it('removes disabled parameters from the URL but keeps the row', () => {
      let state = run(createEmptyDraft(), { type: 'set-url', url: 'https://a.dev/?a=1&b=2' })
      const id = state.params[0]?.id ?? ''
      state = run(state, { type: 'update-entry', collection: 'params', id, patch: { enabled: false } })
      expect(state.url).toBe('https://a.dev/?b=2')
      expect(state.params).toHaveLength(2)

      state = run(state, { type: 'set-url', url: 'https://a.dev/?b=3' })
      expect(state.params.map((entry) => [entry.key, entry.value, entry.enabled])).toEqual([
        ['b', '3', true],
        ['a', '1', false],
      ])
    })

    it('updates the URL when a parameter is deleted', () => {
      let state = run(createEmptyDraft(), { type: 'set-url', url: 'https://a.dev/?a=1&b=2' })
      state = run(state, { type: 'remove-entry', collection: 'params', id: state.params[1]?.id ?? '' })
      expect(state.url).toBe('https://a.dev/?a=1')
    })
  })

  describe('headers', () => {
    it('adds, edits, toggles and removes headers without touching the URL', () => {
      let state = run(makeDraft({ url: 'https://a.dev/x' }), { type: 'add-entry', collection: 'headers' })
      const id = state.headers[0]?.id ?? ''
      state = run(
        state,
        { type: 'update-entry', collection: 'headers', id, patch: { key: 'Accept', value: 'text/html' } },
        { type: 'update-entry', collection: 'headers', id, patch: { enabled: false } },
      )
      expect(state.headers[0]).toMatchObject({ key: 'Accept', value: 'text/html', enabled: false })
      expect(state.url).toBe('https://a.dev/x')

      state = run(state, { type: 'remove-entry', collection: 'headers', id })
      expect(state.headers).toEqual([])
    })
  })

  describe('body', () => {
    it('stores JSON and text content separately', () => {
      const state = run(
        createEmptyDraft(),
        { type: 'set-body-mode', mode: 'json' },
        { type: 'set-body-content', content: '{"a":1}' },
        { type: 'set-body-mode', mode: 'text' },
        { type: 'set-body-content', content: 'plain' },
      )
      expect(state.body).toEqual({ mode: 'text', json: '{"a":1}', text: 'plain' })
    })

    it('ignores content updates when the body is disabled', () => {
      const initial = createEmptyDraft()
      expect(run(initial, { type: 'set-body-content', content: 'x' })).toBe(initial)
    })
  })

  it('loads and resets drafts', () => {
    const loaded = makeDraft({ method: 'PUT', auth: { type: 'bearer', token: 't' } })
    expect(run(createEmptyDraft(), { type: 'load', draft: loaded })).toBe(loaded)
    expect(run(loaded, { type: 'reset' })).toEqual(createEmptyDraft())
  })
})
