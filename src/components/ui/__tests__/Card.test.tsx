import { render } from '@testing-library/react-native';

import { colors, useThemeModeStore } from '@/theme';

import { Card } from '../Card';
import { Text } from '../Text';

afterEach(() => {
  useThemeModeStore.setState({ mode: 'dark' });
});

describe('Card', () => {
  it('en oscuro no dibuja borde y usa radio xl con padding 16', async () => {
    const { getByText } = await render(
      <Card>
        <Text>Contenido</Text>
      </Card>,
    );

    const card = getByText('Contenido').parent;
    expect(card).toHaveStyle({
      backgroundColor: colors.dark.surface,
      borderWidth: 0,
      borderRadius: 20,
      padding: 16,
    });
  });

  it('en claro dibuja un borde de 1 px', async () => {
    useThemeModeStore.setState({ mode: 'light' });

    const { getByText } = await render(
      <Card>
        <Text>Contenido</Text>
      </Card>,
    );

    const card = getByText('Contenido').parent;
    expect(card).toHaveStyle({
      backgroundColor: colors.light.surface,
      borderWidth: 1,
      borderColor: colors.light.border,
    });
  });
});
