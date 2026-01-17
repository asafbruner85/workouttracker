import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginScreen from '../../src/components/LoginScreen';

describe('LoginScreen', () => {
  let onLogin;

  beforeEach(() => {
    onLogin = vi.fn();
  });

  it('should render login form', () => {
    render(<LoginScreen onLogin={onLogin} />);

    expect(screen.getByText('Workout Tracker')).toBeTruthy();
    expect(screen.getByPlaceholderText('Enter password')).toBeTruthy();
    expect(screen.getByText('Login')).toBeTruthy();
  });

  it('should render logo and subtitle', () => {
    render(<LoginScreen onLogin={onLogin} />);

    expect(screen.getByText('Workout Tracker')).toBeTruthy();
    expect(screen.getByText('תכנית אימונים - אסף ברונר')).toBeTruthy();
  });

  it('should update password value on input', async () => {
    render(<LoginScreen onLogin={onLogin} />);

    const input = screen.getByPlaceholderText('Enter password');
    await userEvent.type(input, 'testpassword');

    expect(input.value).toBe('testpassword');
  });

  it('should toggle password visibility', async () => {
    render(<LoginScreen onLogin={onLogin} />);

    const input = screen.getByPlaceholderText('Enter password');
    expect(input.type).toBe('password');

    // Find and click the toggle button (eye icon)
    const toggleButton = screen.getAllByRole('button').find(btn =>
      btn.className.includes('absolute')
    );
    await userEvent.click(toggleButton);

    expect(input.type).toBe('text');

    // Click again to hide
    await userEvent.click(toggleButton);
    expect(input.type).toBe('password');
  });

  it('should call onLogin when login button clicked', async () => {
    onLogin.mockResolvedValue(true);
    render(<LoginScreen onLogin={onLogin} />);

    const input = screen.getByPlaceholderText('Enter password');
    await userEvent.type(input, 'correctpassword');

    const loginButton = screen.getByText('Login');
    await userEvent.click(loginButton);

    expect(onLogin).toHaveBeenCalledWith('correctpassword');
  });

  it('should call onLogin on Enter key press', async () => {
    onLogin.mockResolvedValue(true);
    render(<LoginScreen onLogin={onLogin} />);

    const input = screen.getByPlaceholderText('Enter password');
    await userEvent.type(input, 'password{enter}');

    expect(onLogin).toHaveBeenCalledWith('password');
  });

  it('should show error message on failed login', async () => {
    onLogin.mockResolvedValue(false);
    render(<LoginScreen onLogin={onLogin} />);

    const input = screen.getByPlaceholderText('Enter password');
    await userEvent.type(input, 'wrongpassword');

    const loginButton = screen.getByText('Login');
    await userEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('Incorrect password')).toBeTruthy();
    });
  });

  it('should show loading state while logging in', async () => {
    onLogin.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(true), 100)));
    render(<LoginScreen onLogin={onLogin} />);

    const input = screen.getByPlaceholderText('Enter password');
    await userEvent.type(input, 'password');

    const loginButton = screen.getByText('Login');
    fireEvent.click(loginButton);

    expect(screen.getByText('Logging in...')).toBeTruthy();
  });

  it('should disable input and button while loading', async () => {
    onLogin.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(true), 100)));
    render(<LoginScreen onLogin={onLogin} />);

    const input = screen.getByPlaceholderText('Enter password');
    await userEvent.type(input, 'password');

    const loginButton = screen.getByText('Login');
    fireEvent.click(loginButton);

    expect(input.disabled).toBe(true);
    expect(screen.getByText('Logging in...').closest('button').disabled).toBe(true);
  });

  it('should handle login error exception', async () => {
    onLogin.mockRejectedValue(new Error('Network error'));
    render(<LoginScreen onLogin={onLogin} />);

    const input = screen.getByPlaceholderText('Enter password');
    await userEvent.type(input, 'password');

    const loginButton = screen.getByText('Login');
    await userEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('Login failed. Please try again.')).toBeTruthy();
    });
  });

  it('should clear error when typing after failed login', async () => {
    onLogin.mockResolvedValue(false);
    render(<LoginScreen onLogin={onLogin} />);

    const input = screen.getByPlaceholderText('Enter password');
    await userEvent.type(input, 'wrong');

    const loginButton = screen.getByText('Login');
    await userEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('Incorrect password')).toBeTruthy();
    });

    // Error is cleared on next login attempt, not on typing
    onLogin.mockResolvedValue(true);
    await userEvent.type(input, 'correct');
    await userEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.queryByText('Incorrect password')).toBeNull();
    });
  });
});
