/* eslint-disable camelcase */

exports.shorthands = undefined;

// Three-tier role model: owner (super-admin, seeded manually, approves
// access requests) > admin (full CRUD) > viewer (read-only, can request
// to become admin). Viewers request access via access_requests; only the
// owner can approve/deny, which is the only way a viewer becomes admin —
// there is still no public/self-service way to gain elevated access.
exports.up = (pgm) => {
  pgm.dropConstraint('users', 'users_role_check');
  pgm.addConstraint('users', 'users_role_check', {
    check: "role IN ('owner', 'admin', 'viewer')",
  });

  pgm.createTable('access_requests', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    requester_email: { type: 'text', notNull: true },
    status: { type: 'text', notNull: true, default: 'pending' },
    requested_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    resolved_at: { type: 'timestamptz' },
    resolved_by_email: { type: 'text' },
  });

  pgm.addConstraint('access_requests', 'access_requests_status_check', {
    check: "status IN ('pending', 'approved', 'denied')",
  });

  pgm.createIndex('access_requests', ['requester_email', 'status']);
};

exports.down = (pgm) => {
  pgm.dropTable('access_requests');
  pgm.dropConstraint('users', 'users_role_check');
  pgm.addConstraint('users', 'users_role_check', { check: "role IN ('admin', 'viewer')" });
};
