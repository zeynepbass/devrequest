import { lazy, Suspense } from 'react'
import { cn } from '@/lib/utils'
import type { CodeEditorProps } from './code-editor-impl'

const LazyCodeEditor = lazy(() => import('./code-editor-impl'))

export type { CodeEditorProps }

function EditorFallback({ className }: { className?: string }) {
  return (
    <div className={cn('flex min-h-0 flex-col gap-2 p-4', className)} aria-busy="true" aria-label="Loading editor">
      {[72, 48, 64, 36].map((width) => (
        <span key={width} className="h-3 animate-pulse rounded bg-muted" style={{ width: `${width}%` }} />
      ))}
    </div>
  )
}

export function CodeEditor(props: CodeEditorProps) {
  return (
    <Suspense fallback={<EditorFallback className={props.className} />}>
      <LazyCodeEditor {...props} />
    </Suspense>
  )
}
