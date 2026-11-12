const { test, expect } = require('@playwright/test');
const { env } = require('../config/environments');
const { LoginPage } = require('../pages/login.page');
const { DashboardPage } = require('../pages/dashboard.page');
const { PIMPage } = require('../pages/pim.page');
const { AddEmployeePage } = require('../pages/addEmployee.page');
const { EmployeeDetailsPage } = require('../pages/employeeDetails.page');
const { AdminPage } = require('../pages/admin.page');
const { loginAsAdmin, deleteEmployeeIfExists } = require('../utils/helpers');
const { createEmployeeData, createEssUserData, randomText } = require('../utils/testData');

test.describe('End to end flow', { tag: '@e2e' }, () => {
  test.skip(env.name === 'prod', 'Not allowed on production');

  const employee = createEmployeeData();
  const essUser = createEssUserData();
  const middleName = 'Mid' + randomText(4);

  test.afterAll(async ({ browser }) => {
    const context = await browser.newContext({ baseURL: env.baseURL });
    const page = await context.newPage();
    await loginAsAdmin(page);
    await deleteEmployeeIfExists(page, employee.employeeId);
    await context.close();
  });

  test('complete employee flow from login to logout', { tag: '@regression' }, async ({ page, browser }) => {
    const dashboard = new DashboardPage(page);
    const pimPage = new PIMPage(page);
    const addEmployeePage = new AddEmployeePage(page);
    const detailsPage = new EmployeeDetailsPage(page);
    const adminPage = new AdminPage(page);

    await test.step('login as admin', async () => {
      await loginAsAdmin(page);
      await expect(dashboard.dashboardTitle).toBeVisible();
    });

    await test.step('create employee', async () => {
      await dashboard.menuItem('PIM').click();
      await pimPage.addButton.click();
      await addEmployeePage.addEmployee(employee);
      await expect(detailsPage.firstName).toHaveValue(employee.firstName);
    });

    await test.step('verify employee in list', async () => {
      await pimPage.goto();
      await pimPage.searchByEmployeeId(employee.employeeId);
      await expect(pimPage.oneRecordFound).toBeVisible();
      await expect(pimPage.getRow(employee.employeeId)).toContainText(employee.lastName);
    });

    await test.step('update employee', async () => {
      await pimPage.getRow(employee.employeeId).click();
      await expect(detailsPage.firstName).toHaveValue(employee.firstName);
      await detailsPage.updateMiddleName(middleName);
      await expect(detailsPage.successMessage).toContainText('Successfully Updated');
    });

    await test.step('verify update after reload', async () => {
      await page.reload();
      await expect(detailsPage.firstName).toHaveValue(employee.firstName);
      await expect(detailsPage.middleName).toHaveValue(middleName);
    });

    await test.step('check ESS user access', async () => {
      const fullName = employee.firstName + ' ' + middleName + ' ' + employee.lastName;
      await adminPage.createUser('ESS', fullName, essUser.username, essUser.password);

      const essContext = await browser.newContext({ baseURL: env.baseURL });
      const essPage = await essContext.newPage();
      const essLogin = new LoginPage(essPage);
      const essDashboard = new DashboardPage(essPage);

      await essLogin.goto();
      await essLogin.login(essUser.username, essUser.password);
      await expect(essDashboard.dashboardTitle).toBeVisible();
      await expect(essDashboard.menuItem('Admin')).toHaveCount(0);
      await essContext.close();
    });

    await test.step('delete employee', async () => {
      await pimPage.goto();
      await pimPage.deleteEmployee(employee.employeeId);
      await expect(pimPage.successMessage).toContainText('Successfully Deleted');
    });

    await test.step('verify employee is deleted', async () => {
      await pimPage.goto();
      await pimPage.searchByEmployeeId(employee.employeeId);
      await expect(pimPage.noRecordsFound).toBeVisible();
    });

    await test.step('logout', async () => {
      await dashboard.logout();
      await expect(page).toHaveURL(/auth\/login/);
    });
  });
});
