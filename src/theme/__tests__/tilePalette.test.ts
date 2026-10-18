import { getTileColors, resolveTileKey, tilePalette, type AccountType } from '../tilePalette';

describe('resolveTileKey: categorías por defecto (v3 §3.3)', () => {
  const expense: [string, string, string][] = [
    ['Comida', '#EF4444', 'orange'],
    ['Mercado', '#F97316', 'coral'],
    ['Transporte', '#3B82F6', 'blue'],
    ['Vivienda', '#8B5CF6', 'violet'],
    ['Servicios', '#EAB308', 'yellow'],
    ['Salud', '#14B8A6', 'teal'],
    ['Educación', '#0EA5E9', 'sky'],
    ['Entretenimiento', '#EC4899', 'pink'],
    ['Ropa', '#A855F7', 'purple'],
    ['Suscripciones', '#6366F1', 'indigo'],
    ['Otros', '#6B7280', 'gray'],
  ];

  it.each(expense)('gasto %s -> %s -> %s', (name, color, expected) => {
    expect(resolveTileKey({ name, kind: 'expense', color })).toBe(expected);
  });

  const income: [string, string, string][] = [
    ['Salario', '#16A34A', 'green'],
    ['Extra', '#22C55E', 'yellow'],
    ['Ventas', '#10B981', 'teal'],
    ['Regalos', '#F43F5E', 'pink'],
    ['Otros', '#6B7280', 'gray'],
  ];

  it.each(income)('ingreso %s -> %s -> %s', (name, color, expected) => {
    expect(resolveTileKey({ name, kind: 'income', color })).toBe(expected);
  });
});

describe('resolveTileKey: color guardado (clave más cercana en tono)', () => {
  it('categoría personalizada usa el color de la paleta', () => {
    expect(resolveTileKey({ name: 'Café', kind: 'expense', color: '#3B82F6' })).toBe('blue');
    expect(resolveTileKey({ name: 'Gym', kind: 'expense', color: '#EC4899' })).toBe('pink');
  });

  it('color desconocido y nombre no por defecto -> gray', () => {
    expect(resolveTileKey({ name: 'Café', kind: 'expense', color: '#123456' })).toBe('gray');
  });

  it('sin color y nombre no por defecto -> gray', () => {
    expect(resolveTileKey({ name: 'Café', kind: 'expense' })).toBe('gray');
    expect(resolveTileKey({ name: 'Café', kind: 'expense', color: null })).toBe('gray');
  });

  it('normaliza el color a minúsculas', () => {
    expect(resolveTileKey({ name: 'Café', kind: 'expense', color: '#3b82f6' })).toBe('blue');
  });
});

describe('resolveTileKey: cuentas por tipo', () => {
  const accounts: [AccountType, string][] = [
    ['cash', 'blue'],
    ['bank', 'green'],
    ['savings', 'violet'],
    ['credit_card', 'pink'],
  ];

  it.each(accounts)('%s -> %s', (type, expected) => {
    expect(resolveTileKey({ type })).toBe(expected);
  });
});

describe('getTileColors', () => {
  it('devuelve fondo e ícono según el modo', () => {
    expect(getTileColors('blue', 'dark')).toEqual({ bg: '#1C2A3F', icon: '#6EA8FF' });
    expect(getTileColors('blue', 'light')).toEqual({ bg: '#D9E6FF', icon: '#1B4FB8' });
  });

  it('cada clave tiene sus cuatro valores', () => {
    for (const colors of Object.values(tilePalette)) {
      expect(colors.darkBg).toMatch(/^#[0-9A-F]{6}$/);
      expect(colors.darkIcon).toMatch(/^#[0-9A-F]{6}$/);
      expect(colors.lightBg).toMatch(/^#[0-9A-F]{6}$/);
      expect(colors.lightIcon).toMatch(/^#[0-9A-F]{6}$/);
    }
  });
});
