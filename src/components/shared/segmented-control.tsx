import { useRef, type KeyboardEvent } from 'react'
import { cn } from '@/lib/utils'

interface SegmentedOption<T extends string> {
  value: T
  label: string
}

interface SegmentedControlProps<T extends string> {
  label: string
  value: T
  options: readonly SegmentedOption<T>[]
  onChange: (value: T) => void
  className?: string
}

export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  const buttonsRef = useRef<Array<HTMLButtonElement | null>>([])

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const direction = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
    if (!direction) {
      return
    }
    event.preventDefault()
    const currentIndex = options.findIndex((option) => option.value === value)
    const nextIndex = (currentIndex + direction + options.length) % options.length
    const next = options[nextIndex]
    if (next) {
      onChange(next.value)
      buttonsRef.current[nextIndex]?.focus()
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={handleKeyDown}
      className={cn('inline-flex items-center gap-0.5 rounded-md border bg-surface-sunken p-0.5', className)}
    >
      {options.map((option, index) => {
        const checked = option.value === value
        return (
          <button
            key={option.value}
            ref={(node) => {
              buttonsRef.current[index] = node
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            onClick={() => onChange(option.value)}
            className={cn(
              'h-6 rounded-[5px] px-2.5 text-xs font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50',
              checked && 'bg-surface-raised text-foreground shadow-xs ring-1 ring-border',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
