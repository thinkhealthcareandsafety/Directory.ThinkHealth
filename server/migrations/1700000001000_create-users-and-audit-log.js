/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('users', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    email: { type: 'text', notNull: true },
    password_hash: { type: 'text', notNull: true },
    role: { type: 'text', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.addConstraint('users', 'users_email_unique', { unique: 'email' });
  pgm.addConstraint('users', 'users_role_check', {
    check: "role IN ('admin', 'viewer')",
  });

  // Audit trail for auth failures and admin mutations (create/update/delete).
  // Never write passwords, tokens, or other secrets into this table.
  pgm.createTable('audit_log', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    occurred_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    event_type: { type: 'text', notNull: true },
    user_email: { type: 'text' },
    hotel_id: { type: 'text' },
    detail: { type: 'text' },
  });

  pgm.createIndex('audit_log', 'occurred_at');
  pgm.createIndex('audit_log', 'event_type');
};

exports.down = (pgm) => {
  pgm.dropTable('audit_log');
  pgm.dropTable('users');
};
