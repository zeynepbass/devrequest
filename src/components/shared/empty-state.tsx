import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description?: ReactNode
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center', className)}>
      <div className="flex size-11 items-center justify-center rounded-xl border bg-surface-raised text-muted-foreground [&_svg]:size-5">
        {icon}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">{title}</p>
        {description ? <div className="max-w-xs text-sm text-muted-foreground">{description}</div> : null}
      </div>
      {action}
    </div>
  )
}
