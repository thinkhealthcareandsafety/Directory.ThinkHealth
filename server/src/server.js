const { config, assertValidConfig } = require('./config');

// Fail fast on a misconfigured environment rather than starting up with the
// guard rails silently disabled.
try {
  assertValidConfig();
} catch (err) {
  process.exit(1);
}

const app = require('./app');

app.listen(config.port, () => {
  console.log(`Thinkhealth Hotel Hub API listening on port ${config.port}`);
  console.log(`  environment:   ${config.isProduction ? 'production' : 'development'}`);
  console.log(`  CORS origins:  ${config.corsOrigins.length ? config.corsOrigins.join(', ') : 'any (dev only)'}`);
  console.log(`  login limits:  ${config.loginRateLimit.maxPerIp}/IP per ${config.loginRateLimit.windowMs / 60000}min, ${config.loginRateLimit.maxPerAccount}/account per ${config.loginRateLimit.accountWindowMs / 60000}min`);
});
