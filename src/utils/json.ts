export type JsonValidation =
  | { valid: true; empty: boolean }
  | { valid: false; message: string; line?: number; column?: number }

function locate(text: string, position: number): { line: number; column: number } {
  const before = text.slice(0, position)
  const lines = before.split('\n')
  return { line: lines.length, column: (lines.at(-1)?.length ?? 0) + 1 }
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
    const lineColumn = /line (\d+) column (\d+)/.exec(raw)
    const position = /position (\d+)/.exec(raw)

    let location: { line: number; column: number } | undefined
    if (lineColumn?.[1] && lineColumn[2]) {
      location = { line: Number(lineColumn[1]), column: Number(lineColumn[2]) }
    } else if (position?.[1]) {
      location = locate(text, Number(position[1]))
    } else if (/end of (JSON )?(data|input)/i.test(raw)) {
      location = locate(text, text.length)
    }

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
