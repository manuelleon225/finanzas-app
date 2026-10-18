import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { ScreenScaffold, Text } from '@/components/ui';
import { useTheme } from '@/theme';

export type AuthScaffoldProps = {
  title: string;
  support?: string;
  children: ReactNode;
};

export function AuthScaffold({ title, support, children }: AuthScaffoldProps) {
  const { colors, spacing } = useTheme();

  return (
    <ScreenScaffold
      variant="block"
      scroll={false}
      header={
        <View style={{ gap: spacing.xs }}>
          <Text variant="display" color={colors.onBrand}>
            Finanzas
          </Text>
          <Text variant="title" color={colors.onBrand}>
            {title}
          </Text>
          {support ? (
            <Text variant="caption" color={colors.onBrandMuted}>
              {support}
            </Text>
          ) : null}
        </View>
      }
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={{
            flexGrow: 1,
            gap: spacing.md,
            paddingTop: spacing.lg,
            paddingBottom: spacing.xl,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
