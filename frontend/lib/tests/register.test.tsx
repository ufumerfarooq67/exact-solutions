// lib/tests/register.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Register from '@/app/register/page'; // Adjust path if needed
import { AuthProvider } from '@/lib/contexts/auth-context';

global.fetch = jest.fn();
const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/lib/hooks/use-toast', () => ({
  useToast: () => ({ toast: jest.fn() }),
}));

describe('Register Page - Full Integration Test', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    mockPush.mockReset();
  });

  it('renders register form correctly', () => {
    render(
      <AuthProvider>
        <Register />
      </AuthProvider>
    );

    expect(screen.getByText('Join TaskFlow')).toBeInTheDocument();
    expect(screen.getByTestId('input-name')).toBeInTheDocument();
    expect(screen.getByTestId('input-email')).toBeInTheDocument();
    expect(screen.getByTestId('input-password')).toBeInTheDocument();
    expect(screen.getByTestId('button-register')).toHaveTextContent('Create Account');
    expect(screen.getByTestId('link-login')).toBeInTheDocument();
  });

  it('successfully registers new user and redirects to dashboard', async () => {
    const user = userEvent.setup();

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access_token: 'fake-jwt-456',
        user: { id: 2, name: 'John Doe', email: 'john@example.com', role: 'user' },
      }),
    });

    render(
      <AuthProvider>
        <Register />
      </AuthProvider>
    );

    await user.type(screen.getByTestId('input-name'), 'John Doe');
    await user.type(screen.getByTestId('input-email'), 'john@example.com');
    await user.type(screen.getByTestId('input-password'), 'secret123');

    await user.click(screen.getByTestId('button-register'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/auth/register'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'secret123',
            role: 'user',
          }),
        })
      );

      expect(localStorage.getItem('token')).toBe('fake-jwt-456');
      expect(localStorage.getItem('user')).toContain('john@example.com');
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows error toast on failed registration', async () => {
    const user = userEvent.setup();
    const mockToast = jest.fn();
    jest.spyOn(require('@/lib/hooks/use-toast'), 'useToast').mockReturnValue({
      toast: mockToast,
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Email already exists' }),
    });

    render(
      <AuthProvider>
        <Register />
      </AuthProvider>
    );

    await user.type(screen.getByTestId('input-name'), 'John Doe');
    await user.type(screen.getByTestId('input-email'), 'taken@example.com');
    await user.type(screen.getByTestId('input-password'), 'password123');
    await user.click(screen.getByTestId('button-register'));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Registration failed',
          description: 'Email already exists',
          variant: 'destructive',
        })
      );
    });
  });
});