import type { TransactionWithRelations } from '../../api/transactions';
import { movementRowModel } from '../movementRow';

function makeTransaction(
  overrides: Partial<TransactionWithRelations> = {},
): TransactionWithRelations {
  return {
    id: 't' + Math.random(),
    user_id: 'u',
    type: 'expense',
    nature: 'base',
    status: 'posted',
    amount: 1000,
    account_id: 'a1',
    transfer_account_id: null,
    category_id: 'c1',
    occurred_on: '2026-06-10',
    note: null,
    recurring_rule_id: null,
    occurrence_date: null,
    created_at: '',
    updated_at: '',
    category: {
      id: 'c1',
      user_id: 'u',
      name: 'Comida',
      kind: 'expense',
      icon: 'fast-food-outline',
      color: '#f97316',
      parent_id: null,
      sort_order: 0,
      is_archived: false,
      created_at: '',
      updated_at: '',
    },
    account: {
      id: 'a1',
      user_id: 'u',
      name: 'Efectivo',
      type: 'cash',
      initial_balance: 0,
      is_archived: false,
      counts_as_liquid: true,
      created_at: '',
      updated_at: '',
    },
    transfer_account: null,
    ...overrides,
  } as TransactionWithRelations;
}

describe('movementRowModel', () => {
  it('usa el nombre de la categoría como título y "Categoría · Cuenta" como subtítulo', () => {
    const model = movementRowModel(makeTransaction());
    expect(model.title).toBe('Comida');
    expect(model.subtitle).toBe('Comida · Efectivo');
    expect(model.kind).toBe('expense');
    expect(model.tile.tileKey).toBe('orange');
    expect(model.tile.icon).toBe('fast-food-outline');
    expect(model.isExtra).toBe(false);
    expect(model.isRecurring).toBe(false);
  });

  it('usa la nota como título cuando existe', () => {
    const model = movementRowModel(makeTransaction({ note: 'Almuerzo' }));
    expect(model.title).toBe('Almuerzo');
    expect(model.subtitle).toBe('Comida · Efectivo');
  });

  it('marca la naturaleza extra', () => {
    const model = movementRowModel(makeTransaction({ nature: 'extra' }));
    expect(model.isExtra).toBe(true);
  });

  it('marca los movimientos generados por una regla', () => {
    const model = movementRowModel(
      makeTransaction({ recurring_rule_id: 'r1', occurrence_date: '2026-06-10' }),
    );
    expect(model.isRecurring).toBe(true);
  });

  it('prioriza el nombre sobre el color al elegir la ficha', () => {
    const model = movementRowModel(
      makeTransaction({
        type: 'income',
        category: {
          id: 'c2',
          user_id: 'u',
          name: 'Salario',
          kind: 'income',
          icon: 'cash-outline',
          color: '#3b82f6',
          parent_id: null,
          sort_order: 0,
          is_archived: false,
          created_at: '',
          updated_at: '',
        },
      }),
    );
    expect(model.kind).toBe('income');
    expect(model.tile.tileKey).toBe('green');
  });

  it('usa ficha gris y monto neutro en transferencias', () => {
    const model = movementRowModel(
      makeTransaction({
        type: 'transfer',
        nature: null,
        category_id: null,
        category: null,
        transfer_account_id: 'a2',
        note: 'A ahorros',
        transfer_account: {
          id: 'a2',
          user_id: 'u',
          name: 'Ahorros',
          type: 'savings',
          initial_balance: 0,
          is_archived: false,
          counts_as_liquid: false,
          created_at: '',
          updated_at: '',
        },
      }),
    );
    expect(model.title).toBe('Efectivo → Ahorros');
    expect(model.subtitle).toBe('A ahorros');
    expect(model.kind).toBe('neutral');
    expect(model.tile.tileKey).toBe('gray');
    expect(model.tile.icon).toBe('swap-horizontal');
    expect(model.isExtra).toBe(false);
  });

  it('cae a "Otros" y ficha gris cuando falta la categoría', () => {
    const model = movementRowModel(makeTransaction({ category: null, category_id: null }));
    expect(model.title).toBe('Otros');
    expect(model.subtitle).toBe('Efectivo');
    expect(model.tile.tileKey).toBe('gray');
  });
});
