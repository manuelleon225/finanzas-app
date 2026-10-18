import { buildLineChartLayout, cumulativeBalanceByDay, nearestIndex } from '../cashFlow';

describe('cumulativeBalanceByDay', () => {
  it('mes sin movimientos devuelve ceros', () => {
    const points = cumulativeBalanceByDay({
      transactions: [],
      month: '2026-09-01',
      today: '2026-10-07',
    });
    expect(points).toHaveLength(30);
    expect(points.every((point) => point.balance === 0)).toBe(true);
  });

  it('un solo día', () => {
    const points = cumulativeBalanceByDay({
      transactions: [{ type: 'income', status: 'posted', amount: 100, occurred_on: '2026-09-05' }],
      month: '2026-09-01',
      today: '2026-10-07',
    });
    expect(points[4].balance).toBe(100);
  });

  it('ignora transferencias y pendientes', () => {
    const points = cumulativeBalanceByDay({
      transactions: [
        { type: 'transfer', status: 'posted', amount: 50, occurred_on: '2026-09-02' },
        { type: 'expense', status: 'pending', amount: 20, occurred_on: '2026-09-02' },
        { type: 'expense', status: 'posted', amount: 10, occurred_on: '2026-09-02' },
      ],
      month: '2026-09-01',
      today: '2026-10-07',
    });
    expect(points[1].balance).toBe(-10);
  });

  it('mes actual solo hasta hoy', () => {
    const points = cumulativeBalanceByDay({
      transactions: [],
      month: '2026-10-01',
      today: '2026-10-05',
    });
    expect(points).toHaveLength(5);
  });

  it('mes pasado completo', () => {
    const points = cumulativeBalanceByDay({
      transactions: [],
      month: '2026-09-01',
      today: '2026-10-07',
    });
    expect(points).toHaveLength(30);
  });
});

describe('buildLineChartLayout', () => {
  it('dominio plano usa [-1, 1]', () => {
    const layout = buildLineChartLayout({
      points: [{ day: 1, balance: 0 }],
      width: 100,
      height: 100,
    });
    expect(layout.zeroY).not.toBeNull();
  });

  it('crace por cero: zeroY presente', () => {
    const layout = buildLineChartLayout({
      points: [
        { day: 1, balance: -10 },
        { day: 2, balance: 10 },
      ],
      width: 100,
      height: 100,
    });
    expect(layout.zeroY).not.toBeNull();
  });

  it('siempre positivo: zeroY en borde inferior (null o 0?)', () => {
    const layout = buildLineChartLayout({
      points: [
        { day: 1, balance: 5 },
        { day: 2, balance: 10 },
      ],
      width: 100,
      height: 100,
    });
    // 0 queda dentro del dominio expandido
    expect(layout.zeroY).not.toBeNull();
  });

  it('un solo punto x en centro', () => {
    const layout = buildLineChartLayout({
      points: [{ day: 1, balance: 5 }],
      width: 100,
      height: 100,
    });
    expect(layout.coordinates[0].x).toBe(50);
  });

  it('nearestIndex en extremos', () => {
    const coords = [
      { x: 10, y: 0 },
      { x: 50, y: 0 },
      { x: 90, y: 0 },
    ];
    expect(nearestIndex(0, coords)).toBe(0);
    expect(nearestIndex(100, coords)).toBe(2);
  });

  it('nearestIndex en el centro', () => {
    const coords = [
      { x: 10, y: 0 },
      { x: 50, y: 0 },
      { x: 90, y: 0 },
    ];
    expect(nearestIndex(50, coords)).toBe(1);
  });
});
