import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { AppIcon, Button } from '@/components/ui';
import { es } from '@/i18n/es';
import { useTheme } from '@/theme';

import { AuthScaffold } from './AuthScaffold';
import type { AuthLinkError } from '../store/useAuthLinkStore';

export function AuthLinkErrorView({ flow, reason }: AuthLinkError) {
  const router = useRouter();
  const { colors, spacing } = useTheme();

  const message = reason === 'expired' ? es.auth.linkExpired : es.auth.linkInvalid;
  const isRecovery = flow === 'recovery';

  return (
    <AuthScaffold title={es.auth.linkErrorTitle} support={message}>
      <View style={{ alignItems: 'center', gap: spacing.lg }}>
        <AppIcon name="alert-circle-outline" size={24} color={colors.danger} />
        <Button
          title={es.auth.requestNewLink}
          onPress={() => router.replace(isRecovery ? '/forgot-password' : '/register')}
        />
      </View>
    </AuthScaffold>
  );
}
