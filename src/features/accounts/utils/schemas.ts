import { z } from 'zod';

import { es } from '@/i18n/es';
import { isValidMoneyText } from '@/lib/money';

import type { AccountType } from '../api/accounts';

export const accountTypes: AccountType[] = ['cash', 'bank', 'savings', 'credit_card'];

export function defaultCountsAsLiquid(type: AccountType): boolean {
  return type === 'cash' || type === 'bank';
}

export const accountSchema = z.object({
  name: z.string().trim().min(1, es.accounts.nameRequired),
  type: z.enum(['cash', 'bank', 'savings', 'credit_card']),
  initialBalanceText: z
    .string()
    .refine((value) => isValidMoneyText(value), { message: es.accounts.invalidBalance }),
  countsAsLiquid: z.boolean(),
});

export type AccountForm = z.infer<typeof accountSchema>;
