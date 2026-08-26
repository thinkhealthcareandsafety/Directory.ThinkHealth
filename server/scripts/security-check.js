// Pre-deployment sanity check. Reports configuration problems and any account
// still using one of the seeded demo passwords, so a weak login can't quietly
// survive into a real deployment.
//
// Usage: npm run security:check

const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const { config, validateConfig } = require('../src/config');

// The credentials documented in README/handoff notes for local development.
// Anything still matching one of these must be rotated before deployment.
const KNOWN_DEMO_PASSWORDS = ['OwnerPass123', 'AdminPass123', 'ViewerPass123'];

// Passwords worth rejecting outright regardless of where they came from.
const COMMON_WEAK = ['password', 'password1', '12345678', 'changeme', 'letmein', 'admin123'];

async function main() {
  const problems = [];
  const notes = [];

  const { fatal, warnings } = validateConfig();
  fatal.forEach((f) => problems.push(`config: ${f}`));
  warnings.forEach((w) => notes.push(`config: ${w}`));

  if (!process.env.DATABASE_URL) {
    report(problems, notes);
    process.exit(problems.length > 0 ? 1 : 0);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const { rows } = await pool.query('SELECT email, role, password_hash FROM users ORDER BY email');

    if (rows.length === 0) {
      problems.push('users: no accounts exist. Seed an owner with: npm run user:create -- <email> <password> owner');
    }

    const owners = rows.filter((u) => u.role === 'owner');
    if (owners.length === 0) {
      problems.push('users: no owner account exists — nobody can approve access requests.');
    } else if (owners.length > 1) {
      notes.push(`users: ${owners.length} owner accounts exist (${owners.map((o) => o.email).join(', ')}). Usually there should be one.`);
    }

    for (const user of rows) {
      const candidates = [...KNOWN_DEMO_PASSWORDS, ...COMMON_WEAK];
      for (const candidate of candidates) {
        // eslint-disable-next-line no-await-in-loop
        if (await bcrypt.compare(candidate, user.password_hash)) {
          problems.push(`users: ${user.email} (${user.role}) is still using a known weak password. Rotate it: npm run user:passwd -- ${user.email} <new-password>`);
          break;
        }
      }
    }

    const demoEmails = ['owner@thinkhealth.com', 'admin@thinkhealth.com', 'viewer@thinkhealth.com'];
    const survivingDemoAccounts = rows.filter((u) => demoEmails.includes(u.email));
    if (config.isProduction && survivingDemoAccounts.length > 0) {
      notes.push(`users: seeded demo accounts still exist in a production database (${survivingDemoAccounts.map((u) => u.email).join(', ')}). Remove them if they are not real people.`);
    }
  } finally {
    await pool.end();
  }

  report(problems, notes);
  process.exit(problems.length > 0 ? 1 : 0);
}

function report(problems, notes) {
  console.log('\n--- Security check ---');
  if (notes.length > 0) {
    console.log('\nWarnings:');
    notes.forEach((n) => console.log(`  ~ ${n}`));
  }
  if (problems.length === 0) {
    console.log('\nNo blocking problems found.\n');
  } else {
    console.log('\nMust fix before deploying:');
    problems.forEach((p) => console.log(`  ! ${p}`));
    console.log('');
  }
}

main().catch((err) => {
  console.error('Security check failed to run:', err.message);
  process.exit(1);
});
