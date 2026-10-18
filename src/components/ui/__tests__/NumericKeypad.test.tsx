import { fireEvent, render } from '@testing-library/react-native';

import { NumericKeypad } from '../NumericKeypad';

function setup(disabled = false) {
  const onDigit = jest.fn();
  const onBackspace = jest.fn();
  const onClear = jest.fn();
  const utils = render(
    <NumericKeypad
      onDigit={onDigit}
      onBackspace={onBackspace}
      onClear={onClear}
      disabled={disabled}
    />,
  );
  return { onDigit, onBackspace, onClear, utils };
}

describe('NumericKeypad', () => {
  it('envía el dígito tocado', async () => {
    const { onDigit, utils } = setup();
    const { getByText } = await utils;
    await fireEvent.press(getByText('7'));
    expect(onDigit).toHaveBeenCalledWith('7');
  });

  it('envía la tecla "000"', async () => {
    const { onDigit, utils } = setup();
    const { getByText } = await utils;
    await fireEvent.press(getByText('000'));
    expect(onDigit).toHaveBeenCalledWith('000');
  });

  it('envía borrar', async () => {
    const { onBackspace, utils } = setup();
    const { getByLabelText } = await utils;
    await fireEvent.press(getByLabelText('Borrar'));
    expect(onBackspace).toHaveBeenCalledTimes(1);
  });

  it('al mantener presionado borrar limpia todo', async () => {
    const { onClear, utils } = setup();
    const { getByLabelText } = await utils;
    await fireEvent(getByLabelText('Borrar'), 'longPress');
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('deshabilitado no dispara acciones', async () => {
    const { onDigit, utils } = setup(true);
    const { getByText } = await utils;
    await fireEvent.press(getByText('7'));
    expect(onDigit).not.toHaveBeenCalled();
  });

  it('usa teclas de 52 px de alto', async () => {
    const { utils } = setup();
    const { getAllByTestId } = await utils;
    const keys = getAllByTestId('keypad-key');
    expect(keys).toHaveLength(12);
    for (const key of keys) {
      expect(key).toHaveStyle({ height: 52 });
    }
  });
});
