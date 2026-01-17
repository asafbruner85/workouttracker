/**
 * CalendarGrid - Calendar view grid with day cards
 */

import React from 'react';
import DayCard from './DayCard';

export default function CalendarGrid({
  displayDates,
  viewMode,
  getWorkoutForDate,
  getDateLog,
  onOpenLog,
  onOpenEdit
}) {
  return (
    <div className={`grid gap-4 ${
      viewMode === 'daily'
        ? 'grid-cols-1 max-w-2xl mx-auto'
        : viewMode === 'weekly'
        ? 'grid-cols-1 md:grid-cols-7'
        : 'grid-cols-7'
    }`}>
      {displayDates.map((item, index) => {
        // Handle both date formats (monthly has {date, isPadding}, others have just date)
        let date, isPadding;

        if (viewMode === 'monthly') {
          date = item.date;
          isPadding = item.isPadding;
        } else {
          date = item;
          isPadding = false;
        }

        const workout = getWorkoutForDate(date);
        const log = getDateLog(date);

        return (
          <DayCard
            key={index}
            date={date}
            workout={workout}
            log={log}
            viewMode={viewMode}
            isPadding={isPadding}
            onOpenLog={onOpenLog}
            onOpenEdit={onOpenEdit}
          />
        );
      })}
    </div>
  );
}
