import { MoonIcon, SunIcon } from 'lucide-react'
import { IconButton } from '@/components/shared/icon-button'
import { useTheme } from '@/hooks/use-theme'
import { getShortcutKeys } from '@/lib/shortcuts'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const nextLabel = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'

  return (
    <IconButton
      label={nextLabel}
      shortcut={getShortcutKeys('theme')}
      onClick={toggleTheme}
      icon={theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    />
  )
}
