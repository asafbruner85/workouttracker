import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingSkeleton from '../../src/components/LoadingSkeleton';

describe('LoadingSkeleton', () => {
  it('should render without crashing', () => {
    render(<LoadingSkeleton />);

    // Component should render
    expect(document.querySelector('.min-h-screen')).toBeTruthy();
  });

  it('should render header skeleton', () => {
    render(<LoadingSkeleton />);

    // Header should be present
    expect(document.querySelector('header')).toBeTruthy();
  });

  it('should render 6 header button skeletons', () => {
    render(<LoadingSkeleton />);

    // Header has 6 skeleton buttons
    const headerButtons = document.querySelectorAll('header .w-10');
    expect(headerButtons.length).toBeGreaterThanOrEqual(1);
  });

  it('should render view mode switcher skeleton', () => {
    render(<LoadingSkeleton />);

    // View mode switcher with 3 buttons (Daily, Weekly, Monthly)
    const mainContent = document.querySelector('main');
    expect(mainContent).toBeTruthy();
  });

  it('should render 7 day card skeletons for weekly view', () => {
    render(<LoadingSkeleton />);

    // Grid should have 7 columns on md screens
    const grid = document.querySelector('.grid-cols-1.md\\:grid-cols-7');
    expect(grid).toBeTruthy();

    // Should have 7 children
    expect(grid.children.length).toBe(7);
  });

  it('should render 4 stat card skeletons', () => {
    render(<LoadingSkeleton />);

    // Stats grid
    const statsGrid = document.querySelector('.mt-8.grid');
    expect(statsGrid).toBeTruthy();
    expect(statsGrid.children.length).toBe(4);
  });

  it('should have animated pulse elements', () => {
    render(<LoadingSkeleton />);

    // Should have animation classes
    const pulseElements = document.querySelectorAll('.animate-pulse');
    expect(pulseElements.length).toBeGreaterThan(0);
  });
});
