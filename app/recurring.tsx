import { Redirect, useRouter } from 'expo-router';
import { Alert, Pressable, Switch, View } from 'react-native';

import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  IconButton,
  LoadingState,
  MoneyText,
  Screen,
  ScreenHeader,
  Text,
} from '@/components/ui';
import { useSession } from '@/features/auth/hooks/AuthProvider';
import type { RecurringRuleWithRelations } from '@/features/recurring/api/recurring';
import {
  useDeleteRecurringRule,
  useRecurringRules,
  useUpdateRecurringRule,
} from '@/features/recurring/hooks/useRecurringRules';
import { formatFrequency, getNextOccurrence } from '@/features/recurring/utils/recurrence';
import { es } from '@/i18n/es';
import { todayISO } from '@/lib/dates';
import { useTheme } from '@/theme';

export default function RecurringScreen() {
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const { session, loading: sessionLoading } = useSession();
  const { data, isLoading, isError, refetch } = useRecurringRules();
  const updateRule = useUpdateRecurringRule();
  const deleteRule = useDeleteRecurringRule();

  if (sessionLoading) {
    return <LoadingState />;
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  if (isLoading) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }

  if (isError) {
    return (
      <Screen>
        <ErrorState onRetry={() => void refetch()} />
      </Screen>
    );
  }

  const rules = data ?? [];
  const today = todayISO();

  function confirmDelete(rule: RecurringRuleWithRelations) {
    Alert.alert(es.recurring.confirmDeleteTitle, es.recurring.confirmDeleteMessage, [
      { text: es.common.cancel, style: 'cancel' },
      {
        text: es.recurring.delete,
        style: 'destructive',
        onPress: () => deleteRule.mutate(rule.id),
      },
    ]);
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
          title={es.recurring.title}
        />

        <Button title={es.recurring.newRule} onPress={() => router.push('/recurring-form')} />

        {rules.length === 0 ? (
          <EmptyState
            title={es.recurring.emptyTitle}
            description={es.recurring.emptyDescription}
            actionLabel={es.recurring.newRule}
            onAction={() => router.push('/recurring-form')}
          />
        ) : (
          <View style={{ gap: spacing.md }}>
            {rules.map((rule) => {
              const next = getNextOccurrence(rule, today);
              const label = rule.note || rule.category?.name || '—';

              return (
                <Card key={rule.id} style={{ gap: spacing.sm }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                    <View style={{ flex: 1, gap: spacing.xs }}>
                      <Text variant="body">{label}</Text>
                      <Text variant="caption">
                        {formatFrequency(rule)} · {rule.account?.name ?? ''}
                      </Text>
                      <Text variant="caption">
                        {next ? `${es.recurring.next}: ${next}` : es.recurring.noNext}
                      </Text>
                    </View>
                    <MoneyText
                      amount={rule.amount}
                      kind={rule.type === 'income' ? 'income' : 'expense'}
                      signed
                    />
                    <Switch
                      value={rule.is_active}
                      onValueChange={(value) =>
                        updateRule.mutate({ id: rule.id, input: { is_active: value } })
                      }
                      trackColor={{ true: colors.primary, false: colors.border }}
                      accessibilityLabel={es.recurring.active}
                    />
                  </View>

                  <View style={{ flexDirection: 'row', gap: spacing.lg }}>
                    <Pressable
                      onPress={() =>
                        router.push({ pathname: '/recurring-form', params: { id: rule.id } })
                      }
                      accessibilityRole="button"
                      accessibilityLabel={`${es.common.edit}: ${label}`}
                      hitSlop={{ top: 14, bottom: 14, left: 8, right: 8 }}
                    >
                      <Text variant="caption" color={colors.primary}>
                        {es.common.edit}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => confirmDelete(rule)}
                      accessibilityRole="button"
                      accessibilityLabel={`${es.recurring.delete}: ${label}`}
                      hitSlop={{ top: 14, bottom: 14, left: 8, right: 8 }}
                    >
                      <Text variant="caption" color={colors.danger}>
                        {es.recurring.delete}
                      </Text>
                    </Pressable>
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </View>
    </Screen>
  );
}
