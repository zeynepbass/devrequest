import { METHOD_TEXT_CLASS } from '@/lib/http-meta'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { HTTP_METHODS, type HttpMethod } from '@/types/http'

interface MethodSelectProps {
  value: HttpMethod
  onChange: (method: HttpMethod) => void
}

function isHttpMethod(value: string): value is HttpMethod {
  return (HTTP_METHODS as readonly string[]).includes(value)
}

export function MethodSelect({ value, onChange }: MethodSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(next) => {
        if (isHttpMethod(next)) {
          onChange(next)
        }
      }}
    >
      <SelectTrigger
        aria-label="HTTP method"
        className={cn(
          'h-10 w-[6.75rem] shrink-0 rounded-r-none border-r-0 bg-surface-sunken font-mono text-[13px] font-semibold shadow-none dark:bg-surface-sunken',
          METHOD_TEXT_CLASS[value],
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper" align="start" className="min-w-[8rem]">
        {HTTP_METHODS.map((method) => (
          <SelectItem
            key={method}
            value={method}
            className={cn('font-mono text-[13px] font-semibold', METHOD_TEXT_CLASS[method])}
          >
            {method}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
