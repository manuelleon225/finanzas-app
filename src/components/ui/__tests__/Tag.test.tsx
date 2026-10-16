import { render } from '@testing-library/react-native';

import { Tag, type TagTone } from '../Tag';

const tones: TagTone[] = ['extra', 'base', 'neutral', 'pending'];

describe('Tag', () => {
  it('muestra su etiqueta y tono por defecto', async () => {
    const { getByText, getByLabelText } = await render(<Tag label="Extra" />);
    expect(getByText('Extra')).toBeTruthy();
    expect(getByLabelText('Extra')).toBeTruthy();
  });

  it('renderiza todas las variantes', async () => {
    for (const tone of tones) {
      const { getByText } = await render(<Tag label={`tag-${tone}`} tone={tone} />);
      expect(getByText(`tag-${tone}`)).toBeTruthy();
    }
  });
});
