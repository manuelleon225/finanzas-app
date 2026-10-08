import type { AvailableTodayResult } from '../availableToday';
import { explainAvailable } from '../explain';

function makeResult(overrides: Partial<AvailableTodayResult> = {}): AvailableTodayResult {
  return {
    liquidBalance: 200000,
    committed: 50000,
    availableTotal: 150000,
    extraCushion: 0,
    availableBase: 150000,
    daysToIncome: 5,
    horizonDate: '2026-06-15',
    usedFallbackHorizon: false,
    spentToday: 0,
    allowanceToday: 30000,
    remainingToday: 30000,
    ...overrides,
  };
}

describe('explainAvailable', () => {
  it('devuelve 3 frases (sin colchón) con saldo, comprometidos y días', () => {
    const lines = explainAvailable(makeResult());
    expect(lines).toHaveLength(3);
    expect(lines[0]).toContain('cuentas para gastar');
    expect(lines[0]).toContain('200.000');
    expect(lines[1]).toContain('comprometidos');
    expect(lines[1]).toContain('50.000');
    expect(lines[2]).toContain('5 días');
  });

  it('si no hay ingreso recurrente explica el fallback', () => {
    const lines = explainAvailable(makeResult({ usedFallbackHorizon: true }));
    expect(lines).toHaveLength(3);
    expect(lines[2]).toContain('ingreso recurrente');
  });

  it('añade una 4ª frase cuando hay colchón extra', () => {
    const lines = explainAvailable(makeResult({ extraCushion: 12000 }));
    expect(lines).toHaveLength(4);
    expect(lines[3]).toContain('colchón de');
    expect(lines[3]).toContain('12.000');
  });
});
