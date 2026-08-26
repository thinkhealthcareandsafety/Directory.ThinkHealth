// Creates a timestamped pg_dump backup of the entire database.
// Usage: npm run db:backup
//
// Backups go to ../backups/ (next to the server/ folder).
// Keep at least the last 3; older ones can be deleted manually.

require('dotenv').config();
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const PG_DUMP = process.env.PG_DUMP_PATH || 'pg_dump';
const BACKUP_DIR = path.join(__dirname, '..', '..', 'backups');

if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

const ts = new Date().toISOString().slice(0, 19).replace(/:/g, '-').replace('T', '_');
const outFile = path.join(BACKUP_DIR, `thinkhealth_${ts}.dump`);

const url = new URL(process.env.DATABASE_URL);
const env = {
  ...process.env,
  PGPASSWORD: url.password,
};

const cmd = `"${PG_DUMP}" -U ${url.username} -h ${url.hostname} -p ${url.port || 5432} -d ${url.pathname.slice(1)} -F c -f "${outFile}"`;

console.log(`Backing up to: ${outFile}`);
try {
  execSync(cmd, { env, stdio: 'inherit' });
  const size = (fs.statSync(outFile).size / 1024).toFixed(1);
  console.log(`Done. Size: ${size} KB`);

  // List existing backups so the user knows what's there
  const backups = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.endsWith('.dump'))
    .sort();
  console.log(`\nAll backups (${backups.length}):`);
  backups.forEach(f => {
    const kb = (fs.statSync(path.join(BACKUP_DIR, f)).size / 1024).toFixed(1);
    console.log(`  ${f}  (${kb} KB)`);
  });
} catch (err) {
  console.error('Backup failed:', err.message);
  console.error('If pg_dump is not on PATH, set PG_DUMP_PATH in .env:');
  console.error('  PG_DUMP_PATH=C:\\Program Files\\PostgreSQL\\17\\bin\\pg_dump.exe');
  process.exit(1);
}
