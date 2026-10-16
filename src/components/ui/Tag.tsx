import { StyleSheet, View, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

import { Text } from './Text';

export type TagTone = 'extra' | 'base' | 'neutral' | 'pending';

export type TagProps = {
  label: string;
  tone?: TagTone;
  style?: ViewStyle;
};

export function Tag({ label, tone = 'neutral', style }: TagProps) {
  const { colors, componentHeights, radii } = useTheme();

  const backgroundColor =
    tone === 'extra' ? colors.extraSoft : tone === 'base' ? colors.brandSoft : colors.surfaceRaised;
  const textColor =
    tone === 'extra' ? colors.extra : tone === 'base' ? colors.brand : colors.textSecondary;

  return (
    <View
      accessible
      accessibilityLabel={label}
      style={[
        styles.tag,
        {
          backgroundColor,
          borderRadius: radii.pill,
          height: componentHeights.tag,
        },
        style,
      ]}
    >
      <Text variant="micro" color={textColor}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
