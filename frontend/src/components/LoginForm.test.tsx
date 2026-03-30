import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LoginForm from './LoginForm';

const mutateAsync = vi.fn();

vi.mock('../hooks/useApiMutations', () => ({
  useLoginMutation: () => ({
    isPending: false,
    mutateAsync,
  }),
}));

describe('LoginForm', () => {
  beforeEach(() => {
    mutateAsync.mockReset();
  });

  it('renders validation feedback for invalid credentials', async () => {
    const user = userEvent.setup();

    render(<LoginForm onLoginSuccess={vi.fn()} />);

    const emailInput = screen.getByLabelText(/email address/i);
    await user.clear(emailInput);
    await user.type(emailInput, 'not-an-email');
    await user.click(screen.getByRole('button', { name: /login/i }));

    expect(await screen.findByText('Email is invalid')).toBeInTheDocument();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it('submits valid credentials', async () => {
    const user = userEvent.setup();
    const onLoginSuccess = vi.fn();
    mutateAsync.mockResolvedValue({ access_token: 'token' });

    render(<LoginForm onLoginSuccess={onLoginSuccess} />);

    await user.click(screen.getByRole('button', { name: /login/i }));

    expect(mutateAsync).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    });
    expect(onLoginSuccess).toHaveBeenCalledTimes(1);
  });
});