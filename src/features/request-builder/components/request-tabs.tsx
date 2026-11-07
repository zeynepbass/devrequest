import { KeyValueEditor } from '@/components/shared/key-value-editor'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { KeyValueEntry, RequestDraft } from '@/types/http'
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

export function RequestTabs({ draft, actions }: RequestTabsProps) {
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
      </TabsList>
      <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
        <TabsContent value="params">
          <KeyValueEditor
            label="Query parameters"
            entries={draft.params}
            keyPlaceholder="parameter"
            valuePlaceholder="value"
            addLabel="Add parameter"
            onAdd={() => actions.addEntry('params')}
            onChange={(id, patch) => actions.updateEntry('params', id, patch)}
            onRemove={(id) => actions.removeEntry('params', id)}
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
            onAdd={() => actions.addEntry('headers')}
            onChange={(id, patch) => actions.updateEntry('headers', id, patch)}
            onRemove={(id) => actions.removeEntry('headers', id)}
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
      </div>
    </Tabs>
  )
}
