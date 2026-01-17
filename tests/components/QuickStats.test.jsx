import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import QuickStats from '../../src/components/stats/QuickStats';

describe('QuickStats', () => {
  // Helper to create week dates
  const createWeekDates = () => {
    const dates = [];
    const startDate = new Date('2024-03-10'); // Sunday
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const mockWorkoutProgram = {
    0: { typeEn: 'Rest' },
    1: { typeEn: 'Strength' },
    2: { typeEn: 'CrossFit' },
    3: { typeEn: 'Sprints' },
    4: { typeEn: 'Strength' },
    5: { typeEn: 'Long Run' },
    6: { typeEn: 'CrossFit' }
  };

  const createGetWorkoutForDate = (program = mockWorkoutProgram) => {
    return (date) => program[date.getDay()];
  };

  const createGetDateLog = (logs = {}) => {
    return (date) => {
      const key = date.toISOString().split('T')[0];
      return logs[key] || { completed: null, exercises: {}, running: {}, notes: '' };
    };
  };

  it('should render all four stat cards', () => {
    render(
      <QuickStats
        weekDates={createWeekDates()}
        getWorkoutForDate={createGetWorkoutForDate()}
        getDateLog={createGetDateLog()}
      />
    );

    expect(screen.getByText('This Week')).toBeTruthy();
    expect(screen.getByText('Strength')).toBeTruthy();
    expect(screen.getByText('CrossFit')).toBeTruthy();
    expect(screen.getByText('Running')).toBeTruthy();
  });

  it('should show 0/6 when no workouts completed', () => {
    render(
      <QuickStats
        weekDates={createWeekDates()}
        getWorkoutForDate={createGetWorkoutForDate()}
        getDateLog={createGetDateLog()}
      />
    );

    expect(screen.getByText('0/6')).toBeTruthy();
  });

  it('should count completed workouts correctly', () => {
    const logs = {
      '2024-03-11': { completed: true }, // Monday - Strength
      '2024-03-12': { completed: true }, // Tuesday - CrossFit
      '2024-03-13': { completed: true }  // Wednesday - Sprints
    };

    render(
      <QuickStats
        weekDates={createWeekDates()}
        getWorkoutForDate={createGetWorkoutForDate()}
        getDateLog={createGetDateLog(logs)}
      />
    );

    expect(screen.getByText('3/6')).toBeTruthy();
  });

  it('should count strength workouts correctly', () => {
    const logs = {
      '2024-03-11': { completed: true }, // Monday - Strength
      '2024-03-14': { completed: true }  // Thursday - Strength
    };

    render(
      <QuickStats
        weekDates={createWeekDates()}
        getWorkoutForDate={createGetWorkoutForDate()}
        getDateLog={createGetDateLog(logs)}
      />
    );

    // Should show 2/2 for strength
    const strengthCards = screen.getAllByText('2/2');
    expect(strengthCards.length).toBeGreaterThanOrEqual(1);
  });

  it('should count CrossFit workouts correctly', () => {
    const logs = {
      '2024-03-12': { completed: true }, // Tuesday - CrossFit
      '2024-03-16': { completed: true }  // Saturday - CrossFit
    };

    render(
      <QuickStats
        weekDates={createWeekDates()}
        getWorkoutForDate={createGetWorkoutForDate()}
        getDateLog={createGetDateLog(logs)}
      />
    );

    // Should show 2/2 for crossfit
    const crossfitCards = screen.getAllByText('2/2');
    expect(crossfitCards.length).toBeGreaterThanOrEqual(1);
  });

  it('should count running workouts correctly', () => {
    const logs = {
      '2024-03-13': { completed: true }, // Wednesday - Sprints
      '2024-03-15': { completed: true }  // Friday - Long Run
    };

    render(
      <QuickStats
        weekDates={createWeekDates()}
        getWorkoutForDate={createGetWorkoutForDate()}
        getDateLog={createGetDateLog(logs)}
      />
    );

    // Should show 2/2 for running
    const runningCards = screen.getAllByText('2/2');
    expect(runningCards.length).toBeGreaterThanOrEqual(1);
  });

  it('should not count skipped workouts', () => {
    const logs = {
      '2024-03-11': { completed: false }, // Skipped
      '2024-03-12': { completed: true }   // Completed
    };

    render(
      <QuickStats
        weekDates={createWeekDates()}
        getWorkoutForDate={createGetWorkoutForDate()}
        getDateLog={createGetDateLog(logs)}
      />
    );

    expect(screen.getByText('1/6')).toBeTruthy();
  });

  it('should not count null completion status', () => {
    const logs = {
      '2024-03-11': { completed: null }, // Not logged
      '2024-03-12': { completed: true }  // Completed
    };

    render(
      <QuickStats
        weekDates={createWeekDates()}
        getWorkoutForDate={createGetWorkoutForDate()}
        getDateLog={createGetDateLog(logs)}
      />
    );

    expect(screen.getByText('1/6')).toBeTruthy();
  });

  it('should render with correct stat labels', () => {
    render(
      <QuickStats
        weekDates={createWeekDates()}
        getWorkoutForDate={createGetWorkoutForDate()}
        getDateLog={createGetDateLog()}
      />
    );

    expect(screen.getByText('workouts completed')).toBeTruthy();
    expect(screen.getAllByText('this week')).toHaveLength(3);
  });
});
