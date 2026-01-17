/**
 * HistoryPanel - Workout history sidebar
 */

import React from 'react';
import { History, TrendingUp } from 'lucide-react';

export default function HistoryPanel({
  isOpen,
  history,
  workoutProgram,
  onOpenLog
}) {
  if (!isOpen) return null;

  return (
    <div className="mb-6 bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <History className="w-5 h-5" />
        Workout History
      </h2>
      <div className="max-h-96 overflow-y-auto space-y-2">
        {history.length === 0 ? (
          <p className="text-gray-400">No workout history yet</p>
        ) : (
          history.map(([dateKey, log]) => {
            const date = new Date(dateKey);
            const dayIndex = date.getDay();
            const workout = workoutProgram[dayIndex];

            return (
              <div
                key={dateKey}
                className="flex items-center gap-4 p-3 bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-700"
                onClick={() => onOpenLog(date)}
              >
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                  log.completed === true ? 'bg-green-500' :
                  log.completed === false ? 'bg-red-500' : 'bg-gray-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium">
                    {date.toLocaleDateString('en-IL', { weekday: 'short', month: 'short', day: 'numeric' })}
                    <span className={`ml-2 text-sm px-2 py-0.5 rounded ${workout.color} text-white`}>
                      {workout.typeEn}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 truncate">
                    {workout.typeEn === 'Strength' && log.exercises && Object.keys(log.exercises).length > 0 && (
                      Object.entries(log.exercises).slice(0, 3).map(([idx, ex]) => (
                        <span key={idx} className="mr-3">
                          {ex.weight && `${ex.weight}kg`}
                          {ex.reps && ` × ${ex.reps}`}
                        </span>
                      ))
                    )}
                    {workout.typeEn === 'Long Run' && log.running && (
                      <>
                        {log.running.distance && `${log.running.distance}km `}
                        {log.running.duration && `${log.running.duration}min `}
                        {log.running.pace && `@ ${log.running.pace}/km `}
                        {log.running.heartRate && `❤️ ${log.running.heartRate}bpm`}
                      </>
                    )}
                    {workout.typeEn === 'Sprints' && log.running && (
                      <>
                        {log.running.sprintsCompleted && `${log.running.sprintsCompleted} × `}
                        {log.running.sprintDistance && `${log.running.sprintDistance}m `}
                        {log.running.bestTime && `Best: ${log.running.bestTime}`}
                      </>
                    )}
                    {workout.typeEn === 'CrossFit' && log.exercises?.[0]?.wodName && (
                      <>
                        {log.exercises[0].wodName}
                        {log.exercises[0].score && ` - ${log.exercises[0].score}`}
                        {log.exercises[0].rx && ` (${log.exercises[0].rx})`}
                      </>
                    )}
                    {log.notes && <span className="text-gray-500 ml-2">📝</span>}
                  </div>
                </div>
                <TrendingUp className="w-4 h-4 text-gray-500" />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
