import { es } from '@/i18n/es';
import type { TileKey } from '@/theme';

export type OnboardingStepId = 'income' | 'expense' | 'budget';

export type OnboardingStep = {
  id: OnboardingStepId;
  label: string;
  icon: string;
  tileKey: TileKey;
  done: boolean;
};

export type OnboardingInput = {
  hasIncome: boolean;
  hasExpense: boolean;
  hasBudget: boolean;
};

/**
 * Pasos de "Empieza en 3 pasos". El orden es fijo y cada paso se marca cumplido
 * cuando ya existe al menos un ingreso, un gasto o un presupuesto.
 */
export function getOnboardingSteps(input: OnboardingInput): OnboardingStep[] {
  return [
    {
      id: 'income',
      label: es.home.onboardingIncome,
      icon: 'cash',
      tileKey: 'green',
      done: input.hasIncome,
    },
    {
      id: 'expense',
      label: es.home.onboardingExpense,
      icon: 'cart',
      tileKey: 'coral',
      done: input.hasExpense,
    },
    {
      id: 'budget',
      label: es.home.onboardingBudget,
      icon: 'flag',
      tileKey: 'yellow',
      done: input.hasBudget,
    },
  ];
}

export function isOnboardingDone(steps: OnboardingStep[]): boolean {
  return steps.every((step) => step.done);
}
