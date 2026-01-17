import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCalendarNavigation } from '../../src/hooks/useCalendarNavigation';

describe('useCalendarNavigation', () => {
  describe('initial state', () => {
    it('should start with current date', () => {
      const { result } = renderHook(() => useCalendarNavigation());

      const today = new Date();
      expect(result.current.currentWeek.toDateString()).toBe(today.toDateString());
    });

    it('should start in weekly view mode', () => {
      const { result } = renderHook(() => useCalendarNavigation());

      expect(result.current.viewMode).toBe('weekly');
    });

    it('should expose all expected properties and functions', () => {
      const { result } = renderHook(() => useCalendarNavigation());

      expect(result.current.currentWeek).toBeInstanceOf(Date);
      expect(typeof result.current.setCurrentWeek).toBe('function');
      expect(typeof result.current.viewMode).toBe('string');
      expect(typeof result.current.setViewMode).toBe('function');
      expect(typeof result.current.navigate).toBe('function');
      expect(typeof result.current.goToToday).toBe('function');
      expect(Array.isArray(result.current.weekDates)).toBe(true);
      expect(typeof result.current.currentWeekKey).toBe('string');
      expect(Array.isArray(result.current.displayDates)).toBe(true);
    });
  });

  describe('viewMode', () => {
    it('should change view mode', () => {
      const { result } = renderHook(() => useCalendarNavigation());

      act(() => {
        result.current.setViewMode('daily');
      });
      expect(result.current.viewMode).toBe('daily');

      act(() => {
        result.current.setViewMode('monthly');
      });
      expect(result.current.viewMode).toBe('monthly');

      act(() => {
        result.current.setViewMode('weekly');
      });
      expect(result.current.viewMode).toBe('weekly');
    });
  });

  describe('navigate', () => {
    describe('daily mode', () => {
      it('should navigate forward one day', () => {
        const { result } = renderHook(() => useCalendarNavigation());
        const initialDate = new Date(result.current.currentWeek);

        act(() => {
          result.current.setViewMode('daily');
        });

        act(() => {
          result.current.navigate(1);
        });

        const expected = new Date(initialDate);
        expected.setDate(expected.getDate() + 1);
        expect(result.current.currentWeek.toDateString()).toBe(expected.toDateString());
      });

      it('should navigate backward one day', () => {
        const { result } = renderHook(() => useCalendarNavigation());
        const initialDate = new Date(result.current.currentWeek);

        act(() => {
          result.current.setViewMode('daily');
        });

        act(() => {
          result.current.navigate(-1);
        });

        const expected = new Date(initialDate);
        expected.setDate(expected.getDate() - 1);
        expect(result.current.currentWeek.toDateString()).toBe(expected.toDateString());
      });
    });

    describe('weekly mode', () => {
      it('should navigate forward one week', () => {
        const { result } = renderHook(() => useCalendarNavigation());
        const initialDate = new Date(result.current.currentWeek);

        act(() => {
          result.current.navigate(1);
        });

        const expected = new Date(initialDate);
        expected.setDate(expected.getDate() + 7);
        expect(result.current.currentWeek.toDateString()).toBe(expected.toDateString());
      });

      it('should navigate backward one week', () => {
        const { result } = renderHook(() => useCalendarNavigation());
        const initialDate = new Date(result.current.currentWeek);

        act(() => {
          result.current.navigate(-1);
        });

        const expected = new Date(initialDate);
        expected.setDate(expected.getDate() - 7);
        expect(result.current.currentWeek.toDateString()).toBe(expected.toDateString());
      });
    });

    describe('monthly mode', () => {
      it('should navigate forward one month', () => {
        const { result } = renderHook(() => useCalendarNavigation());
        const initialMonth = result.current.currentWeek.getMonth();

        act(() => {
          result.current.setViewMode('monthly');
        });

        act(() => {
          result.current.navigate(1);
        });

        const expectedMonth = (initialMonth + 1) % 12;
        expect(result.current.currentWeek.getMonth()).toBe(expectedMonth);
      });

      it('should navigate backward one month', () => {
        const { result } = renderHook(() => useCalendarNavigation());
        const initialMonth = result.current.currentWeek.getMonth();

        act(() => {
          result.current.setViewMode('monthly');
        });

        act(() => {
          result.current.navigate(-1);
        });

        const expectedMonth = initialMonth === 0 ? 11 : initialMonth - 1;
        expect(result.current.currentWeek.getMonth()).toBe(expectedMonth);
      });
    });
  });

  describe('goToToday', () => {
    it('should reset to current date', () => {
      const { result } = renderHook(() => useCalendarNavigation());

      // Navigate away
      act(() => {
        result.current.navigate(5);
        result.current.navigate(5);
      });

      // Go back to today
      act(() => {
        result.current.goToToday();
      });

      const today = new Date();
      expect(result.current.currentWeek.toDateString()).toBe(today.toDateString());
    });
  });

  describe('weekDates', () => {
    it('should return 7 dates', () => {
      const { result } = renderHook(() => useCalendarNavigation());

      expect(result.current.weekDates).toHaveLength(7);
    });

    it('should start on Sunday', () => {
      const { result } = renderHook(() => useCalendarNavigation());

      expect(result.current.weekDates[0].getDay()).toBe(0);
    });

    it('should end on Saturday', () => {
      const { result } = renderHook(() => useCalendarNavigation());

      expect(result.current.weekDates[6].getDay()).toBe(6);
    });

    it('should update when currentWeek changes', () => {
      const { result } = renderHook(() => useCalendarNavigation());
      const initialSunday = result.current.weekDates[0].toDateString();

      act(() => {
        result.current.navigate(1);
      });

      expect(result.current.weekDates[0].toDateString()).not.toBe(initialSunday);
    });
  });

  describe('currentWeekKey', () => {
    it('should return Sunday date in ISO format', () => {
      const { result } = renderHook(() => useCalendarNavigation());

      expect(result.current.currentWeekKey).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should match weekDates Sunday', () => {
      const { result } = renderHook(() => useCalendarNavigation());

      const sundayFromKey = new Date(result.current.currentWeekKey + 'T12:00:00');
      expect(sundayFromKey.getDay()).toBe(0);
    });
  });

  describe('displayDates', () => {
    it('should return 1 date in daily mode', () => {
      const { result } = renderHook(() => useCalendarNavigation());

      act(() => {
        result.current.setViewMode('daily');
      });

      expect(result.current.displayDates).toHaveLength(1);
    });

    it('should return 7 dates in weekly mode', () => {
      const { result } = renderHook(() => useCalendarNavigation());

      act(() => {
        result.current.setViewMode('weekly');
      });

      expect(result.current.displayDates).toHaveLength(7);
    });

    it('should return month dates with padding in monthly mode', () => {
      const { result } = renderHook(() => useCalendarNavigation());

      act(() => {
        result.current.setViewMode('monthly');
      });

      expect(result.current.displayDates.length).toBeGreaterThan(28);
      expect(result.current.displayDates[0]).toHaveProperty('isPadding');
    });
  });

  describe('periodTitle', () => {
    it('should return string for daily mode', () => {
      const { result } = renderHook(() => useCalendarNavigation());

      act(() => {
        result.current.setViewMode('daily');
      });

      expect(typeof result.current.periodTitle).toBe('string');
    });

    it('should return object with main/sub for weekly mode', () => {
      const { result } = renderHook(() => useCalendarNavigation());

      expect(result.current.periodTitle).toHaveProperty('main');
      expect(result.current.periodTitle).toHaveProperty('sub');
    });

    it('should return string for monthly mode', () => {
      const { result } = renderHook(() => useCalendarNavigation());

      act(() => {
        result.current.setViewMode('monthly');
      });

      expect(typeof result.current.periodTitle).toBe('string');
    });
  });

  describe('setCurrentWeek', () => {
    it('should allow direct date update', () => {
      const { result } = renderHook(() => useCalendarNavigation());
      const targetDate = new Date('2024-06-15T12:00:00');

      act(() => {
        result.current.setCurrentWeek(targetDate);
      });

      expect(result.current.currentWeek.toDateString()).toBe(targetDate.toDateString());
    });
  });
});
