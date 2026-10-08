import { render } from '@testing-library/react-native';

import { colors } from '@/theme';

import { Text } from '../Text';

describe('Text', () => {
  const variants = [
    'displayLg',
    'display',
    'title',
    'subtitle',
    'body',
    'bodyStrong',
    'caption',
    'micro',
  ] as const;

  for (const variant of variants) {
    it(`renderiza la variante ${variant}`, async () => {
      const { getByText } = await render(<Text variant={variant}>Hola</Text>);
      expect(getByText('Hola')).toBeTruthy();
    });
  }

  it('aplica el color secundario a caption', async () => {
    const { getByText } = await render(<Text variant="caption">Nota</Text>);
    expect(getByText('Nota')).toHaveStyle({ color: colors.dark.textSecondary });
  });
});
