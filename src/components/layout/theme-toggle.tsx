import { MoonIcon, SunIcon } from 'lucide-react'
import { IconButton } from '@/components/shared/icon-button'
import { useTheme } from '@/hooks/use-theme'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const nextLabel = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'

  return (
    <IconButton
      label={nextLabel}
      onClick={toggleTheme}
      icon={theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    />
  )
}
