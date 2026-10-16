export type MutationErrorKind = 'network' | 'server' | 'validation';

const NETWORK_PATTERN =
  /network request failed|failed to fetch|network error|timeout|econn|aborted|offline/i;

/**
 * Clasifica el error de una mutación para decidir cómo presentarlo:
 * - `network`: se cayó la red (se reintenta al reconectar).
 * - `validation`: error del cliente (4xx, datos o restricciones).
 * - `server`: error del servidor (5xx u otros).
 */
export function classifyMutationError(error: unknown): MutationErrorKind {
  if (error instanceof TypeError) {
    return 'network';
  }

  if (typeof error === 'string') {
    return NETWORK_PATTERN.test(error) ? 'network' : 'server';
  }

  if (!error || typeof error !== 'object') {
    return 'server';
  }

  const { message, code, status } = error as {
    message?: string;
    code?: string;
    status?: number;
  };

  if (message && NETWORK_PATTERN.test(message)) {
    return 'network';
  }

  if (typeof status === 'number') {
    if (status >= 500) {
      return 'server';
    }
    if (status >= 400) {
      return 'validation';
    }
  }

  if (code) {
    // 22xxx = data exception, 23xxx = integrity constraint (p. ej. 23505).
    if (/^2[23]/.test(code)) {
      return 'validation';
    }
    if (/^PGRST1/.test(code)) {
      return 'validation';
    }
    if (/^PGRST/.test(code) || /^5/.test(code)) {
      return 'server';
    }
  }

  return 'server';
}
