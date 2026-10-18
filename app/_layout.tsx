import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from '@expo-google-fonts/manrope';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import type { PersistQueryClientOptions } from '@tanstack/react-query-persist-client';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { LoadingState, SnackbarHost, SystemBars } from '@/components/ui';
import { LockScreen } from '@/features/auth/components/LockScreen';
import { AuthProvider, useSession } from '@/features/auth/hooks/AuthProvider';
import { useAuthDeepLink } from '@/features/auth/hooks/useAuthDeepLink';
import { useBiometricLock } from '@/features/auth/hooks/useBiometricLock';
import { useBiometricStore } from '@/features/auth/store/useBiometricStore';
import { useRecurringGeneration } from '@/features/recurring/hooks/useRecurringGeneration';
import { useReminderScheduling } from '@/features/recurring/hooks/useReminderScheduling';
import { registerTransactionMutationDefaults } from '@/features/transactions/offline';
import { useOfflineSync } from '@/features/transactions/hooks/useOfflineSync';
import { setupOnlineManager } from '@/lib/netinfo';
import { persister } from '@/lib/persister';
import { SEVEN_DAYS_MS, queryClient } from '@/lib/queryClient';
import { useTheme } from '@/theme';

SplashScreen.preventAutoHideAsync();

// Infraestructura offline: conecta onlineManager con NetInfo y declara la
// mutación de creación para poder reanudarla tras reiniciar la app.
setupOnlineManager();
registerTransactionMutationDefaults();

const persistOptions: Omit<PersistQueryClientOptions, 'queryClient'> = {
  persister,
  maxAge: SEVEN_DAYS_MS,
  buster: 'v1',
  dehydrateOptions: {
    // Solo se persisten las creaciones de movimientos que quedaron pausadas
    // (offline). Editar y eliminar requieren conexión.
    shouldDehydrateMutation: (mutation) =>
      mutation.state.isPaused &&
      mutation.options.mutationKey?.[0] === 'transactions' &&
      mutation.options.mutationKey?.[1] === 'create',
    // Solo datos de lectura ya resueltos.
    shouldDehydrateQuery: (query) => query.state.status === 'success',
  },
};

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
  useOfflineSync();
  useAuthDeepLink();

  useEffect(() => {
    if (isLocked && router.canDismiss()) {
      router.dismissAll();
    }
  }, [isLocked, router]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <LoadingState />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="transaction-form" options={{ presentation: 'fullScreenModal' }} />
      </Stack>
      <SnackbarHost />
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={persistOptions}
        onSuccess={() => {
          void queryClient.resumePausedMutations();
        }}
      >
        <AuthProvider>
          <RootNavigator />
          <SystemBars variant="plain" />
        </AuthProvider>
      </PersistQueryClientProvider>
    </GestureHandlerRootView>
  );
}
