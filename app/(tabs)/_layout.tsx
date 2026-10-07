import { Redirect, Tabs, usePathname, useRouter } from 'expo-router';
import { View } from 'react-native';

import { Fab } from '@/components/ui';
import { useSession } from '@/features/auth/hooks/AuthProvider';
import { es } from '@/i18n/es';

export default function TabsLayout() {
  const { session } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  if (!session) {
    return <Redirect href="/login" />;
  }

  const showFab = pathname === '/' || pathname === '/movements';

  return (
    <View style={{ flex: 1 }}>
      <Tabs screenOptions={{ headerShown: false }}>
        <Tabs.Screen name="index" options={{ title: es.tabs.home }} />
        <Tabs.Screen name="movements" options={{ title: es.tabs.movements }} />
        <Tabs.Screen name="settings" options={{ title: es.tabs.settings }} />
      </Tabs>
      {showFab ? (
        <Fab
          onPress={() => router.push('/transaction-form')}
          accessibilityLabel={es.transactionForm.add}
        />
      ) : null}
    </View>
  );
}
