import { BinaryIcon, FileIcon } from 'lucide-react'
import { CodeEditor } from '@/components/shared/code-editor'
import { EmptyState } from '@/components/shared/empty-state'
import type { HttpResponse } from '@/types/response'
import { formatBytes } from '@/utils/format'

interface ResponseBodyProps {
  response: HttpResponse
  view: 'pretty' | 'raw'
  prettyText: string
}

export function ResponseBody({ response, view, prettyText }: ResponseBodyProps) {
  if (response.bodyKind === 'empty') {
    return (
      <EmptyState
        icon={<FileIcon />}
        title="Empty response body"
        description={`The server answered with ${response.status} and no content.`}
      />
    )
  }

  if (response.bodyKind === 'binary') {
    return (
      <EmptyState
        icon={<BinaryIcon />}
        title="Binary content"
        description={`${response.contentType || 'Unknown type'} · ${formatBytes(response.sizeBytes)}. Use download to save the file.`}
      />
    )
  }

  if (view === 'raw') {
    return (
      <pre
        data-testid="response-raw"
        tabIndex={0}
        aria-label="Raw response body"
        className="min-h-0 flex-1 overflow-auto p-4 font-mono text-[13px] leading-relaxed whitespace-pre-wrap break-all outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-inset"
      >
        {response.bodyText}
      </pre>
    )
  }

  return (
    <CodeEditor
      value={prettyText}
      language={response.bodyKind === 'json' ? 'json' : 'text'}
      ariaLabel="Formatted response body"
      readOnly
      className="flex-1"
    />
  )
}
