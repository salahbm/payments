import { z } from 'zod';

import { PASSWORD_REGEX } from '@/utils/regex';
import { required } from '@/utils/zod-locale';

export const usernameSchema = required(
  z.string().refine((v) => /^[a-zA-Z0-9_ ]+$/.test(v), {
    params: { customCode: 'custom.username_invalid' },
  }),
);

export const emailSchema = z.email();
export const passwordSchema = required(
  z.string().refine((v) => PASSWORD_REGEX.test(v), {
    params: { customCode: 'custom.password_invalid' },
  }),
);
export const confirmPasswordSchema = required(z.string());

// ───────────────── SIGN IN SCHEMA ────────────────── //

export const signInSchema = z
  .object({
    email: z.string().optional(),
    password: z.string().min(6),
  })
  .superRefine((data, ctx) => {
    if (!data.email) {
      ctx.addIssue({
        path: ['email'],
        code: 'custom',
        params: { customCode: 'custom.required' },
      });
    } else if (data.email) {
      const result = emailSchema.safeParse(data.email);
      if (!result.success) {
        ctx.addIssue({
          path: ['email'],
          code: 'custom',
          params: { customCode: 'custom.email_invalid' },
        });
      }
    }
  });

export type SignInType = z.infer<typeof signInSchema>;
