import { describe, it, expect, beforeEach } from 'vitest';
import {
  getWorkoutForDate,
  getDateLog,
  createUpdatedLogs,
  getWorkoutHistory,
  isRunningWorkout,
  isStrengthWorkout,
  isCrossfitWorkout,
  isRestDay
} from '../src/utils/workoutUtils';

describe('Workout Utilities', () => {
  const mockWorkoutProgram = {
    0: { typeEn: 'Rest', type: 'יום מנוחה', color: 'bg-gray-600' },
    1: { typeEn: 'Strength', type: 'אימון כוח', color: 'bg-indigo-600' },
    2: { typeEn: 'CrossFit', type: 'קרוספיט', color: 'bg-amber-600' },
    3: { typeEn: 'Sprints', type: 'ספרינטים', color: 'bg-rose-600' },
    4: { typeEn: 'Strength', type: 'אימון כוח', color: 'bg-indigo-600' },
    5: { typeEn: 'Long Run', type: 'ריצה ארוכה', color: 'bg-teal-600' },
    6: { typeEn: 'CrossFit', type: 'קרוספיט', color: 'bg-amber-600' }
  };

  const mockWeeklySchedules = {
    '2024-03-10': {
      1: { typeEn: 'CrossFit', type: 'קרוספיט', color: 'bg-amber-600' }, // Override Monday
      3: { typeEn: 'Rest', type: 'יום מנוחה', color: 'bg-gray-600' } // Override Wednesday
    }
  };

  const mockWorkoutLogs = {
    '2024-03-11': {
      completed: true,
      exercises: { 0: { name: 'Squats', weight: '80', reps: '5/5/5' } },
      notes: 'Great workout'
    },
    '2024-03-12': {
      completed: false,
      exercises: {},
      notes: 'Skipped - feeling sick'
    },
    '2024-03-13': {
      completed: true,
      running: { distance: '5', duration: '25', pace: '5:00' }
    }
  };

  describe('getWorkoutForDate', () => {
    it('should return default program workout when no override exists', () => {
      // Friday, March 15, 2024 (day 5 = Long Run)
      const date = new Date('2024-03-15T12:00:00');
      const workout = getWorkoutForDate(date, mockWeeklySchedules, mockWorkoutProgram);

      expect(workout.typeEn).toBe('Long Run');
    });

    it('should return weekly schedule override when it exists', () => {
      // Monday, March 11, 2024 (in week of Mar 10, has override)
      const date = new Date('2024-03-11T12:00:00');
      const workout = getWorkoutForDate(date, mockWeeklySchedules, mockWorkoutProgram);

      expect(workout.typeEn).toBe('CrossFit'); // Override from mockWeeklySchedules
    });

    it('should fall back to default for days without override in scheduled week', () => {
      // Tuesday, March 12, 2024 (in week of Mar 10, but no override for Tuesday)
      const date = new Date('2024-03-12T12:00:00');
      const workout = getWorkoutForDate(date, mockWeeklySchedules, mockWorkoutProgram);

      expect(workout.typeEn).toBe('CrossFit'); // Default program for Tuesday
    });

    it('should handle empty weekly schedules', () => {
      const date = new Date('2024-03-15T12:00:00');
      const workout = getWorkoutForDate(date, {}, mockWorkoutProgram);

      expect(workout.typeEn).toBe('Long Run');
    });

    it('should return correct workout for each day of week', () => {
      // Test Sunday through Saturday
      const sunday = new Date('2024-03-17T12:00:00');
      expect(getWorkoutForDate(sunday, {}, mockWorkoutProgram).typeEn).toBe('Rest');

      const monday = new Date('2024-03-18T12:00:00');
      expect(getWorkoutForDate(monday, {}, mockWorkoutProgram).typeEn).toBe('Strength');

      const tuesday = new Date('2024-03-19T12:00:00');
      expect(getWorkoutForDate(tuesday, {}, mockWorkoutProgram).typeEn).toBe('CrossFit');
    });
  });

  describe('getDateLog', () => {
    it('should return log for existing date', () => {
      const date = new Date('2024-03-11T12:00:00');
      const log = getDateLog(date, mockWorkoutLogs);

      expect(log.completed).toBe(true);
      expect(log.exercises[0].name).toBe('Squats');
      expect(log.notes).toBe('Great workout');
    });

    it('should return default log for non-existing date', () => {
      const date = new Date('2024-03-20T12:00:00');
      const log = getDateLog(date, mockWorkoutLogs);

      expect(log.completed).toBe(null);
      expect(log.exercises).toEqual({});
      expect(log.running).toEqual({});
      expect(log.notes).toBe('');
    });

    it('should handle empty logs object', () => {
      const date = new Date('2024-03-11T12:00:00');
      const log = getDateLog(date, {});

      expect(log.completed).toBe(null);
    });
  });

  describe('createUpdatedLogs', () => {
    it('should create new log entry for new date', () => {
      const date = new Date('2024-03-20T12:00:00');
      const updates = { completed: true, notes: 'New entry' };

      const newLogs = createUpdatedLogs(date, updates, mockWorkoutLogs);

      expect(newLogs['2024-03-20']).toBeDefined();
      expect(newLogs['2024-03-20'].completed).toBe(true);
      expect(newLogs['2024-03-20'].notes).toBe('New entry');
      expect(newLogs['2024-03-20'].timestamp).toBeDefined();
    });

    it('should merge updates with existing log', () => {
      const date = new Date('2024-03-11T12:00:00');
      const updates = { notes: 'Updated notes' };

      const newLogs = createUpdatedLogs(date, updates, mockWorkoutLogs);

      expect(newLogs['2024-03-11'].completed).toBe(true); // Preserved
      expect(newLogs['2024-03-11'].exercises[0].name).toBe('Squats'); // Preserved
      expect(newLogs['2024-03-11'].notes).toBe('Updated notes'); // Updated
    });

    it('should not mutate original logs', () => {
      const date = new Date('2024-03-11T12:00:00');
      const originalNotes = mockWorkoutLogs['2024-03-11'].notes;
      const updates = { notes: 'Different notes' };

      createUpdatedLogs(date, updates, mockWorkoutLogs);

      expect(mockWorkoutLogs['2024-03-11'].notes).toBe(originalNotes);
    });

    it('should add timestamp to new entries', () => {
      const date = new Date('2024-03-20T12:00:00');
      const updates = { completed: true };

      const newLogs = createUpdatedLogs(date, updates, mockWorkoutLogs);

      expect(newLogs['2024-03-20'].timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('should preserve other dates in logs', () => {
      const date = new Date('2024-03-20T12:00:00');
      const updates = { completed: true };

      const newLogs = createUpdatedLogs(date, updates, mockWorkoutLogs);

      expect(newLogs['2024-03-11']).toBeDefined();
      expect(newLogs['2024-03-12']).toBeDefined();
      expect(newLogs['2024-03-13']).toBeDefined();
    });
  });

  describe('getWorkoutHistory', () => {
    it('should return logs sorted by date descending', () => {
      const history = getWorkoutHistory(mockWorkoutLogs);

      expect(history).toHaveLength(3);
      expect(history[0][0]).toBe('2024-03-13');
      expect(history[1][0]).toBe('2024-03-12');
      expect(history[2][0]).toBe('2024-03-11');
    });

    it('should respect limit parameter', () => {
      const history = getWorkoutHistory(mockWorkoutLogs, 2);

      expect(history).toHaveLength(2);
    });

    it('should return empty array for empty logs', () => {
      const history = getWorkoutHistory({});

      expect(history).toEqual([]);
    });

    it('should return tuples of [dateKey, log]', () => {
      const history = getWorkoutHistory(mockWorkoutLogs);

      expect(Array.isArray(history[0])).toBe(true);
      expect(history[0]).toHaveLength(2);
      expect(typeof history[0][0]).toBe('string');
      expect(typeof history[0][1]).toBe('object');
    });

    it('should default to limit of 50', () => {
      // Create 60 log entries
      const manyLogs = {};
      for (let i = 0; i < 60; i++) {
        const date = new Date('2024-01-01');
        date.setDate(date.getDate() + i);
        const key = date.toISOString().split('T')[0];
        manyLogs[key] = { completed: true };
      }

      const history = getWorkoutHistory(manyLogs);

      expect(history).toHaveLength(50);
    });
  });

  describe('isRunningWorkout', () => {
    it('should return true for Sprints', () => {
      expect(isRunningWorkout({ typeEn: 'Sprints' })).toBe(true);
    });

    it('should return true for Long Run', () => {
      expect(isRunningWorkout({ typeEn: 'Long Run' })).toBe(true);
    });

    it('should return true for typeEn containing "run"', () => {
      expect(isRunningWorkout({ typeEn: 'Easy Run' })).toBe(true);
      expect(isRunningWorkout({ typeEn: 'Tempo Run' })).toBe(true);
    });

    it('should return true for fartlek workouts', () => {
      expect(isRunningWorkout({ typeEn: 'Fartlek' })).toBe(true);
    });

    it('should return true for Hebrew running type', () => {
      expect(isRunningWorkout({ type: 'ריצה ארוכה' })).toBe(true);
    });

    it('should return false for Strength', () => {
      expect(isRunningWorkout({ typeEn: 'Strength' })).toBeFalsy();
    });

    it('should return false for CrossFit', () => {
      expect(isRunningWorkout({ typeEn: 'CrossFit' })).toBeFalsy();
    });

    it('should return false for null/undefined', () => {
      expect(isRunningWorkout(null)).toBe(false);
      expect(isRunningWorkout(undefined)).toBe(false);
    });
  });

  describe('isStrengthWorkout', () => {
    it('should return true for Strength', () => {
      expect(isStrengthWorkout({ typeEn: 'Strength' })).toBe(true);
    });

    it('should return false for other types', () => {
      expect(isStrengthWorkout({ typeEn: 'CrossFit' })).toBe(false);
      expect(isStrengthWorkout({ typeEn: 'Sprints' })).toBe(false);
      expect(isStrengthWorkout({ typeEn: 'Rest' })).toBe(false);
    });

    it('should return false for null/undefined', () => {
      expect(isStrengthWorkout(null)).toBe(false);
      expect(isStrengthWorkout(undefined)).toBe(false);
    });
  });

  describe('isCrossfitWorkout', () => {
    it('should return true for CrossFit', () => {
      expect(isCrossfitWorkout({ typeEn: 'CrossFit' })).toBe(true);
    });

    it('should return false for other types', () => {
      expect(isCrossfitWorkout({ typeEn: 'Strength' })).toBe(false);
      expect(isCrossfitWorkout({ typeEn: 'Sprints' })).toBe(false);
    });

    it('should return false for null/undefined', () => {
      expect(isCrossfitWorkout(null)).toBe(false);
      expect(isCrossfitWorkout(undefined)).toBe(false);
    });
  });

  describe('isRestDay', () => {
    it('should return true for Rest', () => {
      expect(isRestDay({ typeEn: 'Rest' })).toBe(true);
    });

    it('should return false for workout types', () => {
      expect(isRestDay({ typeEn: 'Strength' })).toBe(false);
      expect(isRestDay({ typeEn: 'CrossFit' })).toBe(false);
      expect(isRestDay({ typeEn: 'Long Run' })).toBe(false);
    });

    it('should return false for null/undefined', () => {
      expect(isRestDay(null)).toBe(false);
      expect(isRestDay(undefined)).toBe(false);
    });
  });
});
