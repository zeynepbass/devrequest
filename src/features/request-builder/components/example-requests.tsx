import { ArrowUpRightIcon } from 'lucide-react'
import type { RequestDraft } from '@/types/http'
import { EXAMPLE_REQUESTS } from '../examples'

interface ExampleRequestsProps {
  onSelect: (draft: RequestDraft) => void
}

export function ExampleRequests({ onSelect }: ExampleRequestsProps) {
  return (
    <div className="flex w-full max-w-md flex-col gap-2">
      <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">Try a public API</p>
      <div className="grid gap-2 sm:grid-cols-3">
        {EXAMPLE_REQUESTS.map((example) => (
          <button
            key={example.id}
            type="button"
            onClick={() => onSelect(example.create())}
            className="group flex flex-col items-start gap-0.5 rounded-lg border bg-surface px-3 py-2 text-left transition-colors outline-none hover:border-primary/40 hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/40"
          >
            <span className="flex w-full items-center justify-between font-mono text-xs font-semibold">
              {example.label}
              <ArrowUpRightIcon className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
            </span>
            <span className="text-[11px] text-muted-foreground">{example.description}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
