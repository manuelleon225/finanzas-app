import { render } from '@testing-library/react-native';

import { formatCOP } from '@/lib/money';
import { colors } from '@/theme';

import { MoneyText } from '../MoneyText';

describe('MoneyText', () => {
  it('renders the formatted amount', async () => {
    const { getByText } = await render(<MoneyText amount={25000} />);
    expect(getByText(formatCOP(25000))).toBeTruthy();
  });

  it('uses the income color', async () => {
    const { getByText } = await render(<MoneyText amount={1000} kind="income" />);
    expect(getByText(formatCOP(1000))).toHaveStyle({ color: colors.dark.income });
  });

  it('uses the expense color', async () => {
    const { getByText } = await render(<MoneyText amount={1000} kind="expense" />);
    expect(getByText(formatCOP(1000))).toHaveStyle({ color: colors.dark.expense });
  });

  it('adds an explicit sign when signed is set', async () => {
    const { getByText } = await render(<MoneyText amount={1000} kind="income" signed />);
    expect(getByText(`+${formatCOP(1000)}`)).toBeTruthy();
  });

  it('aplica el tamaño display a las cifras grandes', async () => {
    const { getByText } = await render(<MoneyText amount={1000} size="displayLg" />);
    expect(getByText(formatCOP(1000))).toHaveStyle({ fontSize: 40 });
  });
});
