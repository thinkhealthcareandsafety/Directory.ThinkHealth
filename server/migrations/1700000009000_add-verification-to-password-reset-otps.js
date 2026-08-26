/* eslint-disable camelcase */

exports.shorthands = undefined;

// Splits the reset flow into two server round-trips: check the OTP first,
// then set the password. `verified_at` marks that the OTP itself has already
// been proven correct; `ticket_hash` is a separate one-time credential
// (never the OTP) that the client must present to actually change the
// password, so a verified-but-abandoned code can't be reused to skip
// straight to a password change later.
exports.up = (pgm) => {
  pgm.addColumns('password_reset_otps', {
    verified_at: { type: 'timestamptz' },
    ticket_hash: { type: 'text' },
  });
};

exports.down = (pgm) => {
  pgm.dropColumns('password_reset_otps', ['verified_at', 'ticket_hash']);
};
