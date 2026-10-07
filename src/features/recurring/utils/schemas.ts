import { z } from 'zod';

import { es } from '@/i18n/es';
import { isValidISODate } from '@/lib/dates';

const dateSchema = z.string().refine(isValidISODate, { message: es.transactions.invalidDate });

export const recurringRuleSchema = z
  .object({
    type: z.enum(['income', 'expense']),
    nature: z.enum(['base', 'extra']),
    amount: z
      .number({ error: es.transactions.amountPositive })
      .int()
      .positive(es.transactions.amountPositive),
    account_id: z
      .string({ error: es.transactions.accountRequired })
      .trim()
      .min(1, es.transactions.accountRequired),
    category_id: z
      .string({ error: es.transactions.categoryRequired })
      .trim()
      .min(1, es.transactions.categoryRequired),
    note: z.string().trim().max(300).optional(),
    frequency: z.enum(['weekly', 'biweekly', 'semimonthly', 'monthly']),
    start_date: dateSchema,
    end_date: dateSchema.nullable(),
  })
  .refine((value) => !value.end_date || value.end_date >= value.start_date, {
    message: es.recurring.endBeforeStart,
    path: ['end_date'],
  });

export type RecurringRuleInput = z.infer<typeof recurringRuleSchema>;
