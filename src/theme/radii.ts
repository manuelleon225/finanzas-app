export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
  button: 14,
} as const;

export type Radii = typeof radii;
