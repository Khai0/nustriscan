import { test, expect } from '@playwright/test'

test.describe('Landing page', () => {
  test('shows hero heading and CTA', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('dinh dưỡng')
    await expect(page.getByRole('link', { name: /Bắt đầu miễn phí/ })).toBeVisible()
  })

  test('navigates to login from navbar', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Đăng nhập' }).click()
    await expect(page).toHaveURL(/\/auth\/login/)
    await expect(page.getByRole('heading', { name: 'Đăng nhập' })).toBeVisible()
  })

  test('navigates to onboarding from CTA', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /Bắt đầu miễn phí/ }).first().click()
    await expect(page).toHaveURL(/\/onboarding/)
  })
})

test.describe('Login page', () => {
  test('shows validation errors on empty submit', async ({ page }) => {
    await page.goto('/auth/login')
    await page.getByRole('button', { name: 'Đăng nhập' }).click()
    await expect(page.getByText('Email không hợp lệ')).toBeVisible()
  })

  test('links to register page', async ({ page }) => {
    await page.goto('/auth/login')
    await page.getByRole('link', { name: 'Đăng ký ngay' }).click()
    await expect(page).toHaveURL(/\/auth\/register/)
  })

  test('shows demo account credentials hint', async ({ page }) => {
    await page.goto('/auth/login')
    await expect(page.getByText('demo@nutriscan.ai')).toBeVisible()
  })
})

test.describe('Protected routes', () => {
  test('redirects unauthenticated user to login when visiting dashboard', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/auth\/login/)
  })

  test('redirects unauthenticated user away from analytics', async ({ page }) => {
    await page.goto('/analytics')
    await expect(page).toHaveURL(/\/auth\/login/)
  })
})
