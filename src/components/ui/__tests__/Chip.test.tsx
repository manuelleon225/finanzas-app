import { fireEvent, render } from '@testing-library/react-native';

import { Chip } from '../Chip';

describe('Chip', () => {
  it('muestra su etiqueta y el estado seleccionado', async () => {
    const { getByText, getByRole } = await render(<Chip label="Base" selected />);
    expect(getByText('Base')).toBeTruthy();
    expect(getByRole('button', { name: 'Base' })).toBeTruthy();
  });

  it('llama onPress', async () => {
    const onPress = jest.fn();
    const { getByLabelText } = await render(<Chip label="Extra" onPress={onPress} />);
    await fireEvent.press(getByLabelText('Extra'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
