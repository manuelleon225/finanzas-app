import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';

import { TabBar } from '@/components/ui';
import { useSession } from '@/features/auth/hooks/AuthProvider';
import { useAuthLinkStore } from '@/features/auth/store/useAuthLinkStore';
import { es } from '@/i18n/es';

export default function TabsLayout() {
  const { session } = useSession();
  const isRecoverySession = useAuthLinkStore((state) => state.isRecoverySession);

  if (isRecoverySession) {
    return <Redirect href="/reset-password" />;
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: es.tabs.home }} />
      <Tabs.Screen name="movements" options={{ title: es.tabs.movements }} />
      <Tabs.Screen name="plan" options={{ title: es.tabs.plan }} />
      <Tabs.Screen name="more" options={{ title: es.tabs.more }} />
    </Tabs>
  );
}
