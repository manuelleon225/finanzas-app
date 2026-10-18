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
  brandDeep: string;
  brandSoft: string;
  brandText: string;
  onBrand: string;
  onBrandMuted: string;
  blockTrack: string;
  blockSoft: string;
  blockDecor: string;
  income: string;
  expense: string;
  extra: string;
  extraFill: string;
  extraSoft: string;
  danger: string;
  dangerSoft: string;
  scrim: string;
};

const dark: ThemeColors = {
  bg: '#0E1118',
  surface: '#171B26',
  surfaceRaised: '#1F2433',
  surfaceHigh: '#2A3042',
  border: '#232938',
  textPrimary: '#F2F4FA',
  textSecondary: '#9AA3B8',
  textMuted: '#7C849A',
  brand: '#2F5BFF',
  brandDeep: '#2449E0',
  brandSoft: '#26305A',
  brandText: '#9DB4FF',
  onBrand: '#FFFFFF',
  onBrandMuted: '#EEF3FF',
  blockTrack: '#5A80FF',
  blockSoft: '#1F45D6',
  blockDecor: 'rgba(255, 255, 255, 0.08)',
  income: '#4ADE9A',
  expense: '#FF7A6B',
  extra: '#F5B544',
  extraFill: '#F5B544',
  extraSoft: '#3A3217',
  danger: '#FF6B6B',
  dangerSoft: '#3A1E1E',
  scrim: 'rgba(0, 0, 0, 0.6)',
};

const light: ThemeColors = {
  bg: '#F4F6FB',
  surface: '#FFFFFF',
  surfaceRaised: '#EEF1F7',
  surfaceHigh: '#E3E7F0',
  border: '#E3E6EB',
  textPrimary: '#12141A',
  textSecondary: '#5B6270',
  textMuted: '#646B79',
  brand: '#2F5BFF',
  brandDeep: '#2449E0',
  brandSoft: '#E3EBFF',
  brandText: '#2347D6',
  onBrand: '#FFFFFF',
  onBrandMuted: '#EEF3FF',
  blockTrack: '#5A80FF',
  blockSoft: '#1F45D6',
  blockDecor: 'rgba(255, 255, 255, 0.10)',
  income: '#0F7A45',
  expense: '#C73A2B',
  extra: '#9A5B00',
  extraFill: '#F2A93B',
  extraSoft: '#FFF0C2',
  danger: '#C73A2B',
  dangerSoft: '#FFE3E0',
  scrim: 'rgba(0, 0, 0, 0.4)',
};

export const colors: Record<'dark' | 'light', ThemeColors> = { dark, light };
