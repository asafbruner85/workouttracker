/**
 * Workout type configurations - Single source of truth for workout definitions
 */

// Workout type display info for UI components (ScheduleConfig, etc.)
export const WORKOUT_TYPES = [
  { value: 'Strength', label: 'Strength Training', color: 'bg-indigo-600', icon: '💪' },
  { value: 'CrossFit', label: 'CrossFit WOD', color: 'bg-amber-600', icon: '🏋️' },
  { value: 'Sprints', label: 'Sprint Training', color: 'bg-lime-600', icon: '⚡' },
  { value: 'Long Run', label: 'Long Distance Run', color: 'bg-teal-600', icon: '🏃' },
  { value: 'Rest', label: 'Rest Day', color: 'bg-slate-600', icon: '😴' }
];

// Full workout configurations with exercises (for handleScheduleSave)
export const WORKOUT_TYPE_CONFIGS = {
  'Strength': {
    type: 'כוח',
    typeEn: 'Strength',
    color: 'bg-indigo-600',
    exercises: [
      { name: 'Back Squats', sets: '3 super-sets: 5 reps', targetWeight: '70', notes: '+ 8 Weighted dips (2min rest between)' },
      { name: 'Weighted Dips', sets: '3 super-sets: 8 reps', targetWeight: '12', notes: 'Part of super-set with squats' },
      { name: 'Strict Press', sets: '3 super-sets: 5 reps', targetWeight: '45', notes: '+ 8 Weighted pull ups (2min rest between)' },
      { name: 'Weighted Pull Ups', sets: '3 super-sets: 8 reps', targetWeight: '', notes: 'Part of super-set with press' },
      { name: 'Max Reps Dips (B.W)', sets: '1 set', targetReps: '20', notes: '' },
      { name: 'Max Reps Pull Ups (B.W)', sets: '1 set', targetReps: '20', notes: '' }
    ]
  },
  'CrossFit': {
    type: 'קרוספיט',
    typeEn: 'CrossFit',
    color: 'bg-amber-600',
    exercises: [
      { name: 'CrossFit WOD', sets: 'Based on gym programming', notes: 'מבוסס על תכנית האימונים במועדון' }
    ]
  },
  'Sprints': {
    type: 'ריצה (ספרינטים)',
    typeEn: 'Sprints',
    color: 'bg-lime-600',
    exercises: [
      { name: 'Warm-up', sets: '10 mins', notes: 'Easy jog + high knees, butt kicks, triple jump' },
      { name: '150m Sprint', sets: '8 sets', notes: 'RPE: 9-10, REST: 90-120sec walking to start line' },
      { name: 'Cool-down', sets: '7-10 min', notes: 'Light jog' }
    ]
  },
  'Long Run': {
    type: 'ריצה (Zone 2)',
    typeEn: 'Long Run',
    color: 'bg-teal-600',
    exercises: [
      { name: '30 min Long Run', sets: '1 session', notes: 'Heart rate: 120-135bpm, Pace: 05:50-06:00, RPE: 4-5' }
    ]
  },
  'Rest': {
    type: 'מנוחה',
    typeEn: 'Rest',
    color: 'bg-slate-600',
    exercises: [
      { name: 'Rest Day', sets: '', notes: 'Recovery and regeneration' }
    ]
  }
};

// Default weekly workout program (index 0-6 = Sun-Sat)
export const DEFAULT_WORKOUTS = {
  0: { // Sunday - א
    type: 'כוח',
    typeEn: 'Strength',
    color: 'bg-indigo-600',
    exercises: [
      { name: 'Back Squats', sets: '3 super-sets: 5 reps', targetWeight: '70', notes: '+ 8 Weighted dips (2min rest between)' },
      { name: 'Weighted Dips', sets: '3 super-sets: 8 reps', targetWeight: '12', notes: 'Part of super-set with squats' },
      { name: 'Strict Press', sets: '3 super-sets: 5 reps', targetWeight: '45', notes: '+ 8 Weighted pull ups (2min rest between)' },
      { name: 'Weighted Pull Ups', sets: '3 super-sets: 8 reps', targetWeight: '', notes: 'Part of super-set with press' },
      { name: 'Max Reps Dips (B.W)', sets: '1 set', targetReps: '20', notes: '' },
      { name: 'Max Reps Pull Ups (B.W)', sets: '1 set', targetReps: '20', notes: '' }
    ]
  },
  1: { // Monday - ב
    type: 'קרוספיט',
    typeEn: 'CrossFit',
    color: 'bg-amber-600',
    exercises: [
      { name: 'CrossFit WOD', sets: 'Based on gym programming', notes: 'מבוסס על תכנית האימונים במועדון' }
    ]
  },
  2: { // Tuesday - ג
    type: 'קרוספיט',
    typeEn: 'CrossFit',
    color: 'bg-amber-600',
    exercises: [
      { name: 'CrossFit WOD', sets: 'Based on gym programming', notes: 'מבוסס על תכנית האימונים במועדון' }
    ]
  },
  3: { // Wednesday - ד
    type: 'ריצה (ספרינטים)',
    typeEn: 'Sprints',
    color: 'bg-lime-600',
    exercises: [
      { name: 'Warm-up', sets: '10 mins', notes: 'Easy jog + high knees, butt kicks, triple jump' },
      { name: '150m Sprint', sets: '8 sets', notes: 'RPE: 9-10, REST: 90-120sec walking to start line' },
      { name: 'Cool-down', sets: '7-10 min', notes: 'Light jog' }
    ]
  },
  4: { // Thursday - ה
    type: 'כוח',
    typeEn: 'Strength',
    color: 'bg-indigo-600',
    exercises: [
      { name: 'Deadlifts', sets: '3 super-sets: 5 reps', targetWeight: '', notes: '+ 8 Weighted dips (2min rest between)' },
      { name: 'Weighted Dips', sets: '3 super-sets: 8 reps', targetWeight: '', notes: 'Part of super-set with deadlifts' },
      { name: 'Bench Press', sets: '3 super-sets: 5 reps', targetWeight: '', notes: '+ 8 Barbell bent over row (2min rest between)' },
      { name: 'Barbell Bent Over Row', sets: '3 super-sets: 8 reps', targetWeight: '', notes: 'Part of super-set with bench' },
      { name: 'Max Reps Dips (B.W)', sets: '1 set', targetReps: '', notes: '' },
      { name: 'Max Reps Pull Ups (B.W)', sets: '1 set', targetReps: '', notes: '' }
    ]
  },
  5: { // Friday - ו
    type: 'ריצה (Zone 2)',
    typeEn: 'Long Run',
    color: 'bg-teal-600',
    exercises: [
      { name: '30 min Long Run', sets: '1 session', notes: 'Heart rate: 120-135bpm, Pace: 05:50-06:00, RPE: 4-5' }
    ]
  },
  6: { // Saturday - ש
    type: 'מנוחה',
    typeEn: 'Rest',
    color: 'bg-slate-600',
    exercises: [
      { name: 'Rest Day', sets: '', notes: 'Recovery and regeneration' }
    ]
  }
};

/**
 * Get workout type info by value
 * @param {string} typeEn - The English workout type name
 * @returns {Object} Workout type info with label, color, icon
 */
export function getWorkoutTypeInfo(typeEn) {
  return WORKOUT_TYPES.find(w => w.value === typeEn) || WORKOUT_TYPES[4]; // Default to Rest
}

/**
 * Check if a workout type is a running workout
 * @param {Object} workout - Workout object with typeEn property
 * @returns {boolean}
 */
export function isRunningWorkout(workout) {
  if (!workout) return false;
  return workout.typeEn === 'Sprints' ||
         workout.typeEn === 'Long Run' ||
         workout.typeEn?.toLowerCase().includes('run') ||
         workout.typeEn?.toLowerCase().includes('fartlek') ||
         workout.type?.includes('ריצה');
}
