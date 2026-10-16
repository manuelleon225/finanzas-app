import { es } from '@/i18n/es';
import { formatCOP, formatPesos } from '@/lib/money';

export function heroProgress(spentToday: number, allowanceToday: number): number {
  if (allowanceToday <= 0) {
    return spentToday > 0 ? 1 : 0;
  }
  return Math.min(1, Math.max(0, spentToday / allowanceToday));
}

export function isOverAllowance(spentToday: number, allowanceToday: number): boolean {
  return allowanceToday > 0 && spentToday > allowanceToday;
}

export function isNoMargin(availableBase: number): boolean {
  return availableBase <= 0;
}

export function heroSpentText(spentToday: number, allowanceToday: number): string {
  return es.home.spentOfAllowance
    .replace('{spent}', formatCOP(spentToday))
    .replace('{allowance}', formatCOP(allowanceToday));
}

export function daysToPaymentText(daysToIncome: number, usedFallbackHorizon: boolean): string {
  const template = usedFallbackHorizon ? es.home.daysToMonthEnd : es.home.daysToPayment;
  return template.replace('{dias}', String(daysToIncome));
}

export function cushionText(extraCushion: number): string {
  return es.home.cushionRow.replace('{monto}', formatCOP(extraCushion));
}

export function extraDependencyText(percent: number): string {
  return es.home.extraDependencyFooter.replace('{percent}', String(percent));
}

export function heroAccessibilityLabel(remainingToday: number, allowanceToday: number): string {
  return es.home.availableTodayA11y
    .replace('{remaining}', formatPesos(remainingToday))
    .replace('{allowance}', formatPesos(allowanceToday));
}
