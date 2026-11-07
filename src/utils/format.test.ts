import { describe, expect, it } from 'vitest'
import { formatBytes, formatDuration } from './format'

describe('formatBytes', () => {
  it.each([
    [0, '0 B'],
    [512, '512 B'],
    [1536, '1.50 KB'],
    [5 * 1024 * 1024, '5.00 MB'],
    [20 * 1024, '20.0 KB'],
  ])('formats %d bytes as %s', (bytes, expected) => {
    expect(formatBytes(bytes)).toBe(expected)
  })
})

describe('formatDuration', () => {
  it('uses milliseconds below one second and seconds above', () => {
    expect(formatDuration(12.6)).toBe('13 ms')
    expect(formatDuration(1520)).toBe('1.52 s')
    expect(formatDuration(42_000)).toBe('42.0 s')
  })
})
