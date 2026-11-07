import { expect, test, type Page } from '@playwright/test'

const OUTPUT = 'docs/screenshots'

test.use({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, colorScheme: 'dark' })

async function prepare(page: Page, theme: 'dark' | 'light' = 'dark') {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.addInitScript((value) => window.localStorage.setItem('devrequest:theme', value), theme)
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
}

async function send(page: Page, url: string) {
  await page.getByLabel('Request URL').fill(url)
  await page.getByRole('button', { name: 'Send', exact: true }).click()
  await expect(page.getByTestId('response-status')).toBeVisible({ timeout: 20_000 })
}

async function capture(page: Page, name: string) {
  await page.mouse.move(0, 0)
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${OUTPUT}/${name}.png` })
}

test('main interface', async ({ page }) => {
  await prepare(page)
  await send(page, 'https://jsonplaceholder.typicode.com/posts/1')
  await send(page, 'https://httpbin.org/status/404')
  await send(page, 'https://jsonplaceholder.typicode.com/posts?userId=1&_limit=3')
  await page.getByRole('tab', { name: /Query Params/ }).click()
  await capture(page, '01-main-interface')
})

test('request builder with JSON body', async ({ page }) => {
  await prepare(page)
  await page.getByRole('button', { name: /POST JSON/ }).click()
  await page.getByRole('tab', { name: /Body/ }).click()
  await expect(page.getByLabel('JSON body')).toBeVisible()
  await send(page, 'https://jsonplaceholder.typicode.com/posts')
  await capture(page, '02-request-builder-json')
})

test('response viewer with real JSON', async ({ page }) => {
  await prepare(page)
  await send(page, 'https://jsonplaceholder.typicode.com/users/1')
  await expect(page.getByLabel('Formatted response body')).toContainText('Leanne Graham')
  await capture(page, '03-response-viewer')
})

test('response headers and light theme', async ({ page }) => {
  await prepare(page, 'light')
  await send(page, 'https://httpbin.org/get?source=devrequest')
  await page
    .getByRole('tab', { name: /^Headers/ })
    .last()
    .click()
  await capture(page, '04-light-theme-headers')
})

test('mobile layout', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await prepare(page)
  await send(page, 'https://jsonplaceholder.typicode.com/todos/1')
  await capture(page, '05-mobile')
})
