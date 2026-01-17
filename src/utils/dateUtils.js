/**
 * Date utility functions - Centralized date operations
 */

/**
 * Format a date to a storage key string (YYYY-MM-DD)
 * @param {Date} date - The date to format
 * @returns {string} Date key in ISO format (YYYY-MM-DD)
 */
export function formatDateKey(date) {
  return date.toISOString().split('T')[0];
}

/**
 * Get the week key for a date (Sunday's date as the key)
 * @param {Date} date - Any date in the week
 * @returns {string} Week key in ISO format (YYYY-MM-DD of Sunday)
 */
export function getWeekKey(date) {
  const weekStart = new Date(date);
  const day = weekStart.getDay();
  weekStart.setDate(weekStart.getDate() - day);
  return formatDateKey(weekStart);
}

/**
 * Get all dates in a week starting from Sunday
 * @param {Date} date - Any date in the week
 * @returns {Date[]} Array of 7 dates (Sun-Sat)
 */
export function getWeekDates(date) {
  const startOfWeek = new Date(date);
  const day = startOfWeek.getDay();
  startOfWeek.setDate(startOfWeek.getDate() - day);

  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    dates.push(d);
  }
  return dates;
}

/**
 * Get all dates in a month with padding for calendar display
 * @param {Date} date - Any date in the month
 * @returns {Array<{date: Date, isPadding: boolean}>} Array of dates with padding info
 */
export function getMonthDates(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  // Create dates at noon to avoid timezone issues
  const firstDay = new Date(year, month, 1, 12, 0, 0);
  const lastDay = new Date(year, month + 1, 0, 12, 0, 0);

  const dates = [];

  // Add padding days from previous month to start on Sunday
  const firstDayOfWeek = firstDay.getDay();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const paddingDate = new Date(firstDay);
    paddingDate.setDate(paddingDate.getDate() - (i + 1));
    dates.push({ date: paddingDate, isPadding: true });
  }

  // Add all days in current month
  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
    dates.push({ date: new Date(d), isPadding: false });
  }

  // Add padding days from next month to complete the week
  const lastDayOfWeek = lastDay.getDay();
  if (lastDayOfWeek < 6) {
    for (let i = 1; i <= 6 - lastDayOfWeek; i++) {
      const paddingDate = new Date(lastDay);
      paddingDate.setDate(paddingDate.getDate() + i);
      dates.push({ date: paddingDate, isPadding: true });
    }
  }

  return dates;
}

/**
 * Check if a date is today
 * @param {Date} date - The date to check
 * @returns {boolean} True if date is today
 */
export function isToday(date) {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

/**
 * Get display dates based on view mode
 * @param {string} viewMode - 'daily', 'weekly', or 'monthly'
 * @param {Date} currentDate - The current date being viewed
 * @returns {Array} Array of dates or date objects with isPadding
 */
export function getDisplayDates(viewMode, currentDate) {
  if (viewMode === 'daily') {
    return [new Date(currentDate)];
  } else if (viewMode === 'weekly') {
    return getWeekDates(currentDate);
  } else {
    // For monthly view, return raw dates array without wrapping
    return getMonthDates(currentDate);
  }
}

/**
 * Get period title based on view mode
 * @param {string} viewMode - 'daily', 'weekly', or 'monthly'
 * @param {Date} currentDate - The current date being viewed
 * @returns {string|Object} Period title string or object with main/sub
 */
export function getPeriodTitle(viewMode, currentDate) {
  if (viewMode === 'daily') {
    return currentDate.toLocaleDateString('en-IL', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  } else if (viewMode === 'weekly') {
    const dates = getWeekDates(currentDate);
    return {
      main: dates[0].toLocaleDateString('en-IL', { month: 'long', year: 'numeric' }),
      sub: `${dates[0].toLocaleDateString('en-IL', { day: 'numeric', month: 'short' })} - ${dates[6].toLocaleDateString('en-IL', { day: 'numeric', month: 'short' })}`
    };
  } else { // monthly
    return currentDate.toLocaleDateString('en-IL', { month: 'long', year: 'numeric' });
  }
}

/**
 * Navigate to a new date based on view mode
 * @param {Date} currentDate - The current date
 * @param {number} direction - 1 for forward, -1 for backward
 * @param {string} viewMode - 'daily', 'weekly', or 'monthly'
 * @returns {Date} The new date
 */
export function navigateDate(currentDate, direction, viewMode) {
  const newDate = new Date(currentDate);
  if (viewMode === 'daily') {
    newDate.setDate(newDate.getDate() + direction);
  } else if (viewMode === 'weekly') {
    newDate.setDate(newDate.getDate() + (direction * 7));
  } else { // monthly
    newDate.setMonth(newDate.getMonth() + direction);
  }
  return newDate;
}
