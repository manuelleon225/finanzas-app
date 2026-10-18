import { getTileColors } from '@/theme';

import { OTHERS_ID, type CategoryFlow } from '../analysis';
import { sliceColor, sliceTileKey } from '../sliceColors';

function flow(
  partial: Partial<CategoryFlow> & Pick<CategoryFlow, 'categoryId' | 'name'>,
): CategoryFlow {
  return {
    color: null,
    icon: null,
    amount: 1000,
    percentage: 10,
    ...partial,
  };
}

describe('sliceTileKey', () => {
  it('usa el nombre de la categoría por encima del color', () => {
    const item = flow({ categoryId: 'food', name: 'Comida', color: '#EF4444' });
    expect(sliceTileKey(item, 'expense')).toBe('orange');
  });

  it('cae al color cuando el nombre no está mapeado', () => {
    const item = flow({ categoryId: 'pets', name: 'Mascotas', color: '#8b5cf6' });
    expect(sliceTileKey(item, 'expense')).toBe('violet');
  });

  it('pone "Otros" en gray', () => {
    const others = flow({ categoryId: OTHERS_ID, name: 'Otros', color: null });
    expect(sliceTileKey(others, 'expense')).toBe('gray');
    expect(sliceTileKey(others, 'income')).toBe('gray');
  });
});

describe('sliceColor', () => {
  it('da el mismo color a la misma categoría aunque cambien monto u orden', () => {
    const first = flow({ categoryId: 'food', name: 'Comida', color: '#EF4444', amount: 80000 });
    const second = flow({ categoryId: 'food', name: 'Comida', color: '#EF4444', amount: 20000 });
    expect(sliceColor(first, 'expense', 'dark')).toBe(sliceColor(second, 'expense', 'dark'));
    expect(sliceColor(first, 'expense', 'light')).toBe(sliceColor(second, 'expense', 'light'));
  });

  it('toma el color de ícono de la ficha del modo actual', () => {
    const item = flow({ categoryId: 'transport', name: 'Transporte', color: null });
    expect(sliceColor(item, 'expense', 'dark')).toBe(getTileColors('blue', 'dark').icon);
    expect(sliceColor(item, 'expense', 'light')).toBe(getTileColors('blue', 'light').icon);
  });

  it('pinta "Otros" con el gris de la paleta', () => {
    const others = flow({ categoryId: OTHERS_ID, name: 'Otros' });
    expect(sliceColor(others, 'income', 'dark')).toBe(getTileColors('gray', 'dark').icon);
    expect(sliceColor(others, 'income', 'light')).toBe(getTileColors('gray', 'light').icon);
  });

  it('distingue el modo oscuro del claro', () => {
    const item = flow({ categoryId: 'food', name: 'Comida', color: '#EF4444' });
    expect(sliceColor(item, 'expense', 'dark')).not.toBe(sliceColor(item, 'expense', 'light'));
  });
});
