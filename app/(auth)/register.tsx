import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';

import { Button, Input, Text } from '@/components/ui';
import { signUp } from '@/features/auth/api/auth';
import { AuthScaffold } from '@/features/auth/components/AuthScaffold';
import { PasswordInput } from '@/features/auth/components/PasswordInput';
import { registerSchema, type RegisterInput } from '@/features/auth/utils/schemas';
import { es } from '@/i18n/es';
import { useTheme } from '@/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setApiError(null);
    setSubmitting(true);
    try {
      const result = await signUp(values);
      setSubmitting(false);
      if (!result.session) {
        router.push({ pathname: '/verify-email', params: { email: values.email } });
      }
    } catch (error) {
      setApiError(error instanceof Error ? error.message : es.auth.errors.generic);
      setSubmitting(false);
    }
  });

  return (
    <AuthScaffold title={es.auth.registerTitle} support={es.auth.passwordAttempts}>
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

      <Controller
        control={control}
        name="password"
        render={({ field }) => (
          <PasswordInput
            label={es.auth.password}
            autoComplete="new-password"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errors.password?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field }) => (
          <PasswordInput
            label={es.auth.confirmPassword}
            autoComplete="new-password"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errors.confirmPassword?.message}
          />
        )}
      />

      {apiError ? (
        <Text variant="caption" color={colors.danger}>
          {apiError}
        </Text>
      ) : null}

      <Button
        title={es.auth.register}
        onPress={() => void onSubmit()}
        loading={submitting}
        disabled={submitting}
      />

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: spacing.xs,
        }}
      >
        <Text variant="caption">{es.auth.haveAccount}</Text>
        <Button title={es.auth.login} variant="ghost" onPress={() => router.push('/login')} />
      </View>
    </AuthScaffold>
  );
}
