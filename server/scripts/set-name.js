// Sets the display name on an account. Optional — accounts work fine without
// one — but it's what the avatar initial and user menu show when present.
//
// Usage: npm run user:name -- <email> "<full name>"

require('dotenv').config();
const { Pool } = require('pg');

async function main() {
  const [, , email, fullName] = process.argv;

  if (!email || !fullName) {
    console.error('Usage: npm run user:name -- <email> "<full name>"');
    process.exit(1);
  }
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set.');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const result = await pool.query(
      'UPDATE users SET full_name = $1 WHERE email = $2 RETURNING email, full_name, role',
      [fullName.trim(), email.trim().toLowerCase()]
    );
    if (result.rowCount === 0) {
      console.error(`No account found for ${email}.`);
      process.exit(1);
    }
    const u = result.rows[0];
    console.log(`Updated: ${u.email} (${u.role}) -> "${u.full_name}"`);
    console.log('Sign out and back in for it to appear.');
  } finally {
    await pool.end();
  }
}

main().catch((err) => { console.error('Failed:', err.message); process.exit(1); });
