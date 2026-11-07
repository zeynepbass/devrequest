import type { ReactNode } from 'react'
import { LogoMark } from '@/components/shared/logo'
import { ThemeToggle } from './theme-toggle'

interface AppHeaderProps {
  actions?: ReactNode
}

export function AppHeader({ actions }: AppHeaderProps) {
  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b bg-surface-sunken px-3 sm:px-4">
      <a href="/" className="flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
        <LogoMark />
        <span className="text-[15px] font-semibold tracking-tight">
          Dev<span className="text-primary">Request</span>
        </span>
      </a>
      <div className="ml-auto flex items-center gap-1">
        {actions}
        <ThemeToggle />
      </div>
    </header>
  )
}
