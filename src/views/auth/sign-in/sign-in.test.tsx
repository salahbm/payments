import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import messages from '@/messages/en.json';

import { SignInView } from '.';

const push = vi.fn();
const signIn = vi.fn();

vi.mock('@/i18n/routing', () => ({
  Link: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={String(href)} {...props}>
      {children}
    </a>
  ),
  useRouter: () => ({
    push,
  }),
}));

vi.mock('@/hooks/auth/use-sign-in', () => ({
  useSignIn: () => ({
    isPending: false,
    mutate: signIn,
  }),
}));

const renderSignIn = () =>
  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <SignInView />
    </NextIntlClientProvider>,
  );

describe('SignInView', () => {
  beforeEach(() => {
    push.mockReset();
    signIn.mockReset();
  });

  it('submits credentials and navigates home on success', async () => {
    const user = userEvent.setup();

    signIn.mockImplementation((_values, options) => {
      options?.onSuccess?.();
    });

    renderSignIn();

    await user.type(screen.getByLabelText('Email'), 'demo@hopae.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(signIn).toHaveBeenCalledWith(
      {
        email: 'demo@hopae.com',
        password: 'password123',
      },
      expect.objectContaining({
        onSuccess: expect.any(Function),
      }),
    );
    expect(push).toHaveBeenCalledWith('/');
  });

  it('does not submit invalid credentials', async () => {
    const user = userEvent.setup();

    renderSignIn();

    await user.type(screen.getByLabelText('Email'), 'not-an-email');
    await user.type(screen.getByLabelText('Password'), '123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(signIn).not.toHaveBeenCalled();
    });
  });
});
