// User management routes — owner only.
// Never returns password_hash; always strips it before sending.

const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../db');
const { requireRole } = require('../middleware/auth');
const { logAuditEvent } = require('../audit');
const { checkPassword } = require('../../scripts/password-policy');

const router = express.Router();

const SAFE_COLS = 'id, email, full_name, role, created_at';

// GET /api/users — list all accounts (no password hashes)
router.get('/', requireRole('owner'), async (req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT ${SAFE_COLS} FROM users ORDER BY created_at DESC`);
    res.json({ data: rows });
  } catch (err) { next(err); }
});

// GET /api/users/activity — recent audit log entries per user (owner only)
router.get('/activity', requireRole('owner'), async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT user_email, event_type, hotel_id, detail, occurred_at
      FROM audit_log
      ORDER BY occurred_at DESC
      LIMIT 200
    `);
    res.json({ data: rows });
  } catch (err) { next(err); }
});

// PATCH /api/users/:email/role — change a user's role
router.patch('/:email/role', requireRole('owner'), async (req, res, next) => {
  try {
    const target = (req.params.email || '').trim().toLowerCase();
    const { role } = req.body;

    if (!['viewer', 'admin', 'owner'].includes(role)) {
      return res.status(400).json({ error: 'Role must be viewer, admin, or owner.' });
    }
    if (target === req.user.email) {
      return res.status(400).json({ error: 'You cannot change your own role.' });
    }

    const targetRow = await pool.query('SELECT role FROM users WHERE email = $1', [target]);
    if (!targetRow.rows[0]) return res.status(404).json({ error: 'User not found.' });

    // Owner accounts are peers, not subordinates: no owner may demote another.
    // Removing an owner is a deliberate out-of-band act (CLI / direct DB), so
    // a compromised owner session can't quietly strip everyone else's access.
    if (targetRow.rows[0].role === 'owner') {
      return res.status(403).json({
        error: 'Owner accounts cannot be changed from here. Use npm run user:create to reassign an owner.',
      });
    }

    const result = await pool.query(
      `UPDATE users SET role = $1 WHERE email = $2 RETURNING ${SAFE_COLS}`,
      [role, target]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'User not found.' });

    // Being granted admin/owner satisfies any access request they had open —
    // otherwise the owner keeps seeing a pending request from someone who
    // already has the access they asked for.
    if (role !== 'viewer') {
      await pool.query(
        `UPDATE access_requests
            SET status = 'approved', resolved_at = now(), resolved_by_email = $2
          WHERE requester_email = $1 AND status = 'pending'`,
        [target, req.user.email]
      );
    }

    await logAuditEvent({
      eventType: 'user_role_changed',
      userEmail: req.user.email,
      detail: `Changed ${target} → ${role}`,
    });

    res.json({ data: result.rows[0] });
  } catch (err) { next(err); }
});

// DELETE /api/users/:email — remove an account
router.delete('/:email', requireRole('owner'), async (req, res, next) => {
  try {
    const target = (req.params.email || '').trim().toLowerCase();

    if (target === req.user.email) {
      return res.status(400).json({ error: 'You cannot delete your own account.' });
    }

    const targetRow = await pool.query('SELECT role FROM users WHERE email = $1', [target]);
    if (!targetRow.rows[0]) return res.status(404).json({ error: 'User not found.' });

    // Same rule as role changes: owners are not deletable through the API.
    if (targetRow.rows[0].role === 'owner') {
      return res.status(403).json({
        error: 'Owner accounts cannot be deleted from here.',
      });
    }

    await pool.query('DELETE FROM users WHERE email = $1', [target]);

    await logAuditEvent({
      eventType: 'user_deleted',
      userEmail: req.user.email,
      detail: `Deleted account: ${target}`,
    });

    res.status(204).send();
  } catch (err) { next(err); }
});

module.exports = router;
