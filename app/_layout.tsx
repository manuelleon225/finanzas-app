import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from '@expo-google-fonts/manrope';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
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

SplashScreen.preventAutoHideAsync();

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
  const router = useRouter();
  const isLocked = useBiometricStore((state) => state.isLocked);

  useBiometricLock();
  useRecurringGeneration();
  useReminderScheduling();

  useEffect(() => {
    if (isLocked && router.canDismiss()) {
      router.dismissAll();
    }
  }, [isLocked, router]);

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
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RootNavigator />
        <StatusBar style="auto" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
