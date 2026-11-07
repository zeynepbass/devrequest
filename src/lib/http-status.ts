const STATUS_TEXT: Record<number, string> = {
  100: 'Continue',
  101: 'Switching Protocols',
  200: 'OK',
  201: 'Created',
  202: 'Accepted',
  203: 'Non-Authoritative Information',
  204: 'No Content',
  205: 'Reset Content',
  206: 'Partial Content',
  300: 'Multiple Choices',
  301: 'Moved Permanently',
  302: 'Found',
  303: 'See Other',
  304: 'Not Modified',
  307: 'Temporary Redirect',
  308: 'Permanent Redirect',
  400: 'Bad Request',
  401: 'Unauthorized',
  402: 'Payment Required',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  408: 'Request Timeout',
  409: 'Conflict',
  410: 'Gone',
  411: 'Length Required',
  412: 'Precondition Failed',
  413: 'Content Too Large',
  414: 'URI Too Long',
  415: 'Unsupported Media Type',
  418: "I'm a Teapot",
  422: 'Unprocessable Content',
  425: 'Too Early',
  428: 'Precondition Required',
  429: 'Too Many Requests',
  431: 'Request Header Fields Too Large',
  451: 'Unavailable For Legal Reasons',
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
  505: 'HTTP Version Not Supported',
  511: 'Network Authentication Required',
}

export type StatusTone = 'info' | 'success' | 'redirect' | 'client' | 'server'

export function getStatusText(status: number, statusText?: string): string {
  return statusText?.trim() || STATUS_TEXT[status] || 'Unknown Status'
}

export function getStatusTone(status: number): StatusTone {
  if (status >= 500) return 'server'
  if (status >= 400) return 'client'
  if (status >= 300) return 'redirect'
  if (status >= 200) return 'success'
  return 'info'
}

export const STATUS_TONE_CLASS: Record<StatusTone, string> = {
  info: 'bg-muted text-muted-foreground ring-border',
  success: 'bg-status-success/12 text-status-success ring-status-success/25',
  redirect: 'bg-status-redirect/12 text-status-redirect ring-status-redirect/25',
  client: 'bg-status-client/12 text-status-client ring-status-client/25',
  server: 'bg-status-server/12 text-status-server ring-status-server/25',
}
