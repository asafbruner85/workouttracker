import { describe, it, expect } from 'vitest';
import {
  formatDateKey,
  getWeekKey,
  getWeekDates,
  getMonthDates,
  isToday,
  getDisplayDates,
  getPeriodTitle,
  navigateDate
} from '../src/utils/dateUtils';

describe('Date Utilities', () => {
  describe('formatDateKey', () => {
    it('should format date to YYYY-MM-DD', () => {
      const date = new Date('2024-03-15T10:30:00');
      expect(formatDateKey(date)).toBe('2024-03-15');
    });

    it('should handle dates at midnight', () => {
      const date = new Date('2024-01-01T00:00:00');
      expect(formatDateKey(date)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should handle end of year dates', () => {
      const date = new Date('2024-12-31T23:59:59');
      expect(formatDateKey(date)).toBe('2024-12-31');
    });

    it('should handle leap year date', () => {
      const date = new Date('2024-02-29T12:00:00');
      expect(formatDateKey(date)).toBe('2024-02-29');
    });
  });

  describe('getWeekKey', () => {
    it('should return Sunday date for any day in week', () => {
      // Wednesday, March 13, 2024
      const wednesday = new Date('2024-03-13T12:00:00');
      // Sunday of that week is March 10
      expect(getWeekKey(wednesday)).toBe('2024-03-10');
    });

    it('should return same date for Sunday', () => {
      const sunday = new Date('2024-03-10T12:00:00');
      expect(getWeekKey(sunday)).toBe('2024-03-10');
    });

    it('should return Sunday date for Saturday', () => {
      // Saturday, March 16, 2024
      const saturday = new Date('2024-03-16T12:00:00');
      expect(getWeekKey(saturday)).toBe('2024-03-10');
    });

    it('should handle week spanning two months', () => {
      // Wednesday, May 1, 2024 - Sunday is April 28
      const date = new Date('2024-05-01T12:00:00');
      expect(getWeekKey(date)).toBe('2024-04-28');
    });

    it('should handle week spanning two years', () => {
      // Wednesday, Jan 1, 2025 - Sunday is Dec 29, 2024
      const date = new Date('2025-01-01T12:00:00');
      expect(getWeekKey(date)).toBe('2024-12-29');
    });
  });

  describe('getWeekDates', () => {
    it('should return 7 dates starting from Sunday', () => {
      const date = new Date('2024-03-13T12:00:00');
      const weekDates = getWeekDates(date);

      expect(weekDates).toHaveLength(7);
      expect(weekDates[0].getDay()).toBe(0); // Sunday
      expect(weekDates[6].getDay()).toBe(6); // Saturday
    });

    it('should return consecutive dates', () => {
      const date = new Date('2024-03-15T12:00:00');
      const weekDates = getWeekDates(date);

      for (let i = 1; i < weekDates.length; i++) {
        const diff = weekDates[i].getDate() - weekDates[i - 1].getDate();
        // Could be 1 or negative (month boundary)
        const dayDiff = (weekDates[i] - weekDates[i - 1]) / (1000 * 60 * 60 * 24);
        expect(dayDiff).toBeCloseTo(1, 0);
      }
    });

    it('should handle month boundary', () => {
      // Week spanning Feb-March 2024
      const date = new Date('2024-03-01T12:00:00');
      const weekDates = getWeekDates(date);

      expect(weekDates).toHaveLength(7);
      // Feb 25-March 2 week
      expect(weekDates.some(d => d.getMonth() === 1)).toBe(true); // Feb
      expect(weekDates.some(d => d.getMonth() === 2)).toBe(true); // March
    });

    it('should return Date objects', () => {
      const date = new Date('2024-03-15T12:00:00');
      const weekDates = getWeekDates(date);

      weekDates.forEach(d => {
        expect(d).toBeInstanceOf(Date);
      });
    });
  });

  describe('getMonthDates', () => {
    it('should return dates for entire month with padding', () => {
      // March 2024 starts on Friday (day 5)
      const date = new Date('2024-03-15T12:00:00');
      const monthDates = getMonthDates(date);

      // Should include padding from prev month to start on Sunday
      expect(monthDates[0].isPadding).toBe(true);
      expect(monthDates[0].date.getDay()).toBe(0); // Sunday
    });

    it('should mark actual month days as non-padding', () => {
      const date = new Date('2024-03-15T12:00:00');
      const monthDates = getMonthDates(date);

      const march1 = monthDates.find(d =>
        !d.isPadding && d.date.getMonth() === 2 && d.date.getDate() === 1
      );
      expect(march1).toBeDefined();
      expect(march1.isPadding).toBe(false);
    });

    it('should include all 31 days for a 31-day month', () => {
      const date = new Date('2024-03-15T12:00:00');
      const monthDates = getMonthDates(date);

      const marchDays = monthDates.filter(d => !d.isPadding && d.date.getMonth() === 2);
      expect(marchDays).toHaveLength(31);
    });

    it('should handle February in leap year', () => {
      const date = new Date('2024-02-15T12:00:00');
      const monthDates = getMonthDates(date);

      const febDays = monthDates.filter(d => !d.isPadding && d.date.getMonth() === 1);
      expect(febDays).toHaveLength(29);
    });

    it('should handle February in non-leap year', () => {
      const date = new Date('2023-02-15T12:00:00');
      const monthDates = getMonthDates(date);

      const febDays = monthDates.filter(d => !d.isPadding && d.date.getMonth() === 1);
      expect(febDays).toHaveLength(28);
    });

    it('should end week on Saturday', () => {
      const date = new Date('2024-03-15T12:00:00');
      const monthDates = getMonthDates(date);
      const lastDate = monthDates[monthDates.length - 1];

      expect(lastDate.date.getDay()).toBe(6); // Saturday
    });
  });

  describe('isToday', () => {
    it('should return true for today', () => {
      const today = new Date();
      expect(isToday(today)).toBe(true);
    });

    it('should return false for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isToday(yesterday)).toBe(false);
    });

    it('should return false for tomorrow', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(isToday(tomorrow)).toBe(false);
    });

    it('should return true regardless of time', () => {
      const todayMorning = new Date();
      todayMorning.setHours(6, 0, 0, 0);

      const todayEvening = new Date();
      todayEvening.setHours(22, 0, 0, 0);

      expect(isToday(todayMorning)).toBe(true);
      expect(isToday(todayEvening)).toBe(true);
    });
  });

  describe('getDisplayDates', () => {
    it('should return single date for daily view', () => {
      const date = new Date('2024-03-15T12:00:00');
      const dates = getDisplayDates('daily', date);

      expect(dates).toHaveLength(1);
      expect(dates[0].toDateString()).toBe(date.toDateString());
    });

    it('should return 7 dates for weekly view', () => {
      const date = new Date('2024-03-15T12:00:00');
      const dates = getDisplayDates('weekly', date);

      expect(dates).toHaveLength(7);
      expect(dates[0].getDay()).toBe(0); // Sunday
    });

    it('should return month dates with padding for monthly view', () => {
      const date = new Date('2024-03-15T12:00:00');
      const dates = getDisplayDates('monthly', date);

      expect(dates.length).toBeGreaterThan(28);
      expect(dates[0]).toHaveProperty('isPadding');
    });
  });

  describe('getPeriodTitle', () => {
    it('should return formatted date string for daily view', () => {
      const date = new Date('2024-03-15T12:00:00');
      const title = getPeriodTitle('daily', date);

      expect(typeof title).toBe('string');
      expect(title).toContain('2024');
    });

    it('should return object with main/sub for weekly view', () => {
      const date = new Date('2024-03-15T12:00:00');
      const title = getPeriodTitle('weekly', date);

      expect(title).toHaveProperty('main');
      expect(title).toHaveProperty('sub');
      expect(title.sub).toContain('-');
    });

    it('should return month and year for monthly view', () => {
      const date = new Date('2024-03-15T12:00:00');
      const title = getPeriodTitle('monthly', date);

      expect(typeof title).toBe('string');
      expect(title).toContain('2024');
    });
  });

  describe('navigateDate', () => {
    describe('daily navigation', () => {
      it('should move forward one day', () => {
        const date = new Date('2024-03-15T12:00:00');
        const newDate = navigateDate(date, 1, 'daily');

        expect(newDate.getDate()).toBe(16);
      });

      it('should move backward one day', () => {
        const date = new Date('2024-03-15T12:00:00');
        const newDate = navigateDate(date, -1, 'daily');

        expect(newDate.getDate()).toBe(14);
      });

      it('should handle month boundary forward', () => {
        const date = new Date('2024-03-31T12:00:00');
        const newDate = navigateDate(date, 1, 'daily');

        expect(newDate.getMonth()).toBe(3); // April
        expect(newDate.getDate()).toBe(1);
      });

      it('should handle month boundary backward', () => {
        const date = new Date('2024-03-01T12:00:00');
        const newDate = navigateDate(date, -1, 'daily');

        expect(newDate.getMonth()).toBe(1); // February
        expect(newDate.getDate()).toBe(29); // Leap year
      });
    });

    describe('weekly navigation', () => {
      it('should move forward one week', () => {
        const date = new Date('2024-03-15T12:00:00');
        const newDate = navigateDate(date, 1, 'weekly');

        expect(newDate.getDate()).toBe(22);
      });

      it('should move backward one week', () => {
        const date = new Date('2024-03-15T12:00:00');
        const newDate = navigateDate(date, -1, 'weekly');

        expect(newDate.getDate()).toBe(8);
      });
    });

    describe('monthly navigation', () => {
      it('should move forward one month', () => {
        const date = new Date('2024-03-15T12:00:00');
        const newDate = navigateDate(date, 1, 'monthly');

        expect(newDate.getMonth()).toBe(3); // April
      });

      it('should move backward one month', () => {
        const date = new Date('2024-03-15T12:00:00');
        const newDate = navigateDate(date, -1, 'monthly');

        expect(newDate.getMonth()).toBe(1); // February
      });

      it('should handle year boundary forward', () => {
        const date = new Date('2024-12-15T12:00:00');
        const newDate = navigateDate(date, 1, 'monthly');

        expect(newDate.getFullYear()).toBe(2025);
        expect(newDate.getMonth()).toBe(0); // January
      });

      it('should handle year boundary backward', () => {
        const date = new Date('2024-01-15T12:00:00');
        const newDate = navigateDate(date, -1, 'monthly');

        expect(newDate.getFullYear()).toBe(2023);
        expect(newDate.getMonth()).toBe(11); // December
      });
    });

    it('should not mutate original date', () => {
      const date = new Date('2024-03-15T12:00:00');
      const originalTime = date.getTime();

      navigateDate(date, 1, 'daily');
      navigateDate(date, 1, 'weekly');
      navigateDate(date, 1, 'monthly');

      expect(date.getTime()).toBe(originalTime);
    });
  });
});
