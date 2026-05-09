/**
 * fetch-wod.js — Scrapes this week's CrossFit WODs from SugarWOD
 * and writes them to public/wod-cache.json (gitignored).
 *
 * Usage: node scripts/fetch-wod.js
 * Credentials are read from .env.local (SUGARWOD_EMAIL, SUGARWOD_PASSWORD)
 */

import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// --- Load .env.local manually (no extra dependency needed) ---
function loadEnvLocal() {
  const envPath = join(ROOT, '.env.local');
  if (!existsSync(envPath)) return {};
  const env = {};
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)="?([^"]*)"?\s*$/);
    if (match) env[match[1]] = match[2];
  }
  return env;
}

// --- Get Monday of the current week as YYYYMMDD ---
function getMondayParam() {
  const today = new Date();
  const day = today.getDay(); // 0=Sun
  const monday = new Date(today);
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
  return monday.toISOString().slice(0, 10).replace(/-/g, '');
}

// --- Parse YYYYMMDD → Date ---
function parseWeekParam(param) {
  const y = param.slice(0, 4), m = param.slice(4, 6), d = param.slice(6, 8);
  return new Date(`${y}-${m}-${d}`);
}

// --- Extract the highest available scaling level from a WOD description ---
function extractHighestScaling(description) {
  if (!description) return { level: null, text: description };
  // Split on lines that start with a scaling letter (A:, B:, C:, D:)
  const parts = description.split(/(?=^[A-D]:)/m).map(p => p.trim()).filter(Boolean);
  const levels = {};
  for (const part of parts) {
    const m = part.match(/^([A-D]):/);
    if (m) levels[m[1]] = part;
  }
  for (const level of ['D', 'C', 'B', 'A']) {
    if (levels[level]) return { level, text: levels[level] };
  }
  // No scaling letters found — return full description
  return { level: null, text: description };
}

async function main() {
  const env = loadEnvLocal();
  const email = env.SUGARWOD_EMAIL;
  const password = env.SUGARWOD_PASSWORD;

  if (!email || !password) {
    console.error('Missing SUGARWOD_EMAIL or SUGARWOD_PASSWORD in .env.local');
    process.exit(1);
  }

  console.log(`Logging in as ${email}...`);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Login
  await page.goto('https://app.sugarwod.com/login');
  await page.fill('input[type=email]', email);
  await page.fill('input[type=password]', password);
  // SugarWOD's React form keeps the button disabled until internal state updates —
  // remove the attribute and click directly to work around it.
  await page.evaluate(() => {
    const btn = document.querySelector('button');
    btn.removeAttribute('disabled');
    btn.click();
  });
  await page.waitForURL('**/athletes/me', { timeout: 15000 });
  console.log('Logged in.');

  // Navigate to this week's WOD calendar
  const weekParam = getMondayParam();
  console.log(`Fetching week ${weekParam}...`);
  await page.goto(
    `https://app.sugarwod.com/workouts/calendar?week=${weekParam}&track=workout-of-the-day`,
    { waitUntil: 'networkidle', timeout: 30000 }
  );

  // Wait until all 7 day columns have at least one workout loaded
  await page.waitForFunction(
    () => document.querySelectorAll('.col-7ths.cal-day').length >= 7 &&
          document.querySelectorAll('.cal-workout').length >= 6,
    { timeout: 20000 }
  );

  // Extract all day columns
  const rawDays = await page.evaluate(() => {
    return [...document.querySelectorAll('.col-7ths.cal-day')].map(day => ({
      workouts: [...day.querySelectorAll('.cal-workout')].map(w => ({
        title: w.querySelector('.cal-workout-title')?.textContent?.trim() ?? '',
        description: w.querySelector('.cal-workout-description')?.innerText?.trim() ?? ''
      }))
    }));
  });

  await browser.close();

  // Map day index → calendar date (Mon=0 … Sun=6)
  const monday = parseWeekParam(weekParam);
  const days = {};
  rawDays.forEach((day, idx) => {
    if (!day.workouts.length) return;
    const date = new Date(monday);
    date.setDate(monday.getDate() + idx);
    const dateKey = date.toISOString().slice(0, 10); // YYYY-MM-DD

    const strength = day.workouts.find(w => w.title === 'Strength' || w.title === 'Strength Building');
    const wod = day.workouts.find(w => w.title !== 'Strength' && w.title !== 'Strength Building' && w.description);

    days[dateKey] = {
      ...(strength ? { strength: strength.description } : {}),
      ...(wod ? { wod: extractHighestScaling(wod.description), wodTitle: wod.title } : {})
    };
  });

  const output = {
    fetched_at: new Date().toISOString(),
    week: weekParam,
    days
  };

  const outPath = join(ROOT, 'public', 'wod-cache.json');
  writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`Saved to public/wod-cache.json`);

  // Print today's workout
  const todayKey = new Date().toISOString().slice(0, 10);
  const today = days[todayKey];
  if (today) {
    console.log(`\n=== Today (${todayKey}) ===`);
    if (today.strength) console.log(`\nStrength:\n${today.strength}`);
    if (today.wod) console.log(`\nWOD [${today.wod.level ?? 'full'}]:\n${today.wod.text}`);
  } else {
    console.log(`\nNo workout found for today (${todayKey})`);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
