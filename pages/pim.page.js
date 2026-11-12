class PIMPage {
  constructor(page) {
    this.page = page;
    this.title = page.getByRole('heading', { name: 'PIM' });
    this.addButton = page.getByRole('button', { name: 'Add' });
    this.employeeIdInput = page.locator('.oxd-input-group').filter({ hasText: 'Employee Id' }).locator('input');
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.tableRows = page.locator('.oxd-table-body').getByRole('row');
    this.oneRecordFound = page.getByText('(1) Record Found');
    this.noRecordsFound = page.getByText('No Records Found').first();
    this.yesDeleteButton = page.getByRole('button', { name: 'Yes, Delete' });
    this.successMessage = page.locator('.oxd-toast');
  }

  async goto() {
    await this.page.goto('/web/index.php/pim/viewEmployeeList');
  }

  async searchByEmployeeId(employeeId) {
    await this.employeeIdInput.fill(employeeId);
    await this.searchButton.click();
  }

  getRow(employeeId) {
    return this.tableRows.filter({ hasText: employeeId });
  }

  async openEmployee(employeeId) {
    await this.searchByEmployeeId(employeeId);
    await this.oneRecordFound.waitFor();
    await this.getRow(employeeId).click();
    await this.page.waitForURL(/viewPersonalDetails/);
  }

  async deleteEmployee(employeeId) {
    await this.searchByEmployeeId(employeeId);
    await this.oneRecordFound.waitFor();
    // the trash icon button in the row
    await this.getRow(employeeId).locator('.bi-trash').click();
    await this.yesDeleteButton.click();
  }
}

module.exports = { PIMPage };
