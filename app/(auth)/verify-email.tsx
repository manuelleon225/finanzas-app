import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { Button, Text } from '@/components/ui';
import { resendConfirmation } from '@/features/auth/api/auth';
import { AuthScaffold } from '@/features/auth/components/AuthScaffold';
import { es } from '@/i18n/es';
import { useTheme } from '@/theme';

const RESEND_COOLDOWN_SECONDS = 60;

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const params = useLocalSearchParams<{ email?: string }>();
  const email = typeof params.email === 'string' ? params.email : '';

  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }
    const timer = setTimeout(() => setCooldown((current) => current - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function resend() {
    if (!email || cooldown > 0 || resending) {
      return;
    }
    setError(null);
    setResending(true);
    try {
      await resendConfirmation(email);
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : es.auth.errors.generic);
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthScaffold title={es.auth.checkEmailTitle} support={es.auth.checkEmailSupport}>
      <View style={{ gap: spacing.xs }}>
        <Text variant="caption">{es.auth.email}</Text>
        <Text variant="bodyStrong">{email || '—'}</Text>
      </View>

      {error ? (
        <Text variant="caption" color={colors.danger}>
          {error}
        </Text>
      ) : null}

      <Button
        title={
          cooldown > 0
            ? es.auth.resendEmailIn.replace('{seconds}', String(cooldown))
            : es.auth.resendEmail
        }
        onPress={() => void resend()}
        loading={resending}
        disabled={cooldown > 0 || !email || resending}
      />

      <Button
        title={es.auth.backToLogin}
        variant="ghost"
        onPress={() => router.replace('/login')}
      />
    </AuthScaffold>
  );
}
