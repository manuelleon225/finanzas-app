import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { tint, useTheme } from '@/theme';

import { AppIcon } from './AppIcon';
import { Text } from './Text';
import { Tag, type TagTone } from './Tag';

export type ListRowProps = {
  icon: string;
  iconColor: string;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  tag?: { label: string; tone?: TagTone };
  onPress?: () => void;
  style?: ViewStyle;
};

export function ListRow({
  icon,
  iconColor,
  title,
  subtitle,
  trailing,
  tag,
  onPress,
  style,
}: ListRowProps) {
  const { colors, componentHeights } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: pressed ? colors.surfaceRaised : 'transparent',
          minHeight: componentHeights.listRow,
        },
        style,
      ]}
    >
      <View style={[styles.circle, { backgroundColor: tint(iconColor, 0.16) }]}>
        <AppIcon name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text variant="body" numberOfLines={1} style={{ flexShrink: 1 }}>
            {title}
          </Text>
          {tag ? <Tag label={tag.label} tone={tag.tone} /> : null}
        </View>
        {subtitle ? (
          <Text variant="caption" color={colors.textSecondary} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
