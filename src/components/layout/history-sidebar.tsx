import type { ReactNode } from 'react'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'

interface HistorySidebarProps {
  isDesktop: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
}

export function HistorySidebar({ isDesktop, open, onOpenChange, children }: HistorySidebarProps) {
  if (isDesktop) {
    return open ? (
      <aside aria-label="Request history" className="flex w-72 shrink-0 flex-col border-r bg-surface-sunken xl:w-80">
        {children}
      </aside>
    ) : null
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[85vw] max-w-sm gap-0 bg-surface-sunken p-0" showCloseButton={false}>
        <SheetTitle className="sr-only">Request history</SheetTitle>
        <SheetDescription className="sr-only">Previously sent requests stored in this browser.</SheetDescription>
        {children}
      </SheetContent>
    </Sheet>
  )
}
