import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Switch, View } from 'react-native';

import { Button, Card, Screen, Text } from '@/components/ui';
import { signOut } from '@/features/auth/api/auth';
import { useSession } from '@/features/auth/hooks/AuthProvider';
import { useBiometricStore } from '@/features/auth/store/useBiometricStore';
import { es } from '@/i18n/es';
import { useTheme } from '@/theme';

export default function SettingsScreen() {
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const { user } = useSession();
  const biometricEnabled = useBiometricStore((state) => state.biometricEnabled);
  const setBiometricEnabled = useBiometricStore((state) => state.setBiometricEnabled);
  const [enabling, setEnabling] = useState(false);
  const [biometricError, setBiometricError] = useState<string | null>(null);

  async function toggleBiometric(value: boolean) {
    setBiometricError(null);
    setEnabling(true);
    try {
      if (value) {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        if (!hasHardware || !isEnrolled) {
          setBiometricError(es.biometric.unavailable);
          return;
        }
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: es.biometric.enablePrompt,
        });
        if (!result.success) {
          setBiometricError(es.biometric.cancelled);
          return;
        }
        setBiometricEnabled(true);
      } else {
        setBiometricEnabled(false);
      }
    } finally {
      setEnabling(false);
    }
  }

  function confirmLogout() {
    Alert.alert(es.auth.logout, es.auth.logoutConfirmation, [
      { text: es.common.cancel, style: 'cancel' },
      {
        text: es.auth.logout,
        style: 'destructive',
        onPress: () => {
          signOut().catch(() => undefined);
        },
      },
    ]);
  }

  return (
    <Screen>
      <View style={{ gap: spacing.lg, marginTop: spacing.xl }}>
        <View style={{ gap: spacing.xs }}>
          <Text variant="title">{es.tabs.settings}</Text>
          {user?.email ? <Text variant="caption">{user.email}</Text> : null}
        </View>

        <Card style={{ gap: spacing.sm }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: spacing.md,
            }}
          >
            <View style={{ flex: 1, gap: spacing.xs }}>
              <Text variant="body">{es.biometric.enable}</Text>
              <Text variant="caption">{es.biometric.enableDescription}</Text>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={(value) => void toggleBiometric(value)}
              disabled={enabling}
              trackColor={{ true: colors.primary, false: colors.border }}
              thumbColor={biometricEnabled ? '#FFFFFF' : colors.textSecondary}
              accessibilityLabel={es.biometric.enable}
            />
          </View>
          {biometricError ? (
            <Text variant="caption" color={colors.danger}>
              {biometricError}
            </Text>
          ) : null}
        </Card>

        <Button
          title={es.accounts.title}
          variant="secondary"
          onPress={() => router.push('/accounts')}
        />

        <Button title={es.auth.logout} variant="secondary" onPress={confirmLogout} />
      </View>
    </Screen>
  );
}
