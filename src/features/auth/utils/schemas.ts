import { z } from 'zod';

import { es } from '@/i18n/es';

export const loginSchema = z.object({
  email: z.email(es.auth.invalidEmail),
  password: z.string().min(8, es.auth.shortPassword),
});

export const registerSchema = z
  .object({
    email: z.email(es.auth.invalidEmail),
    password: z.string().min(8, es.auth.shortPassword),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: es.auth.confirmPasswordMismatch,
    path: ['confirmPassword'],
  });

export const recoverySchema = z.object({
  email: z.email(es.auth.invalidEmail),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, es.auth.shortPassword),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: es.auth.confirmPasswordMismatch,
    path: ['confirmPassword'],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type RecoveryInput = z.infer<typeof recoverySchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
