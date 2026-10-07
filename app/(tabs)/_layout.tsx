import { Redirect, Tabs } from 'expo-router';

import { useSession } from '@/features/auth/hooks/AuthProvider';
import { es } from '@/i18n/es';

export default function TabsLayout() {
  const { session } = useSession();

  if (!session) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: es.tabs.home }} />
      <Tabs.Screen name="movements" options={{ title: es.tabs.movements }} />
      <Tabs.Screen name="settings" options={{ title: es.tabs.settings }} />
    </Tabs>
  );
}
