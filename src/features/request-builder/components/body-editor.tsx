import { FileX2Icon, InfoIcon, Minimize2Icon, WandSparklesIcon } from 'lucide-react'
import { useMemo } from 'react'
import { CodeEditor } from '@/components/shared/code-editor'
import { EmptyState } from '@/components/shared/empty-state'
import { SegmentedControl } from '@/components/shared/segmented-control'
import { Button } from '@/components/ui/button'
import type { BodyMode, HttpMethod, RequestBody } from '@/types/http'
import { formatJson, minifyJson, validateJson } from '@/utils/json'
import { JsonStatus } from './json-status'

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
  const validation = useMemo(() => validateJson(body.json), [body.json])
  const canTransform = validation.valid && !validation.empty

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <SegmentedControl label="Body type" value={body.mode} options={BODY_MODE_OPTIONS} onChange={onModeChange} />
        {body.mode === 'json' ? (
          <div className="flex items-center gap-1">
            <JsonStatus validation={validation} />
            <span aria-hidden="true" className="mx-1 h-4 w-px bg-border" />
            <Button
              variant="ghost"
              size="xs"
              disabled={!canTransform}
              onClick={() => onContentChange(formatJson(body.json))}
            >
              <WandSparklesIcon />
              Pretty
            </Button>
            <Button
              variant="ghost"
              size="xs"
              disabled={!canTransform}
              onClick={() => onContentChange(minifyJson(body.json))}
            >
              <Minimize2Icon />
              Minify
            </Button>
          </div>
        ) : null}
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
        <>
          <CodeEditor
            key={body.mode}
            value={body[body.mode]}
            language={body.mode === 'json' ? 'json' : 'text'}
            ariaLabel={body.mode === 'json' ? 'JSON body' : 'Raw text body'}
            placeholder={body.mode === 'json' ? '{ "name": "DevRequest" }' : 'Plain text payload'}
            onChange={onContentChange}
            className="min-h-64 flex-1 rounded-lg border bg-surface-sunken focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/30"
          />
          {body.mode === 'json' && !validation.valid ? (
            <p role="alert" className="font-mono text-xs text-destructive">
              {validation.message}
            </p>
          ) : null}
        </>
      )}
    </div>
  )
}
