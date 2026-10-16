import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';

import { Text } from './Text';

export type ConnectivityPillProps = {
  label: string | null;
};

/** Píldora discreta de estado de conexión. No renderiza nada si `label` es null. */
export function ConnectivityPill({ label }: ConnectivityPillProps) {
  const { colors, radii, spacing } = useTheme();

  if (!label) {
    return null;
  }

  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={label}
      style={[
        styles.pill,
        {
          backgroundColor: colors.surfaceRaised,
          borderRadius: radii.pill,
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
        },
      ]}
    >
      <Text variant="micro" color={colors.textSecondary}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
  },
});
