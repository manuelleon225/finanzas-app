import { getFrequentTransactions, normalizeText, suggestCategories } from '../suggestions';

describe('normalizeText', () => {
  it('pasa a minúsculas y quita tildes', () => {
    expect(normalizeText('Árbol Café')).toEqual(['arbol', 'cafe']);
  });

  it('descarta palabras cortas y vacías', () => {
    expect(normalizeText('de la el en y almuerzo')).toEqual(['almuerzo']);
  });

  it('reemplaza no alfanuméricos por espacio', () => {
    expect(normalizeText('almuerzo, bus.')).toEqual(['almuerzo', 'bus']);
  });

  it('devuelve vacío para nota vacía', () => {
    expect(normalizeText('')).toEqual([]);
    expect(normalizeText('   ')).toEqual([]);
  });
});

describe('suggestCategories', () => {
  const today = '2026-10-07';
  const categories = [
    { id: 'c1', is_archived: false },
    { id: 'c2', is_archived: false },
    { id: 'c3', is_archived: true },
  ];

  it('devuelve [] sin palabras', () => {
    const result = suggestCategories({
      note: 'de la',
      history: [],
      categories,
      type: 'expense',
      today,
    });
    expect(result).toEqual([]);
  });

  it('sugiere categoría por coincidencias', () => {
    const result = suggestCategories({
      note: 'almuerzo con amigos',
      history: [
        {
          note: 'almuerzo trabajo',
          categoryId: 'c1',
          type: 'expense',
          occurredOn: today,
          amount: 10000,
        },
      ],
      categories,
      type: 'expense',
      today,
    });
    expect(result).toEqual([{ categoryId: 'c1', score: 3 }]);
  });

  it('ignora categorías archivadas', () => {
    const result = suggestCategories({
      note: 'almuerzo',
      history: [
        { note: 'almuerzo', categoryId: 'c3', type: 'expense', occurredOn: today, amount: 10000 },
      ],
      categories,
      type: 'expense',
      today,
    });
    expect(result).toEqual([]);
  });

  it('ignora fuera de ventana de 180 días', () => {
    const result = suggestCategories({
      note: 'almuerzo',
      history: [
        {
          note: 'almuerzo',
          categoryId: 'c1',
          type: 'expense',
          occurredOn: '2026-01-01',
          amount: 10000,
        },
      ],
      categories,
      type: 'expense',
      today,
    });
    expect(result).toEqual([]);
  });

  it('respeta el tipo', () => {
    const result = suggestCategories({
      note: 'almuerzo',
      history: [
        { note: 'almuerzo', categoryId: 'c1', type: 'income', occurredOn: today, amount: 10000 },
      ],
      categories,
      type: 'expense',
      today,
    });
    expect(result).toEqual([]);
  });

  it('ordena por puntaje y desempata por fecha', () => {
    const result = suggestCategories({
      note: 'almuerzo cafe',
      history: [
        {
          note: 'almuerzo',
          categoryId: 'c1',
          type: 'expense',
          occurredOn: '2026-10-06',
          amount: 10000,
        },
        { note: 'cafe', categoryId: 'c2', type: 'expense', occurredOn: today, amount: 5000 },
      ],
      categories,
      type: 'expense',
      today,
    });
    // both score 3; c2 more recent
    expect(result[0].categoryId).toBe('c2');
  });

  it('limita a 3', () => {
    const cats = [
      { id: 'a', is_archived: false },
      { id: 'b', is_archived: false },
      { id: 'c', is_archived: false },
      { id: 'd', is_archived: false },
    ];
    const result = suggestCategories({
      note: 'alpha beta gamma delta',
      history: [
        { note: 'alpha', categoryId: 'a', type: 'expense', occurredOn: today, amount: 1 },
        { note: 'beta', categoryId: 'b', type: 'expense', occurredOn: today, amount: 1 },
        { note: 'gamma', categoryId: 'c', type: 'expense', occurredOn: today, amount: 1 },
        { note: 'delta', categoryId: 'd', type: 'expense', occurredOn: today, amount: 1 },
      ],
      categories: cats,
      type: 'expense',
      today,
    });
    expect(result).toHaveLength(3);
  });
});

describe('getFrequentTransactions', () => {
  const today = '2026-10-07';

  it('agrupa y conserva >=2 ocurrencias', () => {
    const result = getFrequentTransactions({
      history: [
        {
          note: 'almuerzo',
          categoryId: 'c1',
          type: 'expense',
          occurredOn: '2026-10-06',
          amount: 15000,
          accountId: 'a1',
        },
        {
          note: 'almuerzo',
          categoryId: 'c1',
          type: 'expense',
          occurredOn: today,
          amount: 15000,
          accountId: 'a1',
        },
      ],
      today,
    });
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ type: 'expense', categoryId: 'c1', amount: 15000, count: 2 });
  });

  it('ignora grupos de una ocurrencia', () => {
    const result = getFrequentTransactions({
      history: [
        {
          note: 'cafe',
          categoryId: 'c1',
          type: 'expense',
          occurredOn: today,
          amount: 5000,
          accountId: 'a1',
        },
      ],
      today,
    });
    expect(result).toEqual([]);
  });

  it('ignora transferencias', () => {
    const result = getFrequentTransactions({
      history: [
        {
          note: 'x',
          categoryId: 'c1',
          type: 'transfer',
          occurredOn: '2026-10-06',
          amount: 1000,
          accountId: 'a1',
        },
        {
          note: 'x',
          categoryId: 'c1',
          type: 'transfer',
          occurredOn: today,
          amount: 1000,
          accountId: 'a1',
        },
      ],
      today,
    });
    expect(result).toEqual([]);
  });

  it('respeta límite', () => {
    const result = getFrequentTransactions({
      history: [
        {
          note: 'a',
          categoryId: 'c1',
          type: 'expense',
          occurredOn: '2026-10-06',
          amount: 1,
          accountId: 'a1',
        },
        {
          note: 'a',
          categoryId: 'c1',
          type: 'expense',
          occurredOn: today,
          amount: 1,
          accountId: 'a1',
        },
        {
          note: 'b',
          categoryId: 'c2',
          type: 'expense',
          occurredOn: '2026-10-06',
          amount: 2,
          accountId: 'a1',
        },
        {
          note: 'b',
          categoryId: 'c2',
          type: 'expense',
          occurredOn: today,
          amount: 2,
          accountId: 'a1',
        },
        {
          note: 'c',
          categoryId: 'c3',
          type: 'expense',
          occurredOn: '2026-10-06',
          amount: 3,
          accountId: 'a1',
        },
        {
          note: 'c',
          categoryId: 'c3',
          type: 'expense',
          occurredOn: today,
          amount: 3,
          accountId: 'a1',
        },
        {
          note: 'd',
          categoryId: 'c4',
          type: 'expense',
          occurredOn: '2026-10-06',
          amount: 4,
          accountId: 'a1',
        },
        {
          note: 'd',
          categoryId: 'c4',
          type: 'expense',
          occurredOn: today,
          amount: 4,
          accountId: 'a1',
        },
      ],
      today,
      limit: 2,
    });
    expect(result).toHaveLength(2);
  });

  it('usa ventana de 60 días', () => {
    const result = getFrequentTransactions({
      history: [
        {
          note: 'almuerzo',
          categoryId: 'c1',
          type: 'expense',
          occurredOn: '2026-07-01',
          amount: 15000,
          accountId: 'a1',
        },
        {
          note: 'almuerzo',
          categoryId: 'c1',
          type: 'expense',
          occurredOn: today,
          amount: 15000,
          accountId: 'a1',
        },
      ],
      today,
    });
    expect(result).toEqual([]);
  });
});
