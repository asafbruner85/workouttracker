import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DayCard from '../../src/components/calendar/DayCard';

describe('DayCard', () => {
  const mockWorkout = {
    typeEn: 'Strength',
    type: 'אימון כוח',
    color: 'bg-indigo-600',
    exercises: [
      { name: 'Back Squats', targetWeight: 80 },
      { name: 'Bench Press', targetWeight: 60 }
    ]
  };

  const defaultProps = {
    date: new Date('2024-03-15T12:00:00'), // Friday
    workout: mockWorkout,
    log: { completed: null, exercises: {}, running: {}, notes: '' },
    viewMode: 'weekly',
    onOpenLog: vi.fn(),
    onOpenEdit: vi.fn()
  };

  it('should render day name', () => {
    render(<DayCard {...defaultProps} />);

    expect(screen.getByText('Fri')).toBeTruthy();
  });

  it('should render workout type', () => {
    render(<DayCard {...defaultProps} />);

    expect(screen.getByText('Strength')).toBeTruthy();
    expect(screen.getByText('אימון כוח')).toBeTruthy();
  });

  it('should render Log Workout button', () => {
    render(<DayCard {...defaultProps} />);

    expect(screen.getByText('Log Workout')).toBeTruthy();
  });

  it('should render Edit Workout button', () => {
    render(<DayCard {...defaultProps} />);

    expect(screen.getByText('Edit Workout')).toBeTruthy();
  });

  it('should call onOpenLog when Log Workout clicked', () => {
    const onOpenLog = vi.fn();
    render(<DayCard {...defaultProps} onOpenLog={onOpenLog} />);

    fireEvent.click(screen.getByText('Log Workout'));

    expect(onOpenLog).toHaveBeenCalledWith(defaultProps.date);
  });

  it('should call onOpenEdit when Edit Workout clicked', () => {
    const onOpenEdit = vi.fn();
    render(<DayCard {...defaultProps} onOpenEdit={onOpenEdit} />);

    fireEvent.click(screen.getByText('Edit Workout'));

    expect(onOpenEdit).toHaveBeenCalledWith(defaultProps.date);
  });

  it('should show check icon for completed workout', () => {
    render(
      <DayCard
        {...defaultProps}
        log={{ completed: true, exercises: {}, running: {}, notes: '' }}
      />
    );

    // Check icon has specific classes for green color
    const completedIcon = document.querySelector('.text-green-600');
    expect(completedIcon).toBeTruthy();
  });

  it('should show X icon for skipped workout', () => {
    render(
      <DayCard
        {...defaultProps}
        log={{ completed: false, exercises: {}, running: {}, notes: '' }}
      />
    );

    // X icon has specific classes for red color
    const skippedIcon = document.querySelector('.text-red-600');
    expect(skippedIcon).toBeTruthy();
  });

  it('should not show completion icon for unlogged workout', () => {
    render(<DayCard {...defaultProps} />);

    const greenIcon = document.querySelector('.text-green-600');
    const redIcon = document.querySelector('.text-red-600');
    expect(greenIcon).toBeNull();
    expect(redIcon).toBeNull();
  });

  it('should highlight today with blue border', () => {
    const today = new Date();
    render(<DayCard {...defaultProps} date={today} />);

    const card = document.querySelector('.border-blue-500');
    expect(card).toBeTruthy();
  });

  it('should apply padding styles when isPadding is true', () => {
    render(<DayCard {...defaultProps} isPadding={true} />);

    const card = document.querySelector('.opacity-40');
    expect(card).toBeTruthy();
  });

  it('should not render buttons when isPadding is true', () => {
    render(<DayCard {...defaultProps} isPadding={true} />);

    expect(screen.queryByText('Log Workout')).toBeNull();
    expect(screen.queryByText('Edit Workout')).toBeNull();
  });

  it('should not render buttons for Rest day', () => {
    const restWorkout = {
      typeEn: 'Rest',
      type: 'יום מנוחה',
      color: 'bg-gray-600'
    };

    render(<DayCard {...defaultProps} workout={restWorkout} />);

    expect(screen.queryByText('Log Workout')).toBeNull();
    expect(screen.queryByText('Edit Workout')).toBeNull();
  });

  it('should render with workout color', () => {
    render(<DayCard {...defaultProps} />);

    const header = document.querySelector('.bg-indigo-600');
    expect(header).toBeTruthy();
  });

  it('should render date number in monthly view', () => {
    render(<DayCard {...defaultProps} viewMode="monthly" />);

    // March 15
    expect(screen.getByText('15')).toBeTruthy();
  });

  it('should render Hebrew day name in weekly view', () => {
    // Friday is index 5, Hebrew = 'ו'
    render(<DayCard {...defaultProps} viewMode="weekly" />);

    // Should contain Hebrew day marker
    const dayInfo = screen.getByText(/ו.*15/);
    expect(dayInfo).toBeTruthy();
  });
});
