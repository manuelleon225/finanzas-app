import { Redirect, Stack } from 'expo-router';

import { useSession } from '@/features/auth/hooks/AuthProvider';

export default function AuthLayout() {
  const { session } = useSession();

  if (session) {
    return <Redirect href="/" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
