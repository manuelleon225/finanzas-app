import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { AppIcon, Button } from '@/components/ui';
import { es } from '@/i18n/es';
import { useTheme } from '@/theme';

import { AuthScaffold } from './AuthScaffold';
import type { AuthLinkError } from '../store/useAuthLinkStore';

const TILE_SIZE = 64;
const TILE_RADIUS = 18;
const TILE_ICON = 32;

export function AuthLinkErrorView({ flow, reason }: AuthLinkError) {
  const router = useRouter();
  const { colors, spacing } = useTheme();

  const message = reason === 'expired' ? es.auth.linkExpired : es.auth.linkInvalid;
  const isRecovery = flow === 'recovery';

  return (
    <AuthScaffold title={es.auth.linkErrorTitle} support={message}>
      <View style={{ alignItems: 'center', gap: spacing.lg }}>
        <View
          style={{
            width: TILE_SIZE,
            height: TILE_SIZE,
            borderRadius: TILE_RADIUS,
            backgroundColor: colors.dangerSoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AppIcon name="alert-circle" size={TILE_ICON} color={colors.danger} filled />
        </View>
        <Button
          title={es.auth.requestNewLink}
          onPress={() => router.replace(isRecovery ? '/forgot-password' : '/register')}
        />
      </View>
    </AuthScaffold>
  );
}
