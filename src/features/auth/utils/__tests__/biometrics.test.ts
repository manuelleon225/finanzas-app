import { LOCK_DELAY_MS, shouldLock } from '../biometrics';

describe('shouldLock', () => {
  it('no bloquea si la biometría no está activada', () => {
    expect(shouldLock({ enabled: false, backgroundedAt: 0, now: LOCK_DELAY_MS + 60000 })).toBe(
      false,
    );
  });

  it('no bloquea si nunca pasó a segundo plano', () => {
    expect(shouldLock({ enabled: true, backgroundedAt: null, now: Date.now() })).toBe(false);
  });

  it('no bloquea antes de cumplirse el tiempo de espera', () => {
    expect(shouldLock({ enabled: true, backgroundedAt: 0, now: LOCK_DELAY_MS - 1000 })).toBe(false);
  });

  it('bloquea justo al cumplirse el tiempo de espera', () => {
    expect(shouldLock({ enabled: true, backgroundedAt: 0, now: LOCK_DELAY_MS })).toBe(true);
  });

  it('bloquea después del tiempo de espera', () => {
    expect(shouldLock({ enabled: true, backgroundedAt: 0, now: LOCK_DELAY_MS + 5000 })).toBe(true);
  });

  it('respeta un tiempo de espera personalizado', () => {
    expect(shouldLock({ enabled: true, backgroundedAt: 0, now: 60_000, delayMs: 30_000 })).toBe(
      true,
    );
    expect(shouldLock({ enabled: true, backgroundedAt: 0, now: 10_000, delayMs: 30_000 })).toBe(
      false,
    );
  });
});
