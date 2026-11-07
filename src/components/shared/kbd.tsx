import { formatShortcut } from '@/lib/platform'
import { cn } from '@/lib/utils'

interface KbdProps {
  keys: readonly string[]
  className?: string
}

export function Kbd({ keys, className }: KbdProps) {
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      {formatShortcut(keys).map((key) => (
        <kbd
          key={key}
          className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-b-2 bg-surface-raised px-1 font-sans text-[11px] font-medium text-muted-foreground"
        >
          {key}
        </kbd>
      ))}
    </span>
  )
}
