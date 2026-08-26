// Rate limiters. Login is the one endpoint an unauthenticated attacker can
// hammer, so it gets two independent limits:
//
//   * per-IP     — stops one host brute-forcing any account.
//   * per-account — stops a botnet spreading attempts across many IPs against
//                   one known email. The tradeoff is that someone who knows an
//                   email can lock it out for the account window; that is the
//                   accepted cost of blunting distributed credential stuffing
//                   on a small internal directory. Raise
//                   LOGIN_RATE_MAX_PER_ACCOUNT if it bites real users.
//
// Both skip successful logins, so a person typing one wrong password then
// getting it right never burns through the budget.

const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
const { config } = require('../config');
const { logAuditEvent } = require('../audit');

const RETRY_MESSAGE = 'Too many attempts. Please wait and try again.';

function normalizeEmail(req) {
  return (req.body?.email || '').toString().trim().toLowerCase();
}

function blocked(scope) {
  return (req, res) => {
    logAuditEvent({
      eventType: 'auth_rate_limited',
      userEmail: normalizeEmail(req) || null,
      detail: `Login blocked by ${scope} rate limit.`,
    });
    res.status(429).json({ error: RETRY_MESSAGE });
  };
}

const loginIpLimiter = rateLimit({
  windowMs: config.loginRateLimit.windowMs,
  limit: config.loginRateLimit.maxPerIp,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: blocked('per-IP'),
});

const loginAccountLimiter = rateLimit({
  windowMs: config.loginRateLimit.accountWindowMs,
  limit: config.loginRateLimit.maxPerAccount,
  standardHeaders: false,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  // Fall back to the IP when no email was supplied, so malformed floods are
  // still bucketed rather than sharing one global counter.
  keyGenerator: (req) => normalizeEmail(req) || ipKeyGenerator(req.ip || ''),
  handler: blocked('per-account'),
});

// Broad backstop across the whole API. Deliberately generous — the frontend
// paginates and refetches filters, so this should only ever catch scraping.
const apiLimiter = rateLimit({
  windowMs: config.apiRateLimit.windowMs,
  limit: config.apiRateLimit.max,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: RETRY_MESSAGE },
});

// Registration: tight IP limit — legitimate users register once; this mostly
// stops account-farming bots. Successful registrations DO count (unlike login)
// because each one creates a real DB row regardless of intent.
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,   // 1 hour
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (req, res) => {
    logAuditEvent({
      eventType: 'register_rate_limited',
      userEmail: normalizeEmail(req) || null,
      detail: 'Registration blocked by per-IP rate limit.',
    });
    res.status(429).json({ error: RETRY_MESSAGE });
  },
});

// Password reset request: same shape as registration — one legitimate
// request per person, so a tight per-IP limit mostly stops code-spamming an
// inbox (or probing which emails are registered via response timing/volume).
const passwordResetRequestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,   // 1 hour
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (req, res) => {
    logAuditEvent({
      eventType: 'password_reset_rate_limited',
      userEmail: normalizeEmail(req) || null,
      detail: 'Password reset request blocked by per-IP rate limit.',
    });
    res.status(429).json({ error: RETRY_MESSAGE });
  },
});

// Password reset verify (the OTP-guessing endpoint): tighter than login
// because a 6-digit code is a much smaller space than a password. This is
// the actual brute-force backstop — the per-row attempt_count in the route
// handler is the second layer, for a single attacker working one email.
const passwordResetVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  keyGenerator: (req) => normalizeEmail(req) || ipKeyGenerator(req.ip || ''),
  handler: (req, res) => {
    logAuditEvent({
      eventType: 'password_reset_rate_limited',
      userEmail: normalizeEmail(req) || null,
      detail: 'Password reset verify blocked by rate limit.',
    });
    res.status(429).json({ error: RETRY_MESSAGE });
  },
});

module.exports = {
  loginIpLimiter,
  loginAccountLimiter,
  apiLimiter,
  registerLimiter,
  passwordResetRequestLimiter,
  passwordResetVerifyLimiter,
};
