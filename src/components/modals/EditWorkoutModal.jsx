/**
 * EditWorkoutModal - Modal for editing workout exercises
 */

import React, { useState } from 'react';
import { Settings, Trash2, Plus, X, Save, ChevronUp, ChevronDown } from 'lucide-react';
import { ENGLISH_DAYS } from '../../constants/dates';

export default function EditWorkoutModal({
  isOpen,
  date,
  workout,
  onClose,
  onSave,
  onReset
}) {
  const [localWorkout, setLocalWorkout] = useState(null);
  const [applyToFuture, setApplyToFuture] = useState(false);

  // Reset local state when modal opens with new workout
  React.useEffect(() => {
    if (isOpen && workout && Array.isArray(workout.exercises)) {
      setLocalWorkout(workout);
      setApplyToFuture(false);
    }
  }, [isOpen, workout]);

  // Guard against missing or invalid data
  if (!isOpen || !date || !workout || !localWorkout || !Array.isArray(localWorkout.exercises)) return null;

  const handleSave = async () => {
    await onSave(date, localWorkout, applyToFuture);
    onClose();
  };

  const handleReset = async () => {
    await onReset(date);
    onClose();
  };

  const addExerciseToWorkout = () => {
    setLocalWorkout({
      ...localWorkout,
      exercises: [
        ...localWorkout.exercises,
        { name: 'New Exercise', sets: '', targetWeight: '', targetReps: '', notes: '' }
      ]
    });
  };

  const removeExerciseFromWorkout = (index) => {
    setLocalWorkout({
      ...localWorkout,
      exercises: localWorkout.exercises.filter((_, i) => i !== index)
    });
  };

  const updateExerciseInWorkout = (index, field, value) => {
    setLocalWorkout({
      ...localWorkout,
      exercises: localWorkout.exercises.map((ex, i) =>
        i === index ? { ...ex, [field]: value } : ex
      )
    });
  };

  const moveExercise = (index, direction) => {
    const exercises = [...localWorkout.exercises];
    const target = index + direction;
    if (target < 0 || target >= exercises.length) return;
    [exercises[index], exercises[target]] = [exercises[target], exercises[index]];
    setLocalWorkout({ ...localWorkout, exercises });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700 my-4">
        {/* Modal Header */}
        <div className={`${workout.color} px-6 py-4 rounded-t-2xl sticky top-0 z-10`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Edit Workout</h2>
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
          {/* Workout Type Display (read-only) */}
          <div className="bg-gray-700/50 rounded-xl p-4">
            <div className="text-sm text-gray-400 mb-1">Workout Type</div>
            <div className="font-semibold text-white">{workout.typeEn}</div>
            <div className="text-sm text-gray-400">{workout.type}</div>
            <div className="text-xs text-gray-500 mt-2">
              Note: To change workout type, use the Schedule feature
            </div>
          </div>

          {/* Exercises Editor */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-400" />
              Exercises
            </h3>

            {localWorkout.exercises.map((exercise, idx) => (
              <div key={idx} className="bg-gray-700/50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-white">Exercise {idx + 1}</h4>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveExercise(idx, -1)}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-600 disabled:opacity-25 disabled:cursor-default transition-colors"
                      title="Move up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveExercise(idx, 1)}
                      disabled={idx === localWorkout.exercises.length - 1}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-600 disabled:opacity-25 disabled:cursor-default transition-colors"
                      title="Move down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeExerciseFromWorkout(idx)}
                      className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-gray-600 flex items-center gap-1 text-sm transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">Exercise Name</label>
                  <textarea
                    value={exercise.name}
                    onChange={(e) => {
                      updateExerciseInWorkout(idx, 'name', e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    onFocus={(e) => {
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    rows={1}
                    className="w-full px-3 py-2 bg-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden"
                    placeholder="e.g., Back Squats"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">Sets / Reps Description</label>
                  <textarea
                    value={exercise.sets}
                    onChange={(e) => {
                      updateExerciseInWorkout(idx, 'sets', e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    onFocus={(e) => {
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    rows={1}
                    className="w-full px-3 py-2 bg-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden"
                    placeholder="e.g., 3 sets: 5 reps"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Target Weight (kg)</label>
                    <input
                      type="text"
                      value={exercise.targetWeight || ''}
                      onChange={(e) => updateExerciseInWorkout(idx, 'targetWeight', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 70"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Target Reps</label>
                    <input
                      type="text"
                      value={exercise.targetReps || ''}
                      onChange={(e) => updateExerciseInWorkout(idx, 'targetReps', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 20"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">Notes</label>
                  <textarea
                    value={exercise.notes || ''}
                    onChange={(e) => {
                      updateExerciseInWorkout(idx, 'notes', e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.max(60, e.target.scrollHeight) + 'px';
                    }}
                    onFocus={(e) => {
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.max(60, e.target.scrollHeight) + 'px';
                    }}
                    className="w-full px-3 py-2 bg-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px] resize-none overflow-hidden"
                    placeholder="Additional notes about this exercise..."
                  />
                </div>
              </div>
            ))}

            <button
              onClick={addExerciseToWorkout}
              className="w-full py-3 border-2 border-dashed border-gray-600 rounded-xl text-gray-400 hover:text-white hover:border-gray-500 flex items-center justify-center gap-2 font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Exercise
            </button>
          </div>

          {/* Apply to Future Option */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={applyToFuture}
                onChange={(e) => setApplyToFuture(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <div>
                <div className="font-semibold text-white">Apply to all future occurrences</div>
                <div className="text-sm text-gray-400 mt-1">
                  {applyToFuture
                    ? `This will update the default ${workout.typeEn} workout for all future ${ENGLISH_DAYS[date.getDay()]}s`
                    : "Changes will only apply to this week's workout"
                  }
                </div>
              </div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              Reset to Default
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
