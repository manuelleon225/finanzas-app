import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Switch, View } from 'react-native';

import { Button, Card, Chip, Screen, Text } from '@/components/ui';
import { signOut } from '@/features/auth/api/auth';
import { useSession } from '@/features/auth/hooks/AuthProvider';
import { useBiometricStore } from '@/features/auth/store/useBiometricStore';
import {
  useReminderPrefs,
  type AnticipationDays,
} from '@/features/recurring/store/useReminderPrefs';
import { remindersSupported } from '@/features/recurring/api/reminders';
import { usePreferencesStore } from '@/features/summary/store/usePreferencesStore';
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
  const remindersEnabled = useReminderPrefs((state) => state.remindersEnabled);
  const setRemindersEnabled = useReminderPrefs((state) => state.setRemindersEnabled);
  const anticipationDays = useReminderPrefs((state) => state.anticipationDays);
  const setAnticipationDays = useReminderPrefs((state) => state.setAnticipationDays);
  const includeExtrasInAvailable = usePreferencesStore((state) => state.includeExtrasInAvailable);
  const setIncludeExtrasInAvailable = usePreferencesStore(
    (state) => state.setIncludeExtrasInAvailable,
  );
  const [togglingReminders, setTogglingReminders] = useState(false);

  async function toggleReminders(value: boolean) {
    if (!value) {
      setRemindersEnabled(false);
      return;
    }

    setTogglingReminders(true);
    try {
      if (!remindersSupported()) {
        Alert.alert(es.reminders.enable, es.reminders.requiresBuild);
        return;
      }
      const Notifications = await import('expo-notifications');
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(es.reminders.enable, es.reminders.permissionDenied);
        return;
      }
      setRemindersEnabled(true);
    } catch {
      Alert.alert(es.reminders.enable, es.reminders.requiresBuild);
    } finally {
      setTogglingReminders(false);
    }
  }

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
              accessibilityLabel={es.biometric.enable}
            />
          </View>
          {biometricError ? (
            <Text variant="caption" color={colors.danger}>
              {biometricError}
            </Text>
          ) : null}
        </Card>

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
              <Text variant="body">{es.reminders.enable}</Text>
              <Text variant="caption">{es.reminders.enableDescription}</Text>
            </View>
            <Switch
              value={remindersEnabled}
              onValueChange={(value) => void toggleReminders(value)}
              disabled={togglingReminders}
              trackColor={{ true: colors.primary, false: colors.border }}
              accessibilityLabel={es.reminders.enable}
            />
          </View>
          {remindersEnabled ? (
            <View style={{ gap: spacing.xs }}>
              <Text variant="caption">{es.reminders.anticipation}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                <Chip
                  label={es.reminders.sameDay}
                  selected={anticipationDays === 0}
                  onPress={() => setAnticipationDays(0 as AnticipationDays)}
                />
                <Chip
                  label={es.reminders.oneDayBefore}
                  selected={anticipationDays === 1}
                  onPress={() => setAnticipationDays(1 as AnticipationDays)}
                />
              </View>
            </View>
          ) : null}
        </Card>

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
              <Text variant="body">{es.home.includeExtrasInAvailable}</Text>
              <Text variant="caption">{es.home.includeExtrasInAvailableHelp}</Text>
            </View>
            <Switch
              value={includeExtrasInAvailable}
              onValueChange={setIncludeExtrasInAvailable}
              trackColor={{ true: colors.primary, false: colors.border }}
              accessibilityLabel={es.home.includeExtrasInAvailable}
            />
          </View>
        </Card>

        <Button
          title={es.categories.title}
          variant="secondary"
          onPress={() => router.push('/categories')}
        />

        <Button
          title={es.recurring.title}
          variant="secondary"
          onPress={() => router.push('/recurring')}
        />

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
