import { fireEvent, render } from '@testing-library/react-native';

import type { AccountWithBalance } from '@/features/accounts/api/accounts';
import type { TransactionWithRelations } from '@/features/transactions/api/transactions';
import { es } from '@/i18n/es';
import { formatCompactCOP, formatCOP, formatPesos } from '@/lib/money';

import { AccountsSection } from '../AccountsSection';
import { DailySpendingCard } from '../DailySpendingCard';
import { MonthSummaryCard } from '../MonthSummaryCard';
import { OnboardingCard } from '../OnboardingCard';
import { PendingBanner } from '../PendingBanner';
import { QuickActions } from '../QuickActions';
import { RecentSection } from '../RecentSection';
import type { DailySpendingPoint } from '../../utils/dailySpending';
import { getOnboardingSteps, type OnboardingStep } from '../../utils/onboarding';
import type { MonthSummary } from '../../utils/summary';
const account: AccountWithBalance = {
  account_id: 'a1',
  user_id: 'u1',
  name: 'Efectivo',
  type: 'cash',
  initial_balance: 0,
  is_archived: false,
  balance: 120000,
  counts_as_liquid: true,
};

const summary: MonthSummary = {
  incomeTotal: 2000000,
  incomeBase: 1500000,
  incomeExtra: 500000,
  expenseTotal: 800000,
  expenseBase: 600000,
  expenseExtra: 200000,
  balance: 1200000,
  extraDependency: 25,
};

function transaction(overrides: Partial<TransactionWithRelations> = {}): TransactionWithRelations {
  return {
    id: 't1',
    user_id: 'u1',
    type: 'expense',
    nature: 'base',
    status: 'posted',
    amount: 10000,
    account_id: 'a1',
    transfer_account_id: null,
    category_id: 'c1',
    occurred_on: '2026-10-07',
    note: null,
    recurring_rule_id: null,
    occurrence_date: null,
    created_at: '2026-10-07T00:00:00Z',
    updated_at: '2026-10-07T00:00:00Z',
    category: {
      id: 'c1',
      user_id: 'u1',
      name: 'Comida',
      kind: 'expense',
      icon: 'fast-food-outline',
      color: '#f97316',
      parent_id: null,
      sort_order: 0,
      is_archived: false,
      created_at: '2026-10-01T00:00:00Z',
      updated_at: '2026-10-01T00:00:00Z',
    },
    account: {
      id: 'a1',
      user_id: 'u1',
      name: 'Efectivo',
      type: 'cash',
      initial_balance: 0,
      is_archived: false,
      counts_as_liquid: true,
      created_at: '2026-10-01T00:00:00Z',
      updated_at: '2026-10-01T00:00:00Z',
    },
    transfer_account: null,
    ...overrides,
  };
}

describe('OnboardingCard', () => {
  it('muestra el título y los tres pasos', async () => {
    const steps = getOnboardingSteps({ hasIncome: false, hasExpense: false, hasBudget: false });
    const { getByText } = await render(
      <OnboardingCard steps={steps} onPressStep={() => undefined} />,
    );

    expect(getByText(es.home.onboardingTitle)).toBeTruthy();
    expect(getByText(es.home.onboardingIncome)).toBeTruthy();
    expect(getByText(es.home.onboardingExpense)).toBeTruthy();
    expect(getByText(es.home.onboardingBudget)).toBeTruthy();
  });

  it('marca con un check los pasos cumplidos', async () => {
    const steps = getOnboardingSteps({ hasIncome: true, hasExpense: false, hasBudget: true });
    const { getAllByTestId } = await render(
      <OnboardingCard steps={steps} onPressStep={() => undefined} />,
    );

    expect(getAllByTestId('onboarding-step-done')).toHaveLength(2);
  });

  it('avisa qué paso se pulsó', async () => {
    const onPressStep = jest.fn();
    const steps: OnboardingStep[] = getOnboardingSteps({
      hasIncome: false,
      hasExpense: false,
      hasBudget: false,
    });
    const { getByLabelText } = await render(
      <OnboardingCard steps={steps} onPressStep={onPressStep} />,
    );

    fireEvent.press(getByLabelText(es.home.onboardingBudget));
    expect(onPressStep).toHaveBeenCalledWith('budget');
  });
});

describe('MonthSummaryCard', () => {
  it('muestra ingresos, gastos y la dependencia de extras', async () => {
    const { getByText } = await render(<MonthSummaryCard summary={summary} />);

    expect(getByText(es.home.thisMonth)).toBeTruthy();
    expect(getByText(es.home.incomes)).toBeTruthy();
    expect(getByText(es.home.expenses)).toBeTruthy();
    expect(getByText(`Los extras son el 25% de tus ingresos.`)).toBeTruthy();
  });
});

describe('AccountsSection', () => {
  it('lista las cuentas y el total', async () => {
    const total = 320000;
    const { getByText } = await render(<AccountsSection accounts={[account]} total={total} />);

    expect(getByText(es.home.accounts)).toBeTruthy();
    expect(getByText('Efectivo')).toBeTruthy();
    expect(getByText(formatCOP(account.balance))).toBeTruthy();
    expect(getByText(formatCOP(total))).toBeTruthy();
  });

  it('muestra el vacío cuando no hay cuentas', async () => {
    const { getByText } = await render(<AccountsSection accounts={[]} total={0} />);
    expect(getByText(es.home.noAccounts)).toBeTruthy();
  });
});

describe('RecentSection', () => {
  it('lista hasta los movimientos recibidos y abre el movimiento', async () => {
    const onPressItem = jest.fn();
    const { getByText, getByLabelText } = await render(
      <RecentSection
        items={[transaction()]}
        onPressItem={onPressItem}
        onViewAll={() => undefined}
      />,
    );

    expect(getByText(es.home.recent)).toBeTruthy();
    expect(getByText(es.home.viewAll + ' ›')).toBeTruthy();
    fireEvent.press(getByLabelText('Comida. Efectivo'));
    expect(onPressItem).toHaveBeenCalledTimes(1);
  });
});

describe('PendingBanner', () => {
  it('no renderiza nada sin pendientes', async () => {
    const { queryByText } = await render(<PendingBanner count={0} onPress={() => undefined} />);
    expect(queryByText(es.home.confirmationsTitle)).toBeNull();
  });

  it('muestra el conteo y avisa al pulsar', async () => {
    const onPress = jest.fn();
    const { getByText, getByLabelText } = await render(
      <PendingBanner count={3} onPress={onPress} />,
    );

    expect(getByText(es.home.pendingConfirmations.replace('{count}', '3'))).toBeTruthy();
    fireEvent.press(getByLabelText(es.home.confirmationsTitle));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

describe('QuickActions', () => {
  it('muestra las tres acciones', async () => {
    const { getByText } = await render(<QuickActions onSelect={() => undefined} />);

    expect(getByText(es.home.quickExpense)).toBeTruthy();
    expect(getByText(es.home.quickIncome)).toBeTruthy();
    expect(getByText(es.home.quickTransfer)).toBeTruthy();
  });

  it('avisa el tipo elegido', async () => {
    const onSelect = jest.fn();
    const { getByLabelText } = await render(<QuickActions onSelect={onSelect} />);

    fireEvent.press(getByLabelText(es.home.quickTransferA11y));
    expect(onSelect).toHaveBeenCalledWith('transfer');
  });
});

const dailyPoints: DailySpendingPoint[] = [
  { date: '2026-10-01', total: 0 },
  { date: '2026-10-02', total: 0 },
  { date: '2026-10-03', total: 0 },
  { date: '2026-10-04', total: 0 },
  { date: '2026-10-05', total: 0 },
  { date: '2026-10-06', total: 0 },
  { date: '2026-10-07', total: 35000 },
];

function barLabel(date: string, total: number): string {
  return es.home.dailyBar.replace('{dia}', 'miércoles').replace('{monto}', formatPesos(total));
}

describe('DailySpendingCard', () => {
  it('muestra el título y el promedio por día', async () => {
    const { getByText } = await render(<DailySpendingCard daily={dailyPoints} />);

    expect(getByText(es.home.last7Days)).toBeTruthy();
    expect(
      getByText(es.home.dailyAverage.replace('{amount}', formatCompactCOP(5000))),
    ).toBeTruthy();
  });

  it('muestra el vacío cuando no hay gastos', async () => {
    const { getByText } = await render(
      <DailySpendingCard daily={dailyPoints.map((point) => ({ ...point, total: 0 }))} />,
    );

    expect(getByText(es.home.dailyEmpty)).toBeTruthy();
  });

  it('revela el monto al tocar una barra', async () => {
    const { getByLabelText, getByText } = await render(<DailySpendingCard daily={dailyPoints} />);

    await fireEvent.press(getByLabelText(barLabel('2026-10-07', 35000)));
    expect(getByText(formatCompactCOP(35000))).toBeTruthy();
  });

  it('no muestra la tarjeta mientras carga', async () => {
    const { queryByText } = await render(<DailySpendingCard daily={[]} isLoading />);

    expect(queryByText(es.home.last7Days)).toBeNull();
  });

  it('ofrece reintentar ante un error', async () => {
    const onRetry = jest.fn();
    const { getByText } = await render(<DailySpendingCard daily={[]} isError onRetry={onRetry} />);

    fireEvent.press(getByText(es.common.retry));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
