import { fireEvent, render } from '@testing-library/react-native';

import { Button } from '../Button';

describe('Button', () => {
  it('renders its title', async () => {
    const { getByText } = await render(<Button title="Guardar" />);
    expect(getByText('Guardar')).toBeTruthy();
  });

  it.each(['secondary', 'ghost', 'destructive'] as const)(
    'renderiza la variante %s',
    async (variant) => {
      const { getByText } = await render(<Button title="Guardar" variant={variant} />);
      expect(getByText('Guardar')).toBeTruthy();
    },
  );

  it('calls onPress when pressed', async () => {
    const onPress = jest.fn();
    const { getByLabelText } = await render(<Button title="Guardar" onPress={onPress} />);

    await fireEvent.press(getByLabelText('Guardar'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', async () => {
    const onPress = jest.fn();
    const { getByLabelText } = await render(<Button title="Guardar" onPress={onPress} disabled />);

    await fireEvent.press(getByLabelText('Guardar'));

    expect(onPress).not.toHaveBeenCalled();
  });

  it('shows a loading indicator and is not pressable while loading', async () => {
    const onPress = jest.fn();
    const { queryByText, getByLabelText } = await render(
      <Button title="Guardar" onPress={onPress} loading />,
    );

    expect(queryByText('Guardar')).toBeNull();

    await fireEvent.press(getByLabelText('Guardar'));

    expect(onPress).not.toHaveBeenCalled();
  });
});
