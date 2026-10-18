import type { StatusBarStyle } from 'expo-status-bar';

export type SystemBarVariant = 'block' | 'plain';
export type SystemBarMode = 'dark' | 'light';

/** Token del tema que pinta el área de la zona segura superior (R8.1). */
export type TopInsetColorToken = 'brand' | 'bg';

/**
 * Estilo de los íconos de la barra de estado (v3 §7).
 * - `block`: pantallas con el bloque azul de marca -> siempre íconos claros.
 * - `plain`: pantallas sobre el fondo normal -> claros en oscuro, oscuros en claro.
 */
export function getStatusBarStyle(mode: SystemBarMode, variant: SystemBarVariant): StatusBarStyle {
  if (variant === 'block') {
    return 'light';
  }
  return mode === 'light' ? 'dark' : 'light';
}

/**
 * Color del área de la zona segura superior, detrás de la barra de estado (R8.1).
 * En pantallas con bloque se pinta `brand` para que el azul llegue al borde; en
 * las demás, `bg`. Devuelve un token del tema; el componente lo resuelve con
 * `useTheme()`.
 */
export function getTopInsetColor(variant: SystemBarVariant): TopInsetColorToken {
  return variant === 'block' ? 'brand' : 'bg';
}
