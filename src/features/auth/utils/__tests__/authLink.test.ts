import { parseAuthLink } from '../authLink';

describe('parseAuthLink', () => {
  it('clasifica un enlace de recuperación con código PKCE', () => {
    const link = parseAuthLink('finanzas://reset-password?code=abc123');
    expect(link).toEqual({
      kind: 'session',
      flow: 'recovery',
      code: 'abc123',
      accessToken: null,
      refreshToken: null,
    });
  });

  it('clasifica un enlace de confirmación con código PKCE', () => {
    const link = parseAuthLink('finanzas://confirm-email?code=xyz789');
    expect(link.kind).toBe('session');
    if (link.kind === 'session') {
      expect(link.flow).toBe('confirmation');
      expect(link.code).toBe('xyz789');
    }
  });

  it('reconoce el enlace de Expo Go con el segmento /--/', () => {
    const link = parseAuthLink('exp://127.0.0.1:8081/--/reset-password?code=abc');
    expect(link.kind).toBe('session');
    if (link.kind === 'session') {
      expect(link.flow).toBe('recovery');
    }
  });

  it('usa el parámetro type cuando la ruta no es reconocible', () => {
    const link = parseAuthLink('finanzas://?type=recovery&code=abc');
    expect(link.kind).toBe('session');
    if (link.kind === 'session') {
      expect(link.flow).toBe('recovery');
    }
  });

  it('clasifica un enlace implícito con tokens en el hash', () => {
    const link = parseAuthLink(
      'finanzas://reset-password#access_token=tok&refresh_token=ref&type=recovery',
    );
    expect(link).toEqual({
      kind: 'session',
      flow: 'recovery',
      code: null,
      accessToken: 'tok',
      refreshToken: 'ref',
    });
  });

  it('marca como vencido un enlace con error otp_expired', () => {
    const link = parseAuthLink(
      'finanzas://reset-password?error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired',
    );
    expect(link).toEqual({ kind: 'error', flow: 'recovery', reason: 'expired' });
  });

  it('marca como inválido un enlace con error de otro tipo', () => {
    const link = parseAuthLink('finanzas://reset-password?error=access_denied&error_code=other');
    expect(link).toEqual({ kind: 'error', flow: 'recovery', reason: 'invalid' });
  });

  it('marca como mal formado un enlace de recuperación sin código ni error', () => {
    const link = parseAuthLink('finanzas://reset-password');
    expect(link).toEqual({ kind: 'error', flow: 'recovery', reason: 'malformed' });
  });

  it('marca como mal formado un enlace de confirmación sin código ni error', () => {
    const link = parseAuthLink('finanzas://confirm-email');
    expect(link).toEqual({ kind: 'error', flow: 'confirmation', reason: 'malformed' });
  });

  it('ignora un deep link que no es de autenticación', () => {
    expect(parseAuthLink('finanzas://profile?tab=accounts')).toEqual({ kind: 'none' });
    expect(parseAuthLink('finanzas://settings')).toEqual({ kind: 'none' });
  });

  it('ignora cadenas que no son URLs', () => {
    expect(parseAuthLink('no es una url')).toEqual({ kind: 'none' });
    expect(parseAuthLink('')).toEqual({ kind: 'none' });
    expect(parseAuthLink(null)).toEqual({ kind: 'none' });
    expect(parseAuthLink(undefined)).toEqual({ kind: 'none' });
  });
});
