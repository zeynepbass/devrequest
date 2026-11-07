import { AuthPanel } from '@/features/authorization/components/auth-panel'
import { useMemo } from 'react'
import { KeyValueEditor } from '@/components/shared/key-value-editor'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { EntryPatch, KeyValueCollection, KeyValueEntry, RequestDraft } from '@/types/http'
import { COMMON_HEADERS } from '../constants'
import type { RequestDraftActions } from '../hooks/use-request-draft'
import { BodyEditor } from './body-editor'

interface RequestTabsProps {
  draft: RequestDraft
  actions: RequestDraftActions
}

function countActive(entries: KeyValueEntry[]): number {
  return entries.filter((entry) => entry.enabled && entry.key.trim()).length
}

function TabCount({ value }: { value: number }) {
  if (!value) {
    return null
  }
  return (
    <span className="rounded-sm bg-primary/15 px-1 font-mono text-[10px] leading-4 text-primary tabular-nums">
      {value}
    </span>
  )
}

const triggerClass =
  'h-9 flex-none rounded-none border-0 px-3 text-[13px] data-[state=active]:bg-transparent dark:data-[state=active]:bg-transparent dark:data-[state=active]:border-transparent after:bg-primary'

function useCollectionHandlers(actions: RequestDraftActions, collection: KeyValueCollection) {
  return useMemo(
    () => ({
      onAdd: () => actions.addEntry(collection),
      onChange: (id: string, patch: EntryPatch) => actions.updateEntry(collection, id, patch),
      onRemove: (id: string) => actions.removeEntry(collection, id),
    }),
    [actions, collection],
  )
}

export function RequestTabs({ draft, actions }: RequestTabsProps) {
  const paramHandlers = useCollectionHandlers(actions, 'params')
  const headerHandlers = useCollectionHandlers(actions, 'headers')

  return (
    <Tabs defaultValue="params" className="min-h-0 flex-1 gap-0">
      <TabsList variant="line" className="h-10 w-full justify-start overflow-x-auto border-b px-2 sm:px-3">
        <TabsTrigger value="params" className={triggerClass}>
          Query Params <TabCount value={countActive(draft.params)} />
        </TabsTrigger>
        <TabsTrigger value="headers" className={triggerClass}>
          Headers <TabCount value={countActive(draft.headers)} />
        </TabsTrigger>
        <TabsTrigger value="body" className={triggerClass}>
          Body
          {draft.body.mode !== 'none' ? <span aria-hidden="true" className="size-1.5 rounded-full bg-primary" /> : null}
        </TabsTrigger>
        <TabsTrigger value="auth" className={triggerClass}>
          Authorization
          {draft.auth.type !== 'none' ? <span aria-hidden="true" className="size-1.5 rounded-full bg-primary" /> : null}
        </TabsTrigger>
      </TabsList>
      <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
        <TabsContent value="params">
          <KeyValueEditor
            label="Query parameters"
            entries={draft.params}
            keyPlaceholder="parameter"
            valuePlaceholder="value"
            addLabel="Add parameter"
            {...paramHandlers}
          />
        </TabsContent>
        <TabsContent value="headers">
          <KeyValueEditor
            label="Request headers"
            entries={draft.headers}
            keyPlaceholder="Header-Name"
            valuePlaceholder="value"
            addLabel="Add header"
            keySuggestions={COMMON_HEADERS}
            {...headerHandlers}
          />
        </TabsContent>
        <TabsContent value="body" className="flex min-h-full flex-col">
          <BodyEditor
            method={draft.method}
            body={draft.body}
            onModeChange={actions.setBodyMode}
            onContentChange={actions.setBodyContent}
          />
        </TabsContent>
        <TabsContent value="auth">
          <AuthPanel auth={draft.auth} onChange={actions.setAuth} />
        </TabsContent>
      </div>
    </Tabs>
  )
}
