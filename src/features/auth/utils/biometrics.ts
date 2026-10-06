export const LOCK_DELAY_MS = 30_000;

export type ShouldLockParams = {
  enabled: boolean;
  backgroundedAt: number | null;
  now: number;
  delayMs?: number;
};

export function shouldLock({
  enabled,
  backgroundedAt,
  now,
  delayMs = LOCK_DELAY_MS,
}: ShouldLockParams): boolean {
  if (!enabled || backgroundedAt == null) {
    return false;
  }
  return now - backgroundedAt >= delayMs;
}
