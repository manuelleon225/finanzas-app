import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

import { LoadingState } from '@/components/ui';
import { LockScreen } from '@/features/auth/components/LockScreen';
import { AuthProvider, useSession } from '@/features/auth/hooks/AuthProvider';
import { useBiometricLock } from '@/features/auth/hooks/useBiometricLock';
import { useBiometricStore } from '@/features/auth/store/useBiometricStore';
import { useRecurringGeneration } from '@/features/recurring/hooks/useRecurringGeneration';
import { useReminderScheduling } from '@/features/recurring/hooks/useReminderScheduling';
import { queryClient } from '@/lib/queryClient';
import { useTheme } from '@/theme';

function LockOverlay() {
  const isLocked = useBiometricStore((state) => state.isLocked);
  const { session, loading } = useSession();

  if (loading || !session || !isLocked) {
    return null;
  }

  return <LockScreen />;
}

function RootNavigator() {
  const { loading } = useSession();
  const { colors } = useTheme();

  useBiometricLock();
  useRecurringGeneration();
  useReminderScheduling();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <LoadingState />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="transaction-form" options={{ presentation: 'modal' }} />
      </Stack>
      <LockOverlay />
    </View>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RootNavigator />
        <StatusBar style="auto" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
