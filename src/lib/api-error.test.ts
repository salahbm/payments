import { describe, expect, it } from 'vitest';

import { ApiError } from './api-error';

describe('ApiError', () => {
  it('uses nested backend error as message', () => {
    const error = new ApiError(401, 'Unauthorized', {
      message: 'Unauthorized',
      data: {
        error: 'Invalid email or password',
      },
    });

    expect(error.message).toBe('Invalid email or password');
    expect(error.responseMessage).toBe('Unauthorized');
  });

  it('falls back to the response message', () => {
    const error = new ApiError(500, 'Internal server error');

    expect(error.message).toBe('Internal server error');
  });
});
