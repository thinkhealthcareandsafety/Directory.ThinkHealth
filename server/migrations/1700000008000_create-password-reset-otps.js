/* eslint-disable camelcase */

exports.shorthands = undefined;

// One row per requested code. Only the hash is stored — never the raw OTP —
// so a database read alone can't be used to reset an account. A fresh
// request supersedes any prior unused code for the same user (see
// POST /api/auth/password-reset/request), so at most one row per user is
// ever valid at a time; older rows are left in place as a request history.
exports.up = (pgm) => {
  pgm.createTable('password_reset_otps', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: 'users',
      onDelete: 'cascade',
    },
    otp_hash: { type: 'text', notNull: true },
    expires_at: { type: 'timestamptz', notNull: true },
    used_at: { type: 'timestamptz' },
    attempt_count: { type: 'integer', notNull: true, default: 0 },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  // Lookup pattern is always "latest unused, unexpired code for this user".
  pgm.createIndex('password_reset_otps', 'user_id');
};

exports.down = (pgm) => {
  pgm.dropTable('password_reset_otps');
};
