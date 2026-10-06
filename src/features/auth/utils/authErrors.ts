import { es } from '@/i18n/es';

const KNOWN_ERRORS: Record<string, string> = {
  'Invalid login credentials': es.auth.errors.invalidCredentials,
  'Email not confirmed': es.auth.errors.emailNotConfirmed,
  'User already registered': es.auth.errors.emailAlreadyRegistered,
  'User not found': es.auth.errors.userNotFound,
  'rate limit exceeded': es.auth.errors.rateLimit,
};

export function translateAuthError(message: string): string {
  const lowerMessage = message.toLowerCase();
  const entry = Object.entries(KNOWN_ERRORS).find(([key]) =>
    lowerMessage.includes(key.toLowerCase()),
  );
  return entry ? entry[1] : es.auth.errors.generic;
}

export function errorToMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return translateAuthError(error.message);
  }
  return es.auth.errors.generic;
}
