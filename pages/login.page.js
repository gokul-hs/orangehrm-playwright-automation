class LoginPage {
  constructor(page) {
    this.page = page;
    this.username = page.getByPlaceholder('Username');
    this.password = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.errorMessage = page.getByRole('alert');
    this.requiredMessages = page.locator('.oxd-input-field-error-message');
  }

  async goto() {
    await this.page.goto('/web/index.php/auth/login');
  }

  async login(username, password) {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.loginButton.click();
  }

  // the login page shows "Username : Admin" and "Password : admin123"
  async getDemoCredentials() {
    const userText = await this.page.getByText('Username :').innerText();
    const passText = await this.page.getByText('Password :').innerText();
    return {
      username: userText.split(':')[1].trim(),
      password: passText.split(':')[1].trim(),
    };
  }
}

module.exports = { LoginPage };
