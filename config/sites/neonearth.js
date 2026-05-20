// config/sites/neonearth.js
module.exports = {
  baseUrl: process.env.BASE_URL || 'https://ne.signsigma.com/',
  timeout: 300000,
  expectTimeout: 40000,
  authFile: 'playwright/.auth/user.json',
};
