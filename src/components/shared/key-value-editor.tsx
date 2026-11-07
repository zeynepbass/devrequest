import { PlusIcon, Trash2Icon } from 'lucide-react'
import { useId } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import type { KeyValueEntry } from '@/types/http'

export interface KeyValueEditorProps {
  label: string
  entries: KeyValueEntry[]
  keyPlaceholder: string
  valuePlaceholder: string
  addLabel: string
  keySuggestions?: readonly string[]
  onAdd: () => void
  onChange: (id: string, patch: Partial<Pick<KeyValueEntry, 'key' | 'value' | 'enabled'>>) => void
  onRemove: (id: string) => void
}

const inputClass =
  'h-8 w-full min-w-0 rounded-md border border-transparent bg-transparent px-2 font-mono text-[13px] outline-none transition-colors placeholder:text-muted-foreground/60 hover:border-border focus-visible:border-ring focus-visible:bg-surface-sunken focus-visible:ring-[3px] focus-visible:ring-ring/30'

export function KeyValueEditor({
  label,
  entries,
  keyPlaceholder,
  valuePlaceholder,
  addLabel,
  keySuggestions,
  onAdd,
  onChange,
  onRemove,
}: KeyValueEditorProps) {
  const suggestionsId = useId()

  return (
    <div className="flex flex-col gap-2">
      <div role="table" aria-label={label} className="overflow-hidden rounded-lg border bg-surface">
        <div
          role="row"
          className="grid grid-cols-[2.25rem_minmax(0,1fr)_minmax(0,1.4fr)_2.5rem] border-b bg-surface-sunken text-[11px] font-medium tracking-wide text-muted-foreground uppercase"
        >
          <span role="columnheader" className="sr-only">
            Enabled
          </span>
          <span aria-hidden="true" />
          <span role="columnheader" className="px-2 py-2">
            Key
          </span>
          <span role="columnheader" className="px-2 py-2">
            Value
          </span>
          <span role="columnheader" className="sr-only">
            Actions
          </span>
        </div>
        {entries.length === 0 ? (
          <div role="row" className="px-3 py-6 text-center text-sm text-muted-foreground">
            <span role="cell">Nothing here yet.</span>
          </div>
        ) : (
          entries.map((entry, index) => (
            <div
              key={entry.id}
              role="row"
              className={cn(
                'group grid grid-cols-[2.25rem_minmax(0,1fr)_minmax(0,1.4fr)_2.5rem] items-center border-b px-0.5 py-0.5 last:border-b-0',
                !entry.enabled && 'text-muted-foreground',
              )}
            >
              <span role="cell" className="flex justify-center">
                <Checkbox
                  checked={entry.enabled}
                  aria-label={`Enable ${entry.key || `row ${index + 1}`}`}
                  onCheckedChange={(checked) => onChange(entry.id, { enabled: checked === true })}
                />
              </span>
              <span role="cell" className="min-w-0">
                <input
                  value={entry.key}
                  placeholder={keyPlaceholder}
                  aria-label={`Key for row ${index + 1}`}
                  list={keySuggestions ? suggestionsId : undefined}
                  spellCheck={false}
                  autoComplete="off"
                  className={cn(inputClass, !entry.enabled && 'line-through decoration-muted-foreground/50')}
                  onChange={(event) => onChange(entry.id, { key: event.target.value })}
                />
              </span>
              <span role="cell" className="min-w-0">
                <input
                  value={entry.value}
                  placeholder={valuePlaceholder}
                  aria-label={`Value for row ${index + 1}`}
                  spellCheck={false}
                  autoComplete="off"
                  className={inputClass}
                  onChange={(event) => onChange(entry.id, { value: event.target.value })}
                />
              </span>
              <span role="cell" className="flex justify-center">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Remove ${entry.key || `row ${index + 1}`}`}
                  className="text-muted-foreground opacity-60 group-hover:opacity-100 hover:text-destructive focus-visible:opacity-100"
                  onClick={() => onRemove(entry.id)}
                >
                  <Trash2Icon />
                </Button>
              </span>
            </div>
          ))
        )}
      </div>
      <Button variant="ghost" size="sm" className="self-start text-muted-foreground hover:text-foreground" onClick={onAdd}>
        <PlusIcon />
        {addLabel}
      </Button>
      {keySuggestions ? (
        <datalist id={suggestionsId}>
          {keySuggestions.map((suggestion) => (
            <option key={suggestion} value={suggestion} />
          ))}
        </datalist>
      ) : null}
    </div>
  )
}
