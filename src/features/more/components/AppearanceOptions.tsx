import { Pressable, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { Text } from '@/components/ui/Text';
import { es } from '@/i18n/es';
import { useTheme, type ThemeModePreference } from '@/theme';

export type AppearanceOptionsProps = {
  value: ThemeModePreference;
  onChange: (value: ThemeModePreference) => void;
};

const OPTIONS: { value: ThemeModePreference; label: string }[] = [
  { value: 'system', label: es.more.appearanceSystem },
  { value: 'dark', label: es.more.appearanceDark },
  { value: 'light', label: es.more.appearanceLight },
];

export function AppearanceOptions({ value, onChange }: AppearanceOptionsProps) {
  const { colors, radii, spacing, componentHeights } = useTheme();

  return (
    <View accessibilityRole="radiogroup" style={{ gap: spacing.xs }}>
      {OPTIONS.map((option) => {
        const selected = option.value === value;

        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={option.label}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: spacing.md,
              minHeight: componentHeights.iconButton,
              paddingHorizontal: spacing.sm,
              borderRadius: radii.md,
              backgroundColor: pressed ? colors.surfaceRaised : 'transparent',
            })}
          >
            <Text variant="body">{option.label}</Text>
            {selected ? <AppIcon name="checkmark" size={20} color={colors.brand} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}
