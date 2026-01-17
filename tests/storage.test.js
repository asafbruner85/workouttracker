import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock supabaseClient before importing storage
vi.mock('../src/supabaseClient', () => ({
  supabase: null,
  isSupabaseReady: vi.fn().mockResolvedValue(false),
  markSupabaseWorking: vi.fn(),
  markSupabaseNotWorking: vi.fn()
}));

// Import after mock setup
import storage from '../src/storage';
import { supabase, isSupabaseReady, markSupabaseWorking, markSupabaseNotWorking } from '../src/supabaseClient';

describe('Storage Module', () => {
  let localStorageMock;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup localStorage mock
    localStorageMock = {};
    global.localStorage = {
      getItem: vi.fn((key) => localStorageMock[key] || null),
      setItem: vi.fn((key, value) => { localStorageMock[key] = value; }),
      removeItem: vi.fn((key) => { delete localStorageMock[key]; }),
      clear: vi.fn(() => { localStorageMock = {}; })
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('localStorage operations', () => {
    describe('getFromLocalStorage', () => {
      it('should return value when key exists', () => {
        localStorageMock['test_key'] = 'test_value';

        const result = storage.getFromLocalStorage('test_key');

        expect(result).toEqual({ value: 'test_value' });
      });

      it('should return null when key does not exist', () => {
        const result = storage.getFromLocalStorage('nonexistent');

        expect(result).toBeNull();
      });

      it('should handle localStorage errors', () => {
        global.localStorage.getItem = vi.fn(() => {
          throw new Error('Storage error');
        });

        const result = storage.getFromLocalStorage('test_key');

        expect(result).toBeNull();
      });
    });

    describe('setToLocalStorage', () => {
      it('should set value in localStorage', () => {
        storage.setToLocalStorage('test_key', 'test_value');

        expect(localStorage.setItem).toHaveBeenCalledWith('test_key', 'test_value');
      });

      it('should handle localStorage errors silently', () => {
        global.localStorage.setItem = vi.fn(() => {
          throw new Error('Storage error');
        });

        // Should not throw
        expect(() => {
          storage.setToLocalStorage('test_key', 'test_value');
        }).not.toThrow();
      });
    });

    describe('deleteFromLocalStorage', () => {
      it('should remove item from localStorage', () => {
        storage.deleteFromLocalStorage('test_key');

        expect(localStorage.removeItem).toHaveBeenCalledWith('test_key');
      });

      it('should handle localStorage errors silently', () => {
        global.localStorage.removeItem = vi.fn(() => {
          throw new Error('Storage error');
        });

        expect(() => {
          storage.deleteFromLocalStorage('test_key');
        }).not.toThrow();
      });
    });
  });

  describe('get', () => {
    it('should fall back to localStorage when supabase is not configured', async () => {
      localStorageMock['test_key'] = 'test_value';

      const result = await storage.get('test_key');

      expect(result).toEqual({ value: 'test_value' });
    });

    it('should return null for non-existent keys', async () => {
      const result = await storage.get('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should save to localStorage', async () => {
      const result = await storage.set('test_key', 'test_value');

      expect(localStorage.setItem).toHaveBeenCalledWith('test_key', 'test_value');
      expect(result).toEqual({ success: true });
    });
  });

  describe('delete', () => {
    it('should delete from localStorage', async () => {
      const result = await storage.delete('test_key');

      expect(localStorage.removeItem).toHaveBeenCalledWith('test_key');
      expect(result).toEqual({ success: true });
    });
  });

  describe('exportData', () => {
    it('should export workout_logs and workout_program', async () => {
      const mockLogs = { '2024-03-15': { completed: true } };
      const mockProgram = { 0: { typeEn: 'Rest' } };

      localStorageMock['workout_logs'] = JSON.stringify(mockLogs);
      localStorageMock['workout_program'] = JSON.stringify(mockProgram);

      const data = await storage.exportData();

      expect(data.workout_logs).toEqual(mockLogs);
      expect(data.workout_program).toEqual(mockProgram);
      expect(data.exported_at).toBeDefined();
    });

    it('should handle missing data', async () => {
      const data = await storage.exportData();

      expect(data.workout_logs).toBeNull();
      expect(data.workout_program).toBeNull();
    });

    it('should handle localStorage errors gracefully', async () => {
      global.localStorage.getItem = vi.fn(() => {
        throw new Error('Storage error');
      });

      // getFromLocalStorage returns null on error, so exportData gets null values
      const data = await storage.exportData();
      expect(data.workout_logs).toBeNull();
      expect(data.workout_program).toBeNull();
    });
  });

  describe('importData', () => {
    it('should import workout_logs and workout_program', async () => {
      const data = {
        workout_logs: { '2024-03-15': { completed: true } },
        workout_program: { 0: { typeEn: 'Rest' } }
      };

      const result = await storage.importData(data);

      expect(result.success).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'workout_logs',
        JSON.stringify(data.workout_logs)
      );
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'workout_program',
        JSON.stringify(data.workout_program)
      );
    });

    it('should handle partial data', async () => {
      const data = {
        workout_logs: { '2024-03-15': { completed: true } }
      };

      const result = await storage.importData(data);

      expect(result.success).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledTimes(1);
    });

    it('should handle empty data', async () => {
      const result = await storage.importData({});

      expect(result.success).toBe(true);
    });

    it('should handle localStorage errors during import', async () => {
      global.localStorage.setItem = vi.fn(() => {
        throw new Error('Storage error');
      });

      // setToLocalStorage catches errors silently, so importData succeeds
      // even though the actual storage failed
      const result = await storage.importData({
        workout_logs: { test: 'data' }
      });

      // In localStorage-only mode, set() always returns success
      // since setToLocalStorage catches errors
      expect(result.success).toBe(true);
    });
  });
});

describe('Storage with Supabase', () => {
  let mockSupabase;
  let localStorageMock;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Setup localStorage mock
    localStorageMock = {};
    global.localStorage = {
      getItem: vi.fn((key) => localStorageMock[key] || null),
      setItem: vi.fn((key, value) => { localStorageMock[key] = value; }),
      removeItem: vi.fn((key) => { delete localStorageMock[key]; }),
      clear: vi.fn(() => { localStorageMock = {}; })
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fall back to localStorage when Supabase is not ready', async () => {
    localStorageMock['test_key'] = 'local_value';

    const result = await storage.get('test_key');

    expect(result).toEqual({ value: 'local_value' });
  });
});
