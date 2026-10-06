import { groupCategoriesByParent, type Category } from '../categories';

describe('groupCategoriesByParent', () => {
  it('devuelve una lista vacía si no hay categorías', () => {
    expect(groupCategoriesByParent([])).toEqual([]);
  });

  it('ordena las categorías principales por sort_order', () => {
    const categories = [
      { id: 'b', name: 'B', parent_id: null, sort_order: 2 },
      { id: 'a', name: 'A', parent_id: null, sort_order: 1 },
    ] as Category[];
    const groups = groupCategoriesByParent(categories);
    expect(groups.map((group) => group.category.name)).toEqual(['A', 'B']);
    expect(groups[0].children).toEqual([]);
  });

  it('anida las subcategorías bajo su padre', () => {
    const categories = [
      { id: 'p', name: 'Padre', parent_id: null, sort_order: 1 },
      { id: 'c2', name: 'Hijo 2', parent_id: 'p', sort_order: 2 },
      { id: 'c1', name: 'Hijo 1', parent_id: 'p', sort_order: 1 },
    ] as Category[];
    const groups = groupCategoriesByParent(categories);
    expect(groups).toHaveLength(1);
    expect(groups[0].children.map((child) => child.name)).toEqual(['Hijo 1', 'Hijo 2']);
  });

  it('ignora las subcategorías cuyo padre no está en la lista', () => {
    const categories = [
      { id: 'p', name: 'Padre', parent_id: null, sort_order: 1 },
      { id: 'orphan', name: 'Huérfana', parent_id: 'no-existe', sort_order: 1 },
    ] as Category[];
    const groups = groupCategoriesByParent(categories);
    expect(groups).toHaveLength(1);
    expect(groups[0].children).toEqual([]);
  });
});
