import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { useTheme } from '@/theme';

import { Text } from './Text';

export type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  helperText?: string;
};

export function Input({ label, error, helperText, style, ...rest }: InputProps) {
  const { colors, radii, spacing, fontSizes } = useTheme();

  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text variant="caption" style={{ marginBottom: spacing.xs }}>
          {label}
        </Text>
      ) : null}
      <TextInput
        style={[
          styles.input,
          {
            color: colors.textPrimary,
            backgroundColor: colors.surface,
            borderColor: error ? colors.danger : colors.border,
            borderRadius: radii.md,
            paddingHorizontal: spacing.md,
            fontSize: fontSizes.md,
          },
          style,
        ]}
        placeholderTextColor={colors.textSecondary}
        accessibilityLabel={label}
        accessibilityHint={error}
        {...rest}
      />
      {error ? (
        <Text variant="caption" color={colors.danger} style={{ marginTop: spacing.xs }}>
          {error}
        </Text>
      ) : helperText ? (
        <Text variant="caption" style={{ marginTop: spacing.xs }}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'stretch',
  },
  input: {
    minHeight: 44,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
