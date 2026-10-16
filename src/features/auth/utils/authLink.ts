export type AuthLinkFlow = 'recovery' | 'confirmation';

export type AuthLinkErrorReason = 'expired' | 'invalid' | 'malformed';

export type AuthLinkSession = {
  kind: 'session';
  flow: AuthLinkFlow;
  code: string | null;
  accessToken: string | null;
  refreshToken: string | null;
};

export type AuthLinkFailure = {
  kind: 'error';
  flow: AuthLinkFlow | null;
  reason: AuthLinkErrorReason;
};

export type AuthLink = AuthLinkSession | AuthLinkFailure | { kind: 'none' };

const RECOVERY_TYPES = new Set(['recovery']);
const CONFIRMATION_TYPES = new Set(['signup', 'email', 'email_change', 'invite', 'magiclink']);
const RECOVERY_PATHS = new Set(['reset-password']);
const CONFIRMATION_PATHS = new Set(['confirm-email']);

function flowFromType(type: string | undefined): AuthLinkFlow | null {
  if (!type) {
    return null;
  }
  const value = type.toLowerCase();
  if (RECOVERY_TYPES.has(value)) {
    return 'recovery';
  }
  if (CONFIRMATION_TYPES.has(value)) {
    return 'confirmation';
  }
  return null;
}

function flowFromPath(url: string): AuthLinkFlow | null {
  const withoutHash = url.split('#')[0];
  const withoutQuery = withoutHash.split('?')[0];
  for (const segment of withoutQuery.split('/')) {
    const value = segment.toLowerCase();
    if (RECOVERY_PATHS.has(value)) {
      return 'recovery';
    }
    if (CONFIRMATION_PATHS.has(value)) {
      return 'confirmation';
    }
  }
  return null;
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value.replace(/\+/g, ' '));
  } catch {
    return value;
  }
}

function parseSegment(segment: string): Record<string, string> {
  const params: Record<string, string> = {};
  for (const pair of segment.split('&')) {
    if (!pair) {
      continue;
    }
    const separator = pair.indexOf('=');
    const rawKey = separator === -1 ? pair : pair.slice(0, separator);
    const rawValue = separator === -1 ? '' : pair.slice(separator + 1);
    params[safeDecode(rawKey)] = safeDecode(rawValue);
  }
  return params;
}

function parseParams(url: string): Record<string, string> {
  const hashIndex = url.indexOf('#');
  const queryIndex = url.indexOf('?');
  const querySegment =
    queryIndex === -1
      ? ''
      : url.slice(
          queryIndex + 1,
          hashIndex !== -1 && hashIndex > queryIndex ? hashIndex : undefined,
        );
  const hashSegment = hashIndex === -1 ? '' : url.slice(hashIndex + 1);
  return { ...parseSegment(querySegment), ...parseSegment(hashSegment) };
}

/**
 * Parsea una URL entrante (deep link) y la clasifica: recuperación de contraseña,
 * confirmación de correo, enlace inválido/vencido o algo distinto a auth.
 * Función pura, sin dependencias de React Native ni del cliente de Supabase.
 */
export function parseAuthLink(url: string | null | undefined): AuthLink {
  if (typeof url !== 'string') {
    return { kind: 'none' };
  }
  const trimmed = url.trim();
  if (!trimmed || !trimmed.includes('://')) {
    return { kind: 'none' };
  }

  const params = parseParams(trimmed);
  const flow = flowFromType(params.type) ?? flowFromPath(trimmed);

  const errorText =
    `${params.error_code ?? ''} ${params.error_description ?? ''} ${params.error ?? ''}`.toLowerCase();
  if (errorText.trim().length > 0) {
    const reason: AuthLinkErrorReason = errorText.includes('expired') ? 'expired' : 'invalid';
    return { kind: 'error', flow, reason };
  }

  const code = params.code ?? null;
  const accessToken = params.access_token ?? null;
  const refreshToken = params.refresh_token ?? null;

  if (flow) {
    if (code || accessToken) {
      return { kind: 'session', flow, code, accessToken, refreshToken };
    }
    return { kind: 'error', flow, reason: 'malformed' };
  }

  if (code || accessToken) {
    return { kind: 'session', flow: 'confirmation', code, accessToken, refreshToken };
  }

  return { kind: 'none' };
}
