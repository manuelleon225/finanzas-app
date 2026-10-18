import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { PressableScale } from './PressableScale';

import { tint, useTheme } from '@/theme';

import { AppIcon } from './AppIcon';
import { Text } from './Text';
import { Tag, type TagTone } from './Tag';

export type ListRowProps = {
  icon?: string;
  iconColor?: string;
  leading?: ReactNode;
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
  leading,
  title,
  subtitle,
  trailing,
  tag,
  onPress,
  style,
}: ListRowProps) {
  const { colors, componentHeights } = useTheme();

  return (
    <PressableScale
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
      {leading ??
        (icon ? (
          <View
            style={[
              styles.circle,
              { backgroundColor: tint(iconColor ?? colors.textSecondary, 0.16) },
            ]}
          >
            <AppIcon name={icon} size={20} color={iconColor ?? colors.textSecondary} />
          </View>
        ) : null)}
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
    </PressableScale>
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
