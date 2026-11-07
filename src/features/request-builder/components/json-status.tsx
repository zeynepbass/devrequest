import { CircleCheckIcon, CircleXIcon } from 'lucide-react'
import type { JsonValidation } from '@/utils/json'

interface JsonStatusProps {
  validation: JsonValidation
}

export function JsonStatus({ validation }: JsonStatusProps) {
  if (validation.valid) {
    if (validation.empty) {
      return <span className="text-xs text-muted-foreground">Empty body</span>
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-status-success">
        <CircleCheckIcon className="size-3.5" />
        Valid JSON
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-destructive">
      <CircleXIcon className="size-3.5" />
      {validation.line ? `Invalid JSON at ${validation.line}:${validation.column ?? 1}` : 'Invalid JSON'}
    </span>
  )
}
