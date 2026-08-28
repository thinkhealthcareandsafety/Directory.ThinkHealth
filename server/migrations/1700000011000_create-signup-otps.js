/* eslint-disable camelcase */

exports.shorthands = undefined;

// Self-registration now happens in two steps: request a code, then verify
// it, and only then does a row land in `users`. The email + password are
// held here, not in `users`, until the code is confirmed — a registration
// nobody ever completes just expires here rather than becoming a real
// account with an unverified email. Same hashing rule as the OTP tables
// this mirrors: only the hash of the code is ever stored.
exports.up = (pgm) => {
  pgm.createTable('signup_otps', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    email: { type: 'text', notNull: true },
    password_hash: { type: 'text', notNull: true },
    otp_hash: { type: 'text', notNull: true },
    expires_at: { type: 'timestamptz', notNull: true },
    used_at: { type: 'timestamptz' },
    attempt_count: { type: 'integer', notNull: true, default: 0 },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.createIndex('signup_otps', 'email');
};

exports.down = (pgm) => {
  pgm.dropTable('signup_otps');
};
