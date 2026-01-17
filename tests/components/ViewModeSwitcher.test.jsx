import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ViewModeSwitcher from '../../src/components/header/ViewModeSwitcher';

describe('ViewModeSwitcher', () => {
  const defaultProps = {
    viewMode: 'weekly',
    onViewModeChange: vi.fn()
  };

  it('should render all three view mode buttons', () => {
    render(<ViewModeSwitcher {...defaultProps} />);

    expect(screen.getByText('Daily')).toBeTruthy();
    expect(screen.getByText('Weekly')).toBeTruthy();
    expect(screen.getByText('Monthly')).toBeTruthy();
  });

  it('should highlight active view mode', () => {
    render(<ViewModeSwitcher {...defaultProps} viewMode="weekly" />);

    const weeklyButton = screen.getByText('Weekly');
    expect(weeklyButton.className).toContain('bg-blue-600');

    const dailyButton = screen.getByText('Daily');
    expect(dailyButton.className).not.toContain('bg-blue-600');
  });

  it('should call onViewModeChange with "daily" when Daily clicked', () => {
    const onViewModeChange = vi.fn();
    render(<ViewModeSwitcher {...defaultProps} onViewModeChange={onViewModeChange} />);

    fireEvent.click(screen.getByText('Daily'));

    expect(onViewModeChange).toHaveBeenCalledWith('daily');
  });

  it('should call onViewModeChange with "weekly" when Weekly clicked', () => {
    const onViewModeChange = vi.fn();
    render(<ViewModeSwitcher {...defaultProps} viewMode="daily" onViewModeChange={onViewModeChange} />);

    fireEvent.click(screen.getByText('Weekly'));

    expect(onViewModeChange).toHaveBeenCalledWith('weekly');
  });

  it('should call onViewModeChange with "monthly" when Monthly clicked', () => {
    const onViewModeChange = vi.fn();
    render(<ViewModeSwitcher {...defaultProps} onViewModeChange={onViewModeChange} />);

    fireEvent.click(screen.getByText('Monthly'));

    expect(onViewModeChange).toHaveBeenCalledWith('monthly');
  });

  it('should render with daily mode active', () => {
    render(<ViewModeSwitcher {...defaultProps} viewMode="daily" />);

    const dailyButton = screen.getByText('Daily');
    expect(dailyButton.className).toContain('bg-blue-600');
  });

  it('should render with monthly mode active', () => {
    render(<ViewModeSwitcher {...defaultProps} viewMode="monthly" />);

    const monthlyButton = screen.getByText('Monthly');
    expect(monthlyButton.className).toContain('bg-blue-600');
  });
});
