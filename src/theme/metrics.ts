export const durations = {
  fast: 150,
  standard: 220,
  slow: 320,
} as const;

export const componentHeights = {
  button: 52,
  input: 52,
  chip: 32,
  tag: 20,
  listRow: 64,
  tabBar: 64,
  iconButton: 44,
} as const;

export type Durations = typeof durations;
export type ComponentHeights = typeof componentHeights;
