class AdminPage {
  constructor(page) {
    this.page = page;
    this.systemUsersTitle = page.getByRole('heading', { name: 'System Users' });
    this.addButton = page.getByRole('button', { name: 'Add' });
    this.topMenu = page.getByRole('navigation', { name: 'Topbar Menu' });

    // Add User form
    this.userRoleDropdown = page.locator('.oxd-select-text').nth(0);
    this.statusDropdown = page.locator('.oxd-select-text').nth(1);
    this.employeeNameInput = page.getByPlaceholder('Type for hints...');
    this.usernameInput = page.locator('.oxd-input-group').filter({ hasText: 'Username' }).locator('input');
    this.passwordInput = page.locator('input[type="password"]').nth(0);
    this.confirmPasswordInput = page.locator('input[type="password"]').nth(1);
    this.saveButton = page.getByRole('button', { name: 'Save' });
  }

  async goto() {
    await this.page.goto('/web/index.php/admin/viewSystemUsers');
  }

  // dropdowns in OrangeHRM are not real <select> tags,
  // so we click the dropdown and then click the option
  async selectOption(dropdown, optionName) {
    await dropdown.click();
    await this.page.getByRole('option', { name: optionName, exact: true }).click();
  }

  async createUser(role, employeeName, username, password) {
    await this.page.goto('/web/index.php/admin/saveSystemUser');
    await this.selectOption(this.userRoleDropdown, role);

    await this.employeeNameInput.fill(employeeName);
    await this.page.getByRole('option', { name: employeeName }).click();

    await this.selectOption(this.statusDropdown, 'Enabled');
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(password);
    await this.saveButton.click();
    // after saving, the app goes back to the System Users list
    await this.page.waitForURL(/viewSystemUsers/);
  }
}

module.exports = { AdminPage };
