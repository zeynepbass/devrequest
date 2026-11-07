import type { RequestDraft } from '@/types/http'
import { createEmptyDraft, createEntry } from './model/request-draft'

export interface ExampleRequest {
  id: string
  label: string
  description: string
  create: () => RequestDraft
}

export const EXAMPLE_REQUESTS: readonly ExampleRequest[] = [
  {
    id: 'list-posts',
    label: 'GET posts',
    description: 'JSONPlaceholder · query params',
    create: () => ({
      ...createEmptyDraft(),
      url: 'https://jsonplaceholder.typicode.com/posts?userId=1&_limit=5',
      params: [createEntry({ key: 'userId', value: '1' }), createEntry({ key: '_limit', value: '5' })],
    }),
  },
  {
    id: 'create-post',
    label: 'POST JSON',
    description: 'JSONPlaceholder · JSON body',
    create: () => ({
      ...createEmptyDraft(),
      method: 'POST',
      url: 'https://jsonplaceholder.typicode.com/posts',
      headers: [createEntry({ key: 'Accept', value: 'application/json' })],
      body: {
        mode: 'json',
        json: JSON.stringify({ title: 'Hello from DevRequest', body: 'Testing a real API call.', userId: 1 }, null, 2),
        text: '',
      },
    }),
  },
  {
    id: 'not-found',
    label: 'GET 404',
    description: 'httpbin · error status',
    create: () => ({ ...createEmptyDraft(), url: 'https://httpbin.org/status/404' }),
  },
]
