import { METHOD_TEXT_CLASS } from '@/lib/http-meta'
import { cn } from '@/lib/utils'
import type { HttpMethod } from '@/types/http'

interface MethodBadgeProps {
  method: HttpMethod
  className?: string
}

export function MethodBadge({ method, className }: MethodBadgeProps) {
  return (
    <span className={cn('font-mono text-[11px] font-semibold tracking-wide', METHOD_TEXT_CLASS[method], className)}>
      {method === 'DELETE' ? 'DEL' : method}
    </span>
  )
}
