import { useState, type ReactNode } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { fontSizes, useTheme } from '@/theme';

import { Text } from './Text';

export type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  helperText?: string;
  rightAccessory?: ReactNode;
};

export function Input({
  label,
  error,
  helperText,
  rightAccessory,
  style,
  onFocus,
  onBlur,
  ...rest
}: InputProps) {
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
      <View
        style={[
          styles.field,
          {
            backgroundColor: colors.surfaceRaised,
            borderColor,
            borderRadius: radii.lg,
            height: componentHeights.input,
            paddingHorizontal: spacing.md,
          },
        ]}
      >
        <TextInput
          style={[styles.input, { color: colors.textPrimary }, style]}
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
        {rightAccessory}
      </View>
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
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
    fontSize: fontSizes.body,
  },
});
