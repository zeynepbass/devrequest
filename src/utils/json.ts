export type JsonValidation =
  { valid: true; empty: boolean } | { valid: false; message: string; line?: number; column?: number }

function locate(text: string, position: number): { line: number; column: number } {
  const before = text.slice(0, position)
  const lines = before.split('\n')
  return { line: lines.length, column: (lines.at(-1)?.length ?? 0) + 1 }
}

const WHITESPACE = new Set([' ', '\t', '\n', '\r'])

function findErrorPosition(text: string): number {
  let index = 0

  function skipWhitespace() {
    while (index < text.length && WHITESPACE.has(text.charAt(index))) index += 1
  }

  function fail(): never {
    throw index
  }

  function expectLiteral(literal: string) {
    for (const char of literal) {
      if (text.charAt(index) !== char) fail()
      index += 1
    }
  }

  function parseString() {
    index += 1
    while (index < text.length) {
      const char = text.charAt(index)
      if (char === '"') {
        index += 1
        return
      }
      if (char === '\\') {
        const next = text.charAt(index + 1)
        if (next === 'u') {
          if (!/^[\da-f]{4}$/i.test(text.slice(index + 2, index + 6))) {
            index += 2
            fail()
          }
          index += 6
          continue
        }
        if (!'"\\/bfnrt'.includes(next) || next === '') {
          index += 1
          fail()
        }
        index += 2
        continue
      }
      if (char < ' ') fail()
      index += 1
    }
    fail()
  }

  function parseNumber() {
    const match = /^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/.exec(text.slice(index))
    if (!match || match[0] === '-') fail()
    index += match[0].length
  }

  function parseValue() {
    skipWhitespace()
    const char = text.charAt(index)
    if (char === '{') return parseObject()
    if (char === '[') return parseArray()
    if (char === '"') return parseString()
    if (char === 't') return expectLiteral('true')
    if (char === 'f') return expectLiteral('false')
    if (char === 'n') return expectLiteral('null')
    if (char === '-' || (char >= '0' && char <= '9')) return parseNumber()
    fail()
  }

  function parseObject() {
    index += 1
    skipWhitespace()
    if (text.charAt(index) === '}') {
      index += 1
      return
    }
    for (;;) {
      skipWhitespace()
      if (text.charAt(index) !== '"') fail()
      parseString()
      skipWhitespace()
      if (text.charAt(index) !== ':') fail()
      index += 1
      parseValue()
      skipWhitespace()
      const char = text.charAt(index)
      if (char === '}') {
        index += 1
        return
      }
      if (char !== ',') fail()
      index += 1
    }
  }

  function parseArray() {
    index += 1
    skipWhitespace()
    if (text.charAt(index) === ']') {
      index += 1
      return
    }
    for (;;) {
      parseValue()
      skipWhitespace()
      const char = text.charAt(index)
      if (char === ']') {
        index += 1
        return
      }
      if (char !== ',') fail()
      index += 1
    }
  }

  try {
    parseValue()
    skipWhitespace()
    if (index < text.length) fail()
    return -1
  } catch (position) {
    return typeof position === 'number' ? position : -1
  }
}

function cleanMessage(message: string): string {
  return message
    .replace(/^JSON\.parse: /, '')
    .replace(/,? ?"[\s\S]*" is not valid JSON$/, '')
    .replace(/ in JSON at position \d+( \(line \d+ column \d+\))?$/, '')
    .trim()
}

export function validateJson(text: string): JsonValidation {
  if (!text.trim()) {
    return { valid: true, empty: true }
  }

  try {
    JSON.parse(text)
    return { valid: true, empty: false }
  } catch (error) {
    const raw = error instanceof Error ? error.message : 'Invalid JSON'
    const position = findErrorPosition(text)
    const location = position >= 0 ? locate(text, position) : undefined
    return { valid: false, message: cleanMessage(raw) || 'Invalid JSON', ...location }
  }
}

export function formatJson(text: string, indent = 2): string {
  return JSON.stringify(JSON.parse(text), null, indent)
}

export function minifyJson(text: string): string {
  return JSON.stringify(JSON.parse(text))
}

export function tryFormatJson(text: string): string | null {
  try {
    return formatJson(text)
  } catch {
    return null
  }
}
