import { Redirect, Stack } from 'expo-router';

import { useSession } from '@/features/auth/hooks/AuthProvider';
import { useAuthLinkStore } from '@/features/auth/store/useAuthLinkStore';

export default function AuthLayout() {
  const { session } = useSession();
  const isRecoverySession = useAuthLinkStore((state) => state.isRecoverySession);

  if (session && !isRecoverySession) {
    return <Redirect href="/" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
