import { parseMoneyInput } from '@/lib/money';

export type TransactionFormValues = {
  type: 'income' | 'expense' | 'transfer';
  nature: 'base' | 'extra';
  amountText: string;
  accountId: string;
  transferAccountId: string;
  categoryId: string;
  occurredOn: string;
  note: string;
};

export function buildTransactionCandidate(values: TransactionFormValues) {
  const note = values.note.trim();
  const amount = parseMoneyInput(values.amountText);

  if (values.type === 'transfer') {
    return {
      type: 'transfer' as const,
      amount,
      account_id: values.accountId,
      transfer_account_id: values.transferAccountId,
      occurred_on: values.occurredOn,
      note: note.length > 0 ? note : undefined,
    };
  }

  return {
    type: values.type,
    nature: values.nature,
    amount,
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
    case 'transfer_account_id':
      return 'transferAccountId';
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
