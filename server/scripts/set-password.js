// Rotates the password on an existing account without touching its role.
//
// Usage: npm run user:passwd -- <email> <new-password>
//        npm run user:passwd -- <email> --generate
//
// Use this to replace the seeded demo credentials before deploying; see
// `npm run security:check` for which accounts still need it.

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const { checkPassword, suggestPassword } = require('./password-policy');

async function main() {
  const [, , email, passwordArg] = process.argv;

  if (!email || !passwordArg) {
    console.error('Usage: npm run user:passwd -- <email> <new-password>');
    console.error('       npm run user:passwd -- <email> --generate');
    process.exit(1);
  }
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set. Copy .env.example to .env and fill it in.');
    process.exit(1);
  }

  const generated = passwordArg === '--generate';
  const password = generated ? suggestPassword() : passwordArg;

  const problems = checkPassword(password);
  if (problems.length > 0) {
    console.error(`Password rejected: ${problems.join('; ')}.`);
    console.error(`Suggestion: ${suggestPassword()}`);
    process.exit(1);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(password, 12);

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const result = await pool.query(
      'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING email, role',
      [passwordHash, normalizedEmail]
    );

    if (result.rowCount === 0) {
      console.error(`No account found for ${normalizedEmail}.`);
      console.error('Create one with: npm run user:create -- <email> <password> <owner|admin|viewer>');
      process.exit(1);
    }

    console.log(`Password updated for ${result.rows[0].email} (${result.rows[0].role}).`);
    if (generated) {
      console.log(`\n  New password: ${password}\n`);
      console.log('Store it in a password manager now — it is not recoverable from the database.');
    }
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Failed to set password:', err.message);
  process.exit(1);
});
