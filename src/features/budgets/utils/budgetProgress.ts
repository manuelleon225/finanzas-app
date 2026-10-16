export type BudgetStatus = 'ok' | 'near' | 'over';

export type BudgetInput = {
  id: string;
  category_id: string;
  amount: number;
  is_active: boolean;
};

export type BudgetCategory = {
  id: string;
  parent_id: string | null;
  name: string;
  icon: string;
  color: string;
};

export type BudgetTransaction = {
  type: 'income' | 'expense' | 'transfer';
  category_id: string | null;
  amount: number;
  status?: 'posted' | 'pending';
};

export type BudgetProgressItem = {
  budgetId: string;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  amount: number;
  spent: number;
  remaining: number;
  ratio: number;
  status: BudgetStatus;
};

export type BudgetProgressTotals = {
  budgeted: number;
  spent: number;
  remaining: number;
  ratio: number;
};

export type BudgetProgress = {
  items: BudgetProgressItem[];
  totals: BudgetProgressTotals;
};

export const NEAR_THRESHOLD = 0.85;

export function statusForRatio(ratio: number): BudgetStatus {
  if (ratio > 1) {
    return 'over';
  }
  if (ratio >= NEAR_THRESHOLD) {
    return 'near';
  }
  return 'ok';
}

/**
 * Calcula el progreso de cada presupuesto sobre los movimientos del mes.
 * El gasto de las subcategorías se acumula en su categoría madre; las
 * transferencias y los ingresos no cuentan.
 */
export function calculateBudgetProgress(
  budgets: BudgetInput[],
  categories: BudgetCategory[],
  transactions: BudgetTransaction[],
): BudgetProgress {
  const byId = new Map(categories.map((category) => [category.id, category]));

  const spentByRoot = new Map<string, number>();
  for (const transaction of transactions) {
    if (transaction.type !== 'expense' || !transaction.category_id) {
      continue;
    }
    // Los pendientes de confirmar no cuentan en el progreso.
    if (transaction.status === 'pending') {
      continue;
    }

    const category = byId.get(transaction.category_id);
    if (!category) {
      continue;
    }

    const rootId = category.parent_id ?? category.id;
    spentByRoot.set(rootId, (spentByRoot.get(rootId) ?? 0) + transaction.amount);
  }

  const items: BudgetProgressItem[] = budgets
    .filter((budget) => budget.is_active)
    .map((budget) => {
      const category = byId.get(budget.category_id);
      const spent = spentByRoot.get(budget.category_id) ?? 0;
      const remaining = budget.amount - spent;
      const ratio = budget.amount > 0 ? spent / budget.amount : 0;

      return {
        budgetId: budget.id,
        categoryId: budget.category_id,
        categoryName: category?.name ?? '—',
        categoryIcon: category?.icon ?? 'ellipsis-horizontal-outline',
        categoryColor: category?.color ?? '',
        amount: budget.amount,
        spent,
        remaining,
        ratio,
        status: statusForRatio(ratio),
      };
    });

  const budgeted = items.reduce((sum, item) => sum + item.amount, 0);
  const spent = items.reduce((sum, item) => sum + item.spent, 0);

  return {
    items,
    totals: {
      budgeted,
      spent,
      remaining: budgeted - spent,
      ratio: budgeted > 0 ? spent / budgeted : 0,
    },
  };
}
