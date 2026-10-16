import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { Screen, Text } from '@/components/ui';
import { useTheme } from '@/theme';

export type AuthScaffoldProps = {
  title: string;
  support?: string;
  children: ReactNode;
};

export function AuthScaffold({ title, support, children }: AuthScaffoldProps) {
  const { colors, spacing } = useTheme();

  return (
    <Screen scroll={false}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={{
            flexGrow: 1,
            gap: spacing.xl,
            paddingTop: spacing.xxl,
            paddingBottom: spacing.xl,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ gap: spacing.xs }}>
            <Text variant="display" color={colors.brand}>
              Finanzas
            </Text>
            <Text variant="title">{title}</Text>
            {support ? <Text variant="caption">{support}</Text> : null}
          </View>
          <View style={{ gap: spacing.md }}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
