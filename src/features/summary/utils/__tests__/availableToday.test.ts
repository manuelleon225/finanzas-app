import {
  calculateAvailableToday,
  type AvailableTodayInput,
  type AvailableTodayRule,
  type AvailableTodayTransaction,
} from '../availableToday';

const rule = (overrides: Partial<AvailableTodayRule>): AvailableTodayRule => ({
  type: 'income',
  nature: 'base',
  amount: 1000000,
  frequency: 'monthly',
  start_date: '2026-01-05',
  end_date: null,
  is_active: true,
  ...overrides,
});

const tx = (overrides: Partial<AvailableTodayTransaction>): AvailableTodayTransaction => ({
  type: 'expense',
  nature: 'base',
  amount: 0,
  occurred_on: '2026-06-10',
  ...overrides,
});

const input = (overrides: Partial<AvailableTodayInput>): AvailableTodayInput => ({
  today: '2026-06-10',
  accounts: [],
  rules: [],
  pendingExpenses: 0,
  monthTransactions: [],
  includeExtras: false,
  ...overrides,
});

describe('calculateAvailableToday', () => {
  it('sin reglas: horizonte = primer día del mes siguiente y fallback true', () => {
    const result = calculateAvailableToday(input({}));
    expect(result.usedFallbackHorizon).toBe(true);
    expect(result.horizonDate).toBe('2026-07-01');
    expect(result.daysToIncome).toBe(21);
    expect(result.liquidBalance).toBe(0);
    expect(result.allowanceToday).toBe(0);
  });

  it('ingreso quincenal (semimonthly): horizonte el día 15', () => {
    const result = calculateAvailableToday(
      input({ rules: [rule({ frequency: 'semimonthly', start_date: '2026-01-15' })] }),
    );
    expect(result.horizonDate).toBe('2026-06-15');
    expect(result.daysToIncome).toBe(5);
    expect(result.usedFallbackHorizon).toBe(false);
  });

  it('ingreso quincenal con hoy = día 14 → 1 día al pago', () => {
    const result = calculateAvailableToday(
      input({
        today: '2026-06-14',
        rules: [rule({ frequency: 'semimonthly', start_date: '2026-01-15' })],
      }),
    );
    expect(result.horizonDate).toBe('2026-06-15');
    expect(result.daysToIncome).toBe(1);
  });

  it('ingreso quincenal con hoy = día 15 → próximo pago el último día (15 días)', () => {
    const result = calculateAvailableToday(
      input({
        today: '2026-06-15',
        rules: [rule({ frequency: 'semimonthly', start_date: '2026-01-15' })],
      }),
    );
    expect(result.horizonDate).toBe('2026-06-30');
    expect(result.daysToIncome).toBe(15);
  });

  it('ingreso quincenal con hoy = día 29 → 1 día al pago', () => {
    const result = calculateAvailableToday(
      input({
        today: '2026-06-29',
        rules: [rule({ frequency: 'semimonthly', start_date: '2026-01-15' })],
      }),
    );
    expect(result.horizonDate).toBe('2026-06-30');
    expect(result.daysToIncome).toBe(1);
  });

  it('ingreso mensual: horizonte el próximo mes', () => {
    const result = calculateAvailableToday(input({ rules: [rule({ start_date: '2026-06-05' })] }));
    expect(result.horizonDate).toBe('2026-07-05');
    expect(result.daysToIncome).toBe(25);
  });

  it('ignora las cuentas no líquidas', () => {
    const result = calculateAvailableToday(
      input({
        accounts: [
          { balance: 100000, countsAsLiquid: true },
          { balance: 900000, countsAsLiquid: false },
        ],
      }),
    );
    expect(result.liquidBalance).toBe(100000);
  });

  it('los gastos comprometidos restan del disponible', () => {
    const result = calculateAvailableToday(
      input({
        accounts: [{ balance: 200000, countsAsLiquid: true }],
        rules: [
          rule({ type: 'income', start_date: '2026-06-15' }),
          rule({ type: 'expense', amount: 30000, start_date: '2026-06-11' }),
        ],
      }),
    );
    expect(result.committed).toBe(30000);
    expect(result.availableTotal).toBe(170000);
  });

  it('disponible negativo da allowance y remaining en 0', () => {
    const result = calculateAvailableToday(
      input({
        accounts: [{ balance: 100000, countsAsLiquid: true }],
        rules: [
          rule({ type: 'income', start_date: '2026-06-15' }),
          rule({ type: 'expense', amount: 250000, start_date: '2026-06-11' }),
        ],
      }),
    );
    expect(result.availableTotal).toBe(-150000);
    expect(result.allowanceToday).toBe(0);
    expect(result.remainingToday).toBe(0);
  });

  it('includeExtras true: availableBase = availableTotal', () => {
    const result = calculateAvailableToday(
      input({
        accounts: [{ balance: 100000, countsAsLiquid: true }],
        monthTransactions: [
          tx({ type: 'income', nature: 'extra', amount: 60000 }),
          tx({ type: 'expense', nature: 'extra', amount: 10000 }),
        ],
        includeExtras: true,
      }),
    );
    expect(result.extraCushion).toBe(50000);
    expect(result.availableTotal).toBe(100000);
    expect(result.availableBase).toBe(100000);
  });

  it('includeExtras false: availableBase resta el colchón', () => {
    const result = calculateAvailableToday(
      input({
        accounts: [{ balance: 100000, countsAsLiquid: true }],
        monthTransactions: [
          tx({ type: 'income', nature: 'extra', amount: 60000 }),
          tx({ type: 'expense', nature: 'extra', amount: 10000 }),
        ],
        includeExtras: false,
      }),
    );
    expect(result.availableBase).toBe(50000);
  });

  it('colchón extra mayor que el disponible → sin margen (0)', () => {
    const result = calculateAvailableToday(
      input({
        accounts: [{ balance: 100000, countsAsLiquid: true }],
        monthTransactions: [tx({ type: 'income', nature: 'extra', amount: 120000 })],
        includeExtras: false,
      }),
    );
    expect(result.availableBase).toBe(-20000);
    expect(result.allowanceToday).toBe(0);
  });

  it('el gasto de hoy reduce remainingToday pero no allowanceToday', () => {
    const result = calculateAvailableToday(
      input({
        accounts: [{ balance: 100000, countsAsLiquid: true }],
        rules: [rule({ start_date: '2026-06-12' })],
        monthTransactions: [tx({ amount: 20000 })],
      }),
    );
    expect(result.daysToIncome).toBe(2);
    expect(result.allowanceToday).toBe(60000);
    expect(result.remainingToday).toBe(40000);
    expect(result.allowanceToday - result.remainingToday).toBe(20000);
  });

  it('último día del mes con fallback: daysToIncome = 1', () => {
    const result = calculateAvailableToday(
      input({
        today: '2026-06-30',
        accounts: [{ balance: 50000, countsAsLiquid: true }],
      }),
    );
    expect(result.usedFallbackHorizon).toBe(true);
    expect(result.horizonDate).toBe('2026-07-01');
    expect(result.daysToIncome).toBe(1);
    expect(result.allowanceToday).toBe(50000);
  });

  it('ignora reglas inactivas (ingreso y gasto)', () => {
    const result = calculateAvailableToday(
      input({
        rules: [
          rule({ is_active: false }),
          rule({ type: 'expense', amount: 1000000000, start_date: '2026-06-11', is_active: false }),
        ],
      }),
    );
    expect(result.usedFallbackHorizon).toBe(true);
    expect(result.committed).toBe(0);
  });

  it('ignora reglas de gasto con end_date vencida', () => {
    const result = calculateAvailableToday(
      input({
        accounts: [{ balance: 100000, countsAsLiquid: true }],
        rules: [
          rule({ type: 'income', start_date: '2026-06-15' }),
          rule({
            type: 'expense',
            amount: 30000,
            start_date: '2026-01-11',
            end_date: '2026-05-01',
          }),
        ],
      }),
    );
    expect(result.committed).toBe(0);
    expect(result.availableTotal).toBe(100000);
  });

  it('pendingExpenses restan del disponible', () => {
    const result = calculateAvailableToday(
      input({
        accounts: [{ balance: 100000, countsAsLiquid: true }],
        pendingExpenses: 15000,
      }),
    );
    expect(result.committed).toBe(15000);
    expect(result.availableTotal).toBe(85000);
  });

  it('las transferencias no cuentan como gasto ni para el colchón', () => {
    const result = calculateAvailableToday(
      input({
        today: '2026-06-10',
        monthTransactions: [
          tx({ type: 'transfer', nature: null, amount: 999999, occurred_on: '2026-06-10' }),
        ],
      }),
    );
    expect(result.spentToday).toBe(0);
    expect(result.extraCushion).toBe(0);
  });

  it('varias reglas de ingreso: usa la ocurrencia más cercana', () => {
    const result = calculateAvailableToday(
      input({
        rules: [rule({ start_date: '2026-06-15' }), rule({ start_date: '2026-06-12' })],
      }),
    );
    expect(result.horizonDate).toBe('2026-06-12');
    expect(result.daysToIncome).toBe(2);
  });

  it('caso integrado completo', () => {
    const result = calculateAvailableToday(
      input({
        accounts: [{ balance: 500000, countsAsLiquid: true }],
        rules: [
          rule({ start_date: '2026-06-20' }),
          rule({ type: 'expense', amount: 40000, start_date: '2026-06-11' }),
        ],
        monthTransactions: [
          tx({ type: 'income', nature: 'extra', amount: 30000 }),
          tx({ type: 'expense', nature: 'extra', amount: 5000 }),
          tx({ amount: 15000 }),
        ],
        includeExtras: false,
      }),
    );
    expect(result.horizonDate).toBe('2026-06-20');
    expect(result.daysToIncome).toBe(10);
    expect(result.committed).toBe(40000);
    expect(result.availableTotal).toBe(460000);
    expect(result.extraCushion).toBe(25000);
    expect(result.availableBase).toBe(435000);
    expect(result.spentToday).toBe(20000);
    expect(result.allowanceToday).toBe(45500);
    expect(result.remainingToday).toBe(25500);
  });
});
