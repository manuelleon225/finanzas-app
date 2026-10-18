import { render } from '@testing-library/react-native';

import { es } from '@/i18n/es';

import { ProfileCard } from '../ProfileCard';

describe('ProfileCard', () => {
  it('muestra el nombre y el rol de cuenta personal', async () => {
    const { getByText } = await render(<ProfileCard name="Ana Gómez" />);

    expect(getByText('Ana Gómez')).toBeTruthy();
    expect(getByText(es.more.personalAccount)).toBeTruthy();
  });

  it('muestra la inicial del nombre en el avatar', async () => {
    const { getByText } = await render(<ProfileCard name="Ana" />);

    expect(getByText('A')).toBeTruthy();
  });

  it('usa un marcador cuando no hay nombre', async () => {
    const { getByText } = await render(<ProfileCard name="" />);

    expect(getByText('…')).toBeTruthy();
  });
});
