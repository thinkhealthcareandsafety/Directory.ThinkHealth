const express = require('express');
const { pool } = require('../db');
const { requireRole } = require('../middleware/auth');
const { logAuditEvent } = require('../audit');

const router = express.Router();

// POST /api/access-requests — any logged-in user can request to become
// admin. requireRole() with no args just requires a valid token, any role.
router.post('/', requireRole(), async (req, res, next) => {
  try {
    if (req.user.role !== 'viewer') {
      return res.status(400).json({ error: `You already have ${req.user.role} access.` });
    }

    const existing = await pool.query(
      `SELECT id FROM access_requests WHERE requester_email = $1 AND status = 'pending'`,
      [req.user.email]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'You already have a pending access request.' });
    }

    const result = await pool.query(
      `INSERT INTO access_requests (requester_email) VALUES ($1) RETURNING *`,
      [req.user.email]
    );

    await logAuditEvent({ eventType: 'access_request_created', userEmail: req.user.email });

    res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// GET /api/access-requests/mine — lets any logged-in user check their own
// latest request status, so the frontend can show "pending" vs the button.
router.get('/mine', requireRole(), async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT * FROM access_requests WHERE requester_email = $1 ORDER BY requested_at DESC LIMIT 1`,
      [req.user.email]
    );
    res.json({ data: result.rows[0] || null });
  } catch (err) {
    next(err);
  }
});

// GET /api/access-requests — owner only.
router.get('/', requireRole('owner'), async (req, res, next) => {
  try {
    const status = req.query.status;
    // A pending request is only still meaningful while the requester is a
    // viewer. If they were promoted by other means, the request is stale and
    // shouldn't clutter the owner's queue.
    const conditions = ["(ar.status <> 'pending' OR u.role = 'viewer')"];
    const params = [];
    if (status) {
      params.push(status);
      conditions.push(`ar.status = $${params.length}`);
    }
    const result = await pool.query(
      `SELECT ar.*
         FROM access_requests ar
         JOIN users u ON u.email = ar.requester_email
        WHERE ${conditions.join(' AND ')}
        ORDER BY ar.requested_at DESC`,
      params
    );
    res.json({ data: result.rows });
  } catch (err) {
    next(err);
  }
});

// POST /api/access-requests/:id/approve — owner only. Grants admin role.
router.post('/:id/approve', requireRole('owner'), async (req, res, next) => {
  try {
    const reqResult = await pool.query(
      `SELECT * FROM access_requests WHERE id = $1 AND status = 'pending'`,
      [req.params.id]
    );
    if (reqResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pending access request not found.' });
    }
    const request = reqResult.rows[0];

    await pool.query(`UPDATE users SET role = 'admin' WHERE email = $1`, [request.requester_email]);
    await pool.query(
      `UPDATE access_requests SET status = 'approved', resolved_at = now(), resolved_by_email = $2 WHERE id = $1`,
      [request.id, req.user.email]
    );

    await logAuditEvent({
      eventType: 'access_request_approved',
      userEmail: req.user.email,
      detail: `Granted admin to ${request.requester_email}`,
    });

    res.json({ data: { ...request, status: 'approved' } });
  } catch (err) {
    next(err);
  }
});

// POST /api/access-requests/:id/deny — owner only.
router.post('/:id/deny', requireRole('owner'), async (req, res, next) => {
  try {
    const reqResult = await pool.query(
      `SELECT * FROM access_requests WHERE id = $1 AND status = 'pending'`,
      [req.params.id]
    );
    if (reqResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pending access request not found.' });
    }
    const request = reqResult.rows[0];

    await pool.query(
      `UPDATE access_requests SET status = 'denied', resolved_at = now(), resolved_by_email = $2 WHERE id = $1`,
      [request.id, req.user.email]
    );

    await logAuditEvent({
      eventType: 'access_request_denied',
      userEmail: req.user.email,
      detail: `Denied request from ${request.requester_email}`,
    });

    res.json({ data: { ...request, status: 'denied' } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
