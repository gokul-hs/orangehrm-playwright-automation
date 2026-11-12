const { test, expect } = require('@playwright/test');
const { env } = require('../config/environments');
const { AddEmployeePage } = require('../pages/addEmployee.page');
const { PIMPage } = require('../pages/pim.page');
const { EmployeeDetailsPage } = require('../pages/employeeDetails.page');
const { loginAsAdmin, deleteEmployeeIfExists } = require('../utils/helpers');
const { createEmployeeData, randomText } = require('../utils/testData');

// these tests use the same employee, so they must run one after another
test.describe.configure({ mode: 'serial' });

test.describe('Employee create, update and delete', { tag: '@employee' }, () => {
  // never create or delete data in production
  test.skip(env.name === 'prod', 'Not allowed on production');

  const employee = createEmployeeData();
  const middleName = 'Mid' + randomText(4);

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  // if a test fails in the middle, delete the employee so no test data is left
  test.afterAll(async ({ browser }) => {
    const context = await browser.newContext({ baseURL: env.baseURL });
    const page = await context.newPage();
    await loginAsAdmin(page);
    await deleteEmployeeIfExists(page, employee.employeeId);
    await context.close();
  });

  test('create new employee', { tag: ['@smoke', '@regression'] }, async ({ page }) => {
    const addEmployeePage = new AddEmployeePage(page);
    const detailsPage = new EmployeeDetailsPage(page);

    await addEmployeePage.goto();
    await addEmployeePage.addEmployee(employee);

    // personal details page of the new employee should open with our data
    await expect(page).toHaveURL(/viewPersonalDetails/);
    await expect(detailsPage.firstName).toHaveValue(employee.firstName);
    await expect(detailsPage.lastName).toHaveValue(employee.lastName);
    await expect(detailsPage.employeeId).toHaveValue(employee.employeeId);
  });

  test('new employee is shown in employee list', { tag: '@regression' }, async ({ page }) => {
    const pimPage = new PIMPage(page);
    await pimPage.goto();
    await pimPage.searchByEmployeeId(employee.employeeId);

    await expect(pimPage.oneRecordFound).toBeVisible();
    await expect(pimPage.getRow(employee.employeeId)).toContainText(employee.firstName);
    await expect(pimPage.getRow(employee.employeeId)).toContainText(employee.lastName);
  });

  test('update employee middle name', { tag: '@regression' }, async ({ page }) => {
    const pimPage = new PIMPage(page);
    const detailsPage = new EmployeeDetailsPage(page);

    await pimPage.goto();
    await pimPage.openEmployee(employee.employeeId);

    // wait for the form to load the saved data before typing
    await expect(detailsPage.firstName).toHaveValue(employee.firstName);
    await detailsPage.updateMiddleName(middleName);
    await expect(detailsPage.successMessage).toContainText('Successfully Updated');

    // reload the page and check the new value is saved
    await page.reload();
    await expect(detailsPage.firstName).toHaveValue(employee.firstName);
    await expect(detailsPage.middleName).toHaveValue(middleName);
  });

  test('delete employee', { tag: '@regression' }, async ({ page }) => {
    const pimPage = new PIMPage(page);
    await pimPage.goto();
    await pimPage.deleteEmployee(employee.employeeId);
    await expect(pimPage.successMessage).toContainText('Successfully Deleted');

    // search again, employee should not be found
    await pimPage.goto();
    await pimPage.searchByEmployeeId(employee.employeeId);
    await expect(pimPage.noRecordsFound).toBeVisible();
  });
});
