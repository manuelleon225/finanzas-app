import { getTileColors, resolveTileKey, type TileKey } from '@/theme';

import { OTHERS_ID, type AnalysisKind, type CategoryFlow } from './analysis';

export type SliceMode = 'dark' | 'light';

export type SliceInput = Pick<CategoryFlow, 'categoryId' | 'name' | 'color'>;

/**
 * Clave de ficha de una porción del donut. Se reutiliza el mismo mapeo que las
 * filas de categoría (nombre, y si no, color) para que una categoría tenga
 * siempre el mismo color. "Otros" va en gray.
 */
export function sliceTileKey(item: SliceInput, kind: AnalysisKind): TileKey {
  if (item.categoryId === OTHERS_ID) {
    return 'gray';
  }
  return resolveTileKey({ name: item.name, kind, color: item.color });
}

/**
 * Color de la porción del donut: el color de ícono de la ficha en el modo
 * actual (oscuro o claro). Es determinista: la misma categoría siempre pinta
 * igual, independiente del monto o del orden.
 */
export function sliceColor(item: SliceInput, kind: AnalysisKind, mode: SliceMode): string {
  return getTileColors(sliceTileKey(item, kind), mode).icon;
}
