import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';

import { Button, Input, Text } from '@/components/ui';
import { signIn } from '@/features/auth/api/auth';
import { AuthScaffold } from '@/features/auth/components/AuthScaffold';
import { PasswordInput } from '@/features/auth/components/PasswordInput';
import { loginSchema, type LoginInput } from '@/features/auth/utils/schemas';
import { es } from '@/i18n/es';
import { useTheme } from '@/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setApiError(null);
    setSubmitting(true);
    try {
      await signIn(values);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : es.auth.errors.generic);
      setSubmitting(false);
    }
  });

  return (
    <AuthScaffold title={es.auth.loginTitle} support={es.auth.loginSupport}>
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
            autoComplete="password"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errors.password?.message}
          />
        )}
      />

      {apiError ? (
        <Text variant="caption" color={colors.danger}>
          {apiError}
        </Text>
      ) : null}

      <Button
        title={es.auth.login}
        onPress={() => void onSubmit()}
        loading={submitting}
        disabled={submitting}
      />

      <Button
        title={es.auth.forgotPassword}
        variant="ghost"
        onPress={() => router.push('/forgot-password')}
      />

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: spacing.xs,
        }}
      >
        <Text variant="caption">{es.auth.noAccount}</Text>
        <Button title={es.auth.register} variant="ghost" onPress={() => router.push('/register')} />
      </View>
    </AuthScaffold>
  );
}
