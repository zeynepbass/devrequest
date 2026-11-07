import { InfoIcon } from 'lucide-react'

interface ResponseHeadersTableProps {
  headers: Array<[string, string]>
}

export function ResponseHeadersTable({ headers }: ResponseHeadersTableProps) {
  return (
    <div className="flex flex-col gap-3 p-3 sm:p-4">
      <div className="overflow-hidden rounded-lg border bg-surface">
        <table className="w-full table-fixed text-left">
          <caption className="sr-only">Response headers</caption>
          <thead className="border-b bg-surface-sunken text-[11px] tracking-wide text-muted-foreground uppercase">
            <tr>
              <th scope="col" className="w-2/5 px-3 py-2 font-medium">
                Name
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                Value
              </th>
            </tr>
          </thead>
          <tbody className="font-mono text-[12.5px]">
            {headers.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-3 py-6 text-center font-sans text-sm text-muted-foreground">
                  No headers are visible for this response.
                </td>
              </tr>
            ) : (
              headers.map(([name, value]) => (
                <tr key={name} className="border-b align-top last:border-b-0">
                  <th scope="row" className="px-3 py-2 font-normal break-words text-[var(--syntax-key)]">
                    {name}
                  </th>
                  <td className="px-3 py-2 break-all select-text">{value}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        <InfoIcon className="mt-px size-3.5 shrink-0" aria-hidden="true" />
        Browsers only expose CORS-safelisted headers and those listed in Access-Control-Expose-Headers.
      </p>
    </div>
  )
}
