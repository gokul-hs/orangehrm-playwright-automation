const { env } = require('../config/environments');
const { LoginPage } = require('../pages/login.page');
const { DashboardPage } = require('../pages/dashboard.page');
const { PIMPage } = require('../pages/pim.page');

// login as admin and wait for the dashboard
async function loginAsAdmin(page) {
  const loginPage = new LoginPage(page);
  await loginPage.goto();

  let username = env.username;
  let password = env.password;

  // if .env is empty, take the demo credentials shown on the login page
  if (!username || !password) {
    const demo = await loginPage.getDemoCredentials();
    username = demo.username;
    password = demo.password;
  }

  await loginPage.login(username, password);
  await new DashboardPage(page).dashboardTitle.waitFor();
}

// used in afterAll: deletes the test employee only if it is still there
async function deleteEmployeeIfExists(page, employeeId) {
  const pimPage = new PIMPage(page);
  await pimPage.goto();
  await pimPage.searchByEmployeeId(employeeId);

  // wait until the search result is shown
  await pimPage.oneRecordFound.or(pimPage.noRecordsFound).first().waitFor();

  if (await pimPage.oneRecordFound.isVisible()) {
    await pimPage.deleteEmployee(employeeId);
  }
}

module.exports = { loginAsAdmin, deleteEmployeeIfExists };
