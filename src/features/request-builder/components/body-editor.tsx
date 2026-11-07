import { SegmentedControl } from '@/components/shared/segmented-control'
import type { BodyMode, HttpMethod, RequestBody } from '@/types/http'
import { FileX2Icon, InfoIcon } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'

const BODY_MODE_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'json', label: 'JSON' },
  { value: 'text', label: 'Raw Text' },
] as const satisfies readonly { value: BodyMode; label: string }[]

interface BodyEditorProps {
  method: HttpMethod
  body: RequestBody
  onModeChange: (mode: BodyMode) => void
  onContentChange: (content: string) => void
}

export function BodyEditor({ method, body, onModeChange, onContentChange }: BodyEditorProps) {
  const content = body.mode === 'none' ? '' : body[body.mode]

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <SegmentedControl label="Body type" value={body.mode} options={BODY_MODE_OPTIONS} onChange={onModeChange} />
      </div>
      {method === 'GET' && body.mode !== 'none' ? (
        <p className="flex items-start gap-2 rounded-md border border-status-client/30 bg-status-client/10 px-3 py-2 text-xs text-foreground/90">
          <InfoIcon className="mt-px size-3.5 shrink-0 text-status-client" />
          Browsers do not allow a body on GET requests. It will be ignored unless you switch the method.
        </p>
      ) : null}
      {body.mode === 'none' ? (
        <EmptyState
          icon={<FileX2Icon />}
          title="This request has no body"
          description="Choose JSON or Raw Text to send a payload."
          className="rounded-lg border border-dashed"
        />
      ) : (
        <textarea
          value={content}
          aria-label={body.mode === 'json' ? 'JSON body' : 'Raw text body'}
          spellCheck={false}
          placeholder={body.mode === 'json' ? '{\n  "name": "DevRequest"\n}' : 'Plain text payload'}
          className="min-h-56 flex-1 resize-none rounded-lg border bg-surface-sunken p-3 font-mono text-[13px] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30"
          onChange={(event) => onContentChange(event.target.value)}
        />
      )}
    </div>
  )
}
