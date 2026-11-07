export type ResponseBodyKind = 'json' | 'html' | 'xml' | 'text' | 'binary' | 'empty'

export interface HttpResponse {
  url: string
  redirected: boolean
  status: number
  statusText: string
  headers: Array<[string, string]>
  contentType: string
  bodyKind: ResponseBodyKind
  bodyText: string
  bodyBlob: Blob
  sizeBytes: number
  durationMs: number
  receivedAt: number
}

export type RequestErrorKind =
  | 'invalid-url'
  | 'invalid-header'
  | 'invalid-body'
  | 'mixed-content'
  | 'network'
  | 'offline'
  | 'timeout'
  | 'aborted'

export interface RequestError {
  kind: RequestErrorKind
  title: string
  message: string
  hints: string[]
  durationMs?: number
}

export type ExecutionOutcome = { ok: true; response: HttpResponse } | { ok: false; error: RequestError }
