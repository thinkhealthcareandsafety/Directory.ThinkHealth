// Provisions a login account. There is no public registration endpoint —
// this is the only way to create a user, on purpose (so nobody can mint
// themselves an admin account through the API).
//
// Usage: npm run user:create -- <email> <password> <owner|admin|viewer>
//
// "owner" should normally only be used once, to seed the one super-admin
// account. From then on, admins are created by the owner approving
// access requests in the app (see src/routes/accessRequests.js), not by
// running this script again — this script is the escape hatch, not the
// normal workflow for granting admin.

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const { checkPassword, suggestPassword } = require('./password-policy');

async function main() {
  const [, , email, password, role] = process.argv;

  if (!email || !password || !role) {
    console.error('Usage: npm run user:create -- <email> <password> <owner|admin|viewer>');
    process.exit(1);
  }
  if (!['owner', 'admin', 'viewer'].includes(role)) {
    console.error(`Role must be "owner", "admin", or "viewer", got "${role}".`);
    process.exit(1);
  }
  const passwordProblems = checkPassword(password);
  if (passwordProblems.length > 0) {
    console.error(`Password rejected: ${passwordProblems.join('; ')}.`);
    console.error(`Suggestion: ${suggestPassword()}`);
    process.exit(1);
  }
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set. Copy .env.example to .env and fill it in.');
    process.exit(1);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(password, 12);

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role
       RETURNING email, role`,
      [normalizedEmail, passwordHash, role]
    );
    console.log(`User ready: ${result.rows[0].email} (${result.rows[0].role})`);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Failed to create user:', err.message);
  process.exit(1);
});
