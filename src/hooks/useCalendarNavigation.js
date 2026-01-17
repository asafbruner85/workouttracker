/**
 * useCalendarNavigation - Manages calendar view and navigation state
 */

import { useState, useCallback, useMemo } from 'react';
import {
  getWeekDates,
  getWeekKey,
  getDisplayDates as getDisplayDatesUtil,
  getPeriodTitle as getPeriodTitleUtil,
  navigateDate
} from '../utils/dateUtils';

export function useCalendarNavigation() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [viewMode, setViewMode] = useState('weekly'); // 'daily', 'weekly', 'monthly'

  const navigate = useCallback((direction) => {
    setCurrentWeek(prev => navigateDate(prev, direction, viewMode));
  }, [viewMode]);

  const weekDates = useMemo(() => getWeekDates(currentWeek), [currentWeek]);

  const currentWeekKey = useMemo(() => getWeekKey(currentWeek), [currentWeek]);

  const displayDates = useMemo(
    () => getDisplayDatesUtil(viewMode, currentWeek),
    [viewMode, currentWeek]
  );

  const periodTitle = useMemo(
    () => getPeriodTitleUtil(viewMode, currentWeek),
    [viewMode, currentWeek]
  );

  const goToToday = useCallback(() => {
    setCurrentWeek(new Date());
  }, []);

  return {
    currentWeek,
    setCurrentWeek,
    viewMode,
    setViewMode,
    navigate,
    weekDates,
    currentWeekKey,
    displayDates,
    periodTitle,
    goToToday
  };
}
