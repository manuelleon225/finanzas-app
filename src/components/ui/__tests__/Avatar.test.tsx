import { render } from '@testing-library/react-native';

import { colors } from '@/theme';

import { Avatar } from '../Avatar';

describe('Avatar', () => {
  it('muestra la inicial en mayúscula', async () => {
    const { getByText } = await render(<Avatar name="ana" />);
    expect(getByText('A')).toBeTruthy();
  });

  it('usa brand fuera del bloque', async () => {
    const { getByTestId } = await render(<Avatar name="Ana" size={32} />);
    expect(getByTestId('avatar')).toHaveStyle({
      width: 32,
      height: 32,
      backgroundColor: colors.dark.brand,
    });
  });

  it('usa blockTrack sobre el bloque y el tamaño 44', async () => {
    const { getByTestId } = await render(<Avatar name="Ana" size={44} onBlock />);
    expect(getByTestId('avatar')).toHaveStyle({
      width: 44,
      height: 44,
      backgroundColor: colors.dark.blockTrack,
    });
  });

  it('expone la etiqueta cuando se pasa', async () => {
    const { getByLabelText } = await render(<Avatar name="Ana" accessibilityLabel="Perfil" />);
    expect(getByLabelText('Perfil')).toBeTruthy();
  });
});
