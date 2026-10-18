import { render } from '@testing-library/react-native';

import { colors, spacing } from '@/theme';

import { Sheet } from '../Sheet';
import { Text } from '../Text';

describe('Sheet', () => {
  it('usa fondo bg, radios sheet, solape del bloque y ocupa el alto disponible', async () => {
    const { getByTestId, getByText } = await render(
      <Sheet>
        <Text>Contenido</Text>
      </Sheet>,
    );

    expect(getByText('Contenido')).toBeTruthy();
    expect(getByTestId('sheet')).toHaveStyle({
      backgroundColor: colors.dark.bg,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      marginTop: -28,
      flex: 1,
      overflow: 'hidden',
    });
  });

  it('aplica el margen lateral de pantalla en el contenido interno, no en la hoja', async () => {
    const { getByTestId } = await render(
      <Sheet>
        <Text>Contenido</Text>
      </Sheet>,
    );

    expect(getByTestId('sheet-content')).toHaveStyle({ paddingHorizontal: spacing.screen });
  });
});
