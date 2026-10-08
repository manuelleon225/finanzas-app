import { fireEvent, render } from '@testing-library/react-native';

import { SegmentedControl } from '../SegmentedControl';

jest.mock('react-native-reanimated', () => {
  const { View } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: { View },
    useSharedValue: (value: number) => ({ value }),
    useAnimatedStyle: () => ({}),
    withTiming: (toValue: number) => toValue,
    useReducedMotion: () => false,
  };
});

describe('SegmentedControl', () => {
  it('muestra las opciones y marca la activa', async () => {
    const { getByRole } = await render(
      <SegmentedControl
        options={[
          { label: 'Gasto', value: 'expense' },
          { label: 'Ingreso', value: 'income' },
        ]}
        value="expense"
        onChange={() => undefined}
      />,
    );
    expect(getByRole('radio', { name: 'Gasto' })).toBeTruthy();
    expect(getByRole('radio', { name: 'Ingreso' })).toBeTruthy();
  });

  it('llama onChange al tocar una opción', async () => {
    const onChange = jest.fn();
    const { getByRole } = await render(
      <SegmentedControl
        options={[
          { label: 'Gasto', value: 'expense' },
          { label: 'Ingreso', value: 'income' },
        ]}
        value="expense"
        onChange={onChange}
      />,
    );
    await fireEvent.press(getByRole('radio', { name: 'Ingreso' }));
    expect(onChange).toHaveBeenCalledWith('income');
  });
});
