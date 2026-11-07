import type { ResponseBodyKind } from '@/types/response'

const BINARY_TYPE_PATTERN = /^(image|audio|video|font)\/|^application\/(octet-stream|pdf|zip|gzip|x-tar|wasm|vnd\.)/i

export function detectBodyKind(contentType: string, text: string, sizeBytes: number): ResponseBodyKind {
  if (sizeBytes === 0) {
    return 'empty'
  }

  const type = contentType.toLowerCase()
  if (BINARY_TYPE_PATTERN.test(type) && !type.includes('svg')) {
    return 'binary'
  }
  if (type.includes('json')) {
    return 'json'
  }
  if (type.includes('html')) {
    return 'html'
  }
  if (type.includes('xml')) {
    return 'xml'
  }

  const trimmed = text.trimStart()
  if ((trimmed.startsWith('{') || trimmed.startsWith('[')) && isParsableJson(text)) {
    return 'json'
  }
  return 'text'
}

export function isParsableJson(text: string): boolean {
  try {
    JSON.parse(text)
    return true
  } catch {
    return false
  }
}

export function getCharset(contentType: string): string {
  const match = /charset=([^;]+)/i.exec(contentType)
  return match?.[1]?.trim().replace(/^"|"$/g, '') || 'utf-8'
}

export function decodeBody(buffer: ArrayBuffer, contentType: string): string {
  try {
    return new TextDecoder(getCharset(contentType)).decode(buffer)
  } catch {
    return new TextDecoder().decode(buffer)
  }
}
