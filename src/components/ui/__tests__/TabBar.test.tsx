import { fireEvent, render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { es } from '@/i18n/es';
import { colors } from '@/theme';

import { TabBar } from '../TabBar';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, bottom: 34, left: 0, right: 0 },
};

const TITLES: Record<string, string> = {
  index: es.tabs.home,
  movements: es.tabs.movements,
  plan: es.tabs.plan,
  more: es.tabs.more,
};

const ROUTES = [
  { key: 'index-key', name: 'index' },
  { key: 'movements-key', name: 'movements' },
  { key: 'plan-key', name: 'plan' },
  { key: 'more-key', name: 'more' },
];

async function renderBar(activeName: string) {
  const descriptors = Object.fromEntries(
    ROUTES.map((route) => [route.key, { options: { title: TITLES[route.name] } }]),
  );
  const navigate = jest.fn();
  const navigation = { emit: jest.fn(() => ({ defaultPrevented: false })), navigate };
  const state = { index: ROUTES.findIndex((route) => route.name === activeName), routes: ROUTES };

  const utils = await render(
    <SafeAreaProvider initialMetrics={metrics}>
      <TabBar
        state={state as never}
        descriptors={descriptors as never}
        navigation={navigation as never}
        insets={metrics.insets as never}
      />
    </SafeAreaProvider>,
  );

  return { ...utils, navigate };
}

beforeEach(() => {
  mockPush.mockClear();
});

describe('TabBar', () => {
  it('muestra las etiquetas completas y el botón central', async () => {
    const { getByText, getByLabelText } = await renderBar('index');

    expect(getByText(es.tabs.home)).toBeTruthy();
    expect(getByText(es.tabs.movements)).toBeTruthy();
    expect(getByText(es.tabs.plan)).toBeTruthy();
    expect(getByText(es.tabs.more)).toBeTruthy();
    expect(getByLabelText(es.transactionForm.add)).toBeTruthy();
  });

  it('marca la pestaña activa y pinta su color', async () => {
    const { getByLabelText, getByText } = await renderBar('index');

    expect(getByLabelText(es.tabs.home).props.accessibilityState.selected).toBe(true);
    expect(getByLabelText(es.tabs.movements).props.accessibilityState.selected).toBe(false);
    expect(getByText(es.tabs.home)).toHaveStyle({ color: colors.dark.brandText });
    expect(getByText(es.tabs.movements)).toHaveStyle({ color: colors.dark.textSecondary });
  });

  it('navega al pulsar otra pestaña', async () => {
    const { getByLabelText, navigate } = await renderBar('index');

    await fireEvent.press(getByLabelText(es.tabs.movements));
    expect(navigate).toHaveBeenCalledWith('movements');
  });

  it('el botón central abre el registro rápido', async () => {
    const { getByLabelText } = await renderBar('index');

    await fireEvent.press(getByLabelText(es.transactionForm.add));
    expect(mockPush).toHaveBeenCalledWith('/transaction-form');
  });
});
