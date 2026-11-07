import { useMemo, useReducer } from 'react'
import type { BodyMode, HttpMethod, KeyValueCollection, RequestDraft } from '@/types/http'
import { createEmptyDraft } from '../model/request-draft'
import { requestReducer, type EntryPatch } from '../model/request-reducer'

export interface RequestDraftActions {
  setMethod: (method: HttpMethod) => void
  setUrl: (url: string) => void
  addEntry: (collection: KeyValueCollection) => void
  updateEntry: (collection: KeyValueCollection, id: string, patch: EntryPatch) => void
  removeEntry: (collection: KeyValueCollection, id: string) => void
  setBodyMode: (mode: BodyMode) => void
  setBodyContent: (content: string) => void
  load: (draft: RequestDraft) => void
  reset: () => void
}

export function useRequestDraft() {
  const [draft, dispatch] = useReducer(requestReducer, undefined, createEmptyDraft)

  const actions = useMemo<RequestDraftActions>(
    () => ({
      setMethod: (method) => dispatch({ type: 'set-method', method }),
      setUrl: (url) => dispatch({ type: 'set-url', url }),
      addEntry: (collection) => dispatch({ type: 'add-entry', collection }),
      updateEntry: (collection, id, patch) => dispatch({ type: 'update-entry', collection, id, patch }),
      removeEntry: (collection, id) => dispatch({ type: 'remove-entry', collection, id }),
      setBodyMode: (mode) => dispatch({ type: 'set-body-mode', mode }),
      setBodyContent: (content) => dispatch({ type: 'set-body-content', content }),
      load: (next) => dispatch({ type: 'load', draft: next }),
      reset: () => dispatch({ type: 'reset' }),
    }),
    [],
  )

  return { draft, actions }
}
