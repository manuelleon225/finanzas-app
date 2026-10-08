import { es } from '@/i18n/es';
import { formatCOP } from '@/lib/money';

import type { AvailableTodayResult } from './availableToday';

export function explainAvailable(result: AvailableTodayResult): string[] {
  const lines: string[] = [];
  lines.push(es.home.explainLiquid.replace('{monto}', formatCOP(result.liquidBalance)));
  lines.push(es.home.explainCommitted.replace('{monto}', formatCOP(result.committed)));

  if (result.usedFallbackHorizon) {
    lines.push(es.home.explainNoIncome);
  } else {
    lines.push(es.home.explainDays.replace('{dias}', String(result.daysToIncome)));
  }

  if (result.extraCushion > 0) {
    lines.push(es.home.explainCushion.replace('{monto}', formatCOP(result.extraCushion)));
  }

  return lines;
}
