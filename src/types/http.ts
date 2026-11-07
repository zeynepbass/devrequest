import type { AuthConfig } from './auth'

export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const

export type HttpMethod = (typeof HTTP_METHODS)[number]

export interface KeyValueEntry {
  id: string
  key: string
  value: string
  enabled: boolean
}

export type KeyValueCollection = 'headers' | 'params'

export const BODY_MODES = ['none', 'json', 'text'] as const

export type BodyMode = (typeof BODY_MODES)[number]

export interface RequestBody {
  mode: BodyMode
  json: string
  text: string
}

export interface RequestDraft {
  method: HttpMethod
  url: string
  params: KeyValueEntry[]
  headers: KeyValueEntry[]
  body: RequestBody
  auth: AuthConfig
}
