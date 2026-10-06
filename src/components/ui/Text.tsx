import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';

import { useTheme } from '@/theme';

export type TextVariant = 'title' | 'subtitle' | 'body' | 'caption' | 'money';

export type TextProps = RNTextProps & {
  variant?: TextVariant;
  color?: string;
  align?: TextStyle['textAlign'];
};

export function Text({ variant = 'body', color, align, style, ...rest }: TextProps) {
  const { colors, fontSizes, fontWeights, lineHeights } = useTheme();

  let variantStyle: TextStyle;
  switch (variant) {
    case 'title':
      variantStyle = {
        fontSize: fontSizes.xxl,
        lineHeight: lineHeights.xxl,
        fontWeight: fontWeights.bold,
        color: colors.textPrimary,
      };
      break;
    case 'subtitle':
      variantStyle = {
        fontSize: fontSizes.xl,
        lineHeight: lineHeights.xl,
        fontWeight: fontWeights.semibold,
        color: colors.textPrimary,
      };
      break;
    case 'caption':
      variantStyle = {
        fontSize: fontSizes.sm,
        lineHeight: lineHeights.sm,
        fontWeight: fontWeights.regular,
        color: colors.textSecondary,
      };
      break;
    case 'money':
      variantStyle = {
        fontSize: fontSizes.lg,
        lineHeight: lineHeights.lg,
        fontWeight: fontWeights.semibold,
        color: colors.textPrimary,
        fontVariant: ['tabular-nums'],
      };
      break;
    case 'body':
    default:
      variantStyle = {
        fontSize: fontSizes.md,
        lineHeight: lineHeights.md,
        fontWeight: fontWeights.regular,
        color: colors.textPrimary,
      };
      break;
  }

  return (
    <RNText
      style={[variantStyle, color ? { color } : null, align ? { textAlign: align } : null, style]}
      {...rest}
    />
  );
}
