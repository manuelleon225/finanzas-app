export type ThemeColors = {
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  primary: string;
  onPrimary: string;
  income: string;
  expense: string;
  extra: string;
  warning: string;
  danger: string;
};

export const colors: Record<'light' | 'dark', ThemeColors> = {
  light: {
    background: '#F5F7FA',
    surface: '#FFFFFF',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    primary: '#059669',
    onPrimary: '#FFFFFF',
    income: '#16A34A',
    expense: '#E5484D',
    extra: '#D97706',
    warning: '#F59E0B',
    danger: '#DC2626',
  },
  dark: {
    background: '#0B0F14',
    surface: '#151B23',
    textPrimary: '#F3F4F6',
    textSecondary: '#9CA3AF',
    border: '#2A313C',
    primary: '#10B981',
    onPrimary: '#04231A',
    income: '#4ADE80',
    expense: '#F87171',
    extra: '#FBBF24',
    warning: '#FBBF24',
    danger: '#F87171',
  },
};
