export function isApplePlatform(): boolean {
  if (typeof navigator === 'undefined') {
    return false
  }
  return /mac|iphone|ipad|ipod/i.test(navigator.platform || navigator.userAgent)
}

export function formatShortcut(keys: readonly string[]): string[] {
  const apple = isApplePlatform()
  return keys.map((key) => {
    switch (key) {
      case 'Mod':
        return apple ? '⌘' : 'Ctrl'
      case 'Alt':
        return apple ? '⌥' : 'Alt'
      case 'Shift':
        return apple ? '⇧' : 'Shift'
      case 'Enter':
        return apple ? '↵' : 'Enter'
      case 'Escape':
        return 'Esc'
      default:
        return key
    }
  })
}
