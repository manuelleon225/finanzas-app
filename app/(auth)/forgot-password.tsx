import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { Button, Input, Screen, Text } from '@/components/ui';
import { resetPassword } from '@/features/auth/api/auth';
import { recoverySchema, type RecoveryInput } from '@/features/auth/utils/schemas';
import { es } from '@/i18n/es';
import { useTheme } from '@/theme';

export default function ForgotPasswordScreen() {
  const { colors, spacing } = useTheme();
  const [apiError, setApiError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RecoveryInput>({
    resolver: zodResolver(recoverySchema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async ({ email }) => {
    setApiError(null);
    setInfo(null);
    setSubmitting(true);
    try {
      await resetPassword(email);
      setInfo(es.auth.recoverySent);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : es.auth.errors.generic);
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <Screen scroll>
      <View style={styles.content}>
        <View style={{ gap: spacing.xs }}>
          <Text variant="title">{es.auth.recoveryTitle}</Text>
          <Text variant="caption">{es.auth.recoveryInstructions}</Text>
        </View>

        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <Input
              label={es.auth.email}
              placeholder={es.auth.emailPlaceholder}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={errors.email?.message}
            />
          )}
        />

        {apiError ? (
          <Text variant="caption" color={colors.danger}>
            {apiError}
          </Text>
        ) : null}
        {info ? (
          <Text variant="caption" color={colors.income}>
            {info}
          </Text>
        ) : null}

        <Button
          title={es.auth.sendRecovery}
          onPress={() => void onSubmit()}
          loading={submitting}
          disabled={submitting}
        />

        <Link href="/login" style={styles.link}>
          <Text variant="caption" color={colors.primary}>
            {es.auth.backToLogin}
          </Text>
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    justifyContent: 'center',
    flexGrow: 1,
  },
  link: {
    alignItems: 'center',
  },
});
