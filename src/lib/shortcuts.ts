export const SHORTCUTS = [
  { id: 'send', keys: ['Mod', 'Enter'], description: 'Send request' },
  { id: 'cancel', keys: ['Escape'], description: 'Cancel running request' },
  { id: 'focus-url', keys: ['Alt', 'L'], description: 'Focus the URL field' },
  { id: 'new', keys: ['Alt', 'N'], description: 'New request' },
  { id: 'history', keys: ['Alt', 'H'], description: 'Toggle history' },
  { id: 'theme', keys: ['Alt', 'T'], description: 'Toggle theme' },
  { id: 'help', keys: ['?'], description: 'Show keyboard shortcuts' },
] as const

export type ShortcutId = (typeof SHORTCUTS)[number]['id']

export function getShortcutKeys(id: ShortcutId): readonly string[] {
  return SHORTCUTS.find((shortcut) => shortcut.id === id)?.keys ?? []
}
