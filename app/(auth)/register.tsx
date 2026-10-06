import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { Button, Input, Screen, Text } from '@/components/ui';
import { signUp } from '@/features/auth/api/auth';
import { registerSchema, type RegisterInput } from '@/features/auth/utils/schemas';
import { es } from '@/i18n/es';
import { useTheme } from '@/theme';

export default function RegisterScreen() {
  const { colors, spacing } = useTheme();
  const [apiError, setApiError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
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
    setInfo(null);
    setSubmitting(true);
    try {
      const result = await signUp(values);
      setSubmitting(false);
      if (!result.session) {
        setInfo(es.auth.recoverySent);
      }
    } catch (error) {
      setApiError(error instanceof Error ? error.message : es.auth.errors.generic);
      setSubmitting(false);
    }
  });

  return (
    <Screen scroll>
      <View style={styles.content}>
        <View style={{ gap: spacing.xs }}>
          <Text variant="title">{es.auth.registerTitle}</Text>
          <Text variant="caption">{es.auth.passwordAttempts}</Text>
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
            <Input
              label={es.auth.confirmPassword}
              secureTextEntry
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
        {info ? (
          <Text variant="caption" color={colors.income}>
            {info}
          </Text>
        ) : null}

        <Button
          title={es.auth.register}
          onPress={() => void onSubmit()}
          loading={submitting}
          disabled={submitting}
        />

        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing.xs }}>
          <Text variant="caption">{es.auth.haveAccount}</Text>
          <Link href="/login">
            <Text variant="caption" color={colors.primary}>
              {es.auth.login}
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
});
