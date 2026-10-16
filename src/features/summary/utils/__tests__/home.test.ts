import { formatCOP, formatPesos } from '@/lib/money';

import {
  cushionText,
  daysToPaymentText,
  extraDependencyText,
  heroAccessibilityLabel,
  heroProgress,
  heroSpentText,
  isNoMargin,
  isOverAllowance,
} from '../home';

describe('heroProgress', () => {
  it('calcula la proporción gastada sobre lo permitido', () => {
    expect(heroProgress(25000, 50000)).toBe(0.5);
  });

  it('acota entre 0 y 1', () => {
    expect(heroProgress(-10, 50000)).toBe(0);
    expect(heroProgress(90000, 50000)).toBe(1);
  });

  it('con allowance 0 devuelve 1 solo si ya se gastó algo', () => {
    expect(heroProgress(0, 0)).toBe(0);
    expect(heroProgress(5000, 0)).toBe(1);
  });
});

describe('isOverAllowance', () => {
  it('detecta cuando se superó lo permitido', () => {
    expect(isOverAllowance(60000, 50000)).toBe(true);
    expect(isOverAllowance(50000, 50000)).toBe(false);
    expect(isOverAllowance(1000, 0)).toBe(false);
  });
});

describe('isNoMargin', () => {
  it('hay margen solo con disponible positivo', () => {
    expect(isNoMargin(0)).toBe(true);
    expect(isNoMargin(-5000)).toBe(true);
    expect(isNoMargin(1)).toBe(false);
  });
});

describe('textos', () => {
  it('gastaste de lo permitido', () => {
    expect(heroSpentText(25000, 50000)).toBe(`Gastaste ${formatCOP(25000)} de ${formatCOP(50000)}`);
  });

  it('días a tu pago vs fin de mes', () => {
    expect(daysToPaymentText(5, false)).toBe('5 días a tu pago');
    expect(daysToPaymentText(12, true)).toBe('12 días para fin de mes');
  });

  it('colchón extra', () => {
    expect(cushionText(30000)).toBe(`Colchón extra ${formatCOP(30000)}`);
  });

  it('dependencia de extras', () => {
    expect(extraDependencyText(42)).toBe('Los extras son el 42% de tus ingresos.');
  });

  it('etiqueta accesible del monto héroe', () => {
    expect(heroAccessibilityLabel(87500, 108500)).toBe(
      `Disponible hoy: ${formatPesos(87500)}, de ${formatPesos(108500)}`,
    );
  });
});
