import { es } from '@/i18n/es';

import { getOnboardingSteps, isOnboardingDone } from '../onboarding';

describe('getOnboardingSteps', () => {
  it('devuelve los tres pasos en orden con sus etiquetas', () => {
    const steps = getOnboardingSteps({ hasIncome: false, hasExpense: false, hasBudget: false });
    expect(steps.map((step) => step.id)).toEqual(['income', 'expense', 'budget']);
    expect(steps.map((step) => step.label)).toEqual([
      es.home.onboardingIncome,
      es.home.onboardingExpense,
      es.home.onboardingBudget,
    ]);
  });

  it('marca cumplido cada paso según su bandera', () => {
    const steps = getOnboardingSteps({ hasIncome: true, hasExpense: false, hasBudget: true });
    expect(steps.map((step) => step.done)).toEqual([true, false, true]);
  });

  it('cada paso trae ícono y ficha', () => {
    const steps = getOnboardingSteps({ hasIncome: true, hasExpense: true, hasBudget: true });
    for (const step of steps) {
      expect(step.icon.length).toBeGreaterThan(0);
      expect(step.tileKey.length).toBeGreaterThan(0);
    }
  });
});

describe('isOnboardingDone', () => {
  it('solo está completo con los tres pasos cumplidos', () => {
    expect(
      isOnboardingDone(getOnboardingSteps({ hasIncome: true, hasExpense: true, hasBudget: true })),
    ).toBe(true);
    expect(
      isOnboardingDone(getOnboardingSteps({ hasIncome: true, hasExpense: true, hasBudget: false })),
    ).toBe(false);
    expect(
      isOnboardingDone(
        getOnboardingSteps({ hasIncome: false, hasExpense: false, hasBudget: false }),
      ),
    ).toBe(false);
  });
});
