/**
 * DayCard - Individual day card in the calendar
 */

import React from 'react';
import { Check, X, ClipboardList, Edit3 } from 'lucide-react';
import { HEBREW_DAYS, ENGLISH_DAYS } from '../../constants/dates';
import { isToday } from '../../utils/dateUtils';
import WorkoutPreview from './WorkoutPreview';

export default function DayCard({
  date,
  workout,
  log,
  viewMode,
  isPadding = false,
  onOpenLog,
  onOpenEdit
}) {
  return (
    <div
      className={`rounded-xl border transition-all ${
        viewMode === 'daily' ? 'flex flex-col' : 'flex flex-col h-full'
      } ${
        isToday(date)
          ? 'border-blue-500 ring-2 ring-blue-500/30'
          : isPadding
          ? 'border-gray-800 opacity-40'
          : 'border-gray-700'
      } ${isPadding ? 'bg-gray-800/30' : 'bg-gray-800'}`}
    >
      {/* Day Header */}
      <div className={`${workout.color} px-4 py-3 rounded-t-xl flex items-center justify-between ${isPadding ? 'opacity-50' : ''}`}>
        <div>
          <div className="font-bold text-lg">
            {viewMode === 'monthly'
              ? date.toLocaleDateString('en-IL', { weekday: 'short' })
              : ENGLISH_DAYS[date.getDay()]
            }
          </div>
          <div className="text-sm opacity-80">
            {viewMode === 'monthly'
              ? date.getDate()
              : `${HEBREW_DAYS[date.getDay()]} • ${date.getDate()}`
            }
          </div>
        </div>
        {log.completed !== null && (
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            log.completed
              ? 'bg-white text-green-600 border-white shadow-lg'
              : 'bg-white text-red-600 border-white shadow-lg'
          }`}>
            {log.completed ? <Check className="w-5 h-5 stroke-[3]" /> : <X className="w-5 h-5 stroke-[3]" />}
          </div>
        )}
      </div>

      {/* Workout Type */}
      {!isPadding && (
        <div className="px-4 py-2 border-b border-gray-700">
          <div className="font-semibold">{workout.typeEn}</div>
          <div className="text-sm text-gray-400">{workout.type}</div>
        </div>
      )}

      {/* Exercises Preview */}
      {!isPadding && (
        <div className={`p-4 space-y-2 ${viewMode === 'daily' ? '' : 'flex-1'}`}>
          <WorkoutPreview workout={workout} log={log} viewMode={viewMode} />
        </div>
      )}

      {/* Log and Edit Buttons */}
      {!isPadding && workout.typeEn !== 'Rest' && (
        <div className="px-4 pb-4 space-y-2">
          <button
            onClick={() => onOpenLog(date)}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <ClipboardList className="w-4 h-4" />
            Log Workout
          </button>
          <button
            onClick={() => onOpenEdit(date)}
            className="w-full py-2 bg-amber-600 hover:bg-amber-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            Edit Workout
          </button>
        </div>
      )}
    </div>
  );
}
