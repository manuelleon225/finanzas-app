import Constants from 'expo-constants';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Alert, Pressable, View } from 'react-native';

import {
  AppIcon,
  BottomSheet,
  Card,
  Chip,
  IconTile,
  ScreenHeader,
  ScreenScaffold,
  Switch,
  Text,
} from '@/components/ui';
import { signOut } from '@/features/auth/api/auth';
import { useSession } from '@/features/auth/hooks/AuthProvider';
import { useProfile } from '@/features/auth/hooks/useProfile';
import { useBiometricStore } from '@/features/auth/store/useBiometricStore';
import { AppearanceOptions } from '@/features/more/components/AppearanceOptions';
import { ProfileCard } from '@/features/more/components/ProfileCard';
import { remindersSupported } from '@/features/recurring/api/reminders';
import {
  useReminderPrefs,
  type AnticipationDays,
} from '@/features/recurring/store/useReminderPrefs';
import { usePreferencesStore } from '@/features/summary/store/usePreferencesStore';
import { ExportSheet } from '@/features/transactions/components/ExportSheet';
import { es } from '@/i18n/es';
import {
  componentHeights,
  useTheme,
  useThemeModeStore,
  type ThemeModePreference,
  type TileKey,
} from '@/theme';

const TILE_SIZE = 32;
const TILE_RADIUS = 10;
const TILE_ICON = 18;

const APPEARANCE_LABEL: Record<ThemeModePreference, string> = {
  system: es.more.appearanceSystem,
  dark: es.more.appearanceDark,
  light: es.more.appearanceLight,
};

type SettingRowProps = {
  leading: ReactNode;
  title: string;
  description?: string;
  titleColor?: string;
  value?: string;
  showChevron?: boolean;
  trailing?: ReactNode;
  onPress?: () => void;
};

function SettingRow({
  leading,
  title,
  description,
  titleColor,
  value,
  showChevron = false,
  trailing,
  onPress,
}: SettingRowProps) {
  const { colors, radii, spacing } = useTheme();

  const content = (
    <>
      {leading}
      <View style={{ flex: 1, gap: spacing.xs }}>
        <Text variant="body" color={titleColor}>
          {title}
        </Text>
        {description ? (
          <Text variant="caption" color={colors.textSecondary}>
            {description}
          </Text>
        ) : null}
      </View>
      {value ? (
        <Text variant="caption" color={colors.textSecondary}>
          {value}
        </Text>
      ) : null}
      {trailing}
      {showChevron ? (
        <AppIcon name="chevron-forward-outline" size={20} color={colors.textMuted} />
      ) : null}
    </>
  );

  const baseStyle = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.md,
    minHeight: componentHeights.listRow,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
  };

  if (!onPress) {
    return <View style={baseStyle}>{content}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={description ? `${title}. ${description}` : title}
      style={({ pressed }) => [
        baseStyle,
        pressed ? { backgroundColor: colors.surfaceRaised } : null,
      ]}
    >
      {content}
    </Pressable>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const { spacing } = useTheme();

  return (
    <View style={{ gap: spacing.sm }}>
      <Text variant="caption">{title}</Text>
      <Card style={{ gap: spacing.xs }}>{children}</Card>
    </View>
  );
}

function RowTile({ icon, tileKey }: { icon: string; tileKey: TileKey }) {
  return <IconTile icon={icon} tileKey={tileKey} size={32} />;
}

function DangerTile({ icon }: { icon: string }) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        width: TILE_SIZE,
        height: TILE_SIZE,
        borderRadius: TILE_RADIUS,
        backgroundColor: colors.dangerSoft,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <AppIcon name={icon} size={TILE_ICON} color={colors.danger} filled />
    </View>
  );
}

export default function MoreScreen() {
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const mode = useThemeModeStore((state) => state.mode);
  const setMode = useThemeModeStore((state) => state.setMode);
  const [appearanceOpen, setAppearanceOpen] = useState(false);

  const profile = useProfile();
  const { user } = useSession();
  const displayName = profile.data ?? user?.email?.split('@')[0] ?? '';

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
    <ScreenScaffold
      variant="plain"
      header={<ScreenHeader title={es.more.title} />}
      contentContainerStyle={{ gap: spacing.md }}
    >
      <ProfileCard name={displayName} />

      <Section title={es.more.sectionOrganization}>
        <SettingRow
          leading={<RowTile icon="wallet-outline" tileKey="blue" />}
          title={es.accounts.title}
          showChevron
          onPress={() => router.push('/accounts')}
        />
        <SettingRow
          leading={<RowTile icon="pricetags-outline" tileKey="violet" />}
          title={es.categories.title}
          showChevron
          onPress={() => router.push('/categories')}
        />
      </Section>

      <Section title={es.more.sectionPreferences}>
        <SettingRow
          leading={<RowTile icon="color-palette-outline" tileKey="yellow" />}
          title={es.more.appearance}
          value={APPEARANCE_LABEL[mode]}
          showChevron
          onPress={() => setAppearanceOpen(true)}
        />
        <SettingRow
          leading={<RowTile icon="sparkles-outline" tileKey="yellow" />}
          title={es.home.includeExtrasInAvailable}
          description={es.home.includeExtrasInAvailableHelp}
          trailing={
            <Switch
              value={includeExtrasInAvailable}
              onValueChange={setIncludeExtrasInAvailable}
              accessibilityLabel={es.home.includeExtrasInAvailable}
            />
          }
        />
        <View style={{ gap: spacing.xs }}>
          <SettingRow
            leading={<RowTile icon="finger-print-outline" tileKey="green" />}
            title={es.biometric.enable}
            description={es.biometric.enableDescription}
            trailing={
              <Switch
                value={biometricEnabled}
                onValueChange={(value) => void toggleBiometric(value)}
                disabled={enabling}
                accessibilityLabel={es.biometric.enable}
              />
            }
          />
          {biometricError ? (
            <Text variant="caption" color={colors.danger}>
              {biometricError}
            </Text>
          ) : null}
        </View>
        <View style={{ gap: spacing.sm }}>
          <SettingRow
            leading={<RowTile icon="notifications-outline" tileKey="orange" />}
            title={es.reminders.enable}
            description={es.reminders.enableDescription}
            trailing={
              <Switch
                value={remindersEnabled}
                onValueChange={(value) => void toggleReminders(value)}
                disabled={togglingReminders}
                accessibilityLabel={es.reminders.enable}
              />
            }
          />
          {remindersEnabled ? (
            <View style={{ gap: spacing.sm }}>
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
      </Section>

      <Section title={es.more.sectionData}>
        <SettingRow
          leading={<RowTile icon="download-outline" tileKey="sky" />}
          title={es.export.title}
          showChevron
          onPress={() => setExportOpen(true)}
        />
      </Section>

      <Section title={es.more.sectionAccount}>
        <SettingRow
          leading={<RowTile icon="log-out-outline" tileKey="gray" />}
          title={es.auth.logout}
          onPress={confirmLogout}
        />
        <SettingRow
          leading={<DangerTile icon="trash-outline" />}
          title={es.more.deleteAccount}
          titleColor={colors.danger}
          onPress={() => router.push('/delete-account')}
        />
      </Section>

      <Text variant="caption" align="center">
        {es.more.version.replace('{version}', appVersion)}
      </Text>

      <BottomSheet visible={appearanceOpen} onClose={() => setAppearanceOpen(false)}>
        <View style={{ gap: spacing.md }}>
          <Text variant="subtitle">{es.more.appearance}</Text>
          <AppearanceOptions
            value={mode}
            onChange={(next) => {
              setMode(next);
              setAppearanceOpen(false);
            }}
          />
        </View>
      </BottomSheet>

      <ExportSheet visible={exportOpen} onClose={() => setExportOpen(false)} />
    </ScreenScaffold>
  );
}
