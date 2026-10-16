import { fireEvent, render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { SwipeableRow, SwipeableRowGroup } from '../SwipeableRow';

jest.mock('react-native-reanimated', () => {
  const { View } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: { View },
    runOnJS: (fn: (...args: unknown[]) => unknown) => fn,
    useAnimatedStyle: () => ({}),
    useReducedMotion: () => false,
    useSharedValue: (value: number) => ({ value }),
    withTiming: (toValue: number) => toValue,
  };
});

jest.mock('react-native-gesture-handler', () => {
  const panGesture = {
    activeOffsetX: () => panGesture,
    onUpdate: () => panGesture,
    onEnd: () => panGesture,
  };

  return {
    Gesture: { Pan: () => panGesture },
    GestureDetector: ({ children }: { children: unknown }) => children,
  };
});

describe('SwipeableRow', () => {
  it('renderiza los hijos', async () => {
    const { getByText } = await render(
      <SwipeableRow onDelete={jest.fn()}>
        <Text>Fila</Text>
      </SwipeableRow>,
    );
    expect(getByText('Fila')).toBeTruthy();
  });

  it('llama onDelete al tocar la acción Eliminar', async () => {
    const onDelete = jest.fn();
    const { getByLabelText } = await render(
      <SwipeableRow onDelete={onDelete}>
        <Text>Fila</Text>
      </SwipeableRow>,
    );
    await fireEvent.press(getByLabelText('Eliminar'));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('expone la acción accesible de eliminar', async () => {
    const onDelete = jest.fn();
    const { getByRole } = await render(
      <SwipeableRow onDelete={onDelete}>
        <Text>Fila</Text>
      </SwipeableRow>,
    );
    await fireEvent(getByRole('button', { name: 'Fila' }), 'accessibilityAction', {
      nativeEvent: { actionName: 'delete' },
    });
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('funciona dentro de un grupo', async () => {
    const { getByText } = await render(
      <SwipeableRowGroup>
        <SwipeableRow onDelete={jest.fn()}>
          <Text>Fila agrupada</Text>
        </SwipeableRow>
      </SwipeableRowGroup>,
    );
    expect(getByText('Fila agrupada')).toBeTruthy();
  });
});
