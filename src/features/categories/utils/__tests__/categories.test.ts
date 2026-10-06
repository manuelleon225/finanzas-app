import { groupCategoriesByParent, validateCategoryName, type Category } from '../categories';

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

describe('validateCategoryName', () => {
  const categories = [
    { id: 'comida', name: 'Comida', kind: 'expense', parent_id: null },
    { id: 'salario', name: 'Salario', kind: 'income', parent_id: null },
    { id: 'restaurante', name: 'Restaurante', kind: 'expense', parent_id: 'comida' },
  ] as Category[];

  it('acepta un nombre nuevo', () => {
    expect(
      validateCategoryName({
        name: 'Mercado',
        kind: 'expense',
        parentId: null,
        categories,
      }),
    ).toBeNull();
  });

  it('rechaza un nombre duplicado entre categorías principales (ignorando mayúsculas y espacios)', () => {
    const error = validateCategoryName({
      name: '  comida  ',
      kind: 'expense',
      parentId: null,
      categories,
    });
    expect(error).toBe('Ya existe una categoría con este nombre.');
  });

  it('rechaza un nombre duplicado entre hermanas', () => {
    const error = validateCategoryName({
      name: 'Restaurante',
      kind: 'expense',
      parentId: 'comida',
      categories,
    });
    expect(error).toBe('Ya existe una categoría con este nombre.');
  });

  it('rechaza que una subcategoría se llame igual que su madre', () => {
    const error = validateCategoryName({
      name: 'Comida',
      kind: 'expense',
      parentId: 'comida',
      categories,
    });
    expect(error).toBe('Una subcategoría no puede llamarse igual que su categoría madre.');
  });

  it('no rechaza el mismo nombre en un kind distinto', () => {
    const error = validateCategoryName({
      name: 'Salario',
      kind: 'expense',
      parentId: null,
      categories,
    });
    expect(error).toBeNull();
  });

  it('no se rechaza a sí misma al editar', () => {
    expect(
      validateCategoryName({
        name: 'Comida',
        kind: 'expense',
        parentId: null,
        editingId: 'comida',
        categories,
      }),
    ).toBeNull();
  });
});
