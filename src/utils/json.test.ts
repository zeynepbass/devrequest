import { describe, expect, it } from 'vitest'
import { formatJson, minifyJson, tryFormatJson, validateJson } from './json'

describe('validateJson', () => {
  it('treats blank input as a valid empty body', () => {
    expect(validateJson('  \n')).toEqual({ valid: true, empty: true })
  })

  it('accepts valid documents', () => {
    expect(validateJson('{"a":[1,true,null]}')).toEqual({ valid: true, empty: false })
  })

  it('reports the line and column of a syntax error', () => {
    const result = validateJson('{\n  "a": 1,\n  "b": }')
    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.line).toBe(3)
      expect(result.column).toBeGreaterThan(1)
      expect(result.message).not.toMatch(/position \d+/)
    }
  })

  it('locates unexpected end of input', () => {
    const result = validateJson('{"a": 1')
    expect(result.valid).toBe(false)
    expect(!result.valid && result.line).toBe(1)
  })
})

describe('formatJson and minifyJson', () => {
  const source = '{"user":{"id":1,"tags":["a","b"]}}'

  it('pretty prints with two spaces', () => {
    expect(formatJson(source)).toBe('{\n  "user": {\n    "id": 1,\n    "tags": [\n      "a",\n      "b"\n    ]\n  }\n}')
  })

  it('minifies formatted JSON', () => {
    expect(minifyJson(formatJson(source))).toBe(source)
  })

  it('returns null instead of throwing for invalid JSON', () => {
    expect(tryFormatJson('{oops')).toBeNull()
  })
})

describe('validateJson error locations', () => {
  it.each([
    ['{"a": tru}', 1, 10],
    ['[1, 2,]', 1, 7],
    ['{"a": 1} x', 1, 10],
    ['{\n  "name": "x"\n  "age": 3\n}', 3, 3],
    ['"bad \\q escape"', 1, 7],
  ])('points %j to %d:%d', (input, line, column) => {
    const result = validateJson(input)
    expect(result.valid).toBe(false)
    expect(!result.valid && [result.line, result.column]).toEqual([line, column])
  })
})
