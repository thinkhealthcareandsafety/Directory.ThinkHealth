// One-time CLI import: loads data/hotels.json (produced by
// `npm run db:extract`) and inserts each record into Postgres.
// Not part of app startup — run manually: npm run db:import

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const DATA_PATH = path.join(__dirname, '..', 'data', 'hotels.json');

const PLACEHOLDER_VALUES = new Set(['', '-', 'n/a', 'not listed', 'none']);

function cleanText(val) {
  if (val === undefined || val === null) return null;
  const str = val.toString().trim();
  return PLACEHOLDER_VALUES.has(str.toLowerCase()) ? null : str;
}

function cleanInt(val) {
  const cleaned = cleanText(val);
  if (cleaned === null) return null;
  const n = parseInt(cleaned, 10);
  return Number.isInteger(n) ? n : null;
}

function cleanDate(val) {
  const cleaned = cleanText(val);
  if (cleaned === null) return null;
  const d = new Date(cleaned);
  return Number.isNaN(d.getTime()) ? null : cleaned;
}

function normalizeHotelId(rawId) {
  return (rawId || '').toString().trim().toUpperCase();
}

function mapRecord(raw) {
  return {
    hotel_id: normalizeHotelId(raw.id),
    name: cleanText(raw.name),
    brand: cleanText(raw.brand),
    group_name: cleanText(raw.group),
    establishment_year: cleanInt(raw.establishmentYear),
    star_rating: cleanInt(raw.starRating),
    hospitality_group: cleanText(raw.hospitalityGroup),
    city: cleanText(raw.city),
    state: cleanText(raw.state),
    country: cleanText(raw.country) || 'India',
    category: cleanText(raw.category),
    security_head_name: cleanText(raw.securityHead?.fullName),
    security_head_email: cleanText(raw.securityHead?.email),
    security_head_phone: cleanText(raw.securityHead?.contact),
    general_manager_name: cleanText(raw.generalManager?.fullName),
    general_manager_email: cleanText(raw.generalManager?.email),
    general_manager_phone: cleanText(raw.generalManager?.contact),
    purchase_manager_name: cleanText(raw.purchaseManager?.fullName),
    purchase_manager_email: cleanText(raw.purchaseManager?.email),
    purchase_manager_phone: cleanText(raw.purchaseManager?.contact),
    other_contact_name: cleanText(raw.otherDetails?.fullName),
    other_contact_email: cleanText(raw.otherDetails?.email),
    other_contact_phone: cleanText(raw.otherDetails?.contact),
    linkedin_url: cleanText(raw.linkedIn),
    last_cpr_training: cleanDate(raw.lastCprTraining),
  };
}

function validate(record) {
  const errors = [];
  if (!record.hotel_id) errors.push('missing hotel_id');
  if (!record.name) errors.push('missing name');
  if (!record.city) errors.push('missing city');
  return errors;
}

async function main() {
  if (!fs.existsSync(DATA_PATH)) {
    console.error(`${DATA_PATH} not found. Run "npm run db:extract" first.`);
    process.exit(1);
  }
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set. Copy .env.example to .env and fill it in.');
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  let inserted = 0;
  let skippedDuplicates = 0;
  let validationErrors = 0;
  const seenIds = new Set();

  for (const rawRecord of raw) {
    const record = mapRecord(rawRecord);
    const errors = validate(record);

    if (errors.length > 0) {
      validationErrors++;
      console.warn(`SKIP (validation): ${rawRecord.id || '(no id)'} — ${errors.join(', ')}`);
      continue;
    }

    if (seenIds.has(record.hotel_id)) {
      skippedDuplicates++;
      console.warn(`SKIP (duplicate within import file): ${record.hotel_id}`);
      continue;
    }
    seenIds.add(record.hotel_id);

    const columns = Object.keys(record);
    const values = Object.values(record);
    const placeholders = values.map((_, i) => `$${i + 1}`);

    try {
      await pool.query(
        `INSERT INTO hotels (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`,
        values
      );
      inserted++;
    } catch (err) {
      if (err.code === '23505') {
        skippedDuplicates++;
        console.warn(`SKIP (already in database): ${record.hotel_id}`);
      } else {
        validationErrors++;
        console.error(`ERROR inserting ${record.hotel_id}: ${err.message}`);
      }
    }
  }

  await pool.end();

  console.log('\n--- Import summary ---');
  console.log(`Rows in source file:     ${raw.length}`);
  console.log(`Inserted:                ${inserted}`);
  console.log(`Skipped (duplicates):    ${skippedDuplicates}`);
  console.log(`Skipped (errors):        ${validationErrors}`);
}

main().catch((err) => {
  console.error('Import failed:', err);
  process.exit(1);
});
