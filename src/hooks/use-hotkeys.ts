import { useEffect, useRef } from 'react'
import { isApplePlatform } from '@/lib/platform'

export interface Hotkey {
  key: string
  mod?: boolean
  alt?: boolean
  shift?: boolean
  allowInEditable?: boolean
  when?: () => boolean
  handler: (event: KeyboardEvent) => void
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false
  }
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

function matchesKey(event: KeyboardEvent, key: string): boolean {
  if (key.length === 1 && /[a-z]/i.test(key)) {
    return event.code === `Key${key.toUpperCase()}`
  }
  return event.key === key
}

export function matchesHotkey(event: KeyboardEvent, hotkey: Hotkey, apple = isApplePlatform()): boolean {
  const modPressed = apple ? event.metaKey : event.ctrlKey
  const otherModifier = apple ? event.ctrlKey : event.metaKey
  return (
    matchesKey(event, hotkey.key) &&
    modPressed === Boolean(hotkey.mod) &&
    !otherModifier &&
    event.altKey === Boolean(hotkey.alt) &&
    (hotkey.shift === undefined || event.shiftKey === hotkey.shift)
  )
}

export function useHotkeys(hotkeys: readonly Hotkey[]): void {
  const hotkeysRef = useRef(hotkeys)

  useEffect(() => {
    hotkeysRef.current = hotkeys
  }, [hotkeys])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.isComposing) {
        return
      }
      const editable = isEditableTarget(event.target)
      for (const hotkey of hotkeysRef.current) {
        if (!matchesHotkey(event, hotkey)) continue
        if (editable && !hotkey.allowInEditable) continue
        if (hotkey.when && !hotkey.when()) continue
        event.preventDefault()
        hotkey.handler(event)
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
}
