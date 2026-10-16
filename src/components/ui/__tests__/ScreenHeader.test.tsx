import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { ScreenHeader } from '../ScreenHeader';

describe('ScreenHeader', () => {
  it('muestra título, subtítulo y acciones', async () => {
    const { getByText } = await render(
      <ScreenHeader title="Inicio" subtitle="Resumen del mes" actions={<Text>acciones</Text>} />,
    );

    expect(getByText('Inicio')).toBeTruthy();
    expect(getByText('Resumen del mes')).toBeTruthy();
    expect(getByText('acciones')).toBeTruthy();
  });

  it('omite el título si no se pasa', async () => {
    const { queryByText, getByText } = await render(<ScreenHeader subtitle="Solo subtítulo" />);
    expect(getByText('Solo subtítulo')).toBeTruthy();
    expect(queryByText('Inicio')).toBeNull();
  });
});
