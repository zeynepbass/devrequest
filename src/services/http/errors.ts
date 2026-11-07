import type { RequestError, RequestErrorKind } from '@/types/response'

const DEFAULT_COPY: Record<RequestErrorKind, Pick<RequestError, 'title' | 'hints'>> = {
  'invalid-url': {
    title: 'Invalid URL',
    hints: ['Use an absolute http:// or https:// address.'],
  },
  'invalid-header': {
    title: 'Invalid header',
    hints: ['Header names may only contain letters, digits and !#$%&\'*+-.^_`|~ characters.'],
  },
  'invalid-auth': {
    title: 'Incomplete authorization',
    hints: ['Complete the Authorization tab or switch it to No Auth.'],
  },
  'invalid-body': {
    title: 'Invalid request body',
    hints: ['Fix the highlighted JSON or switch the body type to Raw Text.'],
  },
  'mixed-content': {
    title: 'Blocked insecure request',
    hints: [
      'This page is served over HTTPS, so the browser blocks plain HTTP requests.',
      'Use the https:// version of the API or run DevRequest locally.',
    ],
  },
  network: {
    title: 'Request failed',
    hints: [
      'The server may not allow cross-origin requests (CORS). Browsers hide the response in that case.',
      'Check that the domain exists and the server is reachable.',
      'Self-signed or invalid TLS certificates are rejected by the browser.',
    ],
  },
  offline: {
    title: 'You are offline',
    hints: ['Reconnect to the internet and send the request again.'],
  },
  timeout: {
    title: 'Request timed out',
    hints: ['The server did not respond in time. Try again or check the endpoint.'],
  },
  aborted: {
    title: 'Request cancelled',
    hints: [],
  },
}

export function createRequestError(
  kind: RequestErrorKind,
  message: string,
  extra: Partial<Pick<RequestError, 'hints' | 'durationMs'>> = {},
): RequestError {
  const copy = DEFAULT_COPY[kind]
  return {
    kind,
    title: copy.title,
    message,
    hints: extra.hints ?? copy.hints,
    durationMs: extra.durationMs,
  }
}
