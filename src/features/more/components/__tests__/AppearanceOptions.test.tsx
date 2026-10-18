import { fireEvent, render } from '@testing-library/react-native';

import { es } from '@/i18n/es';

import { AppearanceOptions } from '../AppearanceOptions';

describe('AppearanceOptions', () => {
  it('renderiza las tres opciones', async () => {
    const { getByText } = await render(<AppearanceOptions value="dark" onChange={() => {}} />);

    expect(getByText(es.more.appearanceSystem)).toBeTruthy();
    expect(getByText(es.more.appearanceDark)).toBeTruthy();
    expect(getByText(es.more.appearanceLight)).toBeTruthy();
  });

  it('marca la opción actual como seleccionada', async () => {
    const { getByLabelText } = await render(<AppearanceOptions value="dark" onChange={() => {}} />);

    expect(getByLabelText(es.more.appearanceDark).props.accessibilityState).toEqual({
      selected: true,
    });
    expect(getByLabelText(es.more.appearanceLight).props.accessibilityState).toEqual({
      selected: false,
    });
  });

  it('avisa el cambio al tocar una opción', async () => {
    const onChange = jest.fn();
    const { getByLabelText } = await render(
      <AppearanceOptions value="system" onChange={onChange} />,
    );

    fireEvent.press(getByLabelText(es.more.appearanceLight));

    expect(onChange).toHaveBeenCalledWith('light');
  });
});
