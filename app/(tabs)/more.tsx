import Constants from 'expo-constants';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Alert, Switch, View } from 'react-native';

import {
  AppIcon,
  Card,
  Chip,
  ListRow,
  Screen,
  ScreenHeader,
  SegmentedControl,
  Text,
} from '@/components/ui';
import { signOut } from '@/features/auth/api/auth';
import { useBiometricStore } from '@/features/auth/store/useBiometricStore';
import { remindersSupported } from '@/features/recurring/api/reminders';
import {
  useReminderPrefs,
  type AnticipationDays,
} from '@/features/recurring/store/useReminderPrefs';
import { ExportSheet } from '@/features/transactions/components/ExportSheet';
import { usePreferencesStore } from '@/features/summary/store/usePreferencesStore';
import { es } from '@/i18n/es';
import { useTheme, useThemeModeStore, type ThemeModePreference } from '@/theme';

type SwitchRowProps = {
  title: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
};

function SwitchRow({ title, description, value, onValueChange, disabled = false }: SwitchRowProps) {
  const { colors, spacing } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.md,
      }}
    >
      <View style={{ flex: 1, gap: spacing.xs }}>
        <Text variant="body">{title}</Text>
        {description ? <Text variant="caption">{description}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ true: colors.brand, false: colors.border }}
        accessibilityLabel={title}
      />
    </View>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const { spacing } = useTheme();

  return (
    <View style={{ gap: spacing.sm }}>
      <Text variant="caption">{title}</Text>
      {children}
    </View>
  );
}

export default function MoreScreen() {
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const mode = useThemeModeStore((state) => state.mode);
  const setMode = useThemeModeStore((state) => state.setMode);

  const biometricEnabled = useBiometricStore((state) => state.biometricEnabled);
  const setBiometricEnabled = useBiometricStore((state) => state.setBiometricEnabled);
  const [enabling, setEnabling] = useState(false);
  const [biometricError, setBiometricError] = useState<string | null>(null);

  const remindersEnabled = useReminderPrefs((state) => state.remindersEnabled);
  const setRemindersEnabled = useReminderPrefs((state) => state.setRemindersEnabled);
  const anticipationDays = useReminderPrefs((state) => state.anticipationDays);
  const setAnticipationDays = useReminderPrefs((state) => state.setAnticipationDays);
  const [togglingReminders, setTogglingReminders] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const includeExtrasInAvailable = usePreferencesStore((state) => state.includeExtrasInAvailable);
  const setIncludeExtrasInAvailable = usePreferencesStore(
    (state) => state.setIncludeExtrasInAvailable,
  );

  const appVersion = Constants.expoConfig?.version ?? '';
  const chevron = <AppIcon name="chevron-forward-outline" size={20} color={colors.textMuted} />;

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
    <Screen scroll>
      <View style={{ gap: spacing.lg, marginTop: spacing.lg }}>
        <ScreenHeader title={es.more.title} />

        <Section title={es.more.sectionOrganization}>
          <Card style={{ gap: spacing.xs }}>
            <ListRow
              icon="wallet-outline"
              iconColor={colors.brand}
              title={es.accounts.title}
              trailing={chevron}
              onPress={() => router.push('/accounts')}
            />
            <ListRow
              icon="pricetags-outline"
              iconColor={colors.brand}
              title={es.categories.title}
              trailing={chevron}
              onPress={() => router.push('/categories')}
            />
          </Card>
        </Section>

        <Section title={es.more.sectionPreferences}>
          <Card style={{ gap: spacing.md }}>
            <View style={{ gap: spacing.sm }}>
              <Text variant="body">{es.more.appearance}</Text>
              <SegmentedControl<ThemeModePreference>
                options={[
                  { label: es.more.appearanceSystem, value: 'system' },
                  { label: es.more.appearanceDark, value: 'dark' },
                  { label: es.more.appearanceLight, value: 'light' },
                ]}
                value={mode}
                onChange={setMode}
              />
            </View>

            <SwitchRow
              title={es.home.includeExtrasInAvailable}
              description={es.home.includeExtrasInAvailableHelp}
              value={includeExtrasInAvailable}
              onValueChange={setIncludeExtrasInAvailable}
            />

            <View style={{ gap: spacing.xs }}>
              <SwitchRow
                title={es.biometric.enable}
                description={es.biometric.enableDescription}
                value={biometricEnabled}
                onValueChange={(value) => void toggleBiometric(value)}
                disabled={enabling}
              />
              {biometricError ? (
                <Text variant="caption" color={colors.danger}>
                  {biometricError}
                </Text>
              ) : null}
            </View>

            <View style={{ gap: spacing.sm }}>
              <SwitchRow
                title={es.reminders.enable}
                description={es.reminders.enableDescription}
                value={remindersEnabled}
                onValueChange={(value) => void toggleReminders(value)}
                disabled={togglingReminders}
              />
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
            </View>
          </Card>
        </Section>

        <Section title={es.more.sectionData}>
          <Card style={{ gap: spacing.xs }}>
            <ListRow
              icon="download-outline"
              iconColor={colors.brand}
              title={es.export.title}
              trailing={chevron}
              onPress={() => setExportOpen(true)}
            />
          </Card>
        </Section>

        <Section title={es.more.sectionAccount}>
          <Card style={{ gap: spacing.xs }}>
            <ListRow
              icon="log-out-outline"
              iconColor={colors.textSecondary}
              title={es.auth.logout}
              onPress={confirmLogout}
            />
            <ListRow
              icon="trash-outline"
              iconColor={colors.danger}
              title={es.more.deleteAccount}
              onPress={() => router.push('/delete-account')}
            />
          </Card>
        </Section>

        <Text variant="caption" align="center">
          {es.more.version.replace('{version}', appVersion)}
        </Text>
      </View>

      <ExportSheet visible={exportOpen} onClose={() => setExportOpen(false)} />
    </Screen>
  );
}
