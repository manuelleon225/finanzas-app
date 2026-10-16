export type MonthSummary = {
  incomeTotal: number;
  incomeBase: number;
  incomeExtra: number;
  expenseTotal: number;
  expenseBase: number;
  expenseExtra: number;
  balance: number;
  extraDependency: number;
};

type SummaryTransaction = {
  type: 'income' | 'expense' | 'transfer';
  nature: 'base' | 'extra' | null;
  amount: number;
  status?: 'posted' | 'pending';
};

export function calculateMonthSummary(transactions: SummaryTransaction[]): MonthSummary {
  let incomeBase = 0;
  let incomeExtra = 0;
  let expenseBase = 0;
  let expenseExtra = 0;

  for (const transaction of transactions) {
    // Los movimientos pendientes de confirmar no cuentan en ningún total.
    if (transaction.status === 'pending') {
      continue;
    }

    if (transaction.type === 'income') {
      if (transaction.nature === 'extra') {
        incomeExtra += transaction.amount;
      } else {
        incomeBase += transaction.amount;
      }
    } else if (transaction.type === 'expense') {
      if (transaction.nature === 'extra') {
        expenseExtra += transaction.amount;
      } else {
        expenseBase += transaction.amount;
      }
    }
  }

  const incomeTotal = incomeBase + incomeExtra;
  const expenseTotal = expenseBase + expenseExtra;
  const balance = incomeTotal - expenseTotal;
  const extraDependency = incomeTotal > 0 ? Math.round((incomeExtra / incomeTotal) * 100) : 0;

  return {
    incomeTotal,
    incomeBase,
    incomeExtra,
    expenseTotal,
    expenseBase,
    expenseExtra,
    balance,
    extraDependency,
  };
}
