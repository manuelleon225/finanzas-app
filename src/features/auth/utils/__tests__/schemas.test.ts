import { es } from '@/i18n/es';

import { loginSchema, recoverySchema, registerSchema } from '../schemas';

describe('loginSchema', () => {
  it('acepta un correo y una contraseña válidos', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', password: '12345678' });
    expect(result.success).toBe(true);
  });

  it('rechaza un correo inválido', () => {
    const result = loginSchema.safeParse({ email: 'no-es-correo', password: '12345678' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(es.auth.invalidEmail);
    }
  });

  it('rechaza una contraseña corta', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', password: '1234' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(es.auth.shortPassword);
    }
  });
});

describe('registerSchema', () => {
  it('acepta cuando las contraseñas coinciden', () => {
    const result = registerSchema.safeParse({
      email: 'a@b.com',
      password: '12345678',
      confirmPassword: '12345678',
    });
    expect(result.success).toBe(true);
  });

  it('rechaza cuando las contraseñas no coinciden', () => {
    const result = registerSchema.safeParse({
      email: 'a@b.com',
      password: '12345678',
      confirmPassword: '87654321',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(es.auth.confirmPasswordMismatch);
    }
  });
});

describe('recoverySchema', () => {
  it('acepta un correo válido', () => {
    expect(recoverySchema.safeParse({ email: 'a@b.com' }).success).toBe(true);
  });

  it('rechaza un correo inválido', () => {
    expect(recoverySchema.safeParse({ email: 'nope' }).success).toBe(false);
  });
});
