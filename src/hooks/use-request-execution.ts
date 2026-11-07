import { useCallback, useEffect, useRef, useState } from 'react'
import { buildRequest, executeRequest } from '@/services/http'
import type { RequestDraft } from '@/types/http'
import type { ExecutionOutcome, HttpResponse, RequestError } from '@/types/response'

export type ExecutionState =
  | { status: 'idle' }
  | { status: 'loading'; startedAt: number }
  | { status: 'success'; response: HttpResponse }
  | { status: 'error'; error: RequestError }

export type SendResult = { duplicate: true } | { duplicate: false; outcome: ExecutionOutcome }

interface UseRequestExecutionOptions {
  timeoutMs?: number
}

export function useRequestExecution({ timeoutMs }: UseRequestExecutionOptions = {}) {
  const [state, setState] = useState<ExecutionState>({ status: 'idle' })
  const controllerRef = useRef<AbortController | null>(null)

  useEffect(() => () => controllerRef.current?.abort(), [])

  const send = useCallback(
    async (draft: RequestDraft): Promise<SendResult> => {
      if (controllerRef.current) {
        return { duplicate: true }
      }

      const built = buildRequest(draft, window.location.protocol)
      if (!built.ok) {
        setState({ status: 'error', error: built.error })
        return { duplicate: false, outcome: { ok: false, error: built.error } }
      }

      const controller = new AbortController()
      controllerRef.current = controller
      setState({ status: 'loading', startedAt: Date.now() })

      const outcome = await executeRequest(built.request, { signal: controller.signal, timeoutMs })

      if (controllerRef.current === controller) {
        controllerRef.current = null
        setState(
          outcome.ok ? { status: 'success', response: outcome.response } : { status: 'error', error: outcome.error },
        )
      }

      return { duplicate: false, outcome }
    },
    [timeoutMs],
  )

  const cancel = useCallback(() => {
    controllerRef.current?.abort()
  }, [])

  const reset = useCallback(() => {
    controllerRef.current?.abort()
    controllerRef.current = null
    setState({ status: 'idle' })
  }, [])

  return { state, isLoading: state.status === 'loading', send, cancel, reset }
}
