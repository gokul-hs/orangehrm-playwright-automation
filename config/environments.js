// reads values from the .env file
require('dotenv').config();

// base urls for each environment
// qa and stage both use the public demo site because that is the only one we have
const urls = {
  qa: 'https://opensource-demo.orangehrmlive.com',
  stage: 'https://opensource-demo.orangehrmlive.com',
  prod: 'https://your-prod-orangehrm-url.com',
};

const envName = process.env.TEST_ENV || 'qa';

if (!urls[envName]) {
  throw new Error('Wrong TEST_ENV value: ' + envName + '. Use qa, stage or prod');
}

const env = {
  name: envName,
  baseURL: process.env.BASE_URL || urls[envName],
  username: process.env.ADMIN_USERNAME,
  password: process.env.ADMIN_PASSWORD,
};

module.exports = { env };
