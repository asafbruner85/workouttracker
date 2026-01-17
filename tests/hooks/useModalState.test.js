import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useModalState } from '../../src/hooks/useModalState';

describe('useModalState', () => {
  describe('initial state', () => {
    it('should start with all modals closed', () => {
      const { result } = renderHook(() => useModalState());

      expect(result.current.showHistory).toBe(false);
      expect(result.current.showLogModal).toBe(false);
      expect(result.current.showEditModal).toBe(false);
      expect(result.current.showProgressDashboard).toBe(false);
      expect(result.current.showScheduleConfig).toBe(false);
    });

    it('should start with null dates', () => {
      const { result } = renderHook(() => useModalState());

      expect(result.current.logDate).toBe(null);
      expect(result.current.editDate).toBe(null);
    });

    it('should expose all expected functions', () => {
      const { result } = renderHook(() => useModalState());

      expect(typeof result.current.openLogModal).toBe('function');
      expect(typeof result.current.closeLogModal).toBe('function');
      expect(typeof result.current.openEditModal).toBe('function');
      expect(typeof result.current.closeEditModal).toBe('function');
      expect(typeof result.current.toggleHistory).toBe('function');
      expect(typeof result.current.toggleProgressDashboard).toBe('function');
      expect(typeof result.current.toggleScheduleConfig).toBe('function');
    });
  });

  describe('Log Modal', () => {
    it('should open log modal with date', () => {
      const { result } = renderHook(() => useModalState());
      const testDate = new Date('2024-03-15');

      act(() => {
        result.current.openLogModal(testDate);
      });

      expect(result.current.showLogModal).toBe(true);
      expect(result.current.logDate).toBe(testDate);
    });

    it('should close log modal', () => {
      const { result } = renderHook(() => useModalState());
      const testDate = new Date('2024-03-15');

      act(() => {
        result.current.openLogModal(testDate);
      });

      act(() => {
        result.current.closeLogModal();
      });

      expect(result.current.showLogModal).toBe(false);
      // Note: logDate is not cleared on close (allows for animation)
    });

    it('should allow direct state updates', () => {
      const { result } = renderHook(() => useModalState());
      const testDate = new Date('2024-03-15');

      act(() => {
        result.current.setShowLogModal(true);
        result.current.setLogDate(testDate);
      });

      expect(result.current.showLogModal).toBe(true);
      expect(result.current.logDate).toBe(testDate);
    });
  });

  describe('Edit Modal', () => {
    it('should open edit modal with date', () => {
      const { result } = renderHook(() => useModalState());
      const testDate = new Date('2024-03-15');

      act(() => {
        result.current.openEditModal(testDate);
      });

      expect(result.current.showEditModal).toBe(true);
      expect(result.current.editDate).toBe(testDate);
    });

    it('should close edit modal', () => {
      const { result } = renderHook(() => useModalState());
      const testDate = new Date('2024-03-15');

      act(() => {
        result.current.openEditModal(testDate);
      });

      act(() => {
        result.current.closeEditModal();
      });

      expect(result.current.showEditModal).toBe(false);
    });

    it('should allow direct state updates', () => {
      const { result } = renderHook(() => useModalState());
      const testDate = new Date('2024-03-15');

      act(() => {
        result.current.setShowEditModal(true);
        result.current.setEditDate(testDate);
      });

      expect(result.current.showEditModal).toBe(true);
      expect(result.current.editDate).toBe(testDate);
    });
  });

  describe('History Panel', () => {
    it('should toggle history visibility', () => {
      const { result } = renderHook(() => useModalState());

      expect(result.current.showHistory).toBe(false);

      act(() => {
        result.current.toggleHistory();
      });
      expect(result.current.showHistory).toBe(true);

      act(() => {
        result.current.toggleHistory();
      });
      expect(result.current.showHistory).toBe(false);
    });

    it('should allow direct state update', () => {
      const { result } = renderHook(() => useModalState());

      act(() => {
        result.current.setShowHistory(true);
      });

      expect(result.current.showHistory).toBe(true);
    });
  });

  describe('Progress Dashboard', () => {
    it('should toggle progress dashboard visibility', () => {
      const { result } = renderHook(() => useModalState());

      expect(result.current.showProgressDashboard).toBe(false);

      act(() => {
        result.current.toggleProgressDashboard();
      });
      expect(result.current.showProgressDashboard).toBe(true);

      act(() => {
        result.current.toggleProgressDashboard();
      });
      expect(result.current.showProgressDashboard).toBe(false);
    });

    it('should allow direct state update', () => {
      const { result } = renderHook(() => useModalState());

      act(() => {
        result.current.setShowProgressDashboard(true);
      });

      expect(result.current.showProgressDashboard).toBe(true);
    });
  });

  describe('Schedule Config', () => {
    it('should toggle schedule config visibility', () => {
      const { result } = renderHook(() => useModalState());

      expect(result.current.showScheduleConfig).toBe(false);

      act(() => {
        result.current.toggleScheduleConfig();
      });
      expect(result.current.showScheduleConfig).toBe(true);

      act(() => {
        result.current.toggleScheduleConfig();
      });
      expect(result.current.showScheduleConfig).toBe(false);
    });

    it('should allow direct state update', () => {
      const { result } = renderHook(() => useModalState());

      act(() => {
        result.current.setShowScheduleConfig(true);
      });

      expect(result.current.showScheduleConfig).toBe(true);
    });
  });

  describe('Multiple modals', () => {
    it('should allow multiple modals open simultaneously', () => {
      const { result } = renderHook(() => useModalState());

      act(() => {
        result.current.toggleHistory();
        result.current.toggleProgressDashboard();
        result.current.openLogModal(new Date());
      });

      expect(result.current.showHistory).toBe(true);
      expect(result.current.showProgressDashboard).toBe(true);
      expect(result.current.showLogModal).toBe(true);
    });

    it('should maintain independence between modals', () => {
      const { result } = renderHook(() => useModalState());

      act(() => {
        result.current.toggleHistory();
      });

      act(() => {
        result.current.openLogModal(new Date());
      });

      act(() => {
        result.current.closeLogModal();
      });

      // History should still be open
      expect(result.current.showHistory).toBe(true);
      expect(result.current.showLogModal).toBe(false);
    });
  });
});
