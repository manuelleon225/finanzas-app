import { renderHook } from '@testing-library/react-native';

import { resolveAccountTile, resolveCategoryTile, useCategoryTile } from '../tileHelpers';

describe('resolveCategoryTile', () => {
  it('usa la ficha de la categoría por defecto', () => {
    expect(
      resolveCategoryTile({
        name: 'Comida',
        kind: 'expense',
        icon: 'fast-food-outline',
        color: '#EF4444',
      }),
    ).toEqual({ icon: 'fast-food-outline', tileKey: 'orange' });
  });

  it('usa el color guardado en una categoría personalizada', () => {
    expect(
      resolveCategoryTile({
        name: 'Café',
        kind: 'expense',
        icon: 'cafe-outline',
        color: '#3B82F6',
      }),
    ).toEqual({ icon: 'cafe-outline', tileKey: 'blue' });
  });
});

describe('resolveAccountTile', () => {
  it.each([
    ['cash', 'wallet', 'blue'],
    ['bank', 'business', 'green'],
    ['credit_card', 'card', 'pink'],
  ] as const)('%s -> %s / %s', (type, icon, tileKey) => {
    expect(resolveAccountTile({ type })).toEqual({ icon, tileKey });
  });

  it('savings cae a cash si el ícono de Piggy no existe en Ionicons', () => {
    expect(resolveAccountTile({ type: 'savings' })).toEqual({ icon: 'wallet', tileKey: 'violet' });
  });
});

describe('useCategoryTile', () => {
  it('devuelve el descriptor de la categoría', async () => {
    const { result } = await renderHook(() =>
      useCategoryTile({ name: 'Salario', kind: 'income', icon: 'cash-outline', color: '#16A34A' }),
    );
    expect(result.current).toEqual({ icon: 'cash-outline', tileKey: 'green' });
  });
});
