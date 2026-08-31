const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');
const { config } = require('../config');
const { logAuditEvent } = require('../audit');
const {
  loginIpLimiter, loginAccountLimiter, registerLimiter,
  passwordResetRequestLimiter, passwordResetVerifyLimiter, signupVerifyLimiter,
} = require('../middleware/rateLimit');
const { checkPassword } = require('../../scripts/password-policy');
const { sendPasswordResetOtp, sendSignupOtp } = require('../email');

const router = express.Router();

// Compared against when the email doesn't exist so timing is constant.
const DUMMY_HASH = bcrypt.hashSync('unused-placeholder-for-constant-time-login', 12);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sha256Hex(otp) {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

function timingSafeEqualHex(a, b) {
  const bufA = Buffer.from(a, 'hex');
  const bufB = Buffer.from(b, 'hex');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// POST /api/auth/register/request — public self-registration, step 1.
// Validates email + password and, if the address isn't already taken,
// stashes both (password already hashed) alongside an OTP. No row lands in
// `users` until /register/verify confirms the code — an abandoned signup
// just expires here instead of becoming a real, never-logged-into account.
router.post('/register/request', registerLimiter, async (req, res, next) => {
  try {
    const email = (req.body.email || '').toString().trim().toLowerCase();
    const password = (req.body.password || '').toString();

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'Enter a valid email address.' });
    }

    const passwordProblems = checkPassword(password);
    if (passwordProblems.length > 0) {
      return res.status(400).json({ error: `Password rejected: ${passwordProblems.join('; ')}.` });
    }

    const GENERIC_MESSAGE = 'If that address is not already registered, a verification code has been sent. It expires in 10 minutes.';

    const existing = await pool.query('SELECT 1 FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      // Don't reveal whether the email exists — same response either way,
      // and skip sending mail to an address that's already a real account.
      return res.status(200).json({ message: GENERIC_MESSAGE });
    }

    // A fresh request supersedes any prior unused one for this email, same
    // rule as password-reset — at most one live code per address at a time.
    await pool.query(
      `UPDATE signup_otps SET used_at = now() WHERE email = $1 AND used_at IS NULL`,
      [email]
    );

    const passwordHash = await bcrypt.hash(password, 12);
    const otp = crypto.randomInt(0, 1000000).toString().padStart(6, '0');
    await pool.query(
      `INSERT INTO signup_otps (email, password_hash, otp_hash, expires_at)
       VALUES ($1, $2, $3, now() + ($4 || ' minutes')::interval)`,
      [email, passwordHash, sha256Hex(otp), config.signupOtp.expiresMinutes]
    );

    await sendSignupOtp(email, otp);
    await logAuditEvent({ eventType: 'signup_requested', userEmail: email });

    res.status(200).json({ message: GENERIC_MESSAGE });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/register/verify — step 2. Confirms the code and only then
// creates the real `users` row, always as viewer — elevation to admin still
// only happens via owner-approved access requests.
router.post('/register/verify', signupVerifyLimiter, async (req, res, next) => {
  try {
    const email = (req.body.email || '').toString().trim().toLowerCase();
    const otp = (req.body.otp || '').toString().trim();

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and code are required.' });
    }

    const INVALID = { error: 'That code is invalid or has expired. Request a new one.' };

    const otpResult = await pool.query(
      `SELECT id, password_hash, otp_hash, attempt_count FROM signup_otps
       WHERE email = $1 AND used_at IS NULL AND expires_at > now()
       ORDER BY created_at DESC LIMIT 1`,
      [email]
    );
    const row = otpResult.rows[0];
    if (!row) {
      return res.status(400).json(INVALID);
    }

    if (row.attempt_count >= config.signupOtp.maxAttempts) {
      await pool.query('UPDATE signup_otps SET used_at = now() WHERE id = $1', [row.id]);
      return res.status(400).json(INVALID);
    }

    if (!timingSafeEqualHex(sha256Hex(otp), row.otp_hash)) {
      const attempts = row.attempt_count + 1;
      const burn = attempts >= config.signupOtp.maxAttempts;
      await pool.query(
        `UPDATE signup_otps SET attempt_count = $1, used_at = ${burn ? 'now()' : 'used_at'} WHERE id = $2`,
        [attempts, row.id]
      );
      await logAuditEvent({ eventType: 'signup_failed', userEmail: email, detail: burn ? 'Code burned after too many attempts.' : 'Incorrect code.' });
      return res.status(400).json(INVALID);
    }

    // Someone could register the same email again while this code sat
    // unverified — re-check right before the insert, not just at request time.
    const existing = await pool.query('SELECT 1 FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      await pool.query('UPDATE signup_otps SET used_at = now() WHERE id = $1', [row.id]);
      return res.status(409).json({ error: 'That email is already registered. Try signing in instead.' });
    }

    await pool.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3)',
      [email, row.password_hash, 'viewer']
    );
    await pool.query('UPDATE signup_otps SET used_at = now() WHERE id = $1', [row.id]);
    await logAuditEvent({ eventType: 'user_registered', userEmail: email, detail: 'Self-registered as viewer, email verified.' });

    res.status(201).json({ message: 'Account created. You can now log in.' });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', loginIpLimiter, loginAccountLimiter, async (req, res, next) => {
  try {
    const email = (req.body.email || '').toString().trim().toLowerCase();
    const password = (req.body.password || '').toString();

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    const passwordMatches = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH);

    if (!user || !passwordMatches) {
      await logAuditEvent({ eventType: 'auth_failure', userEmail: email, detail: 'Invalid email or password.' });
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (!config.jwtSecret) {
      console.error('JWT_SECRET is not set.');
      return res.status(500).json({ error: 'Server auth is not configured.' });
    }

    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    await logAuditEvent({ eventType: 'auth_success', userEmail: user.email, detail: `Signed in as ${user.role}.` });

    res.json({ token, user: { email: user.email, role: user.role, full_name: user.full_name || null } });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/password-reset/request — always returns the same message
// regardless of whether the email is registered (same enumeration guard as
// /register). If it is, any prior unused code for this user is superseded
// so only the most recently sent code is ever valid.
router.post('/password-reset/request', passwordResetRequestLimiter, async (req, res, next) => {
  try {
    const email = (req.body.email || '').toString().trim().toLowerCase();
    if (!email || !EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'Enter a valid email address.' });
    }

    const GENERIC_MESSAGE = 'If that address is registered, a reset code has been sent. It expires in 5 minutes.';

    const result = await pool.query('SELECT id, email FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) {
      return res.status(200).json({ message: GENERIC_MESSAGE });
    }

    await pool.query(
      `UPDATE password_reset_otps SET used_at = now()
       WHERE user_id = $1 AND used_at IS NULL`,
      [user.id]
    );

    const otp = crypto.randomInt(0, 1000000).toString().padStart(6, '0');
    const expiresMinutes = Number(config.passwordResetOtp.expiresMinutes) || 5;

await pool.query(
  `INSERT INTO password_reset_otps (user_id, otp_hash, expires_at)
   VALUES ($1, $2, now() + ($3 * INTERVAL '1 minute'))`,
  [user.id, sha256Hex(otp), expiresMinutes]
);

    try {
  await sendPasswordResetOtp(user.email, otp);
  await logAuditEvent({ eventType: 'password_reset_requested', userEmail: user.email });
} catch (emailErr) {
  console.error('[SMTP Error] Failed to send password reset email:', emailErr);
}

    res.status(200).json({ message: GENERIC_MESSAGE });
  } catch (err) {
    next(err);
  }
});

const INVALID_OTP = { error: 'That code is invalid or has expired. Request a new one.' };
const INVALID_TICKET = { error: 'This reset has expired. Request a new code.' };

// POST /api/auth/password-reset/check-otp — verifies the code only, and does
// not touch the password. On success it returns a one-time reset ticket (a
// second, unrelated secret) that /complete requires — so a verified OTP
// can't be replayed later to change the password without the client having
// actually gone through this step.
router.post('/password-reset/check-otp', passwordResetVerifyLimiter, async (req, res, next) => {
  try {
    const email = (req.body.email || '').toString().trim().toLowerCase();
    const otp = (req.body.otp || '').toString().trim();

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and code are required.' });
    }

    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    const user = userResult.rows[0];
    if (!user) {
      return res.status(400).json(INVALID_OTP);
    }

    const otpResult = await pool.query(
      `SELECT id, otp_hash, attempt_count FROM password_reset_otps
       WHERE user_id = $1 AND used_at IS NULL AND verified_at IS NULL AND expires_at > now()
       ORDER BY created_at DESC LIMIT 1`,
      [user.id]
    );
    const row = otpResult.rows[0];
    if (!row) {
      return res.status(400).json(INVALID_OTP);
    }

    if (row.attempt_count >= config.passwordResetOtp.maxAttempts) {
      await pool.query('UPDATE password_reset_otps SET used_at = now() WHERE id = $1', [row.id]);
      return res.status(400).json(INVALID_OTP);
    }

    if (!timingSafeEqualHex(sha256Hex(otp), row.otp_hash)) {
      const attempts = row.attempt_count + 1;
      const burn = attempts >= config.passwordResetOtp.maxAttempts;
      await pool.query(
        `UPDATE password_reset_otps SET attempt_count = $1, used_at = ${burn ? 'now()' : 'used_at'} WHERE id = $2`,
        [attempts, row.id]
      );
      await logAuditEvent({ eventType: 'password_reset_failed', userEmail: email, detail: burn ? 'Code burned after too many attempts.' : 'Incorrect code.' });
      return res.status(400).json(INVALID_OTP);
    }

    // Correct code. Bounded by the OTP's own expires_at — verifying doesn't
    // buy extra time beyond the original 5-minute window.
    const ticket = crypto.randomBytes(32).toString('hex');
    const expiryResult = await pool.query(
      `UPDATE password_reset_otps SET verified_at = now(), ticket_hash = $1
       WHERE id = $2 RETURNING extract(epoch from (expires_at - now()))::int AS seconds_remaining`,
      [sha256Hex(ticket), row.id]
    );

    await logAuditEvent({ eventType: 'password_reset_otp_verified', userEmail: email });

    res.json({
      message: 'Code verified. Choose a new password.',
      resetTicket: ticket,
      secondsRemaining: Math.max(0, expiryResult.rows[0].seconds_remaining),
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/password-reset/complete — takes the ticket from /check-otp
// (never the OTP itself) and the new password. The ticket is single-use.
router.post('/password-reset/complete', passwordResetVerifyLimiter, async (req, res, next) => {
  try {
    const email = (req.body.email || '').toString().trim().toLowerCase();
    const resetTicket = (req.body.resetTicket || '').toString().trim();
    const newPassword = (req.body.newPassword || '').toString();

    if (!email || !resetTicket || !newPassword) {
      return res.status(400).json({ error: 'Email, reset ticket, and new password are required.' });
    }

    const passwordProblems = checkPassword(newPassword);
    if (passwordProblems.length > 0) {
      return res.status(400).json({ error: `Password rejected: ${passwordProblems.join('; ')}.` });
    }

    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    const user = userResult.rows[0];
    if (!user) {
      return res.status(400).json(INVALID_TICKET);
    }

    const ticketResult = await pool.query(
      `SELECT id, ticket_hash FROM password_reset_otps
       WHERE user_id = $1 AND verified_at IS NOT NULL AND used_at IS NULL AND expires_at > now()
       ORDER BY created_at DESC LIMIT 1`,
      [user.id]
    );
    const row = ticketResult.rows[0];
    if (!row || !row.ticket_hash || !timingSafeEqualHex(sha256Hex(resetTicket), row.ticket_hash)) {
      return res.status(400).json(INVALID_TICKET);
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, user.id]);
    await pool.query('UPDATE password_reset_otps SET used_at = now() WHERE id = $1', [row.id]);
    await logAuditEvent({ eventType: 'password_reset_completed', userEmail: email });

    res.json({ message: 'Password updated. You can now sign in.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
