export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  sheet: 28,
  pill: 999,
} as const;

export type Radii = typeof radii;
