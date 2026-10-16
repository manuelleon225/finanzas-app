import { fireEvent, render } from '@testing-library/react-native';

import { IconButton } from '../IconButton';

describe('IconButton', () => {
  it('llama onPress', async () => {
    const onPress = jest.fn();
    const { getByLabelText } = await render(
      <IconButton icon="settings-outline" onPress={onPress} accessibilityLabel="Ajustes" />,
    );
    await fireEvent.press(getByLabelText('Ajustes'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('deshabilitado no llama onPress', async () => {
    const onPress = jest.fn();
    const { getByLabelText } = await render(
      <IconButton
        icon="settings-outline"
        onPress={onPress}
        accessibilityLabel="Ajustes"
        disabled
      />,
    );
    await fireEvent.press(getByLabelText('Ajustes'));
    expect(onPress).not.toHaveBeenCalled();
    expect(getByLabelText('Ajustes').props.accessibilityState.disabled).toBe(true);
  });

  it('renderiza con badge', async () => {
    const { getByLabelText } = await render(
      <IconButton
        icon="notifications-outline"
        onPress={jest.fn()}
        accessibilityLabel="Avisos"
        badge
      />,
    );
    expect(getByLabelText('Avisos')).toBeTruthy();
  });
});
