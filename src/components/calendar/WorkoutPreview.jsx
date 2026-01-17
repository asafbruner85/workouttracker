/**
 * WorkoutPreview - Exercise preview display based on view mode
 */

import React from 'react';

export default function WorkoutPreview({ workout, viewMode }) {
  if (workout.typeEn === 'Rest') {
    return null;
  }

  if (viewMode === 'monthly') {
    // Condensed view for monthly
    return (
      <div className="text-xs text-gray-400">
        {workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}
      </div>
    );
  }

  if (viewMode === 'daily') {
    // Show ALL exercises in daily view with target weights
    return (
      <>
        {workout.exercises.map((exercise, exIndex) => (
          <div key={exIndex} className="text-sm">
            <div className="font-medium text-white">{exercise.name}</div>
            {exercise.sets && <div className="text-gray-400 text-xs">{exercise.sets}</div>}
            {exercise.targetWeight && (
              <div className="text-xs text-blue-400">Target: {exercise.targetWeight}kg</div>
            )}
            {exercise.targetReps && (
              <div className="text-xs text-blue-400">Target: {exercise.targetReps} reps</div>
            )}
            {exercise.notes && <div className="text-gray-500 text-xs mt-1">{exercise.notes}</div>}
          </div>
        ))}
      </>
    );
  }

  // Weekly view - show first 3 with target weights
  return (
    <>
      {workout.exercises.slice(0, 3).map((exercise, exIndex) => (
        <div key={exIndex} className="text-sm">
          <div className="font-medium text-white truncate">{exercise.name}</div>
          {exercise.sets && <div className="text-gray-400 text-xs truncate">{exercise.sets}</div>}
          {exercise.targetWeight && (
            <div className="text-xs text-blue-400">Target: {exercise.targetWeight}kg</div>
          )}
          {exercise.targetReps && (
            <div className="text-xs text-blue-400">Target: {exercise.targetReps} reps</div>
          )}
        </div>
      ))}
      {workout.exercises.length > 3 && (
        <div className="text-xs text-gray-500">+{workout.exercises.length - 3} more...</div>
      )}
    </>
  );
}
