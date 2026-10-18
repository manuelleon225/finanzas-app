import type { ReactElement } from 'react';
import { render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BlockHeader } from '../BlockHeader';
import { Text } from '../Text';

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, bottom: 34, left: 0, right: 0 },
};

function renderBlock(ui: ReactElement) {
  return render(<SafeAreaProvider initialMetrics={metrics}>{ui}</SafeAreaProvider>);
}

describe('BlockHeader', () => {
  it('renderiza los children dentro del contenedor raíz', async () => {
    const { getByTestId, getByText } = await renderBlock(
      <BlockHeader>
        <Text>Titulo</Text>
      </BlockHeader>,
    );

    const root = getByTestId('block-header');
    expect(root).toContainElement(getByTestId('block-content'));
    expect(root).toContainElement(getByText('Titulo'));
  });

  it('el contenedor raíz ocupa el 100% del ancho y recorta la decoración', async () => {
    const { getByTestId } = await renderBlock(
      <BlockHeader>
        <Text>Titulo</Text>
      </BlockHeader>,
    );

    expect(getByTestId('block-header')).toHaveStyle({
      width: '100%',
      alignSelf: 'stretch',
      overflow: 'hidden',
    });
  });

  it('el contenido interno respeta la zona segura superior y el relleno inferior', async () => {
    const { getByTestId } = await renderBlock(
      <BlockHeader>
        <Text>Titulo</Text>
      </BlockHeader>,
    );

    expect(getByTestId('block-content')).toHaveStyle({
      paddingTop: 47 + 12,
      paddingBottom: 44,
      paddingHorizontal: 20,
    });
  });

  it('dibuja el fondo y las dos decoraciones dentro de un mismo Svg', async () => {
    const { getByTestId } = await renderBlock(
      <BlockHeader>
        <Text>Titulo</Text>
      </BlockHeader>,
    );

    const svg = getByTestId('block-background');
    // `preserveAspectRatio="none"` llega al nativo como align 'none'; el `viewBox`
    // se traduce a vbWidth/vbHeight.
    expect(svg.props.align).toBe('none');
    expect(svg.props.vbWidth).toBe(100);
    expect(svg.props.vbHeight).toBe(100);
    expect(svg).toContainElement(getByTestId('block-decor-circle-1'));
    expect(svg).toContainElement(getByTestId('block-decor-circle-2'));
  });
});
