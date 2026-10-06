import { mergeCategories } from '../../utils/categories';
import type { Category } from '../../api/categories';

function makeCategory(id: string): Category {
  return {
    id,
    user_id: 'u',
    name: id,
    kind: 'expense',
    icon: 'x',
    color: '#000',
    parent_id: null,
    sort_order: 1,
    is_archived: false,
    created_at: '',
    updated_at: '',
  };
}

describe('mergeCategories', () => {
  it('devuelve solo las activas cuando no hay añadidas', () => {
    const active = [makeCategory('a'), makeCategory('b')];
    expect(mergeCategories(active, [])).toHaveLength(2);
  });

  it('agrega las añadidas que no estén ya en las activas', () => {
    const active = [makeCategory('a'), makeCategory('b')];
    const additions = [makeCategory('c'), makeCategory('a')];
    const merged = mergeCategories(active, additions);
    expect(merged.map((category) => category.id)).toEqual(['a', 'b', 'c']);
  });

  it('preserva las añadidas aunque estén archivadas (sin filtrar)', () => {
    const archived = { ...makeCategory('d'), is_archived: true };
    const merged = mergeCategories([], [archived]);
    expect(merged).toHaveLength(1);
    expect(merged[0].is_archived).toBe(true);
  });
});
