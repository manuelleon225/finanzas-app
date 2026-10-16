import * as Haptics from 'expo-haptics';

import { error, select, success, tap, warning } from './haptics';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(async () => undefined),
  selectionAsync: jest.fn(async () => undefined),
  notificationAsync: jest.fn(async () => undefined),
  ImpactFeedbackStyle: { Light: 'light' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));

const impactAsync = Haptics.impactAsync as jest.Mock;
const selectionAsync = Haptics.selectionAsync as jest.Mock;
const notificationAsync = Haptics.notificationAsync as jest.Mock;

describe('haptics', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('dispara impacto en tap', () => {
    tap();
    expect(impactAsync).toHaveBeenCalledTimes(1);
  });

  it('dispara selección y notificaciones', () => {
    select();
    success();
    warning();
    error();
    expect(selectionAsync).toHaveBeenCalledTimes(1);
    expect(notificationAsync).toHaveBeenCalledTimes(3);
  });

  it('no rompe si el módulo falla', () => {
    selectionAsync.mockRejectedValueOnce(new Error('sin soporte'));
    expect(() => select()).not.toThrow();
  });
});
