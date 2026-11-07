import type {
  BodyMode,
  HttpMethod,
  KeyValueCollection,
  KeyValueEntry,
  RequestDraft,
} from '@/types/http'
import { applyQueryParams, extractQueryParams } from '@/utils/url'
import { createEmptyDraft, createEntry } from './request-draft'

export type EntryPatch = Partial<Pick<KeyValueEntry, 'key' | 'value' | 'enabled'>>

export type RequestAction =
  | { type: 'set-method'; method: HttpMethod }
  | { type: 'set-url'; url: string }
  | { type: 'add-entry'; collection: KeyValueCollection }
  | { type: 'update-entry'; collection: KeyValueCollection; id: string; patch: EntryPatch }
  | { type: 'remove-entry'; collection: KeyValueCollection; id: string }
  | { type: 'set-body-mode'; mode: BodyMode }
  | { type: 'set-body-content'; content: string }
  | { type: 'load'; draft: RequestDraft }
  | { type: 'reset' }

function syncParamsFromUrl(current: KeyValueEntry[], url: string): KeyValueEntry[] {
  const enabled = current.filter((entry) => entry.enabled)
  const disabled = current.filter((entry) => !entry.enabled)
  const parsed = extractQueryParams(url).map((pair, index) => ({
    id: enabled[index]?.id ?? createEntry().id,
    key: pair.key,
    value: pair.value,
    enabled: true,
  }))

  return [...parsed, ...disabled]
}

function syncUrlFromParams(url: string, params: KeyValueEntry[]): string {
  return applyQueryParams(
    url,
    params.filter((entry) => entry.enabled),
  )
}

function updateCollection(
  state: RequestDraft,
  collection: KeyValueCollection,
  entries: KeyValueEntry[],
): RequestDraft {
  if (collection === 'headers') {
    return { ...state, headers: entries }
  }

  return { ...state, params: entries, url: syncUrlFromParams(state.url, entries) }
}

export function requestReducer(state: RequestDraft, action: RequestAction): RequestDraft {
  switch (action.type) {
    case 'set-method':
      return { ...state, method: action.method }
    case 'set-url':
      return { ...state, url: action.url, params: syncParamsFromUrl(state.params, action.url) }
    case 'add-entry':
      return {
        ...state,
        [action.collection]: [...state[action.collection], createEntry()],
      }
    case 'update-entry':
      return updateCollection(
        state,
        action.collection,
        state[action.collection].map((entry) =>
          entry.id === action.id ? { ...entry, ...action.patch } : entry,
        ),
      )
    case 'remove-entry':
      return updateCollection(
        state,
        action.collection,
        state[action.collection].filter((entry) => entry.id !== action.id),
      )
    case 'set-body-mode':
      return { ...state, body: { ...state.body, mode: action.mode } }
    case 'set-body-content':
      if (state.body.mode === 'none') {
        return state
      }
      return { ...state, body: { ...state.body, [state.body.mode]: action.content } }
    case 'load':
      return action.draft
    case 'reset':
      return createEmptyDraft()
  }
}
