import { z } from 'zod';

import { es } from '@/i18n/es';
import { isValidISODate } from '@/lib/dates';

const amountSchema = z
  .number({ error: es.transactions.amountPositive })
  .int()
  .positive(es.transactions.amountPositive);
const accountIdSchema = z
  .string({ error: es.transactions.accountRequired })
  .trim()
  .min(1, es.transactions.accountRequired);
const transferAccountIdSchema = z
  .string({ error: es.transactions.transferAccountRequired })
  .trim()
  .min(1, es.transactions.transferAccountRequired);
const categoryIdSchema = z
  .string({ error: es.transactions.categoryRequired })
  .trim()
  .min(1, es.transactions.categoryRequired);
const isoDateSchema = z.string().refine(isValidISODate, { message: es.transactions.invalidDate });
const noteSchema = z.string().trim().max(300).optional();

const commonFields = {
  amount: amountSchema,
  account_id: accountIdSchema,
  occurred_on: isoDateSchema,
  note: noteSchema,
};

export const transactionSchema = z
  .discriminatedUnion('type', [
    z.object({
      type: z.literal('income'),
      nature: z.enum(['base', 'extra']),
      category_id: categoryIdSchema,
      ...commonFields,
    }),
    z.object({
      type: z.literal('expense'),
      nature: z.enum(['base', 'extra']),
      category_id: categoryIdSchema,
      ...commonFields,
    }),
    z.object({
      type: z.literal('transfer'),
      transfer_account_id: transferAccountIdSchema,
      ...commonFields,
    }),
  ])
  .superRefine((value, ctx) => {
    if (value.type === 'transfer' && value.account_id === value.transfer_account_id) {
      ctx.addIssue({
        code: 'custom',
        message: es.transactions.differentAccounts,
        path: ['transfer_account_id'],
      });
    }
  });

export type TransactionInput = z.infer<typeof transactionSchema>;
