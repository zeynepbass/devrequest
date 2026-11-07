import { z } from 'zod'
import { AUTH_TYPES } from '@/types/auth'
import { BODY_MODES, HTTP_METHODS } from '@/types/http'

const keyValueEntrySchema = z.object({
  id: z.string().min(1),
  key: z.string(),
  value: z.string(),
  enabled: z.boolean(),
})

export const storedRequestSchema = z.object({
  method: z.enum(HTTP_METHODS),
  url: z.string(),
  params: z.array(keyValueEntrySchema),
  headers: z.array(keyValueEntrySchema),
  body: z.object({
    mode: z.enum(BODY_MODES),
    json: z.string(),
    text: z.string(),
  }),
  authType: z.enum(AUTH_TYPES),
})

export const historyEntrySchema = z.object({
  id: z.string().min(1),
  savedAt: z.number().int().nonnegative(),
  request: storedRequestSchema,
  result: z.discriminatedUnion('ok', [
    z.object({ ok: z.literal(true), status: z.number().int(), durationMs: z.number().nonnegative() }),
    z.object({ ok: z.literal(false), errorTitle: z.string() }),
  ]),
})

export const historySchema = z.object({
  version: z.literal(1),
  entries: z.array(historyEntrySchema),
})

export type StoredRequest = z.infer<typeof storedRequestSchema>
export type HistoryEntry = z.infer<typeof historyEntrySchema>
export type HistoryResult = HistoryEntry['result']
