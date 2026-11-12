class AddEmployeePage {
  constructor(page) {
    this.page = page;
    this.title = page.getByRole('heading', { name: 'Add Employee' });
    this.firstName = page.getByPlaceholder('First Name');
    this.lastName = page.getByPlaceholder('Last Name');
    // employee id input has no placeholder, so find it using its label
    this.employeeId = page.locator('.oxd-input-group').filter({ hasText: 'Employee Id' }).locator('input');
    this.saveButton = page.getByRole('button', { name: 'Save' });
  }

  async goto() {
    await this.page.goto('/web/index.php/pim/addEmployee');
  }

  async addEmployee(employee) {
    await this.firstName.fill(employee.firstName);
    await this.lastName.fill(employee.lastName);
    await this.employeeId.fill(employee.employeeId);
    await this.saveButton.click();
    // after saving, the app opens the Personal Details page of the new employee
    await this.page.waitForURL(/viewPersonalDetails/);
  }
}

module.exports = { AddEmployeePage };
