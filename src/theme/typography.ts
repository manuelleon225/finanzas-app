export const fontSizes = {
  displayLg: 44,
  display: 34,
  title: 24,
  subtitle: 17,
  body: 15,
  bodyStrong: 15,
  caption: 12,
  micro: 11,
} as const;

export const fontWeights = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const lineHeights = {
  displayLg: 52,
  display: 40,
  title: 30,
  subtitle: 24,
  body: 22,
  bodyStrong: 22,
  caption: 16,
  micro: 14,
} as const;

export type FontSizes = typeof fontSizes;
export type FontWeights = typeof fontWeights;
export type LineHeights = typeof lineHeights;
