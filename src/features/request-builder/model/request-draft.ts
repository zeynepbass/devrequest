import type { KeyValueEntry, RequestDraft } from '@/types/http'
import { createId } from '@/utils/id'

export function createEntry(values: Partial<Omit<KeyValueEntry, 'id'>> = {}): KeyValueEntry {
  return {
    id: createId(),
    key: values.key ?? '',
    value: values.value ?? '',
    enabled: values.enabled ?? true,
  }
}

export function createEmptyDraft(): RequestDraft {
  return {
    method: 'GET',
    url: '',
    params: [],
    headers: [],
    body: { mode: 'none', json: '', text: '' },
    auth: { type: 'none' },
  }
}
