import * as LocalAuthentication from 'expo-local-authentication';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, Text } from '@/components/ui';
import { signOut } from '@/features/auth/api/auth';
import { useBiometricStore } from '@/features/auth/store/useBiometricStore';
import { es } from '@/i18n/es';
import { useTheme } from '@/theme';

export function LockScreen() {
  const { colors, spacing } = useTheme();
  const unlock = useBiometricStore((state) => state.unlock);
  const [attempting, setAttempting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUnlock() {
    setError(null);
    setAttempting(true);
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHardware || !isEnrolled) {
        setError(es.biometric.unavailable);
        return;
      }
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: es.biometric.unlockPrompt,
      });
      if (result.success) {
        unlock();
      } else {
        setError(es.biometric.retry);
      }
    } finally {
      setAttempting(false);
    }
  }

  function handleLogout() {
    signOut()
      .catch(() => undefined)
      .finally(() => unlock());
  }

  return (
    <View style={[styles.overlay, { backgroundColor: colors.background }]}>
      <View style={[styles.content, { gap: spacing.lg }]}>
        <View style={{ gap: spacing.sm }}>
          <Text variant="title" align="center">
            {es.biometric.lockScreenTitle}
          </Text>
          <Text variant="body" color={colors.textSecondary} align="center">
            {es.biometric.lockScreenDescription}
          </Text>
        </View>

        {error ? (
          <Text variant="caption" color={colors.danger} align="center">
            {error}
          </Text>
        ) : null}

        <Button
          title={es.biometric.unlock}
          onPress={() => void handleUnlock()}
          loading={attempting}
          disabled={attempting}
        />
        <Button title={es.auth.logout} variant="ghost" onPress={handleLogout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    elevation: 1000,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    alignSelf: 'stretch',
  },
});
