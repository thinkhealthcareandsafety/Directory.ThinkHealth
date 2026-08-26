// One-time bootstrap import: reads the full hotel dataset exported from
// the Zoho sheet as CSV and loads it into Postgres, replacing whatever is
// currently in the hotels table. Not part of app startup — run manually.
//
// Usage: npm run db:import-csv -- "<path-to-csv>"
//
// Expected layout (two header rows, matching the Zoho export):
//   Row 1: section headers (HOTEL DETAILS | OTHER DETAILS | GENERAL
//          MANAGER | SECURITY HEAD | PURCHASE MANAGER | LAST CPR TRAINING)
//   Row 2: field headers (HOTEL, NAME OF THE HOTEL, BRAND, ... for each
//          section: FULL NAME, EMAIL ADDRESS, CONTACT NUMBER, LINKEDIN
//          PROFILE)
//   Row 3+: data

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { Pool } = require('pg');

const DEFAULT_CSV_PATH = path.join(__dirname, '..', 'data', 'hotels-source.csv');
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

// 0-indexed column positions in the source CSV.
const COL = {
  hotel_id: 0,
  name: 1,
  brand: 2,
  group_name: 3,
  establishment_year: 4,
  star_rating: 5,
  hospitality_group: 6,
  city: 7,
  state: 8,
  country: 9,
  category: 10,
  other_contact_name: 11,
  other_contact_email: 12,
  other_contact_phone: 13,
  linkedin_url: 14,
  general_manager_name: 15,
  general_manager_email: 16,
  general_manager_phone: 17,
  general_manager_linkedin: 18,
  security_head_name: 19,
  security_head_email: 20,
  security_head_phone: 21,
  security_head_linkedin: 22,
  purchase_manager_name: 23,
  purchase_manager_email: 24,
  purchase_manager_phone: 25,
  purchase_manager_linkedin: 26,
  last_cpr_training: 27,
};

function mapRow(row) {
  return {
    hotel_id: normalizeHotelId(row[COL.hotel_id]),
    name: cleanText(row[COL.name]),
    brand: cleanText(row[COL.brand]),
    group_name: cleanText(row[COL.group_name]),
    establishment_year: cleanInt(row[COL.establishment_year]),
    star_rating: cleanInt(row[COL.star_rating]),
    hospitality_group: cleanText(row[COL.hospitality_group]),
    city: cleanText(row[COL.city]),
    state: cleanText(row[COL.state]),
    country: cleanText(row[COL.country]) || 'India',
    category: cleanText(row[COL.category]),

    other_contact_name: cleanText(row[COL.other_contact_name]),
    other_contact_email: cleanText(row[COL.other_contact_email]),
    other_contact_phone: cleanText(row[COL.other_contact_phone]),
    linkedin_url: cleanText(row[COL.linkedin_url]),

    general_manager_name: cleanText(row[COL.general_manager_name]),
    general_manager_email: cleanText(row[COL.general_manager_email]),
    general_manager_phone: cleanText(row[COL.general_manager_phone]),
    general_manager_linkedin: cleanText(row[COL.general_manager_linkedin]),

    security_head_name: cleanText(row[COL.security_head_name]),
    security_head_email: cleanText(row[COL.security_head_email]),
    security_head_phone: cleanText(row[COL.security_head_phone]),
    security_head_linkedin: cleanText(row[COL.security_head_linkedin]),

    purchase_manager_name: cleanText(row[COL.purchase_manager_name]),
    purchase_manager_email: cleanText(row[COL.purchase_manager_email]),
    purchase_manager_phone: cleanText(row[COL.purchase_manager_phone]),
    purchase_manager_linkedin: cleanText(row[COL.purchase_manager_linkedin]),

    last_cpr_training: cleanDate(row[COL.last_cpr_training]),
  };
}

function validate(record) {
  const errors = [];
  if (!record.hotel_id) errors.push('missing hotel_id');
  if (!record.name) errors.push('missing name');
  if (!record.city) errors.push('missing city');
  return errors;
}

function isBlankRow(row) {
  return row.every((cell) => cleanText(cell) === null);
}

async function main() {
  const csvPath = process.argv[2] || DEFAULT_CSV_PATH;

  if (!fs.existsSync(csvPath)) {
    console.error(`CSV file not found: ${csvPath}`);
    console.error('Usage: npm run db:import-csv -- "<path-to-csv>"');
    process.exit(1);
  }
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set. Copy .env.example to .env and fill it in.');
    process.exit(1);
  }

  const rawText = fs.readFileSync(csvPath, 'utf8');
  const allRows = parse(rawText, { relax_column_count: true });
  const dataRows = allRows.slice(2).filter((row) => !isBlankRow(row));

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  console.log(`This will REPLACE all rows currently in the hotels table with the ${dataRows.length} rows from:`);
  console.log(`  ${csvPath}`);
  console.log('Clearing hotels table...');
  await pool.query('TRUNCATE hotels RESTART IDENTITY');

  let inserted = 0;
  let skippedDuplicates = 0;
  let validationErrors = 0;
  const seenIds = new Set();

  for (const row of dataRows) {
    const record = mapRow(row);
    const errors = validate(record);

    if (errors.length > 0) {
      validationErrors++;
      console.warn(`SKIP (validation): ${record.hotel_id || '(no id)'} — ${errors.join(', ')}`);
      continue;
    }

    if (seenIds.has(record.hotel_id)) {
      skippedDuplicates++;
      console.warn(`SKIP (duplicate within file): ${record.hotel_id}`);
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
  console.log(`Rows in source file:     ${dataRows.length}`);
  console.log(`Inserted:                ${inserted}`);
  console.log(`Skipped (duplicates):    ${skippedDuplicates}`);
  console.log(`Skipped (errors):        ${validationErrors}`);
}

main().catch((err) => {
  console.error('Import failed:', err);
  process.exit(1);
});
