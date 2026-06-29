import { test, expect } from '@playwright/test'

/**
 * This spec exercises the full demo-account login flow and core
 * authenticated navigation. Requires the backend API (with seeded
 * demo account demo@nutriscan.ai / Password123!) to be reachable
 * at VITE_API_URL.
 *
 * Run with: npm run test:e2e
 */

test.describe('Authenticated flow (demo account)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login')
    await page.getByLabel('Email').fill('demo@nutriscan.ai')
    await page.getByLabel('Mật khẩu').fill('Password123!')
    await page.getByRole('button', { name: 'Đăng nhập' }).click()
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 })
  })

  test('dashboard shows greeting and quick-scan button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Quét ngay/ })).toBeVisible()
    await expect(page.getByText(/Calo hôm nay/)).toBeVisible()
  })

  test('navigates to scan page via bottom nav / sidebar', async ({ page }) => {
    await page.getByRole('link', { name: /Quét/ }).first().click()
    await expect(page).toHaveURL(/\/scan/)
    await expect(page.getByText(/Tải ảnh lên hoặc kéo thả/)).toBeVisible()
  })

  test('navigates to analytics and shows score widgets', async ({ page }) => {
    await page.goto('/analytics')
    await expect(page.getByRole('heading', { name: 'Thống kê & Thành tích' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Tổng quan' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Thành tích' })).toBeVisible()
  })

  test('achievements tab shows level and streak', async ({ page }) => {
    await page.goto('/analytics')
    await page.getByRole('tab', { name: 'Thành tích' }).click()
    await expect(page.getByText(/Level/)).toBeVisible()
    await expect(page.getByText(/Chuỗi ngày hiện tại/)).toBeVisible()
  })

  test('logout returns to login page', async ({ page }) => {
    await page.goto('/profile')
    await page.getByRole('button', { name: 'Đăng xuất' }).click()
    await expect(page).toHaveURL(/\/auth\/login/)
  })
})
