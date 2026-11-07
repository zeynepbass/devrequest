import { CopyIcon, DownloadIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { IconButton } from '@/components/shared/icon-button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useClipboard } from '@/hooks/use-clipboard'
import type { HttpResponse } from '@/types/response'
import { createDownloadName, downloadBlob } from '@/utils/download'
import { tryFormatJson } from '@/utils/json'
import { ResponseBody } from './response-body'
import { ResponseHeadersTable } from './response-headers-table'
import { ResponseMeta } from './response-meta'
import { PANEL_TAB_TRIGGER_CLASS } from '@/lib/tab-styles'

type ResponseTab = 'pretty' | 'raw' | 'headers'

interface ResponseViewProps {
  response: HttpResponse
}

function isResponseTab(value: string): value is ResponseTab {
  return value === 'pretty' || value === 'raw' || value === 'headers'
}

export function ResponseView({ response }: ResponseViewProps) {
  const [tab, setTab] = useState<ResponseTab>('pretty')
  const copy = useClipboard()

  const prettyText = useMemo(
    () => (response.bodyKind === 'json' ? (tryFormatJson(response.bodyText) ?? response.bodyText) : response.bodyText),
    [response.bodyKind, response.bodyText],
  )

  function handleCopy() {
    if (tab === 'headers') {
      void copy(response.headers.map(([name, value]) => `${name}: ${value}`).join('\n'), 'Headers copied')
      return
    }
    void copy(tab === 'pretty' ? prettyText : response.bodyText, 'Response copied')
  }

  function handleDownload() {
    downloadBlob(response.bodyBlob, createDownloadName(response.url, response.bodyKind))
  }

  return (
    <Tabs
      value={tab}
      onValueChange={(value) => {
        if (isResponseTab(value)) {
          setTab(value)
        }
      }}
      className="min-h-0 flex-1 gap-0"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b px-3 py-2 sm:px-4">
        <ResponseMeta response={response} />
        <div className="ml-auto flex items-center gap-0.5">
          <IconButton
            label={tab === 'headers' ? 'Copy headers' : 'Copy response'}
            icon={<CopyIcon />}
            disabled={tab !== 'headers' && response.bodyKind === 'binary'}
            onClick={handleCopy}
          />
          <IconButton label="Download response" icon={<DownloadIcon />} onClick={handleDownload} />
        </div>
      </div>
      <TabsList variant="line" className="h-10 w-full justify-start border-b px-2 sm:px-3">
        <TabsTrigger value="pretty" className={PANEL_TAB_TRIGGER_CLASS}>
          Pretty
        </TabsTrigger>
        <TabsTrigger value="raw" className={PANEL_TAB_TRIGGER_CLASS}>
          Raw
        </TabsTrigger>
        <TabsTrigger value="headers" className={PANEL_TAB_TRIGGER_CLASS}>
          Headers
          <span className="rounded-sm bg-muted px-1 font-mono text-[10px] leading-4 text-muted-foreground tabular-nums">
            {response.headers.length}
          </span>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="pretty" className="flex min-h-0 flex-col">
        <ResponseBody response={response} view="pretty" prettyText={prettyText} />
      </TabsContent>
      <TabsContent value="raw" className="flex min-h-0 flex-col">
        <ResponseBody response={response} view="raw" prettyText={prettyText} />
      </TabsContent>
      <TabsContent value="headers" className="min-h-0 overflow-y-auto">
        <ResponseHeadersTable headers={response.headers} />
      </TabsContent>
    </Tabs>
  )
}
