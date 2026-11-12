# OrangeHRM Automation - Playwright

Automation tests for the OrangeHRM demo site using Playwright with JavaScript and the Page Object Model.

Site: https://opensource-demo.orangehrmlive.com/web/index.php/auth/login

## What is tested

- **Login**: valid login, invalid login, empty fields, logout
- **Employee**: create a new employee, find it in the list, update the middle name, delete it
- **Roles**: admin can open Admin and PIM. An ESS user is created and checked so it cannot open the Admin module
- **End to end**: login → create → update → ESS check → delete → logout in one test

## Folder structure

```
config/environments.js      - base URL and login details for qa / stage / prod
pages/                      - page objects (locators and actions for each page)
tests/                      - test files
utils/testData.js           - random test data
utils/helpers.js            - admin login and cleanup functions
playwright.config.js        - Playwright settings
.env.example                - sample environment file
```

## Setup

You need Node.js installed.

```
npm install
npx playwright install chromium
```

Copy `.env.example` to `.env`. If you leave the username and password empty, the tests read the
demo login details shown on the OrangeHRM login page.

## Running tests

```
npx playwright test                  run all tests
npx playwright test --grep @smoke    run smoke tests
npx playwright test --grep @regression
npx playwright test --project=chromium
npm run test:qa                      run on qa
npm run test:stage                   run on stage
npm run test:prod                    only smoke tests, employee tests are skipped on prod
npx playwright show-report           open the html report
```

Tags used: `@smoke`, `@regression`, `@authentication`, `@employee`, `@rbac`, `@e2e`

## Reports

After a run, the HTML report is in `playwright-report/`. For failed tests it has the screenshot and video.
A trace is saved when a test is retried.

## Notes

- Every run creates a new employee with a random name and a 10 digit employee id, so it does not clash with other data.
- The employee tests run in serial mode because they use the same employee.
- If a test fails in the middle, `afterAll` deletes the test employee.
- Dropdowns in OrangeHRM are not `<select>` elements, so `selectOption()` does not work. The test clicks the dropdown and then clicks the option.
- After saving a new employee the page reloads, so the "Successfully Saved" message is not checked. The test checks the saved values instead.
- The demo site is shared and sometimes slow, so timeouts are higher and 1 retry is set.
- Only Chromium is used.

## Troubleshooting

- `Executable doesn't exist` → run `npx playwright install chromium`
- All tests time out → check that the demo site opens in your browser, it may be down
- `Wrong TEST_ENV value` → use qa, stage or prod

## Pushing to GitHub

```
git init
git add .
git commit -m "OrangeHRM playwright tests"
git branch -M main
git remote add origin <repo url>
git push -u origin main
```

`node_modules`, `.env`, `test-results` and `playwright-report` are in `.gitignore`. The GitHub Actions
workflow runs the tests on every push and uploads the report as an artifact.
