import type { BudgetProgressItem } from '@/features/budgets/utils/budgetProgress';
import { es } from '@/i18n/es';

import { analysisSubtitle, featuredBudgets, recurringSubtitle } from '../planText';
import type { PlanRecurringRule } from '../planText';

function rule(overrides: Partial<PlanRecurringRule> = {}): PlanRecurringRule {
  return {
    id: 'r1',
    frequency: 'monthly',
    start_date: '2026-01-10',
    end_date: null,
    is_active: true,
    note: 'Arriendo',
    category: { name: 'Vivienda' },
    ...overrides,
  };
}

function item(overrides: Partial<BudgetProgressItem> = {}): BudgetProgressItem {
  return {
    budgetId: 'b1',
    categoryId: 'c1',
    categoryName: 'Comida',
    categoryIcon: 'cart-outline',
    categoryColor: '',
    amount: 100000,
    spent: 50000,
    remaining: 50000,
    ratio: 0.5,
    status: 'ok',
    ...overrides,
  };
}

describe('recurringSubtitle', () => {
  it('sin reglas activas usa el texto por defecto', () => {
    expect(recurringSubtitle([], '2026-06-01')).toBe(es.plan.recurringDescription);
  });

  it('ignora reglas inactivas', () => {
    expect(recurringSubtitle([rule({ is_active: false })], '2026-06-01')).toBe(
      es.plan.recurringDescription,
    );
  });

  it('usa la nota y la próxima fecha de la regla', () => {
    expect(recurringSubtitle([rule()], '2026-06-01')).toBe('Próximo: Arriendo · 10 jun');
  });

  it('cae al nombre de la categoría si no hay nota', () => {
    expect(recurringSubtitle([rule({ note: null })], '2026-06-01')).toBe(
      'Próximo: Vivienda · 10 jun',
    );
  });

  it('elige la próxima fecha más cercana entre varias reglas', () => {
    const rules = [
      rule({ id: 'a', start_date: '2026-01-20' }),
      rule({ id: 'b', note: 'Internet', start_date: '2026-01-05' }),
    ];
    expect(recurringSubtitle(rules, '2026-06-01')).toBe('Próximo: Internet · 5 jun');
  });

  it('vuelve al texto por defecto si las reglas activas ya terminaron', () => {
    expect(recurringSubtitle([rule({ end_date: '2026-05-31' })], '2026-06-01')).toBe(
      es.plan.recurringDescription,
    );
  });
});

describe('analysisSubtitle', () => {
  it('devuelve la primera frase de insights', () => {
    expect(analysisSubtitle(['Uno', 'Dos'])).toBe('Uno');
  });

  it('usa el texto por defecto si no hay insights', () => {
    expect(analysisSubtitle([])).toBe(es.plan.analysisDescription);
  });
});

describe('featuredBudgets', () => {
  it('ordena por uso (ratio) descendente', () => {
    const result = featuredBudgets([
      item({ budgetId: 'low', ratio: 0.2 }),
      item({ budgetId: 'high', ratio: 0.9 }),
      item({ budgetId: 'mid', ratio: 0.5 }),
    ]);
    expect(result.map((entry) => entry.budgetId)).toEqual(['high', 'mid', 'low']);
  });

  it('devuelve como máximo 3 presupuestos', () => {
    const result = featuredBudgets([
      item({ budgetId: 'a', ratio: 0.1 }),
      item({ budgetId: 'b', ratio: 0.2 }),
      item({ budgetId: 'c', ratio: 0.3 }),
      item({ budgetId: 'd', ratio: 0.4 }),
    ]);
    expect(result).toHaveLength(3);
    expect(result.map((entry) => entry.budgetId)).toEqual(['d', 'c', 'b']);
  });

  it('desempata por gasto cuando el uso es igual', () => {
    const result = featuredBudgets([
      item({ budgetId: 'small', ratio: 0.5, spent: 10000 }),
      item({ budgetId: 'big', ratio: 0.5, spent: 90000 }),
    ]);
    expect(result.map((entry) => entry.budgetId)).toEqual(['big', 'small']);
  });
});
