import { Alert, View } from 'react-native';

import { Button, Screen, Text } from '@/components/ui';
import { signOut } from '@/features/auth/api/auth';
import { useSession } from '@/features/auth/hooks/AuthProvider';
import { es } from '@/i18n/es';
import { useTheme } from '@/theme';

export default function SettingsScreen() {
  const { spacing } = useTheme();
  const { user } = useSession();

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

        <Button title={es.auth.logout} variant="secondary" onPress={confirmLogout} />
      </View>
    </Screen>
  );
}
