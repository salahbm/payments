import { expect, test } from '@playwright/test';

const demoUser = {
  id: 'usr_demo',
  email: 'demo@hopae.com',
  name: 'Demo Merchant',
};

test('redirects protected root to localized sign in', async ({ page }) => {
  await page.goto('/en');

  await expect(page).toHaveURL(/\/en\/sign-in$/);
  await expect(
    page.getByRole('heading', { name: 'Welcome back' }),
  ).toBeVisible();
});

test('health endpoint reports ok', async ({ request }) => {
  const response = await request.get('/api/health');
  const body = await response.json();

  expect(response.ok()).toBeTruthy();
  expect(body).toEqual(expect.objectContaining({ status: 'ok' }));
});

test('signs in with demo credentials and opens the dashboard', async ({
  page,
}) => {
  await page.route('**/api/auth/sign-in', async (route) => {
    const request = route.request();
    const payload = request.postDataJSON();

    expect(payload).toEqual({
      email: 'demo@hopae.com',
      password: 'password123',
    });

    await route.fulfill({
      status: 200,
      headers: {
        'content-type': 'application/json',
        'set-cookie':
          'PROJECT_ACCESS_TOKEN=e2e-token; Path=/; HttpOnly; SameSite=Strict',
      },
      body: JSON.stringify({
        message: 'Login successful',
        data: {
          user: demoUser,
        },
      }),
    });
  });

  await page.goto('/en/sign-in');
  await page.getByLabel('Email').fill('demo@hopae.com');
  await page.getByPlaceholder('Enter your password').fill('password123');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/\/en$/);
  await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible();
});

test('shows clear feedback when sign in fails', async ({ page }) => {
  await page.route('**/api/auth/sign-in', async (route) => {
    await route.fulfill({
      status: 401,
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Unauthorized',
        data: {
          error: 'Invalid email or password',
        },
      }),
    });
  });

  await page.goto('/en/sign-in');
  await page.getByLabel('Email').fill('demo@hopae.com');
  await page.getByPlaceholder('Enter your password').fill('wrong-password');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/\/en\/sign-in$/);
  await expect(page.getByText('Invalid email or password')).toBeVisible();
});
