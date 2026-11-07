import type { ReactNode, RefObject } from 'react'
import type { HttpMethod } from '@/types/http'
import { MethodSelect } from './method-select'

interface RequestBarProps {
  method: HttpMethod
  url: string
  urlInputRef?: RefObject<HTMLInputElement | null>
  invalid?: boolean
  onMethodChange: (method: HttpMethod) => void
  onUrlChange: (url: string) => void
  onSubmit?: () => void
  actions?: ReactNode
}

export function RequestBar({
  method,
  url,
  urlInputRef,
  invalid,
  onMethodChange,
  onUrlChange,
  onSubmit,
  actions,
}: RequestBarProps) {
  return (
    <form
      className="flex flex-col gap-2 sm:flex-row"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit?.()
      }}
    >
      <div className="flex min-w-0 flex-1">
        <MethodSelect value={method} onChange={onMethodChange} />
        <input
          ref={urlInputRef}
          type="text"
          inputMode="url"
          value={url}
          aria-label="Request URL"
          aria-invalid={invalid || undefined}
          placeholder="https://api.example.com/v1/resource"
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
          className="h-10 min-w-0 flex-1 rounded-r-md border border-input bg-surface-sunken px-3 font-mono text-[13px] outline-none transition-[color,box-shadow,border-color] placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-destructive/20"
          onChange={(event) => onUrlChange(event.target.value)}
        />
      </div>
      {actions}
    </form>
  )
}
