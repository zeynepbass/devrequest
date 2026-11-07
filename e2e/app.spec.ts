import { expect, test } from '@playwright/test'

test.describe('DevRequest', () => {
  test('sends a real request and renders the JSON response', async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('Request URL').fill('https://jsonplaceholder.typicode.com/todos/1')
    await page.getByRole('button', { name: 'Send', exact: true }).click()

    await expect(page.getByTestId('response-status')).toContainText('200')
    await expect(page.getByLabel('Formatted response body')).toContainText('"userId": 1')
    await expect(page.getByRole('list', { name: 'Saved requests' })).toContainText('/todos/1')
  })

  test('shows a blocked cross-origin request as an error', async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('Request URL').fill('https://example.com')
    await page.getByRole('button', { name: 'Send', exact: true }).click()

    await expect(page.getByRole('alert')).toContainText('Request failed')
    await expect(page.getByTestId('response-status')).toHaveCount(0)
  })

  test('has no horizontal overflow on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(overflow).toBeLessThanOrEqual(0)
  })
})
