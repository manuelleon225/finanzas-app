import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';

import { useTheme } from '@/theme';

const MANROPE_FACE: Record<string, string> = {
  '400': 'Manrope_400Regular',
  '500': 'Manrope_500Medium',
  '600': 'Manrope_600SemiBold',
  '700': 'Manrope_700Bold',
};

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
        fontSize: fontSizes.title,
        lineHeight: lineHeights.title,
        fontWeight: fontWeights.bold,
        fontFamily: MANROPE_FACE[fontWeights.bold],
        color: colors.textPrimary,
      };
      break;
    case 'subtitle':
      variantStyle = {
        fontSize: fontSizes.subtitle,
        lineHeight: lineHeights.subtitle,
        fontWeight: fontWeights.semibold,
        fontFamily: MANROPE_FACE[fontWeights.semibold],
        color: colors.textPrimary,
      };
      break;
    case 'caption':
      variantStyle = {
        fontSize: fontSizes.caption,
        lineHeight: lineHeights.caption,
        fontWeight: fontWeights.regular,
        fontFamily: MANROPE_FACE[fontWeights.regular],
        color: colors.textSecondary,
      };
      break;
    case 'money':
      variantStyle = {
        fontSize: fontSizes.bodyStrong,
        lineHeight: lineHeights.bodyStrong,
        fontWeight: fontWeights.semibold,
        fontFamily: MANROPE_FACE[fontWeights.semibold],
        color: colors.textPrimary,
        fontVariant: ['tabular-nums'],
      };
      break;
    case 'body':
    default:
      variantStyle = {
        fontSize: fontSizes.body,
        lineHeight: lineHeights.body,
        fontWeight: fontWeights.regular,
        fontFamily: MANROPE_FACE[fontWeights.regular],
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
