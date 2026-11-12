const { test, expect } = require('@playwright/test');
const { env } = require('../config/environments');
const { LoginPage } = require('../pages/login.page');
const { DashboardPage } = require('../pages/dashboard.page');
const { PIMPage } = require('../pages/pim.page');
const { AddEmployeePage } = require('../pages/addEmployee.page');
const { AdminPage } = require('../pages/admin.page');
const { loginAsAdmin, deleteEmployeeIfExists } = require('../utils/helpers');
const { createEmployeeData, createEssUserData } = require('../utils/testData');

test.describe('Admin role checks', { tag: '@rbac' }, () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('admin can see Admin and PIM menu', { tag: '@smoke' }, async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await expect(dashboard.menuItem('Admin')).toBeVisible();
    await expect(dashboard.menuItem('PIM')).toBeVisible();
  });

  test('admin can open employee list and add employee page', { tag: '@regression' }, async ({ page }) => {
    const pimPage = new PIMPage(page);
    const addEmployeePage = new AddEmployeePage(page);

    await pimPage.goto();
    await expect(pimPage.title).toBeVisible();
    await expect(pimPage.tableRows.first()).toBeVisible();

    await pimPage.addButton.click();
    await expect(addEmployeePage.title).toBeVisible();
  });

  test('admin can open user management', { tag: '@regression' }, async ({ page }) => {
    const adminPage = new AdminPage(page);
    await adminPage.goto();

    await expect(adminPage.systemUsersTitle).toBeVisible();
    await expect(adminPage.topMenu).toContainText('User Management');
    await expect(adminPage.addButton).toBeVisible();
  });
});

test.describe('ESS user role checks', { tag: '@rbac' }, () => {
  test.describe.configure({ mode: 'serial' });
  test.skip(env.name === 'prod', 'Not allowed on production');

  const employee = createEmployeeData();
  const essUser = createEssUserData();

  test.afterAll(async ({ browser }) => {
    // deleting the employee also deletes the ESS user linked to it
    const context = await browser.newContext({ baseURL: env.baseURL });
    const page = await context.newPage();
    await loginAsAdmin(page);
    await deleteEmployeeIfExists(page, employee.employeeId);
    await context.close();
  });

  test('admin creates an ESS user', { tag: '@regression' }, async ({ page }) => {
    await loginAsAdmin(page);

    const addEmployeePage = new AddEmployeePage(page);
    await addEmployeePage.goto();
    await addEmployeePage.addEmployee(employee);

    const adminPage = new AdminPage(page);
    const fullName = employee.firstName + ' ' + employee.lastName;
    await adminPage.createUser('ESS', fullName, essUser.username, essUser.password);

    await expect(adminPage.systemUsersTitle).toBeVisible();
  });

  test('ESS user cannot access Admin module', { tag: '@regression' }, async ({ browser }) => {
    // new browser context = separate session, so admin session is not used here
    const essContext = await browser.newContext({ baseURL: env.baseURL });
    const essPage = await essContext.newPage();

    const loginPage = new LoginPage(essPage);
    const dashboard = new DashboardPage(essPage);
    const adminPage = new AdminPage(essPage);

    await loginPage.goto();
    await loginPage.login(essUser.username, essUser.password);
    await expect(dashboard.dashboardTitle).toBeVisible();

    // ESS user should see My Info but not Admin
    await expect(dashboard.menuItem('My Info')).toBeVisible();
    await expect(dashboard.menuItem('Admin')).toHaveCount(0);

    // opening the admin page directly should not show System Users
    await adminPage.goto();
    await expect(adminPage.systemUsersTitle).toBeHidden();

    await essContext.close();
  });
});
