import type { ReactNode } from 'react'

interface WorkspaceLayoutProps {
  toolbar: ReactNode
  request: ReactNode
  response: ReactNode
}

export function WorkspaceLayout({ toolbar, request, response }: WorkspaceLayoutProps) {
  return (
    <>
      <div className="shrink-0 border-b bg-surface p-3 sm:px-4">{toolbar}</div>
      <div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-2">
        <section
          aria-label="Request configuration"
          className="flex min-h-[22rem] min-w-0 flex-col border-b xl:min-h-0 xl:border-r xl:border-b-0"
        >
          {request}
        </section>
        <section aria-label="Response" className="flex min-h-[24rem] min-w-0 flex-col bg-surface-sunken xl:min-h-0">
          {response}
        </section>
      </div>
    </>
  )
}
