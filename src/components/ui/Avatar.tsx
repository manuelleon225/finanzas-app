import { View } from 'react-native';

import { useTheme } from '@/theme';

import { Text, type TextVariant } from './Text';

export type AvatarSize = 32 | 36 | 44;

export type AvatarProps = {
  name: string;
  size?: AvatarSize;
  onBlock?: boolean;
  accessibilityLabel?: string;
};

const TEXT_VARIANTS: Record<AvatarSize, TextVariant> = {
  32: 'caption',
  36: 'body',
  44: 'bodyStrong',
};

function initialOf(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : '?';
}

export function Avatar({ name, size = 36, onBlock = false, accessibilityLabel }: AvatarProps) {
  const { colors, radii } = useTheme();
  const isLabeled = accessibilityLabel != null;

  return (
    <View
      testID="avatar"
      accessible={isLabeled}
      accessibilityRole={isLabeled ? 'image' : undefined}
      accessibilityLabel={accessibilityLabel}
      style={{
        width: size,
        height: size,
        borderRadius: radii.pill,
        backgroundColor: onBlock ? colors.blockTrack : colors.brand,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text variant={TEXT_VARIANTS[size]} color={colors.onBrand}>
        {initialOf(name)}
      </Text>
    </View>
  );
}
