import { colors } from '../colors';

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function luminance(hex: string): number {
  const rgb = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).map(channel);
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}

type Pairs = [
  fg: keyof (typeof colors)['dark'],
  bg: keyof (typeof colors)['dark'],
  label: string,
][];

const pairs: Pairs = [
  ['textPrimary', 'bg', 'textPrimary/bg'],
  ['textPrimary', 'surface', 'textPrimary/surface'],
  ['textPrimary', 'surfaceRaised', 'textPrimary/surfaceRaised'],
  ['textSecondary', 'bg', 'textSecondary/bg'],
  ['textSecondary', 'surface', 'textSecondary/surface'],
  ['textSecondary', 'surfaceRaised', 'textSecondary/surfaceRaised'],
  ['textMuted', 'bg', 'textMuted/bg'],
  ['textMuted', 'surface', 'textMuted/surface'],
  ['onBrand', 'brand', 'onBrand/brand'],
  ['income', 'surface', 'income/surface'],
  ['expense', 'surface', 'expense/surface'],
  ['extra', 'surface', 'extra/surface'],
];

describe('contraste WCAG (mínimo 4.5:1)', () => {
  for (const mode of ['dark', 'light'] as const) {
    const t = colors[mode];
    for (const [fg, bg, label] of pairs) {
      it(`${mode}: ${label}`, () => {
        const ratio = contrast(t[fg], t[bg]);
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      });
    }
  }
});
