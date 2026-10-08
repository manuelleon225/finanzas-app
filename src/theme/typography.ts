export const fontSizes = {
  displayLg: 40,
  display: 34,
  title: 22,
  subtitle: 17,
  body: 15,
  bodyStrong: 15,
  caption: 12,
  micro: 11,
  // deprecated: migrar a micro/body/etc. según variante
  xs: 11,
  // deprecated: migrar a caption
  sm: 12,
  // deprecated: migrar a body
  md: 15,
  // deprecated: migrar a subtitle
  lg: 17,
  // deprecated: migrar a subtitle
  xl: 17,
  // deprecated: migrar a title
  xxl: 22,
} as const;

export const fontWeights = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const lineHeights = {
  displayLg: 48,
  display: 40,
  title: 28,
  subtitle: 24,
  body: 22,
  bodyStrong: 22,
  caption: 16,
  micro: 14,
  // deprecated
  xs: 14,
  sm: 16,
  md: 22,
  lg: 24,
  xl: 24,
  xxl: 28,
} as const;

export type FontSizes = typeof fontSizes;
export type FontWeights = typeof fontWeights;
export type LineHeights = typeof lineHeights;
