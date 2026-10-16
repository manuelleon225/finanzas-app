import {
  buildInsights,
  extraShareByMonth,
  monthlyTrend,
  OTHERS_ID,
  spendingByCategory,
  type AnalysisCategory,
  type AnalysisTransaction,
} from '../analysis';

function category(id: string, parentId: string | null = null, color = '#000000'): AnalysisCategory {
  return { id, parent_id: parentId, name: id, color };
}

const categories: AnalysisCategory[] = [
  category('food', null, '#EF4444'),
  category('food-out', 'food'),
  category('transport', null, '#3B82F6'),
  category('home', null),
  category('fun', null),
  category('health', null),
  category('clothes', null),
  category('other-a', null),
];

function expense(
  categoryId: string,
  amount: number,
  occurredOn = '2026-10-05',
): AnalysisTransaction {
  return {
    type: 'expense',
    nature: 'base',
    category_id: categoryId,
    amount,
    occurred_on: occurredOn,
  };
}

describe('spendingByCategory', () => {
  it('acumula subcategorías en la madre', () => {
    const result = spendingByCategory(
      [expense('food', 40000), expense('food-out', 60000)],
      categories,
    );
    expect(result).toHaveLength(1);
    expect(result[0].categoryId).toBe('food');
    expect(result[0].amount).toBe(100000);
    expect(result[0].percentage).toBe(100);
  });

  it('agrupa el resto en Otros cuando supera topN', () => {
    const transactions = [
      expense('food', 70000),
      expense('transport', 60000),
      expense('home', 50000),
      expense('fun', 40000),
      expense('health', 30000),
      expense('clothes', 20000),
      expense('other-a', 10000),
    ];
    const result = spendingByCategory(transactions, categories, { topN: 6 });
    expect(result).toHaveLength(7);
    const others = result.find((item) => item.categoryId === OTHERS_ID);
    expect(others?.amount).toBe(10000);
    expect(others?.percentage).toBeCloseTo((10000 / 280000) * 100);
  });

  it('ignora transferencias e ingresos', () => {
    const transactions: AnalysisTransaction[] = [
      {
        type: 'transfer',
        nature: null,
        category_id: null,
        amount: 99999,
        occurred_on: '2026-10-05',
      },
      {
        type: 'income',
        nature: 'base',
        category_id: 'food',
        amount: 99999,
        occurred_on: '2026-10-05',
      },
      expense('food', 1000),
    ];
    const result = spendingByCategory(transactions, categories);
    expect(result).toHaveLength(1);
    expect(result[0].amount).toBe(1000);
  });

  it('con kind income agrupa ingresos', () => {
    const transactions: AnalysisTransaction[] = [
      {
        type: 'income',
        nature: 'base',
        category_id: 'food',
        amount: 5000,
        occurred_on: '2026-10-05',
      },
    ];
    const result = spendingByCategory(transactions, categories, { kind: 'income' });
    expect(result[0].amount).toBe(5000);
  });
});

describe('monthlyTrend', () => {
  it('devuelve 6 meses con totales y base/extra de ingresos', () => {
    const transactions: AnalysisTransaction[] = [
      {
        type: 'income',
        nature: 'base',
        category_id: 'food',
        amount: 100,
        occurred_on: '2026-10-05',
      },
      {
        type: 'income',
        nature: 'extra',
        category_id: 'food',
        amount: 50,
        occurred_on: '2026-10-06',
      },
      expense('food', 30, '2026-10-07'),
      expense('food', 20, '2026-09-10'),
      { type: 'transfer', nature: null, category_id: null, amount: 999, occurred_on: '2026-10-08' },
    ];

    const trend = monthlyTrend(transactions, new Date(2026, 9, 15), 6);
    expect(trend).toHaveLength(6);
    expect(trend[5].key).toBe('2026-10');
    expect(trend[5].income).toBe(150);
    expect(trend[5].base).toBe(100);
    expect(trend[5].extra).toBe(50);
    expect(trend[5].expense).toBe(30);
    expect(trend[4].key).toBe('2026-09');
    expect(trend[4].expense).toBe(20);
  });

  it('ignora movimientos fuera de la ventana', () => {
    const trend = monthlyTrend([expense('food', 500, '2020-01-01')], new Date(2026, 9, 1), 6);
    expect(trend.every((point) => point.expense === 0)).toBe(true);
  });
});

describe('extraShareByMonth', () => {
  it('calcula el porcentaje de extras sobre los ingresos', () => {
    const trend = monthlyTrend(
      [
        {
          type: 'income',
          nature: 'base',
          category_id: 'food',
          amount: 800,
          occurred_on: '2026-10-01',
        },
        {
          type: 'income',
          nature: 'extra',
          category_id: 'food',
          amount: 200,
          occurred_on: '2026-10-02',
        },
      ],
      new Date(2026, 9, 1),
      6,
    );
    const share = extraShareByMonth(trend);
    expect(share[5].percentage).toBe(20);
    expect(share[0].percentage).toBe(0);
  });
});

describe('buildInsights', () => {
  it('sin datos suficientes no compara', () => {
    const trend = monthlyTrend([], new Date(2026, 9, 1), 6);
    expect(buildInsights({ trend, topExpenses: [] })).toEqual([]);
  });

  it('detecta la variación contra el mes anterior', () => {
    const trend = monthlyTrend(
      [expense('food', 100, '2026-09-01'), expense('food', 150, '2026-10-01')],
      new Date(2026, 9, 1),
      6,
    );
    const insights = buildInsights({ trend, topExpenses: [] });
    expect(insights.some((line) => line.includes('50'))).toBe(true);
  });

  it('menciona la categoría que más pesa y la dependencia de extras', () => {
    const trend = monthlyTrend(
      [
        {
          type: 'income',
          nature: 'base',
          category_id: 'food',
          amount: 700,
          occurred_on: '2026-10-01',
        },
        {
          type: 'income',
          nature: 'extra',
          category_id: 'food',
          amount: 300,
          occurred_on: '2026-10-02',
        },
      ],
      new Date(2026, 9, 1),
      6,
    );
    const insights = buildInsights({
      trend,
      topExpenses: [
        { categoryId: 'food', name: 'Comida', color: null, amount: 100, percentage: 60 },
      ],
    });
    expect(insights.some((line) => line.includes('Comida'))).toBe(true);
    expect(insights.some((line) => line.includes('30%'))).toBe(true);
  });
});
