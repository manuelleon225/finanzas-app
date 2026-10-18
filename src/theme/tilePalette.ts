export type TileKey =
  | 'orange'
  | 'coral'
  | 'blue'
  | 'violet'
  | 'yellow'
  | 'teal'
  | 'sky'
  | 'pink'
  | 'purple'
  | 'indigo'
  | 'green'
  | 'gray';

export type TileColors = {
  darkBg: string;
  darkIcon: string;
  lightBg: string;
  lightIcon: string;
};

export type TileColorPair = {
  bg: string;
  icon: string;
};

// Paleta de fichas de categoría (v3 §3.2 del Anexo).
export const tilePalette: Record<TileKey, TileColors> = {
  orange: { darkBg: '#3A2A1C', darkIcon: '#FFA25C', lightBg: '#FFE3CC', lightIcon: '#B8480F' },
  coral: { darkBg: '#3A2418', darkIcon: '#FF8A5C', lightBg: '#FFE0D4', lightIcon: '#B83C0F' },
  blue: { darkBg: '#1C2A3F', darkIcon: '#6EA8FF', lightBg: '#D9E6FF', lightIcon: '#1B4FB8' },
  violet: { darkBg: '#2B2447', darkIcon: '#A78BFA', lightBg: '#E7DEFF', lightIcon: '#5B34C7' },
  yellow: { darkBg: '#3A3217', darkIcon: '#F5C542', lightBg: '#FFF0C2', lightIcon: '#8A6100' },
  teal: { darkBg: '#153A36', darkIcon: '#3DD6C0', lightBg: '#CFF3EC', lightIcon: '#0B7A6A' },
  sky: { darkBg: '#162E45', darkIcon: '#4FB7FF', lightBg: '#D5ECFF', lightIcon: '#0B6AAE' },
  pink: { darkBg: '#3A1F33', darkIcon: '#FF7AC8', lightBg: '#FFD9EE', lightIcon: '#B0206F' },
  purple: { darkBg: '#2E2147', darkIcon: '#C084FC', lightBg: '#EBD9FF', lightIcon: '#7A2FC7' },
  indigo: { darkBg: '#1F2A44', darkIcon: '#7C9BFF', lightBg: '#DCE4FF', lightIcon: '#2F4BC0' },
  green: { darkBg: '#1C3A2C', darkIcon: '#4ADE9A', lightBg: '#D4F1DF', lightIcon: '#0F7A45' },
  gray: { darkBg: '#232938', darkIcon: '#9AA3B8', lightBg: '#E3E7F0', lightIcon: '#5B6270' },
};

export function getTileColors(key: TileKey, mode: 'dark' | 'light'): TileColorPair {
  const tile = tilePalette[key] ?? tilePalette.gray;
  return mode === 'light'
    ? { bg: tile.lightBg, icon: tile.lightIcon }
    : { bg: tile.darkBg, icon: tile.darkIcon };
}

export type CategoryKind = 'income' | 'expense';
export type AccountType = 'cash' | 'bank' | 'savings' | 'credit_card';

export type CategoryTileInput = {
  name: string;
  kind: CategoryKind;
  color?: string | null;
};

export type AccountTileInput = {
  type: AccountType;
};

export type TileInput = CategoryTileInput | AccountTileInput;

// Mapeo por defecto de las categorías de la app (v3 §3.3 del Anexo), por nombre.
const DEFAULT_CATEGORY_TILE: Record<CategoryKind, Record<string, TileKey>> = {
  expense: {
    comida: 'orange',
    mercado: 'coral',
    transporte: 'blue',
    vivienda: 'violet',
    servicios: 'yellow',
    salud: 'teal',
    educacion: 'sky',
    entretenimiento: 'pink',
    ropa: 'purple',
    suscripciones: 'indigo',
    otros: 'gray',
  },
  income: {
    salario: 'green',
    extra: 'yellow',
    ventas: 'teal',
    regalos: 'pink',
    otros: 'gray',
  },
};

// Color guardado -> clave de ficha (tono más cercano). No cambia los datos guardados.
const COLOR_TILE: Record<string, TileKey> = {
  '#ef4444': 'coral',
  '#f97316': 'orange',
  '#f59e0b': 'yellow',
  '#eab308': 'yellow',
  '#84cc16': 'green',
  '#22c55e': 'green',
  '#10b981': 'teal',
  '#14b8a6': 'teal',
  '#3b82f6': 'blue',
  '#6366f1': 'indigo',
  '#a855f7': 'purple',
  '#ec4899': 'pink',
  '#8b5cf6': 'violet',
  '#0ea5e9': 'sky',
  '#6b7280': 'gray',
  '#16a34a': 'green',
  '#f43f5e': 'pink',
};

const ACCOUNT_TILE: Record<AccountType, TileKey> = {
  cash: 'blue',
  bank: 'green',
  savings: 'violet',
  credit_card: 'pink',
};

function normalizeName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function tileByColor(color?: string | null): TileKey | undefined {
  if (!color) {
    return undefined;
  }
  return COLOR_TILE[color.trim().toLowerCase()];
}

export function resolveTileKey(input: TileInput): TileKey {
  if ('type' in input) {
    return ACCOUNT_TILE[input.type] ?? 'gray';
  }

  const byName = DEFAULT_CATEGORY_TILE[input.kind]?.[normalizeName(input.name)];
  if (byName) {
    return byName;
  }

  return tileByColor(input.color) ?? 'gray';
}
