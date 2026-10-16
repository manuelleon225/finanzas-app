import { fireEvent, render } from '@testing-library/react-native';

import { MonthSelector } from '../MonthSelector';

describe('MonthSelector', () => {
  it('muestra el mes y permite navegar', async () => {
    const onChange = jest.fn();
    const { getByText, getByLabelText } = await render(
      <MonthSelector value="2026-10" maxDate={new Date(2026, 11, 15)} onChange={onChange} />,
    );

    expect(getByText('octubre de 2026')).toBeTruthy();

    await fireEvent.press(getByLabelText('Mes siguiente'));
    expect(onChange).toHaveBeenCalledWith(new Date(2026, 10, 1));

    await fireEvent.press(getByLabelText('Mes anterior'));
    expect(onChange).toHaveBeenCalledWith(new Date(2026, 8, 1));
  });

  it('no permite ir a un mes futuro', async () => {
    const onChange = jest.fn();
    const { getByLabelText } = await render(
      <MonthSelector value="2026-10" maxDate={new Date(2026, 9, 5)} onChange={onChange} />,
    );

    await fireEvent.press(getByLabelText('Mes siguiente'));
    expect(onChange).not.toHaveBeenCalled();
    expect(getByLabelText('Mes siguiente').props.accessibilityState.disabled).toBe(true);
  });
});
