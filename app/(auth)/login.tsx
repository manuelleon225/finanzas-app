import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { Button, Input, Screen, Text } from '@/components/ui';
import { signIn } from '@/features/auth/api/auth';
import { loginSchema, type LoginInput } from '@/features/auth/utils/schemas';
import { es } from '@/i18n/es';
import { useTheme } from '@/theme';

export default function LoginScreen() {
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
    <Screen scroll>
      <View style={styles.content}>
        <View style={{ gap: spacing.xs }}>
          <Text variant="title">{es.auth.loginTitle}</Text>
          <Text variant="caption">{es.auth.welcome}</Text>
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

        <Controller
          control={control}
          name="password"
          render={({ field }) => (
            <Input
              label={es.auth.password}
              secureTextEntry
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

        <Link href="/forgot-password" style={styles.link}>
          <Text variant="caption" color={colors.primary}>
            {es.auth.forgotPassword}
          </Text>
        </Link>

        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing.xs }}>
          <Text variant="caption">{es.auth.noAccount}</Text>
          <Link href="/register">
            <Text variant="caption" color={colors.primary}>
              {es.auth.register}
            </Text>
          </Link>
        </View>
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
