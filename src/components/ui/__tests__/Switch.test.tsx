import { fireEvent, render } from '@testing-library/react-native';

import { colors } from '@/theme';

import { Switch } from '../Switch';

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

describe('Switch', () => {
  it('expone el estado en accesibilidad y lo cambia al pulsar', async () => {
    const onValueChange = jest.fn();
    const { getByTestId } = await render(
      <Switch value={false} onValueChange={onValueChange} accessibilityLabel="Extras" />,
    );

    expect(getByTestId('switch').props.accessibilityState.checked).toBe(false);

    await fireEvent.press(getByTestId('switch'));
    expect(onValueChange).toHaveBeenCalledWith(true);
  });

  it('encendido usa el riel brand', async () => {
    const { getByTestId } = await render(
      <Switch value onValueChange={() => undefined} accessibilityLabel="Extras" />,
    );
    expect(getByTestId('switch')).toHaveStyle({ backgroundColor: colors.dark.brand });
  });

  it('deshabilitado no cambia y se anuncia como tal', async () => {
    const onValueChange = jest.fn();
    const { getByTestId } = await render(
      <Switch value={false} onValueChange={onValueChange} disabled accessibilityLabel="Extras" />,
    );

    await fireEvent.press(getByTestId('switch'));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(getByTestId('switch').props.accessibilityState.disabled).toBe(true);
  });
});
