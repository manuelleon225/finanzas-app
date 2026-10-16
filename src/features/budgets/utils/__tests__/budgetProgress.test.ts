import {
  calculateBudgetProgress,
  statusForRatio,
  type BudgetCategory,
  type BudgetInput,
  type BudgetTransaction,
} from '../budgetProgress';

function category(id: string, parentId: string | null = null, name = id): BudgetCategory {
  return { id, parent_id: parentId, name, icon: 'cart-outline', color: '#000000' };
}

const budgets: BudgetInput[] = [
  { id: 'b-food', category_id: 'food', amount: 100000, is_active: true },
];

const categories: BudgetCategory[] = [
  category('food', null, 'Comida'),
  category('food-restaurants', 'food', 'Restaurantes'),
  category('transport', null, 'Transporte'),
];

function expense(categoryId: string, amount: number): BudgetTransaction {
  return { type: 'expense', category_id: categoryId, amount };
}

describe('statusForRatio', () => {
  it('ok por debajo de 85%', () => {
    expect(statusForRatio(0)).toBe('ok');
    expect(statusForRatio(0.849)).toBe('ok');
  });

  it('near entre 85% y 100%', () => {
    expect(statusForRatio(0.85)).toBe('near');
    expect(statusForRatio(1)).toBe('near');
  });

  it('over por encima de 100%', () => {
    expect(statusForRatio(1.0001)).toBe('over');
    expect(statusForRatio(2)).toBe('over');
  });
});

describe('calculateBudgetProgress', () => {
  it('presupuesto sin gasto', () => {
    const progress = calculateBudgetProgress(budgets, categories, []);
    expect(progress.items[0].spent).toBe(0);
    expect(progress.items[0].remaining).toBe(100000);
    expect(progress.items[0].status).toBe('ok');
  });

  it('acumula el gasto de las subcategorías en la madre', () => {
    const progress = calculateBudgetProgress(budgets, categories, [
      expense('food', 40000),
      expense('food-restaurants', 30000),
    ]);
    expect(progress.items[0].spent).toBe(70000);
    expect(progress.items[0].remaining).toBe(30000);
    expect(progress.items[0].status).toBe('ok');
  });

  it('ignora transferencias e ingresos', () => {
    const progress = calculateBudgetProgress(budgets, categories, [
      { type: 'transfer', category_id: null, amount: 90000 },
      { type: 'income', category_id: null, amount: 90000 },
      expense('food', 10000),
    ]);
    expect(progress.items[0].spent).toBe(10000);
  });

  it('ignora movimientos de categorías sin presupuesto', () => {
    const progress = calculateBudgetProgress(budgets, categories, [expense('transport', 50000)]);
    expect(progress.items[0].spent).toBe(0);
  });

  it('ratio mayor a 1 marca over', () => {
    const progress = calculateBudgetProgress(budgets, categories, [expense('food', 150000)]);
    expect(progress.items[0].ratio).toBeCloseTo(1.5);
    expect(progress.items[0].remaining).toBe(-50000);
    expect(progress.items[0].status).toBe('over');
  });

  it('funciona con una categoría archivada (solo usa el árbol)', () => {
    const progress = calculateBudgetProgress(budgets, categories, [
      expense('food-restaurants', 85000),
    ]);
    expect(progress.items[0].spent).toBe(85000);
    expect(progress.items[0].status).toBe('near');
  });

  it('calcula los totales de los presupuestos activos', () => {
    const withInactive: BudgetInput[] = [
      ...budgets,
      { id: 'b-old', category_id: 'transport', amount: 50000, is_active: false },
    ];
    const progress = calculateBudgetProgress(withInactive, categories, [
      expense('food', 40000),
      expense('transport', 10000),
    ]);
    expect(progress.items).toHaveLength(1);
    expect(progress.totals.budgeted).toBe(100000);
    expect(progress.totals.spent).toBe(40000);
    expect(progress.totals.remaining).toBe(60000);
    expect(progress.totals.ratio).toBeCloseTo(0.4);
  });
});
