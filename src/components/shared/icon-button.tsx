import type { ComponentProps, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { formatShortcut } from '@/lib/platform'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface IconButtonProps extends Omit<ComponentProps<typeof Button>, 'children'> {
  label: string
  shortcut?: readonly string[]
  icon: ReactNode
}

export function IconButton({ label, shortcut, icon, variant = 'ghost', size = 'icon-sm', ...props }: IconButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant={variant} size={size} aria-label={label} {...props}>
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="flex items-center gap-2">
        <span>{label}</span>
        {shortcut ? <kbd className="font-sans text-[11px] opacity-70">{formatShortcut(shortcut).join(' ')}</kbd> : null}
      </TooltipContent>
    </Tooltip>
  )
}
