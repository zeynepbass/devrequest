import { createEmptyDraft, createEntry } from '@/features/request-builder/model/request-draft'
import type { RequestDraft } from '@/types/http'

export function makeDraft(overrides: Partial<RequestDraft> = {}): RequestDraft {
  return { ...createEmptyDraft(), url: 'https://api.example.com/items', ...overrides }
}

export { createEntry }

export function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    ...init,
    headers: { 'content-type': 'application/json; charset=utf-8', ...init.headers },
  })
}
