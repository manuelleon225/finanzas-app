import { fireEvent, render } from '@testing-library/react-native';

import { ListRow } from '../ListRow';
import { Text } from '../Text';
import { IconTile } from '../IconTile';

describe('ListRow', () => {
  it('muestra título y subtítulo', async () => {
    const { getByText } = await render(
      <ListRow icon="cash-outline" iconColor="#0A7F48" title="Salario" subtitle="Ingreso" />,
    );
    expect(getByText('Salario')).toBeTruthy();
    expect(getByText('Ingreso')).toBeTruthy();
  });

  it('llama onPress al tocarla', async () => {
    const onPress = jest.fn();
    const { getByRole } = await render(
      <ListRow icon="cash-outline" iconColor="#0A7F48" title="Salario" onPress={onPress} />,
    );
    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('muestra una tag junto al título', async () => {
    const { getByText } = await render(
      <ListRow
        icon="fast-food-outline"
        iconColor="#9A5B00"
        title="Almuerzo"
        tag={{ label: 'Extra', tone: 'extra' }}
      />,
    );
    expect(getByText('Extra')).toBeTruthy();
  });

  it('usa leading en lugar del círculo de ícono', async () => {
    const { getByText, getByTestId } = await render(
      <ListRow
        leading={<IconTile icon="cart-outline" tileKey="coral" size={40} />}
        title="Mercado"
      />,
    );

    expect(getByText('Mercado')).toBeTruthy();
    expect(getByTestId('icon-tile')).toBeTruthy();
  });

  it('title con leading no requiere icon ni iconColor', async () => {
    const { getByText } = await render(<ListRow leading={<Text>L</Text>} title="Sin icono" />);
    expect(getByText('L')).toBeTruthy();
    expect(getByText('Sin icono')).toBeTruthy();
  });
});
