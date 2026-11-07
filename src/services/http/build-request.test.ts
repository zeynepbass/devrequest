import { describe, expect, it } from 'vitest'
import { createEntry, makeDraft } from '@/test/factories'
import { HTTP_METHODS } from '@/types/http'
import { buildRequest } from './build-request'

function build(...args: Parameters<typeof makeDraft>) {
  return buildRequest(makeDraft(...args), 'http:')
}

describe('buildRequest', () => {
  it.each(HTTP_METHODS)('keeps the %s method', (method) => {
    const result = build({ method })
    expect(result.ok && result.request.method).toBe(method)
  })

  it('normalizes the URL', () => {
    const result = build({ url: 'api.example.com/users?page=2' })
    expect(result.ok && result.request.url).toBe('https://api.example.com/users?page=2')
  })

  it('rejects invalid URLs', () => {
    const result = build({ url: 'not a url' })
    expect(!result.ok && result.error.kind).toBe('invalid-url')
  })

  it('blocks plain HTTP calls from a secure page except for localhost', () => {
    expect(buildRequest(makeDraft({ url: 'http://api.example.com' }), 'https:').ok).toBe(false)
    expect(buildRequest(makeDraft({ url: 'http://localhost:8080' }), 'https:').ok).toBe(true)
  })

  it('only sends enabled headers with a name', () => {
    const result = build({
      headers: [
        createEntry({ key: 'Accept', value: 'application/json' }),
        createEntry({ key: 'X-Disabled', value: '1', enabled: false }),
        createEntry({ key: ' ', value: 'blank' }),
      ],
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(Object.fromEntries(result.request.headers)).toEqual({ accept: 'application/json' })
    }
  })

  it('rejects malformed header names', () => {
    const result = build({ headers: [createEntry({ key: 'Bad Header', value: 'x' })] })
    expect(!result.ok && result.error.kind).toBe('invalid-header')
  })

  it('sends a JSON body with a default content type', () => {
    const result = build({ method: 'POST', body: { mode: 'json', json: '{"a":1}', text: '' } })
    expect(result.ok && result.request.body).toBe('{"a":1}')
    expect(result.ok && result.request.headers.get('content-type')).toBe('application/json')
  })

  it('keeps a user supplied content type', () => {
    const result = build({
      method: 'PUT',
      headers: [createEntry({ key: 'Content-Type', value: 'application/vnd.api+json' })],
      body: { mode: 'json', json: '{}', text: '' },
    })
    expect(result.ok && result.request.headers.get('content-type')).toBe('application/vnd.api+json')
  })

  it('sends raw text bodies as text/plain', () => {
    const result = build({ method: 'PATCH', body: { mode: 'text', json: '', text: 'hello' } })
    expect(result.ok && result.request.body).toBe('hello')
    expect(result.ok && result.request.headers.get('content-type')).toContain('text/plain')
  })

  it('never attaches a body to GET requests', () => {
    const result = build({ method: 'GET', body: { mode: 'text', json: '', text: 'ignored' } })
    expect(result.ok && result.request.body).toBeUndefined()
  })

  it('refuses to send invalid JSON', () => {
    const result = build({ method: 'POST', body: { mode: 'json', json: '{"a":', text: '' } })
    expect(!result.ok && result.error.kind).toBe('invalid-body')
  })

  it('adds a bearer token header', () => {
    const result = build({ auth: { type: 'bearer', token: ' abc.def ' } })
    expect(result.ok && result.request.headers.get('authorization')).toBe('Bearer abc.def')
  })

  it('encodes basic credentials as UTF-8 base64', () => {
    const result = build({ auth: { type: 'basic', username: 'zeynep', password: 'şifre' } })
    expect(result.ok && result.request.headers.get('authorization')).toBe('Basic emV5bmVwOsWfaWZyZQ==')
  })

  it('lets the Authorization tab override a manual header', () => {
    const result = build({
      headers: [createEntry({ key: 'Authorization', value: 'Token old' })],
      auth: { type: 'bearer', token: 'new' },
    })
    expect(result.ok && result.request.headers.get('authorization')).toBe('Bearer new')
  })

  it('reports incomplete authorization', () => {
    expect(!build({ auth: { type: 'bearer', token: '' } }).ok).toBe(true)
    const result = build({ auth: { type: 'basic', username: 'a:b', password: '' } })
    expect(!result.ok && result.error.kind).toBe('invalid-auth')
  })
})
