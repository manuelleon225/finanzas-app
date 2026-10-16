import { render } from '@testing-library/react-native';

import { formatCOP } from '@/lib/money';

import { AnimatedNumber } from '../AnimatedNumber';

jest.mock('react-native-reanimated', () => {
  const { View } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: { View },
    Easing: { out: (fn: unknown) => fn, cubic: () => 0, inOut: (fn: unknown) => fn },
    runOnJS: (fn: (...args: unknown[]) => unknown) => fn,
    useAnimatedReaction: () => undefined,
    useAnimatedStyle: () => ({}),
    useReducedMotion: () => false,
    useSharedValue: (value: number) => ({ value }),
    withTiming: (toValue: number) => toValue,
  };
});

describe('AnimatedNumber', () => {
  it('muestra el monto formateado', async () => {
    const { getByText } = await render(<AnimatedNumber value={87500} />);
    expect(getByText(formatCOP(87500))).toBeTruthy();
  });

  it('expone el monto como etiqueta accesible', async () => {
    const { getByLabelText } = await render(<AnimatedNumber value={1200} />);
    expect(getByLabelText(formatCOP(1200))).toBeTruthy();
  });
});
