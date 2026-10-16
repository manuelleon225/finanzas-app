import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import {
  Button,
  Card,
  IconButton,
  Input,
  LoadingState,
  Screen,
  ScreenHeader,
  Text,
} from '@/components/ui';
import { DeleteAccountError, deleteAccount } from '@/features/auth/api/deleteAccount';
import { useSession } from '@/features/auth/hooks/AuthProvider';
import { isDeleteConfirmationValid } from '@/features/auth/utils/deleteAccount';
import { ExportSheet } from '@/features/transactions/components/ExportSheet';
import { es } from '@/i18n/es';
import { useSnackbarStore } from '@/lib/snackbar';
import { useConnectivity } from '@/lib/useConnectivity';
import { useTheme } from '@/theme';

export default function DeleteAccountScreen() {
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const { session, loading: sessionLoading } = useSession();
  const isOnline = useConnectivity();
  const showSnackbar = useSnackbarStore((state) => state.show);

  const [word, setWord] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState(false);

  if (sessionLoading) {
    return <LoadingState />;
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  const canSubmit = isDeleteConfirmationValid(word) && !submitting;

  async function handleDelete() {
    setError(null);

    if (!isOnline) {
      setError(es.deleteAccount.offline);
      return;
    }

    setSubmitting(true);
    try {
      await deleteAccount();
      showSnackbar(es.deleteAccount.success);
      router.replace('/login');
    } catch (caught) {
      const kind = caught instanceof DeleteAccountError ? caught.kind : 'server';
      setError(kind === 'offline' ? es.deleteAccount.offline : es.deleteAccount.serverError);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen scroll>
      <View style={{ gap: spacing.lg, marginTop: spacing.lg }}>
        <ScreenHeader
          left={
            <IconButton
              icon="chevron-back-outline"
              onPress={() => router.back()}
              accessibilityLabel={es.common.back}
            />
          }
          title={es.deleteAccount.title}
        />

        <Card style={{ gap: spacing.sm }}>
          <Text variant="body">{es.deleteAccount.whatDeleted1}</Text>
          <Text variant="body">{es.deleteAccount.whatDeleted2}</Text>
          <Text variant="body" color={colors.danger}>
            {es.deleteAccount.irreversible}
          </Text>
        </Card>

        <Button
          title={es.deleteAccount.exportFirst}
          variant="ghost"
          onPress={() => setExportOpen(true)}
        />

        <Input
          label={es.deleteAccount.confirmLabel}
          placeholder={es.deleteAccount.confirmPlaceholder}
          value={word}
          onChangeText={setWord}
          autoCapitalize="characters"
          autoCorrect={false}
          editable={!submitting}
        />

        {error ? (
          <Text variant="caption" color={colors.danger}>
            {error}
          </Text>
        ) : null}

        <Button
          title={es.deleteAccount.submit}
          variant="destructive"
          disabled={!canSubmit}
          loading={submitting}
          onPress={() => void handleDelete()}
        />
      </View>

      <ExportSheet visible={exportOpen} onClose={() => setExportOpen(false)} />
    </Screen>
  );
}
