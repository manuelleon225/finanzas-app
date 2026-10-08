import { useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { useTheme } from '@/theme';

import { Text } from './Text';

export type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  helperText?: string;
};

export function Input({ label, error, helperText, style, onFocus, onBlur, ...rest }: InputProps) {
  const { colors, radii, spacing, componentHeights } = useTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error ? colors.expense : focused ? colors.brand : 'transparent';

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
            backgroundColor: colors.surfaceRaised,
            borderColor,
            borderRadius: radii.md,
            height: componentHeights.input,
            paddingHorizontal: spacing.md,
            fontSize: 15,
          },
          style,
        ]}
        placeholderTextColor={colors.textMuted}
        accessibilityLabel={label}
        accessibilityHint={error}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        {...rest}
      />
      {error ? (
        <Text variant="caption" color={colors.expense} style={{ marginTop: spacing.xs }}>
          {error}
        </Text>
      ) : helperText ? (
        <Text variant="caption" color={colors.textSecondary} style={{ marginTop: spacing.xs }}>
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
    borderWidth: 1,
  },
});
