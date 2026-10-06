import { es } from '@/i18n/es';

import { translateAuthError } from '../authErrors';

describe('translateAuthError', () => {
  it('traduce credenciales inválidas', () => {
    expect(translateAuthError('Invalid login credentials')).toBe(es.auth.errors.invalidCredentials);
  });

  it('traduce email ya registrado', () => {
    expect(translateAuthError('User already registered')).toBe(
      es.auth.errors.emailAlreadyRegistered,
    );
  });

  it('traduce email sin confirmar', () => {
    expect(translateAuthError('Email not confirmed')).toBe(es.auth.errors.emailNotConfirmed);
  });

  it('traduce límite de intentos', () => {
    expect(translateAuthError('Email rate limit exceeded')).toBe(es.auth.errors.rateLimit);
  });

  it('devuelve un error genérico para mensajes desconocidos', () => {
    expect(translateAuthError('Algo raro pasó')).toBe(es.auth.errors.generic);
  });
});
