/**
 * useAuthentication - Manages authentication state
 */

import { useState, useCallback } from 'react';
import { verifyPassword, getActivePasswordHash } from '../utils/auth';

export function useAuthentication() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = useCallback(async (password) => {
    try {
      const hash = await getActivePasswordHash();
      const isValid = await verifyPassword(password, hash);

      if (isValid) {
        setIsAuthenticated(true);
        await window.storage.set('auth_state', 'authenticated');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    setIsAuthenticated(false);
    try {
      await window.storage.delete('auth_state');
    } catch (e) {
      // Ignore logout errors
    }
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const authResult = await window.storage.get('auth_state');
      if (authResult?.value === 'authenticated') {
        setIsAuthenticated(true);
        return true;
      }
    } catch (e) {
      console.error('Auth check error:', e);
    }
    return false;
  }, []);

  return {
    isAuthenticated,
    setIsAuthenticated,
    login,
    logout,
    checkAuth
  };
}
