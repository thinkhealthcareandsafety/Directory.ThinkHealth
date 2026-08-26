// Central config + startup validation. Everything security-relevant is read
// and checked here once, at boot, so a misconfigured deployment fails loudly
// on startup instead of quietly serving requests with the guard rails off.

// Loaded here rather than only in server.js so that anything pulling in the
// app directly (tests, scripts) still sees the same environment.
require('dotenv').config();

const MIN_SECRET_LENGTH = 32;

function parseList(raw) {
  return (raw || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseTrustProxy(raw) {
  const value = (raw || '').trim();
  if (!value) return 0;                       // direct exposure — req.ip is the socket address
  if (value === 'true') return true;          // trust every hop (only safe on a closed network)
  const asNumber = Number(value);
  if (Number.isInteger(asNumber) && asNumber >= 0) return asNumber;
  return value;                               // an IP / CIDR / preset name, passed to Express as-is
}

const isProduction = process.env.NODE_ENV === 'production';

const config = {
  isProduction,
  port: Number(process.env.PORT) || 3000,
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  corsOrigins: parseList(process.env.CORS_ORIGINS),
  trustProxy: parseTrustProxy(process.env.TRUST_PROXY),
  loginRateLimit: {
    windowMs: Number(process.env.LOGIN_RATE_WINDOW_MS) || 15 * 60 * 1000,
    maxPerIp: Number(process.env.LOGIN_RATE_MAX_PER_IP) || 10,
    maxPerAccount: Number(process.env.LOGIN_RATE_MAX_PER_ACCOUNT) || 20,
    accountWindowMs: Number(process.env.LOGIN_RATE_ACCOUNT_WINDOW_MS) || 60 * 60 * 1000,
  },
  apiRateLimit: {
    windowMs: Number(process.env.API_RATE_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.API_RATE_MAX) || 600,
  },
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || '',
  },
  // A code is valid for 5 minutes and burns itself after too many wrong
  // guesses, so a 6-digit space (1M combinations) can't be brute-forced
  // inside its own lifetime.
  passwordResetOtp: {
    expiresMinutes: 5,
    maxAttempts: 5,
  },
};

// Returns { fatal: [...], warnings: [...] }. Split out from the throw so tests
// can assert on the rules without the process exiting.
function validateConfig(cfg = config) {
  const fatal = [];
  const warnings = [];

  if (!cfg.jwtSecret) {
    fatal.push('JWT_SECRET is not set. Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
  } else if (cfg.jwtSecret.length < MIN_SECRET_LENGTH) {
    const msg = `JWT_SECRET is only ${cfg.jwtSecret.length} characters; use at least ${MIN_SECRET_LENGTH}.`;
    if (cfg.isProduction) fatal.push(msg);
    else warnings.push(msg);
  }

  if (!process.env.DATABASE_URL) {
    fatal.push('DATABASE_URL is not set. Copy .env.example to .env and fill it in.');
  }

  if (cfg.corsOrigins.length === 0) {
    if (cfg.isProduction) {
      fatal.push('CORS_ORIGINS is not set. In production every allowed frontend origin must be listed explicitly, e.g. CORS_ORIGINS=https://hotels.thinkhealth.com');
    } else {
      warnings.push('CORS_ORIGINS is not set — allowing any origin. Fine for local dev, never for a deployed instance.');
    }
  }

  if (cfg.isProduction && cfg.trustProxy === 0) {
    warnings.push('TRUST_PROXY is off. If this runs behind a load balancer or reverse proxy, set it (e.g. TRUST_PROXY=1) or rate limiting will bucket every user under the proxy IP.');
  }

  if (!cfg.smtp.host || !cfg.smtp.user || !cfg.smtp.pass || !cfg.smtp.from) {
    const msg = 'SMTP is not fully configured (SMTP_HOST/SMTP_USER/SMTP_PASS/SMTP_FROM). Password-reset emails cannot be sent.';
    if (cfg.isProduction) fatal.push(msg);
    else warnings.push(`${msg} Reset codes will be logged to the console instead.`);
  }

  return { fatal, warnings };
}

function assertValidConfig(cfg = config) {
  const { fatal, warnings } = validateConfig(cfg);
  warnings.forEach((w) => console.warn(`[config warning] ${w}`));
  if (fatal.length > 0) {
    console.error('\nRefusing to start — configuration problems:');
    fatal.forEach((f) => console.error(`  * ${f}`));
    console.error('');
    throw new Error('Invalid configuration.');
  }
}

module.exports = { config, validateConfig, assertValidConfig, MIN_SECRET_LENGTH };
