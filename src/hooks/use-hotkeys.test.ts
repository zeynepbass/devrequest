import { describe, expect, it } from 'vitest'
import { matchesHotkey } from './use-hotkeys'

function keydown(init: KeyboardEventInit) {
  return new KeyboardEvent('keydown', init)
}

describe('matchesHotkey', () => {
  const send = { key: 'Enter', mod: true, handler: () => undefined }
  const newRequest = { key: 'n', alt: true, handler: () => undefined }

  it('uses Cmd on Apple platforms and Ctrl elsewhere', () => {
    expect(matchesHotkey(keydown({ key: 'Enter', metaKey: true }), send, true)).toBe(true)
    expect(matchesHotkey(keydown({ key: 'Enter', ctrlKey: true }), send, true)).toBe(false)
    expect(matchesHotkey(keydown({ key: 'Enter', ctrlKey: true }), send, false)).toBe(true)
  })

  it('matches letters by physical key so Option combos work on macOS', () => {
    expect(matchesHotkey(keydown({ key: '˜', code: 'KeyN', altKey: true }), newRequest, true)).toBe(true)
  })

  it('requires exact modifiers', () => {
    expect(matchesHotkey(keydown({ key: 'n', code: 'KeyN' }), newRequest, false)).toBe(false)
    expect(matchesHotkey(keydown({ key: 'Enter', ctrlKey: true, altKey: true }), send, false)).toBe(false)
  })
})
