class DashboardPage {
  constructor(page) {
    this.page = page;
    this.dashboardTitle = page.getByRole('heading', { name: 'Dashboard' });
    this.sideMenu = page.getByRole('navigation', { name: 'Sidepanel' });
    this.profileDropdown = page.locator('.oxd-userdropdown-tab');
    this.logoutLink = page.getByRole('menuitem', { name: 'Logout' });
  }

  // returns a link from the left side menu, e.g. menuItem('PIM')
  menuItem(name) {
    return this.sideMenu.getByRole('link', { name: name, exact: true });
  }

  async logout() {
    await this.profileDropdown.click();
    await this.logoutLink.click();
  }
}

module.exports = { DashboardPage };
