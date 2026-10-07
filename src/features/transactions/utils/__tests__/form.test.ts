import { buildTransactionCandidate, formFieldForIssuePath } from '../form';

describe('buildTransactionCandidate', () => {
  const baseValues = {
    type: 'expense' as const,
    nature: 'base' as const,
    amountText: '25.000',
    accountId: 'a1',
    categoryId: 'c1',
    occurredOn: '2026-06-10',
    note: '',
  };

  it('convierte el monto de texto a número', () => {
    const candidate = buildTransactionCandidate(baseValues);
    expect(candidate.amount).toBe(25000);
    expect(candidate.account_id).toBe('a1');
    expect(candidate.category_id).toBe('c1');
  });

  it('deja la nota como undefined si está vacía', () => {
    expect(buildTransactionCandidate(baseValues).note).toBeUndefined();
  });

  it('recorta la nota no vacía', () => {
    const candidate = buildTransactionCandidate({ ...baseValues, note: '  Almuerzo  ' });
    expect(candidate.note).toBe('Almuerzo');
  });
});

describe('formFieldForIssuePath', () => {
  it('mapea las rutas de zod a los campos del formulario', () => {
    expect(formFieldForIssuePath(['amount'])).toBe('amountText');
    expect(formFieldForIssuePath(['account_id'])).toBe('accountId');
    expect(formFieldForIssuePath(['category_id'])).toBe('categoryId');
    expect(formFieldForIssuePath(['occurred_on'])).toBe('occurredOn');
  });

  it('devuelve null para rutas desconocidas', () => {
    expect(formFieldForIssuePath(['desconocido'])).toBeNull();
  });
});
