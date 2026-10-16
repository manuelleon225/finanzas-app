import type { Category } from '@/features/categories/api/categories';

import { rankCategoriesByUsage } from '../ranking';

function category(id: string, sortOrder: number): Category {
  return {
    id,
    user_id: 'user',
    name: id,
    kind: 'expense',
    icon: 'cash-outline',
    color: '#000000',
    parent_id: null,
    sort_order: sortOrder,
    is_archived: false,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  };
}

const TODAY = '2026-10-07';

describe('rankCategoriesByUsage', () => {
  it('ordena por uso y desempata por sort_order', () => {
    const categories = [category('a', 1), category('b', 2), category('c', 3)];
    const transactions = [
      { category_id: 'b', occurred_on: TODAY },
      { category_id: 'b', occurred_on: '2026-09-20' },
      { category_id: 'a', occurred_on: TODAY },
      { category_id: 'a', occurred_on: TODAY },
    ];

    expect(rankCategoriesByUsage(transactions, categories, TODAY).map((c) => c.id)).toEqual([
      'a',
      'b',
      'c',
    ]);
  });

  it('sin uso ordena por sort_order', () => {
    const categories = [category('c', 3), category('a', 1), category('b', 2)];
    expect(rankCategoriesByUsage([], categories, TODAY).map((c) => c.id)).toEqual(['a', 'b', 'c']);
  });

  it('ignora movimientos fuera de la ventana de 60 días', () => {
    const categories = [category('a', 1), category('b', 2)];
    const transactions = [
      { category_id: 'a', occurred_on: '2026-01-01' },
      { category_id: 'b', occurred_on: TODAY },
    ];

    expect(rankCategoriesByUsage(transactions, categories, TODAY).map((c) => c.id)).toEqual([
      'b',
      'a',
    ]);
  });

  it('ignora movimientos sin categoría', () => {
    const categories = [category('a', 1), category('b', 2)];
    const transactions = [{ category_id: null, occurred_on: TODAY }];
    expect(rankCategoriesByUsage(transactions, categories, TODAY).map((c) => c.id)).toEqual([
      'a',
      'b',
    ]);
  });
});
