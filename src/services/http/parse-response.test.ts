import { describe, expect, it } from 'vitest'
import { decodeBody, detectBodyKind, getCharset } from './parse-response'

describe('detectBodyKind', () => {
  it.each([
    ['application/json', '{}', 'json'],
    ['application/problem+json', '{}', 'json'],
    ['text/html; charset=utf-8', '<p>', 'html'],
    ['application/xml', '<a/>', 'xml'],
    ['image/svg+xml', '<svg/>', 'xml'],
    ['text/plain', 'hello', 'text'],
    ['application/octet-stream', 'x', 'binary'],
  ])('maps %s to %s', (contentType, text, kind) => {
    expect(detectBodyKind(contentType, text, text.length)).toBe(kind)
  })

  it('does not treat invalid JSON-looking text as JSON', () => {
    expect(detectBodyKind('', '{not json', 9)).toBe('text')
  })
})

describe('decodeBody', () => {
  it('honors the declared charset', () => {
    expect(getCharset('text/plain; charset="ISO-8859-9"')).toBe('ISO-8859-9')
    const latin = new Uint8Array([0xfe, 0xf0]).buffer
    expect(decodeBody(latin, 'text/plain; charset=iso-8859-9')).toBe('şğ')
  })

  it('falls back to UTF-8 for unknown charsets', () => {
    const buffer = new TextEncoder().encode('merhaba').buffer
    expect(decodeBody(buffer, 'text/plain; charset=unknown-x')).toBe('merhaba')
  })
})
