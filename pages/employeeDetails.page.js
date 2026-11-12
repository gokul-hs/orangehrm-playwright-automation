class EmployeeDetailsPage {
  constructor(page) {
    this.page = page;
    this.title = page.getByRole('heading', { name: 'Personal Details' });
    this.firstName = page.getByPlaceholder('First Name');
    this.middleName = page.getByPlaceholder('Middle Name');
    this.lastName = page.getByPlaceholder('Last Name');
    this.employeeId = page.locator('.oxd-input-group').filter({ hasText: 'Employee Id' }).locator('input');
    // this page has 2 Save buttons, the first one is for Personal Details
    this.saveButton = page.getByRole('button', { name: 'Save' }).first();
    this.successMessage = page.locator('.oxd-toast');
  }

  async updateMiddleName(middleName) {
    await this.middleName.fill(middleName);
    await this.saveButton.click();
  }
}

module.exports = { EmployeeDetailsPage };
