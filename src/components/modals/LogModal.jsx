/**
 * LogModal - Modal for logging workout data
 * Uses useRef for form data to avoid re-renders during typing
 */

import React, { useCallback, useRef, useEffect } from 'react';
import { Check, X, Dumbbell, Activity, Timer, Save } from 'lucide-react';
import { formatDateKey } from '../../utils/dateUtils';

export default function LogModal({
  isOpen,
  date,
  workout,
  log,
  onClose,
  onUpdateLog,
  onToggleCompletion,
  saveTimeoutRef
}) {
  // Store form data in ref to avoid re-renders
  const formDataRef = useRef({
    exercises: {},
    running: {},
    notes: ''
  });

  // Track if form has been initialized
  const initializedRef = useRef(false);

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

  if (!isOpen || !date || !workout || !Array.isArray(workout.exercises)) return null;

  const isStrength = workout.typeEn === 'Strength';
  const isRunning = workout.typeEn === 'Sprints' || workout.typeEn === 'Long Run';
  const isCrossfit = workout.typeEn === 'CrossFit';
  const dateIsoString = date.toISOString();

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700 my-4">
        {/* Modal Header */}
        <div className={`${workout.color} px-6 py-4 rounded-t-2xl sticky top-0 z-10`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">{workout.typeEn}</h2>
              <p className="text-white/80">
                {date.toLocaleDateString('en-IL', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Completion Status */}
          <div className="flex gap-3">
            <button
              onClick={() => onToggleCompletion(date, true)}
              className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all ${
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
              className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all ${
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
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-blue-400" />
                Strength Exercises
              </h3>

              {workout.exercises.map((exercise, idx) => (
                <div key={idx} className="bg-gray-700/50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-white">{exercise.name}</h4>
                      <p className="text-sm text-gray-400">{exercise.sets}</p>
                      {exercise.targetWeight && (
                        <p className="text-xs text-blue-400">Target: {exercise.targetWeight}kg</p>
                      )}
                      {exercise.targetReps && (
                        <p className="text-xs text-blue-400">Target: {exercise.targetReps} reps</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Weight (kg)</label>
                      <input
                        key={`weight-${idx}-${dateIsoString}`}
                        type="number"
                        defaultValue={log.exercises[idx]?.weight || ''}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => updateExerciseLog(idx, 'weight', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="kg"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Reps</label>
                      <input
                        key={`reps-${idx}-${dateIsoString}`}
                        type="text"
                        defaultValue={log.exercises[idx]?.reps || ''}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => updateExerciseLog(idx, 'reps', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="5/5/5"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Sets Done</label>
                      <input
                        key={`sets-${idx}-${dateIsoString}`}
                        type="number"
                        defaultValue={log.exercises[idx]?.sets || ''}
                        onChange={(e) => updateExerciseLog(idx, 'sets', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="3"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Notes</label>
                    <input
                      key={`notes-${idx}-${dateIsoString}`}
                      type="text"
                      defaultValue={log.exercises[idx]?.notes || ''}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => updateExerciseLog(idx, 'notes', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="How did it feel? Any issues?"
                    />
                  </div>
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
                      defaultValue={log.running?.duration || ''}
                      onChange={(e) => updateRunningLog('duration', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="30"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Distance (km)</label>
                    <input
                      key={`distance-${dateIsoString}`}
                      type="number"
                      step="0.1"
                      defaultValue={log.running?.distance || ''}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => updateRunningLog('distance', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                      onChange={(e) => updateRunningLog('pace', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="5:50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Avg Heart Rate (bpm)</label>
                    <input
                      key={`heartRate-${dateIsoString}`}
                      type="number"
                      defaultValue={log.running?.heartRate || ''}
                      onChange={(e) => updateRunningLog('heartRate', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                      min="1"
                      max="10"
                      defaultValue={log.running?.rpe || ''}
                      onChange={(e) => updateRunningLog('rpe', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="4"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Calories Burned</label>
                    <input
                      key={`calories-${dateIsoString}`}
                      type="number"
                      defaultValue={log.running?.calories || ''}
                      onChange={(e) => updateRunningLog('calories', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                    onChange={(e) => updateRunningLog('route', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                      defaultValue={log.running?.sprintsCompleted || ''}
                      onChange={(e) => updateRunningLog('sprintsCompleted', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="8"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Sprint Distance (m)</label>
                    <input
                      key={`sprintDistance-${dateIsoString}`}
                      type="number"
                      defaultValue={log.running?.sprintDistance || ''}
                      onChange={(e) => updateRunningLog('sprintDistance', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
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
                    onChange={(e) => updateRunningLog('sprintTimes', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
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
                      onChange={(e) => updateRunningLog('bestTime', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="21s"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Avg Sprint Time</label>
                    <input
                      key={`avgTime-${dateIsoString}`}
                      type="text"
                      defaultValue={log.running?.avgTime || ''}
                      onChange={(e) => updateRunningLog('avgTime', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
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
                      onChange={(e) => updateRunningLog('restTime', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="90-120"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">RPE (1-10)</label>
                    <input
                      key={`sprint-rpe-${dateIsoString}`}
                      type="number"
                      min="1"
                      max="10"
                      defaultValue={log.running?.rpe || ''}
                      onChange={(e) => updateRunningLog('rpe', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="9"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">Warm-up Duration (min)</label>
                  <input
                    key={`warmupDuration-${dateIsoString}`}
                    type="number"
                    defaultValue={log.running?.warmupDuration || ''}
                    onChange={(e) => updateRunningLog('warmupDuration', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="10"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">Location</label>
                  <input
                    key={`sprint-route-${dateIsoString}`}
                    type="text"
                    defaultValue={log.running?.route || ''}
                    onChange={(e) => updateRunningLog('route', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
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
                    onChange={(e) => updateExerciseLog(0, 'wodName', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                      onChange={(e) => updateExerciseLog(0, 'score', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="12:30 / 5 rounds"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Rx / Scaled</label>
                    <select
                      key={`rx-${dateIsoString}`}
                      defaultValue={log.exercises[0]?.rx || ''}
                      onChange={(e) => updateExerciseLog(0, 'rx', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
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
              className="w-full px-4 py-3 bg-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              placeholder="How did the workout feel? Any PRs? Issues?"
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleClose}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
}
