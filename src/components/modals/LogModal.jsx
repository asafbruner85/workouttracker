/**
 * LogModal - Modal for logging workout data
 * Uses useRef for form data to avoid re-renders during typing
 */

import React, { useCallback, useRef, useEffect, useState } from 'react';
import { Check, X, Dumbbell, Activity, Timer, Save } from 'lucide-react';
import { formatDateKey } from '../../utils/dateUtils';

// Weight stepper component — avoids typing for incremental weight changes
function WeightStepper({ exerciseIdx, dateIsoString, defaultValue, onUpdate, onWeightLogged }) {
  const inputRef = useRef(null);

  const applyStep = (delta) => {
    const current = parseFloat(inputRef.current?.value) || 0;
    const rounded = Math.round((current + delta) * 2) / 2; // snap to 0.5kg
    const newVal = String(Math.max(0, rounded));
    if (inputRef.current) inputRef.current.value = newVal;
    onUpdate(exerciseIdx, 'weight', newVal);
    onWeightLogged?.();
  };

  return (
    <div className="flex-1 min-w-0">
      <label className="text-xs text-gray-400 block mb-1">Weight (kg)</label>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onPointerDown={(e) => { e.preventDefault(); applyStep(-2.5); }}
          className="w-10 h-10 rounded-lg bg-gray-600 hover:bg-gray-500 active:bg-gray-400 text-white font-bold text-xl flex items-center justify-center shrink-0 touch-manipulation select-none"
          aria-label="Decrease weight by 2.5kg"
        >
          −
        </button>
        <input
          ref={inputRef}
          key={`weight-${exerciseIdx}-${dateIsoString}`}
          type="number"
          inputMode="decimal"
          step="2.5"
          min="0"
          defaultValue={defaultValue}
          onFocus={(e) => e.target.select()}
          onChange={(e) => { onUpdate(exerciseIdx, 'weight', e.target.value); onWeightLogged?.(); }}
          className="flex-1 min-w-0 px-2 py-2.5 bg-gray-600 rounded-lg text-white text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
          placeholder="kg"
        />
        <button
          type="button"
          onPointerDown={(e) => { e.preventDefault(); applyStep(2.5); }}
          className="w-10 h-10 rounded-lg bg-gray-600 hover:bg-gray-500 active:bg-gray-400 text-white font-bold text-xl flex items-center justify-center shrink-0 touch-manipulation select-none"
          aria-label="Increase weight by 2.5kg"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function LogModal({
  isOpen,
  date,
  workout,
  log,
  onClose,
  onUpdateLog,
  onToggleCompletion,
  saveTimeoutRef,
  saveStatus
}) {
  // Store form data in ref to avoid re-renders
  const formDataRef = useRef({
    exercises: {},
    running: {},
    notes: ''
  });

  // Track if form has been initialized
  const initializedRef = useRef(false);

  // Live progress counter for strength exercises
  const [loggedWeightCount, setLoggedWeightCount] = useState(0);

  // Initialize form data from log when modal opens
  useEffect(() => {
    if (isOpen && date && !initializedRef.current) {
      formDataRef.current = {
        exercises: { ...log.exercises },
        running: { ...log.running },
        notes: log.notes || ''
      };
      initializedRef.current = true;
    }

    return () => {
      if (!isOpen) {
        initializedRef.current = false;
      }
    };
  }, [isOpen, date, log]);

  // Sync progress counter when modal opens or date changes
  useEffect(() => {
    if (isOpen && workout?.typeEn === 'Strength') {
      const count = Object.values(log?.exercises || {}).filter(e => e?.weight && e.weight !== '').length;
      setLoggedWeightCount(count);
    } else if (!isOpen) {
      setLoggedWeightCount(0);
    }
  }, [isOpen, date, workout, log]);

  const updateExerciseLog = useCallback((exerciseIndex, field, value) => {
    if (!formDataRef.current.exercises[exerciseIndex]) {
      formDataRef.current.exercises[exerciseIndex] = {};
    }
    formDataRef.current.exercises[exerciseIndex][field] = value;

    if (saveTimeoutRef?.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      const dateKey = formatDateKey(date);
      window.storage.get('workout_logs').then(result => {
        const currentLogs = result?.value ? JSON.parse(result.value) : {};
        const currentLog = currentLogs[dateKey] || { completed: null, exercises: {}, running: {}, notes: '' };
        const newLogs = {
          ...currentLogs,
          [dateKey]: {
            ...currentLog,
            exercises: { ...formDataRef.current.exercises },
            timestamp: new Date().toISOString()
          }
        };
        window.storage.set('workout_logs', JSON.stringify(newLogs));
      });
    }, 1500);
  }, [date, saveTimeoutRef]);

  const updateRunningLog = useCallback((field, value) => {
    formDataRef.current.running[field] = value;

    if (saveTimeoutRef?.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      const dateKey = formatDateKey(date);
      window.storage.get('workout_logs').then(result => {
        const currentLogs = result?.value ? JSON.parse(result.value) : {};
        const currentLog = currentLogs[dateKey] || { completed: null, exercises: {}, running: {}, notes: '' };
        const newLogs = {
          ...currentLogs,
          [dateKey]: {
            ...currentLog,
            running: { ...formDataRef.current.running },
            timestamp: new Date().toISOString()
          }
        };
        window.storage.set('workout_logs', JSON.stringify(newLogs));
      });
    }, 1500);
  }, [date, saveTimeoutRef]);

  const updateGeneralNotes = useCallback((notes) => {
    formDataRef.current.notes = notes;

    if (saveTimeoutRef?.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      const dateKey = formatDateKey(date);
      window.storage.get('workout_logs').then(result => {
        const currentLogs = result?.value ? JSON.parse(result.value) : {};
        const currentLog = currentLogs[dateKey] || { completed: null, exercises: {}, running: {}, notes: '' };
        const newLogs = {
          ...currentLogs,
          [dateKey]: {
            ...currentLog,
            notes: formDataRef.current.notes,
            timestamp: new Date().toISOString()
          }
        };
        window.storage.set('workout_logs', JSON.stringify(newLogs));
      });
    }, 1500);
  }, [date, saveTimeoutRef]);

  const handleClose = useCallback(() => {
    if (saveTimeoutRef?.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    onUpdateLog(date, {
      exercises: { ...formDataRef.current.exercises },
      running: { ...formDataRef.current.running },
      notes: formDataRef.current.notes
    });

    onClose();
  }, [date, onUpdateLog, onClose, saveTimeoutRef]);

  // Update progress counter when a weight field changes
  const handleWeightLogged = useCallback(() => {
    if (workout?.typeEn !== 'Strength' || !workout?.exercises) return;
    const count = workout.exercises.filter(
      (_, idx) => formDataRef.current.exercises[idx]?.weight &&
                  formDataRef.current.exercises[idx].weight !== ''
    ).length;
    setLoggedWeightCount(count);
  }, [workout]);

  if (!isOpen || !date || !workout || !Array.isArray(workout.exercises)) return null;

  const isStrength = workout.typeEn === 'Strength';
  const isRunning = workout.typeEn === 'Sprints' || workout.typeEn === 'Long Run';
  const isCrossfit = workout.typeEn === 'CrossFit';
  const dateIsoString = date.toISOString();
  const totalExercises = isStrength ? workout.exercises.length : 0;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="bg-gray-800 w-full max-w-2xl rounded-t-2xl sm:rounded-2xl h-[92dvh] sm:max-h-[90vh] sm:h-auto overflow-hidden flex flex-col border border-gray-700">

        {/* Drag handle — mobile only */}
        <div className="flex justify-center pt-2 pb-0 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-600" />
        </div>

        {/* Modal Header */}
        <div className={`${workout.color} px-4 py-3 sm:px-6 sm:py-4`}>
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-white truncate">{workout.typeEn}</h2>
              <p className="text-sm text-white/80">
                {date.toLocaleDateString('en-IL', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>

            {/* Progress counter — Strength only */}
            {isStrength && (
              <div className="flex flex-col items-center shrink-0 mx-1">
                <span className="text-sm font-bold text-white tabular-nums leading-none">
                  {loggedWeightCount}/{totalExercises}
                </span>
                <span className="text-[10px] text-white/60 leading-none mt-0.5">exercises</span>
              </div>
            )}

            {/* Save status badge */}
            {saveStatus && (
              <span className="text-xs text-white/90 bg-white/20 rounded-full px-2 py-0.5 shrink-0 hidden sm:inline">
                {saveStatus}
              </span>
            )}

            <button
              onClick={onClose}
              className="text-white/80 hover:text-white w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/20 shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">

          {/* Completion Status */}
          <div className="flex gap-3">
            <button
              onClick={() => onToggleCompletion(date, true)}
              className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-base transition-all ${
                log.completed === true
                  ? 'bg-green-600 text-white shadow-lg shadow-green-600/30'
                  : 'bg-gray-700 text-gray-400 hover:bg-green-600/30 hover:text-green-400'
              }`}
            >
              <Check className="w-5 h-5" />
              Completed
            </button>
            <button
              onClick={() => onToggleCompletion(date, false)}
              className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-base transition-all ${
                log.completed === false
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'bg-gray-700 text-gray-400 hover:bg-red-600/30 hover:text-red-400'
              }`}
            >
              <X className="w-5 h-5" />
              Skipped
            </button>
          </div>

          {/* Strength Logging */}
          {isStrength && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-blue-400" />
                Strength Exercises
              </h3>

              {workout.exercises.map((exercise, idx) => (
                <div key={idx} className="bg-gray-700/50 rounded-xl p-4 space-y-3 border border-gray-700/50">
                  {/* Exercise name + target */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="font-semibold text-white text-base leading-tight">{exercise.name}</h4>
                      <p className="text-sm text-gray-400 mt-0.5">{exercise.sets}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {exercise.targetWeight && (
                        <span className="text-xs bg-blue-500/20 text-blue-300 rounded px-1.5 py-0.5 font-medium">
                          target {exercise.targetWeight}kg
                        </span>
                      )}
                      {exercise.targetReps && (
                        <span className="text-xs bg-blue-500/20 text-blue-300 rounded px-1.5 py-0.5 font-medium">
                          target {exercise.targetReps} reps
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Input row: stepper + reps + sets */}
                  <div className="flex items-end gap-2">
                    <WeightStepper
                      exerciseIdx={idx}
                      dateIsoString={dateIsoString}
                      defaultValue={log.exercises[idx]?.weight || ''}
                      onUpdate={updateExerciseLog}
                      onWeightLogged={handleWeightLogged}
                    />
                    <div className="w-20 shrink-0">
                      <label className="text-xs text-gray-400 block mb-1">Reps</label>
                      <input
                        key={`reps-${idx}-${dateIsoString}`}
                        type="text"
                        inputMode="text"
                        defaultValue={log.exercises[idx]?.reps || ''}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => updateExerciseLog(idx, 'reps', e.target.value)}
                        className="w-full px-2 py-2.5 bg-gray-600 rounded-lg text-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                        placeholder="5/5/5"
                      />
                    </div>
                    <div className="w-16 shrink-0">
                      <label className="text-xs text-gray-400 block mb-1">Sets</label>
                      <input
                        key={`sets-${idx}-${dateIsoString}`}
                        type="number"
                        inputMode="numeric"
                        defaultValue={log.exercises[idx]?.sets || ''}
                        onChange={(e) => updateExerciseLog(idx, 'sets', e.target.value)}
                        className="w-full px-2 py-2.5 bg-gray-600 rounded-lg text-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                        placeholder="3"
                      />
                    </div>
                  </div>

                  {/* Per-exercise notes */}
                  <input
                    key={`exnotes-${idx}-${dateIsoString}`}
                    type="text"
                    defaultValue={log.exercises[idx]?.notes || ''}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => updateExerciseLog(idx, 'notes', e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-600 rounded-lg text-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="How did it feel? Any issues?"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Running Logging - Long Run */}
          {isRunning && workout.typeEn === 'Long Run' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                Long Run Log
              </h3>

              <div className="bg-gray-700/50 rounded-xl p-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Duration (min)</label>
                    <input
                      key={`duration-${dateIsoString}`}
                      type="number"
                      inputMode="numeric"
                      defaultValue={log.running?.duration || ''}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => updateRunningLog('duration', e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-600 rounded-lg text-white text-base focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="30"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Distance (km)</label>
                    <input
                      key={`distance-${dateIsoString}`}
                      type="number"
                      inputMode="decimal"
                      step="0.1"
                      defaultValue={log.running?.distance || ''}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => updateRunningLog('distance', e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-600 rounded-lg text-white text-base focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="5.0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Avg Pace (min/km)</label>
                    <input
                      key={`pace-${dateIsoString}`}
                      type="text"
                      defaultValue={log.running?.pace || ''}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => updateRunningLog('pace', e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-600 rounded-lg text-white text-base focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="5:50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Avg Heart Rate (bpm)</label>
                    <input
                      key={`heartRate-${dateIsoString}`}
                      type="number"
                      inputMode="numeric"
                      defaultValue={log.running?.heartRate || ''}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => updateRunningLog('heartRate', e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-600 rounded-lg text-white text-base focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="125"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">RPE (1-10)</label>
                    <input
                      key={`rpe-${dateIsoString}`}
                      type="number"
                      inputMode="numeric"
                      min="1"
                      max="10"
                      defaultValue={log.running?.rpe || ''}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => updateRunningLog('rpe', e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-600 rounded-lg text-white text-base focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="4"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Calories Burned</label>
                    <input
                      key={`calories-${dateIsoString}`}
                      type="number"
                      inputMode="numeric"
                      defaultValue={log.running?.calories || ''}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => updateRunningLog('calories', e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-600 rounded-lg text-white text-base focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="300"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">Route / Location</label>
                  <input
                    key={`route-${dateIsoString}`}
                    type="text"
                    defaultValue={log.running?.route || ''}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => updateRunningLog('route', e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-600 rounded-lg text-white text-base focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Park, Treadmill, etc."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Running Logging - Sprints */}
          {isRunning && workout.typeEn === 'Sprints' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-400" />
                Sprint Session Log
              </h3>

              <div className="bg-gray-700/50 rounded-xl p-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Sprints Completed</label>
                    <input
                      key={`sprintsCompleted-${dateIsoString}`}
                      type="number"
                      inputMode="numeric"
                      defaultValue={log.running?.sprintsCompleted || ''}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => updateRunningLog('sprintsCompleted', e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-600 rounded-lg text-white text-base focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="8"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Sprint Distance (m)</label>
                    <input
                      key={`sprintDistance-${dateIsoString}`}
                      type="number"
                      inputMode="numeric"
                      defaultValue={log.running?.sprintDistance || ''}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => updateRunningLog('sprintDistance', e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-600 rounded-lg text-white text-base focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="150"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">Sprint Times (comma separated)</label>
                  <input
                    key={`sprintTimes-${dateIsoString}`}
                    type="text"
                    defaultValue={log.running?.sprintTimes || ''}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => updateRunningLog('sprintTimes', e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-600 rounded-lg text-white text-base focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="22s, 23s, 22s, 24s, 23s, 24s, 25s, 26s"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Best Sprint Time</label>
                    <input
                      key={`bestTime-${dateIsoString}`}
                      type="text"
                      defaultValue={log.running?.bestTime || ''}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => updateRunningLog('bestTime', e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-600 rounded-lg text-white text-base focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="21s"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Avg Sprint Time</label>
                    <input
                      key={`avgTime-${dateIsoString}`}
                      type="text"
                      defaultValue={log.running?.avgTime || ''}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => updateRunningLog('avgTime', e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-600 rounded-lg text-white text-base focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="23s"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Rest Between (sec)</label>
                    <input
                      key={`restTime-${dateIsoString}`}
                      type="text"
                      defaultValue={log.running?.restTime || ''}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => updateRunningLog('restTime', e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-600 rounded-lg text-white text-base focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="90-120"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">RPE (1-10)</label>
                    <input
                      key={`sprint-rpe-${dateIsoString}`}
                      type="number"
                      inputMode="numeric"
                      min="1"
                      max="10"
                      defaultValue={log.running?.rpe || ''}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => updateRunningLog('rpe', e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-600 rounded-lg text-white text-base focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="9"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">Warm-up Duration (min)</label>
                  <input
                    key={`warmupDuration-${dateIsoString}`}
                    type="number"
                    inputMode="numeric"
                    defaultValue={log.running?.warmupDuration || ''}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => updateRunningLog('warmupDuration', e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-600 rounded-lg text-white text-base focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="10"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">Location</label>
                  <input
                    key={`sprint-route-${dateIsoString}`}
                    type="text"
                    defaultValue={log.running?.route || ''}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => updateRunningLog('route', e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-600 rounded-lg text-white text-base focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Track, field, etc."
                  />
                </div>
              </div>
            </div>
          )}

          {/* CrossFit Logging */}
          {isCrossfit && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Timer className="w-5 h-5 text-orange-400" />
                CrossFit WOD
              </h3>

              <div className="bg-gray-700/50 rounded-xl p-4 space-y-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">WOD Name/Description</label>
                  <input
                    key={`wodName-${dateIsoString}`}
                    type="text"
                    defaultValue={log.exercises[0]?.wodName || ''}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => updateExerciseLog(0, 'wodName', e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-600 rounded-lg text-white text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., Fran, AMRAP 20..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Time / Score</label>
                    <input
                      key={`score-${dateIsoString}`}
                      type="text"
                      defaultValue={log.exercises[0]?.score || ''}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => updateExerciseLog(0, 'score', e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-600 rounded-lg text-white text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="12:30 / 5 rounds"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Rx / Scaled</label>
                    <select
                      key={`rx-${dateIsoString}`}
                      defaultValue={log.exercises[0]?.rx || ''}
                      onChange={(e) => updateExerciseLog(0, 'rx', e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-600 rounded-lg text-white text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Select...</option>
                      <option value="Rx">Rx</option>
                      <option value="Scaled">Scaled</option>
                      <option value="Rx+">Rx+</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* General Notes */}
          <div>
            <label className="text-sm text-gray-400 block mb-2">General Notes</label>
            <textarea
              key={`general-notes-${dateIsoString}`}
              defaultValue={log.notes || ''}
              onFocus={(e) => e.target.select()}
              onChange={(e) => updateGeneralNotes(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
              placeholder="How did the workout feel? Any PRs? Issues?"
            />
          </div>

        </div>

        {/* Sticky save bar */}
        <div className="shrink-0 px-4 pb-6 pt-3 sm:px-6 border-t border-gray-700/50 bg-gray-800">
          <button
            onClick={handleClose}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-base"
          >
            <Save className="w-5 h-5" />
            Save & Close
          </button>
        </div>

      </div>
    </div>
  );
}
