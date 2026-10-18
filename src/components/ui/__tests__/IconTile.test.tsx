import { render } from '@testing-library/react-native';

import { useThemeModeStore } from '@/theme';

import { IconTile } from '../IconTile';

afterEach(() => {
  useThemeModeStore.setState({ mode: 'dark' });
});

describe('IconTile', () => {
  it('usa la ficha de 40 por defecto en tema oscuro', async () => {
    const { getByTestId } = await render(<IconTile icon="home-outline" tileKey="blue" />);
    expect(getByTestId('icon-tile')).toHaveStyle({
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: '#1C2A3F',
    });
  });

  it('ajusta radio y tamaño para 32 y 48', async () => {
    const small = await render(<IconTile icon="home-outline" tileKey="blue" size={32} />);
    expect(small.getByTestId('icon-tile')).toHaveStyle({ width: 32, height: 32, borderRadius: 10 });

    const large = await render(<IconTile icon="home-outline" tileKey="blue" size={48} />);
    expect(large.getByTestId('icon-tile')).toHaveStyle({ width: 48, height: 48, borderRadius: 14 });
  });

  it('usa los colores del tema claro', async () => {
    useThemeModeStore.setState({ mode: 'light' });
    const { getByTestId } = await render(<IconTile icon="home-outline" tileKey="blue" />);
    expect(getByTestId('icon-tile')).toHaveStyle({ backgroundColor: '#D9E6FF' });
  });

  it('es decorativo sin etiqueta y expone la etiqueta si se pasa', async () => {
    const decorative = await render(<IconTile icon="home-outline" tileKey="blue" />);
    expect(decorative.getByTestId('icon-tile').props.accessible).toBe(false);

    const labeled = await render(
      <IconTile icon="home-outline" tileKey="blue" accessibilityLabel="Comida" />,
    );
    expect(labeled.getByLabelText('Comida')).toBeTruthy();
  });
});
