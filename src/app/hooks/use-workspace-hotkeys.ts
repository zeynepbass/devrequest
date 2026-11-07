import { useMemo, type RefObject } from 'react'
import { useHotkeys, type Hotkey } from '@/hooks/use-hotkeys'

interface WorkspaceHotkeyHandlers {
  urlInputRef: RefObject<HTMLInputElement | null>
  isLoading: boolean
  send: () => void
  cancel: () => void
  newRequest: () => void
  toggleHistory: () => void
  toggleTheme: () => void
  showShortcuts: () => void
}

export function useWorkspaceHotkeys({
  urlInputRef,
  isLoading,
  send,
  cancel,
  newRequest,
  toggleHistory,
  toggleTheme,
  showShortcuts,
}: WorkspaceHotkeyHandlers) {
  const hotkeys = useMemo<Hotkey[]>(
    () => [
      { key: 'Enter', mod: true, allowInEditable: true, handler: send },
      { key: 'Escape', allowInEditable: true, when: () => isLoading, handler: cancel },
      {
        key: 'l',
        alt: true,
        allowInEditable: true,
        handler: () => {
          urlInputRef.current?.focus()
          urlInputRef.current?.select()
        },
      },
      { key: 'n', alt: true, allowInEditable: true, handler: newRequest },
      { key: 'h', alt: true, allowInEditable: true, handler: toggleHistory },
      { key: 't', alt: true, allowInEditable: true, handler: toggleTheme },
      { key: '?', handler: showShortcuts },
    ],
    [urlInputRef, isLoading, send, cancel, newRequest, toggleHistory, toggleTheme, showShortcuts],
  )

  useHotkeys(hotkeys)
}
