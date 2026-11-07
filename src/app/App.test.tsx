import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { HISTORY_STORAGE_KEY } from '@/features/request-history/lib/history-storage'
import { jsonResponse } from '@/test/factories'
import { App } from './App'

function setup(fetchImpl: typeof fetch = async () => jsonResponse({ id: 1, title: 'Hello' })) {
  const fetchMock = vi.fn<typeof fetch>(fetchImpl)
  vi.stubGlobal('fetch', fetchMock)
  const user = userEvent.setup()
  render(<App />)
  return { user, fetchMock, urlInput: screen.getByRole('textbox', { name: 'Request URL' }) }
}

function sendButton() {
  return screen.getByRole('button', { name: /^Send$/ })
}

describe('App', () => {
  it('sends a request and shows the response', async () => {
    const { user, fetchMock, urlInput } = setup()

    await user.type(urlInput, 'https://api.example.com/posts/1')
    await user.click(sendButton())

    expect(await screen.findByTestId('response-status')).toHaveTextContent('200OK')
    expect(screen.getByTestId('response-size')).toHaveTextContent('24 B')
    expect(fetchMock).toHaveBeenCalledWith('https://api.example.com/posts/1', expect.objectContaining({ method: 'GET' }))

    await user.click(screen.getByRole('tab', { name: 'Raw' }))
    expect(screen.getByTestId('response-raw')).toHaveTextContent('{"id":1,"title":"Hello"}')
  })

  it('keeps the URL and the query parameter table in sync', async () => {
    const { user, urlInput } = setup()

    await user.type(urlInput, 'https://api.example.com/search?q=cats')
    expect(screen.getByRole('textbox', { name: 'Key for row 1' })).toHaveValue('q')

    await user.click(screen.getByRole('button', { name: 'Add parameter' }))
    await user.type(screen.getByRole('textbox', { name: 'Key for row 2' }), 'page')
    await user.type(screen.getByRole('textbox', { name: 'Value for row 2' }), '2')
    expect(urlInput).toHaveValue('https://api.example.com/search?q=cats&page=2')

    await user.click(screen.getByRole('checkbox', { name: 'Enable q' }))
    expect(urlInput).toHaveValue('https://api.example.com/search?page=2')
  })

  it('sends custom headers and skips disabled ones', async () => {
    const { user, fetchMock, urlInput } = setup()

    await user.type(urlInput, 'https://api.example.com/me')
    await user.click(screen.getByRole('tab', { name: /Headers/ }))
    await user.click(screen.getByRole('button', { name: 'Add header' }))
    await user.type(screen.getByRole('combobox', { name: 'Key for row 1' }), 'X-Trace')
    await user.type(screen.getByRole('textbox', { name: 'Value for row 1' }), 'abc')
    await user.click(screen.getByRole('button', { name: 'Add header' }))
    await user.type(screen.getByRole('combobox', { name: 'Key for row 2' }), 'X-Off')
    await user.click(screen.getByRole('checkbox', { name: 'Enable X-Off' }))
    await user.click(sendButton())

    await screen.findByTestId('response-status')
    const headers = fetchMock.mock.calls[0]?.[1]?.headers
    expect(headers).toBeInstanceOf(Headers)
    expect(Object.fromEntries(headers as Headers)).toEqual({ 'x-trace': 'abc' })
  })

  it('sends the JSON body of an example request', async () => {
    const { user, fetchMock } = setup(async () => jsonResponse({ id: 101 }, { status: 201 }))

    await user.click(screen.getByRole('button', { name: /POST JSON/ }))
    await user.click(sendButton())

    expect(await screen.findByTestId('response-status')).toHaveTextContent('201Created')
    const init = fetchMock.mock.calls[0]?.[1]
    expect(init?.method).toBe('POST')
    expect(JSON.parse(String(init?.body))).toMatchObject({ userId: 1 })
  })

  it('shows HTTP error statuses inside the response viewer', async () => {
    const { user, urlInput } = setup(async () => jsonResponse({ message: 'Not found' }, { status: 404 }))

    await user.type(urlInput, 'https://api.example.com/missing')
    await user.click(sendButton())

    expect(await screen.findByTestId('response-status')).toHaveTextContent('404Not Found')
  })

  it('explains network failures instead of showing a response', async () => {
    const { user, urlInput } = setup(async () => {
      throw new TypeError('Failed to fetch')
    })

    await user.type(urlInput, 'https://blocked.example.com')
    await user.click(sendButton())

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Request failed')
    expect(alert).toHaveTextContent('CORS')
    expect(screen.queryByTestId('response-status')).not.toBeInTheDocument()
  })

  it('validates the URL before sending', async () => {
    const { user, fetchMock, urlInput } = setup()

    await user.type(urlInput, 'ftp://files.example.com')
    await user.click(sendButton())

    expect(await screen.findByRole('alert')).toHaveTextContent('Unsupported protocol')
    expect(urlInput).toHaveAttribute('aria-invalid', 'true')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('sends with the keyboard shortcut', async () => {
    const { user, fetchMock, urlInput } = setup()

    await user.type(urlInput, 'https://api.example.com/ping')
    await user.keyboard('{Control>}{Enter}{/Control}')

    await screen.findByTestId('response-status')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('stores requests in history without credentials and reopens them', async () => {
    const { user, urlInput } = setup()

    await user.type(urlInput, 'https://api.example.com/private')
    await user.click(screen.getByRole('tab', { name: /Authorization/ }))
    await user.click(screen.getByRole('radio', { name: 'Bearer Token' }))
    await user.type(screen.getByLabelText('Token'), 'top-secret-token')
    await user.click(sendButton())
    await screen.findByTestId('response-status')

    const stored = window.localStorage.getItem(HISTORY_STORAGE_KEY) ?? ''
    expect(stored).toContain('https://api.example.com/private')
    expect(stored).not.toContain('top-secret-token')

    await user.click(screen.getByRole('button', { name: 'New request' }))
    expect(urlInput).toHaveValue('')

    await user.click(screen.getByRole('button', { name: 'Show history' }))
    const list = await screen.findByRole('list', { name: 'Saved requests' })
    await user.click(within(list).getByRole('button', { name: /^GET\s*\/private/ }))

    await waitFor(() => expect(urlInput).toHaveValue('https://api.example.com/private'))
    await user.click(screen.getByRole('tab', { name: /Authorization/ }))
    expect(screen.getByLabelText('Token')).toHaveValue('')
  })

  it('toggles and remembers the theme', async () => {
    const { user } = setup()

    expect(document.documentElement).toHaveClass('dark')
    await user.click(screen.getByRole('button', { name: 'Switch to light theme' }))
    expect(document.documentElement).not.toHaveClass('dark')
    expect(window.localStorage.getItem('devrequest:theme')).toBe('light')
  })
})
