import { describe, expect, it } from 'vitest'
import { applyQueryParams, extractQueryParams, normalizeUrl, splitUrl, validateUrl } from './url'

describe('splitUrl', () => {
  it('separates base, query and hash', () => {
    expect(splitUrl('https://a.dev/p?x=1&y=2#top')).toEqual({ base: 'https://a.dev/p', query: 'x=1&y=2', hash: '#top' })
  })

  it('handles URLs without query or hash', () => {
    expect(splitUrl('https://a.dev/p')).toEqual({ base: 'https://a.dev/p', query: '', hash: '' })
  })
})

describe('extractQueryParams', () => {
  it('decodes repeated and encoded parameters', () => {
    expect(extractQueryParams('https://a.dev/?tag=a&tag=b&q=hello%20world&empty=')).toEqual([
      { key: 'tag', value: 'a' },
      { key: 'tag', value: 'b' },
      { key: 'q', value: 'hello world' },
      { key: 'empty', value: '' },
    ])
  })

  it('works on partially typed URLs', () => {
    expect(extractQueryParams('api.dev/users?page=2')).toEqual([{ key: 'page', value: '2' }])
  })
})

describe('applyQueryParams', () => {
  it('replaces the query string and keeps the hash', () => {
    expect(applyQueryParams('https://a.dev/p?old=1#frag', [{ key: 'page', value: '2' }])).toBe('https://a.dev/p?page=2#frag')
  })

  it('encodes special characters and skips blank keys', () => {
    expect(
      applyQueryParams('https://a.dev/search', [
        { key: 'q', value: 'a&b c' },
        { key: '  ', value: 'ignored' },
      ]),
    ).toBe('https://a.dev/search?q=a%26b+c')
  })

  it('removes the question mark when no parameters remain', () => {
    expect(applyQueryParams('https://a.dev/p?x=1', [])).toBe('https://a.dev/p')
  })
})

describe('normalizeUrl', () => {
  it('adds https to bare hosts and http to local hosts', () => {
    expect(normalizeUrl(' api.github.com/users ')).toBe('https://api.github.com/users')
    expect(normalizeUrl('localhost:3000/health')).toBe('http://localhost:3000/health')
    expect(normalizeUrl('http://example.com')).toBe('http://example.com')
  })
})

describe('validateUrl', () => {
  it('accepts http and https URLs', () => {
    const result = validateUrl('https://api.example.com/v1?x=1')
    expect(result.ok && result.url.href).toBe('https://api.example.com/v1?x=1')
  })

  it.each([
    ['', 'Enter a URL'],
    ['ftp://files.example.com', 'Unsupported protocol'],
    ['https://exa mple.com', 'not a valid URL'],
  ])('rejects %j', (input, message) => {
    const result = validateUrl(input)
    expect(result.ok).toBe(false)
    expect(!result.ok && result.message).toContain(message)
  })
})
