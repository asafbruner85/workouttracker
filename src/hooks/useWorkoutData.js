/**
 * useWorkoutData - Manages workout program, schedules, and logs
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { DEFAULT_WORKOUTS, WORKOUT_TYPE_CONFIGS } from '../constants/workoutTypes';
import { formatDateKey, getWeekKey, getWeekDates } from '../utils/dateUtils';
import {
  getWorkoutForDate as getWorkoutForDateUtil,
  getDateLog as getDateLogUtil,
  createUpdatedLogs,
  getWorkoutHistory
} from '../utils/workoutUtils';

export function useWorkoutData() {
  const [workoutProgram, setWorkoutProgram] = useState(DEFAULT_WORKOUTS);
  const [weeklySchedules, setWeeklySchedules] = useState({});
  const [workoutLogs, setWorkoutLogs] = useState({});
  const [wodCache, setWodCache] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');
  const saveTimeoutRef = useRef(null);

  // Load data from storage
  useEffect(() => {
    const loadData = async () => {
      const timeoutId = setTimeout(() => {
        setLoading(false);
      }, 3000);

      try {
        const programResult = await window.storage.get('workout_program');
        if (programResult?.value) {
          setWorkoutProgram(JSON.parse(programResult.value));
        }
      } catch (e) {
        console.error('Program load error:', e);
      }

      try {
        const logsResult = await window.storage.get('workout_logs');
        if (logsResult?.value) {
          setWorkoutLogs(JSON.parse(logsResult.value));
        }
      } catch (e) {
        console.error('Logs load error:', e);
      }

      try {
        const schedulesResult = await window.storage.get('weekly_schedules');
        if (schedulesResult?.value) {
          setWeeklySchedules(JSON.parse(schedulesResult.value));
        }
      } catch (e) {
        console.error('Schedules load error:', e);
      }

      clearTimeout(timeoutId);
      setLoading(false);
    };
    loadData();

    // Load WOD cache (written by `npm run fetch-wod`, gitignored)
    fetch('/wod-cache.json')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setWodCache(data); })
      .catch(() => {}); // silently ignore if not present
  }, []);

  // Save helper
  const saveData = useCallback(async (key, value) => {
    try {
      await window.storage.set(key, JSON.stringify(value));
      setSaveStatus('✓ Saved');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (error) {
      console.error('Save error:', error);
      setSaveStatus('Save failed');
    }
  }, []);

  // Get workout for specific date, enriched with WOD cache data for CrossFit days
  const getWorkoutForDate = useCallback((date) => {
    const workout = getWorkoutForDateUtil(date, weeklySchedules, workoutProgram);

    if (workout.typeEn === 'CrossFit' && wodCache) {
      const dateKey = formatDateKey(date);
      const day = wodCache.days?.[dateKey];
      if (day?.wod) {
        const exercises = [];
        if (day.strength) {
          exercises.push({ name: 'Strength', sets: day.strength, notes: '' });
        }
        exercises.push({
          name: day.wodTitle || 'CrossFit WOD',
          sets: day.wod.text,
          notes: day.wod.level ? `Scaling ${day.wod.level}` : ''
        });
        return { ...workout, exercises };
      }
    }

    return workout;
  }, [weeklySchedules, workoutProgram, wodCache]);

  // Get log for specific date
  const getDateLog = useCallback((date) => {
    return getDateLogUtil(date, workoutLogs);
  }, [workoutLogs]);

  // Update workout log
  const updateLog = useCallback(async (date, updates) => {
    const newLogs = createUpdatedLogs(date, updates, workoutLogs);
    setWorkoutLogs(newLogs);
    await saveData('workout_logs', newLogs);
  }, [workoutLogs, saveData]);

  // Toggle workout completion
  const toggleCompletion = useCallback(async (date, value) => {
    await updateLog(date, { completed: value });
  }, [updateLog]);

  // Update workout for specific date
  const updateWorkoutForDate = useCallback(async (date, updates, applyToFuture = false) => {
    const weekKey = getWeekKey(date);
    const dayIndex = date.getDay();
    const currentWorkout = getWorkoutForDate(date);

    const updatedWorkout = {
      ...currentWorkout,
      ...updates
    };

    if (applyToFuture) {
      const newProgram = {
        ...workoutProgram,
        [dayIndex]: updatedWorkout
      };
      setWorkoutProgram(newProgram);
      await saveData('workout_program', newProgram);
      setSaveStatus('✓ Applied to all future occurrences');
    } else {
      const newWeeklySchedules = {
        ...weeklySchedules,
        [weekKey]: {
          ...(weeklySchedules[weekKey] || {}),
          [dayIndex]: updatedWorkout
        }
      };
      setWeeklySchedules(newWeeklySchedules);
      await saveData('weekly_schedules', newWeeklySchedules);
      setSaveStatus('✓ Updated for this week');
    }

    setTimeout(() => setSaveStatus(''), 2000);
  }, [workoutProgram, weeklySchedules, getWorkoutForDate, saveData]);

  // Reset workout to default
  const resetWorkoutToDefault = useCallback(async (date) => {
    const weekKey = getWeekKey(date);
    const dayIndex = date.getDay();

    const newWeeklySchedules = { ...weeklySchedules };
    if (newWeeklySchedules[weekKey]) {
      delete newWeeklySchedules[weekKey][dayIndex];

      if (Object.keys(newWeeklySchedules[weekKey]).length === 0) {
        delete newWeeklySchedules[weekKey];
      }
    }

    setWeeklySchedules(newWeeklySchedules);
    await saveData('weekly_schedules', newWeeklySchedules);
    setSaveStatus('✓ Reset to default');
    setTimeout(() => setSaveStatus(''), 2000);
  }, [weeklySchedules, saveData]);

  // Handle schedule save for current week
  const handleScheduleSave = useCallback(async (schedule, currentWeekKey, weekDates) => {
    const weekSchedule = {};
    schedule.forEach(({ day, workoutType }) => {
      const existingWorkout = getWorkoutForDate(weekDates[day]);
      const newWorkoutType = WORKOUT_TYPE_CONFIGS[workoutType];

      if (existingWorkout && existingWorkout.typeEn === workoutType && Array.isArray(existingWorkout.exercises)) {
        // Keep existing workout only if it has valid exercises array
        weekSchedule[day] = existingWorkout;
      } else if (newWorkoutType && Array.isArray(newWorkoutType.exercises)) {
        // Use config workout only if it's valid
        weekSchedule[day] = { ...newWorkoutType };
      } else {
        // Fallback to Rest day config if something went wrong
        weekSchedule[day] = { ...WORKOUT_TYPE_CONFIGS['Rest'] };
        console.warn(`Invalid workout config for ${workoutType}, falling back to Rest`);
      }
    });

    const newWeeklySchedules = {
      ...weeklySchedules,
      [currentWeekKey]: weekSchedule
    };

    setWeeklySchedules(newWeeklySchedules);
    await saveData('weekly_schedules', newWeeklySchedules);
    setSaveStatus('✓ Schedule saved for this week');
    setTimeout(() => setSaveStatus(''), 2000);
  }, [weeklySchedules, getWorkoutForDate, saveData]);

  // Export data
  const handleExportData = useCallback(async () => {
    try {
      const data = await window.storage.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `workout-tracker-backup-${formatDateKey(new Date())}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSaveStatus('✓ Data exported');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (error) {
      console.error('Export error:', error);
      setSaveStatus('Export failed');
      setTimeout(() => setSaveStatus(''), 2000);
    }
  }, []);

  // Import data
  const handleImportData = useCallback(async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const result = await window.storage.importData(data);

      if (result.success) {
        const logsResult = await window.storage.get('workout_logs');
        if (logsResult?.value) {
          setWorkoutLogs(JSON.parse(logsResult.value));
        }

        const programResult = await window.storage.get('workout_program');
        if (programResult?.value) {
          setWorkoutProgram(JSON.parse(programResult.value));
        }

        setSaveStatus('✓ Data imported');
      } else {
        setSaveStatus('Import failed');
      }

      setTimeout(() => setSaveStatus(''), 2000);
    } catch (error) {
      console.error('Import error:', error);
      setSaveStatus('Import failed - Invalid file');
      setTimeout(() => setSaveStatus(''), 3000);
    }

    event.target.value = '';
  }, []);

  // Get history
  const getHistory = useCallback((limit = 50) => {
    return getWorkoutHistory(workoutLogs, limit);
  }, [workoutLogs]);

  return {
    // State
    workoutProgram,
    weeklySchedules,
    workoutLogs,
    loading,
    saveStatus,
    saveTimeoutRef,

    // Setters
    setWorkoutProgram,
    setWeeklySchedules,
    setWorkoutLogs,
    setSaveStatus,

    // Getters
    getWorkoutForDate,
    getDateLog,
    getHistory,

    // Actions
    updateLog,
    toggleCompletion,
    updateWorkoutForDate,
    resetWorkoutToDefault,
    handleScheduleSave,
    handleExportData,
    handleImportData,
    saveData
  };
}
