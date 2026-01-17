import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuthentication } from '../../src/hooks/useAuthentication';
import * as auth from '../../src/utils/auth';

// Mock the auth utilities
vi.mock('../../src/utils/auth', () => ({
  verifyPassword: vi.fn(),
  getActivePasswordHash: vi.fn()
}));

describe('useAuthentication', () => {
  let mockStorage;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock storage
    mockStorage = {
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn()
    };
    window.storage = mockStorage;
  });

  describe('initial state', () => {
    it('should start with isAuthenticated as false', () => {
      const { result } = renderHook(() => useAuthentication());

      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should expose all expected functions', () => {
      const { result } = renderHook(() => useAuthentication());

      expect(typeof result.current.login).toBe('function');
      expect(typeof result.current.logout).toBe('function');
      expect(typeof result.current.checkAuth).toBe('function');
      expect(typeof result.current.setIsAuthenticated).toBe('function');
    });
  });

  describe('login', () => {
    it('should authenticate with valid password', async () => {
      auth.getActivePasswordHash.mockResolvedValue('hashed_password');
      auth.verifyPassword.mockResolvedValue(true);
      mockStorage.set.mockResolvedValue();

      const { result } = renderHook(() => useAuthentication());

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login('correct_password');
      });

      expect(loginResult).toBe(true);
      expect(result.current.isAuthenticated).toBe(true);
      expect(mockStorage.set).toHaveBeenCalledWith('auth_state', 'authenticated');
    });

    it('should reject invalid password', async () => {
      auth.getActivePasswordHash.mockResolvedValue('hashed_password');
      auth.verifyPassword.mockResolvedValue(false);

      const { result } = renderHook(() => useAuthentication());

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login('wrong_password');
      });

      expect(loginResult).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
      expect(mockStorage.set).not.toHaveBeenCalled();
    });

    it('should handle login errors gracefully', async () => {
      auth.getActivePasswordHash.mockRejectedValue(new Error('Hash error'));

      const { result } = renderHook(() => useAuthentication());

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login('password');
      });

      expect(loginResult).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should call verifyPassword with correct arguments', async () => {
      auth.getActivePasswordHash.mockResolvedValue('stored_hash');
      auth.verifyPassword.mockResolvedValue(true);
      mockStorage.set.mockResolvedValue();

      const { result } = renderHook(() => useAuthentication());

      await act(async () => {
        await result.current.login('test_password');
      });

      expect(auth.verifyPassword).toHaveBeenCalledWith('test_password', 'stored_hash');
    });
  });

  describe('logout', () => {
    it('should set isAuthenticated to false', async () => {
      const { result } = renderHook(() => useAuthentication());

      // First, authenticate
      await act(async () => {
        result.current.setIsAuthenticated(true);
      });
      expect(result.current.isAuthenticated).toBe(true);

      // Then logout
      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should delete auth_state from storage', async () => {
      mockStorage.delete.mockResolvedValue();

      const { result } = renderHook(() => useAuthentication());

      await act(async () => {
        await result.current.logout();
      });

      expect(mockStorage.delete).toHaveBeenCalledWith('auth_state');
    });

    it('should handle storage delete errors silently', async () => {
      mockStorage.delete.mockRejectedValue(new Error('Delete failed'));

      const { result } = renderHook(() => useAuthentication());

      // Should not throw
      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('checkAuth', () => {
    it('should authenticate if auth_state is stored', async () => {
      mockStorage.get.mockResolvedValue({ value: 'authenticated' });

      const { result } = renderHook(() => useAuthentication());

      let checkResult;
      await act(async () => {
        checkResult = await result.current.checkAuth();
      });

      expect(checkResult).toBe(true);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should not authenticate if auth_state is not stored', async () => {
      mockStorage.get.mockResolvedValue(null);

      const { result } = renderHook(() => useAuthentication());

      let checkResult;
      await act(async () => {
        checkResult = await result.current.checkAuth();
      });

      expect(checkResult).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should not authenticate if auth_state has different value', async () => {
      mockStorage.get.mockResolvedValue({ value: 'something_else' });

      const { result } = renderHook(() => useAuthentication());

      let checkResult;
      await act(async () => {
        checkResult = await result.current.checkAuth();
      });

      expect(checkResult).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should handle storage errors gracefully', async () => {
      mockStorage.get.mockRejectedValue(new Error('Storage error'));

      const { result } = renderHook(() => useAuthentication());

      let checkResult;
      await act(async () => {
        checkResult = await result.current.checkAuth();
      });

      expect(checkResult).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('setIsAuthenticated', () => {
    it('should allow direct state update', async () => {
      const { result } = renderHook(() => useAuthentication());

      await act(async () => {
        result.current.setIsAuthenticated(true);
      });

      expect(result.current.isAuthenticated).toBe(true);

      await act(async () => {
        result.current.setIsAuthenticated(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
    });
  });
});
