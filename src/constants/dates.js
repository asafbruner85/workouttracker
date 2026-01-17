/**
 * Date-related constants - Single source of truth for day names
 */

// Hebrew day abbreviations (א-ש)
export const HEBREW_DAYS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

// English day abbreviations
export const ENGLISH_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Full day information for schedule configuration
export const DAYS_CONFIG = [
  { index: 0, name: 'Sunday', nameHe: 'א', short: 'Sun' },
  { index: 1, name: 'Monday', nameHe: 'ב', short: 'Mon' },
  { index: 2, name: 'Tuesday', nameHe: 'ג', short: 'Tue' },
  { index: 3, name: 'Wednesday', nameHe: 'ד', short: 'Wed' },
  { index: 4, name: 'Thursday', nameHe: 'ה', short: 'Thu' },
  { index: 5, name: 'Friday', nameHe: 'ו', short: 'Fri' },
  { index: 6, name: 'Saturday', nameHe: 'ש', short: 'Sat' }
];
