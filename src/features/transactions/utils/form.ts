import { parseMoneyInput } from '@/lib/money';

export type TransactionFormValues = {
  type: 'income' | 'expense';
  nature: 'base' | 'extra';
  amountText: string;
  accountId: string;
  categoryId: string;
  occurredOn: string;
  note: string;
};

export function buildTransactionCandidate(values: TransactionFormValues) {
  const note = values.note.trim();

  return {
    type: values.type,
    nature: values.nature,
    amount: parseMoneyInput(values.amountText),
    account_id: values.accountId,
    category_id: values.categoryId,
    occurred_on: values.occurredOn,
    note: note.length > 0 ? note : undefined,
  };
}

export function formFieldForIssuePath(path: PropertyKey[]): keyof TransactionFormValues | null {
  switch (path[0]) {
    case 'amount':
      return 'amountText';
    case 'account_id':
      return 'accountId';
    case 'category_id':
      return 'categoryId';
    case 'occurred_on':
      return 'occurredOn';
    case 'nature':
      return 'nature';
    case 'type':
      return 'type';
    case 'note':
      return 'note';
    default:
      return null;
  }
}
