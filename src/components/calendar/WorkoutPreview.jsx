/**
 * WorkoutPreview - Exercise preview display based on view mode
 */

import React from 'react';

export default function WorkoutPreview({ workout, log, viewMode }) {
  if (workout.typeEn === 'Rest' || !workout.exercises || !Array.isArray(workout.exercises)) {
    return null;
  }

  const loggedExercises = log?.exercises || {};

  if (viewMode === 'monthly') {
    return (
      <div className="text-xs text-gray-400">
        {workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}
      </div>
    );
  }

  if (viewMode === 'daily') {
    return (
      <>
        {workout.exercises.map((exercise, exIndex) => {
          const logged = loggedExercises[exIndex];
          const hasLogged = logged?.weight || logged?.reps;
          return (
            <div key={exIndex} className="text-sm">
              <div className="font-medium text-white">{exercise.name}</div>
              {exercise.sets && <div className="text-gray-400 text-xs whitespace-pre-line">{exercise.sets}</div>}
              {(exercise.targetWeight || exercise.targetReps) && (
                <div className="text-xs text-blue-400">
                  Target: {exercise.targetWeight && `${exercise.targetWeight}kg`}
                  {exercise.targetWeight && exercise.targetReps && ' · '}
                  {exercise.targetReps && `${exercise.targetReps} reps`}
                </div>
              )}
              {hasLogged && (
                <div className="text-xs text-green-400 font-medium">
                  ✓ {logged.weight && `${logged.weight}kg`}
                  {logged.weight && logged.reps && ' × '}
                  {logged.reps}
                </div>
              )}
              {logged?.notes && <div className="text-gray-500 text-xs mt-0.5 italic">{logged.notes}</div>}
              {exercise.notes && !hasLogged && <div className="text-gray-500 text-xs mt-1">{exercise.notes}</div>}
            </div>
          );
        })}
      </>
    );
  }

  // Weekly view — compact, show logged or target
  return (
    <>
      {workout.exercises.slice(0, 3).map((exercise, exIndex) => {
        const logged = loggedExercises[exIndex];
        const hasLogged = logged?.weight || logged?.reps;
        return (
          <div key={exIndex} className="text-sm">
            <div className="font-medium text-white truncate">{exercise.name}</div>
            {exercise.sets && <div className="text-gray-400 text-xs truncate">{exercise.sets}</div>}
            {exercise.targetWeight && (
              <div className="text-xs text-blue-400 truncate">Target: {exercise.targetWeight}kg</div>
            )}
            {hasLogged && (
              <div className="text-xs text-green-400 font-medium truncate">
                ✓ {logged.weight && `${logged.weight}kg`}
                {logged.weight && logged.reps && ' × '}
                {logged.reps}
              </div>
            )}
          </div>
        );
      })}
      {workout.exercises.length > 3 && (
        <div className="text-xs text-gray-500">+{workout.exercises.length - 3} more...</div>
      )}
    </>
  );
}
