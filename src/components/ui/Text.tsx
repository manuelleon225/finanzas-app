import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';

import { useTheme } from '@/theme';

const MANROPE_FACE: Record<string, string> = {
  '400': 'Manrope_400Regular',
  '500': 'Manrope_500Medium',
  '600': 'Manrope_600SemiBold',
  '700': 'Manrope_700Bold',
};

export type TextVariant =
  | 'displayLg'
  | 'display'
  | 'title'
  | 'subtitle'
  | 'body'
  | 'bodyStrong'
  | 'caption'
  | 'micro'
  // aliases compatibles hacia atrás
  | 'money';

export type TextProps = RNTextProps & {
  variant?: TextVariant;
  color?: string;
  align?: TextStyle['textAlign'];
};

export function Text({ variant = 'body', color, align, style, ...rest }: TextProps) {
  const { colors } = useTheme();

  const base = {
    fontSize: fontSizeFor(variant),
    lineHeight: lineHeightFor(variant),
    fontWeight: fontWeightFor(variant),
    fontFamily: fontFamilyFor(variant),
    color: colors.textPrimary,
    fontVariant: variant === 'money' ? (['tabular-nums'] as TextStyle['fontVariant']) : undefined,
  };

  const variantStyle: TextStyle = {
    ...base,
    color: variant === 'caption' || variant === 'micro' ? colors.textSecondary : colors.textPrimary,
  };

  return (
    <RNText
      style={[variantStyle, color ? { color } : null, align ? { textAlign: align } : null, style]}
      {...rest}
    />
  );
}

function fontWeightFor(variant: TextVariant): TextStyle['fontWeight'] {
  switch (variant) {
    case 'displayLg':
    case 'display':
    case 'title':
    case 'bodyStrong':
    case 'money':
      return '600';
    case 'subtitle':
    case 'micro':
      return '500';
    default:
      return '400';
  }
}

function fontSizeFor(variant: TextVariant): number {
  switch (variant) {
    case 'displayLg':
      return 40;
    case 'display':
      return 34;
    case 'title':
      return 22;
    case 'subtitle':
      return 17;
    case 'body':
    case 'bodyStrong':
    case 'money':
      return 15;
    case 'caption':
      return 12;
    case 'micro':
      return 11;
    default:
      return 15;
  }
}

function lineHeightFor(variant: TextVariant): number {
  switch (variant) {
    case 'displayLg':
      return 48;
    case 'display':
      return 40;
    case 'title':
      return 28;
    case 'subtitle':
      return 24;
    case 'body':
    case 'bodyStrong':
    case 'money':
      return 22;
    case 'caption':
      return 16;
    case 'micro':
      return 14;
    default:
      return 22;
  }
}

function fontFamilyFor(variant: TextVariant): string {
  return MANROPE_FACE[String(fontWeightFor(variant))] ?? 'Manrope_400Regular';
}
