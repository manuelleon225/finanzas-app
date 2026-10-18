import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';

import { getStatusBarStyle, type SystemBarVariant } from '@/lib/systemBars';
import { useTheme } from '@/theme';

export type SystemBarsProps = {
  variant?: SystemBarVariant;
};

/**
 * Aplica las barras del sistema al tema actual (v3 §7):
 * - estilo de los íconos de la barra de estado según `variant` y modo,
 * - color de fondo del sistema (vista raíz) = token `bg`, que es lo que se ve
 *   detrás de las barras transparentes en borde a borde.
 */
export function SystemBars({ variant = 'plain' }: SystemBarsProps) {
  const { colors, mode } = useTheme();

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(colors.bg);
  }, [colors.bg]);

  return <StatusBar style={getStatusBarStyle(mode, variant)} animated />;
}
