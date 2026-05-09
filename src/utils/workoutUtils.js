/**
 * Workout utility functions - Centralized workout operations
 */

import { formatDateKey, getWeekKey } from './dateUtils';

// Canonical colors by typeEn — single source of truth to prevent stale stored colors
const CANONICAL_COLORS = {
  'Strength': 'bg-indigo-600',
  'CrossFit': 'bg-amber-600',
  'Sprints':  'bg-lime-600',
  'Long Run': 'bg-teal-600',
  'Rest':     'bg-slate-600',
};

function resolveColor(workout) {
  if (CANONICAL_COLORS[workout.typeEn]) return CANONICAL_COLORS[workout.typeEn];
  if (isRunningWorkout(workout)) return 'bg-teal-600';
  return workout.color || 'bg-slate-600';
}

// Default fallback workout to prevent crashes
const FALLBACK_WORKOUT = {
  type: 'מנוחה',
  typeEn: 'Rest',
  color: 'bg-slate-600',
  exercises: []
};

/**
 * Validates that a workout object has required properties
 * @param {Object} workout - Workout to validate
 * @returns {boolean} True if workout is valid
 */
function isValidWorkout(workout) {
  return workout &&
         typeof workout === 'object' &&
         workout.typeEn &&
         Array.isArray(workout.exercises);
}

/**
 * Get workout for a specific date
 * Checks week-specific schedule first, then falls back to default program
 * Always returns a valid workout object with exercises array
 * @param {Date} date - The date to get workout for
 * @param {Object} weeklySchedules - Week-specific schedule overrides
 * @param {Object} workoutProgram - Default workout program
 * @returns {Object} Workout configuration for the date
 */
export function getWorkoutForDate(date, weeklySchedules, workoutProgram) {
  const weekKey = getWeekKey(date);
  const dayIndex = date.getDay();

  // Check if there's a custom schedule for this week
  if (weeklySchedules[weekKey] && weeklySchedules[weekKey][dayIndex]) {
    const weeklyWorkout = weeklySchedules[weekKey][dayIndex];
    if (isValidWorkout(weeklyWorkout)) {
      return { ...weeklyWorkout, color: resolveColor(weeklyWorkout) };
    }
    console.warn(`Invalid weekly schedule for ${weekKey}/${dayIndex}, using default`);
  }

  // Fall back to default program
  const defaultWorkout = workoutProgram[dayIndex];
  if (isValidWorkout(defaultWorkout)) {
    return { ...defaultWorkout, color: resolveColor(defaultWorkout) };
  }

  // Ultimate fallback if even default program is corrupted
  console.error(`Invalid workout program for day ${dayIndex}, using fallback`);
  return FALLBACK_WORKOUT;
}

/**
 * Get workout log for a specific date
 * @param {Date} date - The date to get log for
 * @param {Object} workoutLogs - All workout logs
 * @returns {Object} Log for the date with defaults
 */
export function getDateLog(date, workoutLogs) {
  const dateKey = formatDateKey(date);
  return workoutLogs[dateKey] || { completed: null, exercises: {}, running: {}, notes: '' };
}

/**
 * Create updated workout logs with new data
 * @param {Date} date - The date to update
 * @param {Object} updates - Updates to apply to the log
 * @param {Object} workoutLogs - Current workout logs
 * @returns {Object} New workout logs object
 */
export function createUpdatedLogs(date, updates, workoutLogs) {
  const dateKey = formatDateKey(date);
  const currentLog = getDateLog(date, workoutLogs);

  return {
    ...workoutLogs,
    [dateKey]: {
      ...currentLog,
      ...updates,
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Get workout history sorted by date (most recent first)
 * @param {Object} workoutLogs - All workout logs
 * @param {number} limit - Maximum number of entries to return
 * @returns {Array} Array of [dateKey, log] tuples
 */
export function getWorkoutHistory(workoutLogs, limit = 50) {
  return Object.entries(workoutLogs)
    .sort(([a], [b]) => new Date(b) - new Date(a))
    .slice(0, limit);
}

/**
 * Check if a workout is a running type
 * @param {Object} workout - Workout object
 * @returns {boolean} True if it's a running workout
 */
export function isRunningWorkout(workout) {
  if (!workout) return false;
  return workout.typeEn === 'Sprints' ||
         workout.typeEn === 'Long Run' ||
         workout.typeEn?.toLowerCase().includes('run') ||
         workout.typeEn?.toLowerCase().includes('fartlek') ||
         workout.type?.includes('ריצה');
}

/**
 * Check if a workout is strength training
 * @param {Object} workout - Workout object
 * @returns {boolean} True if it's a strength workout
 */
export function isStrengthWorkout(workout) {
  return workout?.typeEn === 'Strength';
}

/**
 * Check if a workout is CrossFit
 * @param {Object} workout - Workout object
 * @returns {boolean} True if it's a CrossFit workout
 */
export function isCrossfitWorkout(workout) {
  return workout?.typeEn === 'CrossFit';
}

/**
 * Check if a workout is a rest day
 * @param {Object} workout - Workout object
 * @returns {boolean} True if it's a rest day
 */
export function isRestDay(workout) {
  return workout?.typeEn === 'Rest';
}
