import type { ReactElement } from 'react';
import { render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors } from '@/theme';

import { ScreenScaffold } from '../ScreenScaffold';
import { Text } from '../Text';

jest.mock('expo-status-bar', () => ({ StatusBar: () => null }));
jest.mock('expo-system-ui', () => ({
  setBackgroundColorAsync: jest.fn().mockResolvedValue(undefined),
}));

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, bottom: 34, left: 0, right: 0 },
};

function renderScaffold(ui: ReactElement) {
  return render(<SafeAreaProvider initialMetrics={metrics}>{ui}</SafeAreaProvider>);
}

describe('ScreenScaffold', () => {
  it('variante block muestra el encabezado y el contenido en la hoja', async () => {
    const { getByTestId, getByText } = await renderScaffold(
      <ScreenScaffold variant="block" header={<Text>Bloque</Text>}>
        <Text>Hoja</Text>
      </ScreenScaffold>,
    );

    expect(getByTestId('block-header')).toBeTruthy();
    expect(getByTestId('sheet')).toBeTruthy();
    expect(getByText('Bloque')).toBeTruthy();
    expect(getByText('Hoja')).toBeTruthy();
  });

  it('variante plain muestra el encabezado sobre el fondo', async () => {
    const { queryByTestId, getByText } = await renderScaffold(
      <ScreenScaffold variant="plain" header={<Text>Normal</Text>}>
        <Text>Cuerpo</Text>
      </ScreenScaffold>,
    );

    expect(queryByTestId('block-header')).toBeNull();
    expect(getByText('Normal')).toBeTruthy();
    expect(getByText('Cuerpo')).toBeTruthy();
  });

  it('variante block pinta la zona segura superior con brand', async () => {
    const { getByTestId } = await renderScaffold(
      <ScreenScaffold variant="block" header={<Text>Bloque</Text>}>
        <Text>Hoja</Text>
      </ScreenScaffold>,
    );

    expect(getByTestId('top-inset-fill')).toHaveStyle({
      height: metrics.insets.top,
      backgroundColor: colors.dark.brand,
    });
  });

  it('variante plain pinta la zona segura superior con bg', async () => {
    const { getByTestId } = await renderScaffold(
      <ScreenScaffold variant="plain" header={<Text>Normal</Text>}>
        <Text>Cuerpo</Text>
      </ScreenScaffold>,
    );

    expect(getByTestId('top-inset-fill')).toHaveStyle({
      height: metrics.insets.top,
      backgroundColor: colors.dark.bg,
    });
  });
});
