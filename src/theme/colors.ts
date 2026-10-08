export type ThemeColors = {
  bg: string;
  surface: string;
  surfaceRaised: string;
  surfaceHigh: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  brand: string;
  brandSoft: string;
  onBrand: string;
  income: string;
  expense: string;
  extra: string;
  extraSoft: string;
  danger: string;
  scrim: string;
  // deprecated: migrar a bg
  background: string;
  // deprecated: migrar a brand
  primary: string;
  // deprecated: migrar a onBrand
  onPrimary: string;
  // deprecated: migrar a extra
  warning: string;
};

const dark = {
  bg: '#0F1115',
  surface: '#181B22',
  surfaceRaised: '#1F232C',
  surfaceHigh: '#2A2F3A',
  border: '#262A33',
  textPrimary: '#F2F3F5',
  textSecondary: '#9AA0AB',
  textMuted: '#858B97',
  brand: '#7C86FF',
  brandSoft: '#262B4D',
  onBrand: '#0F1115',
  income: '#4ADE9A',
  expense: '#FF7A6B',
  extra: '#F5B544',
  extraSoft: '#3A2E14',
  danger: '#FF5C5C',
  scrim: 'rgba(0, 0, 0, 0.6)',
  background: '#0F1115',
  primary: '#7C86FF',
  onPrimary: '#0F1115',
  warning: '#F5B544',
} as const;

const light = {
  bg: '#F6F7F9',
  surface: '#FFFFFF',
  surfaceRaised: '#F0F2F5',
  surfaceHigh: '#E6E9EE',
  border: '#E3E6EB',
  textPrimary: '#12141A',
  textSecondary: '#5B6270',
  textMuted: '#6B7280',
  brand: '#4F5BFF',
  brandSoft: '#E6E8FF',
  onBrand: '#FFFFFF',
  income: '#0A7F48',
  expense: '#C73A2B',
  extra: '#9A5B00',
  extraSoft: '#FFF1D6',
  danger: '#C73A2B',
  scrim: 'rgba(0, 0, 0, 0.4)',
  background: '#F6F7F9',
  primary: '#4F5BFF',
  onPrimary: '#FFFFFF',
  warning: '#9A5B00',
} as const;

export const colors: Record<'dark' | 'light', ThemeColors> = { dark, light };
