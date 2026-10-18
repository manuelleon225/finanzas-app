import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Button, LoadingState, Text } from '@/components/ui';
import { updatePassword } from '@/features/auth/api/auth';
import { AuthLinkErrorView } from '@/features/auth/components/AuthLinkError';
import { AuthScaffold } from '@/features/auth/components/AuthScaffold';
import { PasswordInput } from '@/features/auth/components/PasswordInput';
import { useSession } from '@/features/auth/hooks/AuthProvider';
import { useAuthLinkStore } from '@/features/auth/store/useAuthLinkStore';
import { resetPasswordSchema, type ResetPasswordInput } from '@/features/auth/utils/schemas';
import { es } from '@/i18n/es';
import { useSnackbarStore } from '@/lib/snackbar';
import { useTheme } from '@/theme';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { session, loading } = useSession();
  const linkError = useAuthLinkStore((state) => state.linkError);
  const endRecovery = useAuthLinkStore((state) => state.endRecovery);
  const showSnackbar = useSnackbarStore((state) => state.show);

  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  if (linkError) {
    return <AuthLinkErrorView flow={linkError.flow} reason={linkError.reason} />;
  }

  if (loading || !session) {
    return (
      <AuthScaffold title={es.auth.resetPasswordTitle} support={es.auth.resetPasswordSupport}>
        <LoadingState />
      </AuthScaffold>
    );
  }

  const onSubmit = handleSubmit(async ({ password }) => {
    setApiError(null);
    setSubmitting(true);
    try {
      await updatePassword(password);
      endRecovery();
      showSnackbar(es.auth.passwordUpdated);
      router.replace('/');
    } catch (error) {
      setApiError(error instanceof Error ? error.message : es.auth.errors.generic);
      setSubmitting(false);
    }
  });

  return (
    <AuthScaffold title={es.auth.resetPasswordTitle} support={es.auth.resetPasswordSupport}>
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
        title={es.auth.savePassword}
        onPress={() => void onSubmit()}
        loading={submitting}
        disabled={submitting}
      />
    </AuthScaffold>
  );
}
