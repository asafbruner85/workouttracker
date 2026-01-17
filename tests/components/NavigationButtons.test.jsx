import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import NavigationButtons from '../../src/components/header/NavigationButtons';

describe('NavigationButtons', () => {
  const defaultProps = {
    periodTitle: 'March 2024',
    viewMode: 'monthly',
    onNavigate: vi.fn()
  };

  it('should render period title as string', () => {
    render(<NavigationButtons {...defaultProps} />);

    expect(screen.getByText('March 2024')).toBeTruthy();
  });

  it('should render navigation buttons', () => {
    render(<NavigationButtons {...defaultProps} />);

    // Should have 2 buttons (prev and next)
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
  });

  it('should call onNavigate with -1 when previous button clicked', () => {
    const onNavigate = vi.fn();
    render(<NavigationButtons {...defaultProps} onNavigate={onNavigate} />);

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]); // First button is previous

    expect(onNavigate).toHaveBeenCalledWith(-1);
  });

  it('should call onNavigate with 1 when next button clicked', () => {
    const onNavigate = vi.fn();
    render(<NavigationButtons {...defaultProps} onNavigate={onNavigate} />);

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]); // Second button is next

    expect(onNavigate).toHaveBeenCalledWith(1);
  });

  it('should render weekly title with main and sub when viewMode is weekly', () => {
    const weeklyTitle = {
      main: 'March 2024',
      sub: 'Mar 10 - Mar 16'
    };

    render(
      <NavigationButtons
        {...defaultProps}
        viewMode="weekly"
        periodTitle={weeklyTitle}
      />
    );

    expect(screen.getByText('March 2024')).toBeTruthy();
    expect(screen.getByText('Mar 10 - Mar 16')).toBeTruthy();
  });

  it('should render string title for daily view', () => {
    render(
      <NavigationButtons
        {...defaultProps}
        viewMode="daily"
        periodTitle="Friday, March 15, 2024"
      />
    );

    expect(screen.getByText('Friday, March 15, 2024')).toBeTruthy();
  });

  it('should render string title for monthly view', () => {
    render(
      <NavigationButtons
        {...defaultProps}
        viewMode="monthly"
        periodTitle="March 2024"
      />
    );

    expect(screen.getByText('March 2024')).toBeTruthy();
  });
});
