import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Button, Input, Text } from '@/components/ui';
import { resetPassword } from '@/features/auth/api/auth';
import { AuthScaffold } from '@/features/auth/components/AuthScaffold';
import { recoverySchema, type RecoveryInput } from '@/features/auth/utils/schemas';
import { es } from '@/i18n/es';
import { useTheme } from '@/theme';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { colors } = useTheme();
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
    <AuthScaffold title={es.auth.recoveryTitle} support={es.auth.recoveryInstructions}>
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

      <Button title={es.auth.backToLogin} variant="ghost" onPress={() => router.push('/login')} />
    </AuthScaffold>
  );
}
