const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/login.page');
const { DashboardPage } = require('../pages/dashboard.page');
const { loginAsAdmin } = require('../utils/helpers');

test.describe('Login tests', () => {
  test('valid admin login opens dashboard', { tag: ['@smoke', '@authentication'] }, async ({ page }) => {
    await loginAsAdmin(page);

    const dashboard = new DashboardPage(page);
    await expect(page).toHaveURL(/dashboard/);
    await expect(dashboard.dashboardTitle).toBeVisible();
  });

  test('invalid login shows error message', { tag: ['@regression', '@authentication'] }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('wronguser', 'wrongpass123');

    await expect(loginPage.errorMessage).toHaveText('Invalid credentials');
    await expect(page).toHaveURL(/auth\/login/);
  });

  test('empty login shows required message', { tag: ['@regression', '@authentication'] }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginButton.click();

    await expect(loginPage.requiredMessages).toHaveCount(2);
    await expect(loginPage.requiredMessages.first()).toHaveText('Required');
  });

  test('admin can logout', { tag: ['@smoke', '@authentication'] }, async ({ page }) => {
    await loginAsAdmin(page);

    const dashboard = new DashboardPage(page);
    await dashboard.logout();
    await expect(page).toHaveURL(/auth\/login/);

    // after logout, dashboard should not open
    await page.goto('/web/index.php/dashboard/index');
    await expect(page).toHaveURL(/auth\/login/);
  });
});
