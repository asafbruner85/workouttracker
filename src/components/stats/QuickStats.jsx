/**
 * QuickStats - Weekly statistics panel
 */

import React from 'react';
import { isRunningWorkout } from '../../constants/workoutTypes';

export default function QuickStats({
  weekDates,
  getWorkoutForDate,
  getDateLog
}) {
  // Calculate stats
  const completedWorkouts = weekDates.filter(d => getDateLog(d).completed === true).length;

  const strengthCount = weekDates.filter(d => {
    const workout = getWorkoutForDate(d);
    return workout.typeEn === 'Strength' && getDateLog(d).completed === true;
  }).length;

  const crossfitCount = weekDates.filter(d => {
    const workout = getWorkoutForDate(d);
    return workout.typeEn === 'CrossFit' && getDateLog(d).completed === true;
  }).length;

  const runningCount = weekDates.filter(d => {
    const workout = getWorkoutForDate(d);
    const log = getDateLog(d);
    return isRunningWorkout(workout) && log.completed === true;
  }).length;

  return (
    <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <div className="text-gray-400 text-sm mb-1">This Week</div>
        <div className="text-2xl font-bold text-green-400">
          {completedWorkouts}/6
        </div>
        <div className="text-gray-500 text-xs">workouts completed</div>
      </div>

      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <div className="text-gray-400 text-sm mb-1">Strength</div>
        <div className="text-2xl font-bold text-blue-400">
          {strengthCount}/2
        </div>
        <div className="text-gray-500 text-xs">this week</div>
      </div>

      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <div className="text-gray-400 text-sm mb-1">CrossFit</div>
        <div className="text-2xl font-bold text-orange-400">
          {crossfitCount}/2
        </div>
        <div className="text-gray-500 text-xs">this week</div>
      </div>

      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <div className="text-gray-400 text-sm mb-1">Running</div>
        <div className="text-2xl font-bold text-emerald-400">
          {runningCount}/2
        </div>
        <div className="text-gray-500 text-xs">this week</div>
      </div>
    </div>
  );
}
