import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
  SegmentedControl,
  Text,
} from '@/components/ui';
import { useSession } from '@/features/auth/hooks/AuthProvider';
import type { Category, CategoryKind } from '@/features/categories/api/categories';
import { CategoryIcon } from '@/features/categories/components/CategoryIcon';
import {
  useArchiveCategory,
  useCategories,
  useRestoreCategory,
} from '@/features/categories/hooks/useCategories';
import { groupCategoriesByParent } from '@/features/categories/utils/categories';
import { es } from '@/i18n/es';
import { useTheme } from '@/theme';

type KindOption = 'expense' | 'income';

export default function CategoriesScreen() {
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const { session, loading: sessionLoading } = useSession();
  const [kind, setKind] = useState<KindOption>('expense');
  const [showArchived, setShowArchived] = useState(false);

  const activeCategories = useCategories(kind as CategoryKind);
  const archivedCategories = useCategories(kind as CategoryKind, { archived: true });
  const archiveCategory = useArchiveCategory();
  const restoreCategory = useRestoreCategory();

  const current = showArchived ? archivedCategories : activeCategories;
  const data = current.data;
  const groups = groupCategoriesByParent(data ?? []);
  const archivedCount = archivedCategories.data?.length ?? 0;

  if (sessionLoading) {
    return <LoadingState />;
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  if (current.isLoading) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }

  if (current.isError) {
    return (
      <Screen>
        <ErrorState onRetry={() => void current.refetch()} />
      </Screen>
    );
  }

  function confirmArchive(category: Category) {
    Alert.alert(es.categories.confirmArchiveTitle, es.categories.confirmArchiveMessage, [
      { text: es.common.cancel, style: 'cancel' },
      {
        text: es.categories.archive,
        style: 'destructive',
        onPress: () => {
          archiveCategory.mutate(category.id);
        },
      },
    ]);
  }

  function restore(category: Category) {
    if (category.parent_id) {
      const parentArchived = (archivedCategories.data ?? []).some(
        (entry) => entry.id === category.parent_id,
      );
      if (parentArchived) {
        Alert.alert(es.categories.title, es.categories.cannotRestoreChild);
        return;
      }
    }
    restoreCategory.mutate(category.id);
  }

  function editCategory(category: Category) {
    router.push({ pathname: '/category-form', params: { kind, id: category.id } });
  }

  return (
    <Screen scroll>
      <View style={{ gap: spacing.lg, marginTop: spacing.lg }}>
        <View style={{ gap: spacing.xs }}>
          <Pressable onPress={() => router.back()} accessibilityRole="button" hitSlop={8}>
            <Text variant="caption" color={colors.primary}>
              {es.common.back}
            </Text>
          </Pressable>
          <Text variant="title">{es.categories.title}</Text>
        </View>

        <SegmentedControl<KindOption>
          options={[
            { label: es.categories.tabExpense, value: 'expense' },
            { label: es.categories.tabIncome, value: 'income' },
          ]}
          value={kind}
          onChange={setKind}
        />

        <Pressable
          onPress={() => setShowArchived((value) => !value)}
          accessibilityRole="button"
          accessibilityState={{ selected: showArchived }}
          hitSlop={8}
          style={{ alignSelf: 'flex-start' }}
        >
          <Text variant="caption" color={colors.primary}>
            {showArchived
              ? es.categories.hideArchived
              : `${es.categories.showArchived}${archivedCount > 0 ? ` (${archivedCount})` : ''}`}
          </Text>
        </Pressable>

        {!showArchived ? (
          <Button
            title={es.categories.newCategory}
            onPress={() => router.push({ pathname: '/category-form', params: { kind } })}
          />
        ) : null}

        {groups.length === 0 ? (
          <EmptyState
            title={es.categories.emptyTitle}
            description={showArchived ? es.categories.noArchived : es.categories.emptyDescription}
            actionLabel={showArchived ? undefined : es.categories.newCategory}
            onAction={
              showArchived
                ? undefined
                : () => router.push({ pathname: '/category-form', params: { kind } })
            }
          />
        ) : (
          <View style={{ gap: spacing.md }}>
            {groups.map(({ category, children }) => (
              <Card key={category.id} style={{ gap: spacing.sm }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.md,
                  }}
                >
                  <CategoryIcon icon={category.icon} color={category.color} size={22} />
                  <Text variant="body" style={{ flex: 1 }}>
                    {category.name}
                  </Text>
                  {showArchived ? (
                    <Pressable
                      onPress={() => restore(category)}
                      accessibilityRole="button"
                      hitSlop={8}
                    >
                      <Text variant="caption" color={colors.primary}>
                        {es.categories.restore}
                      </Text>
                    </Pressable>
                  ) : (
                    <>
                      <Pressable
                        onPress={() =>
                          router.push({
                            pathname: '/category-form',
                            params: { kind, parentId: category.id },
                          })
                        }
                        accessibilityRole="button"
                        accessibilityLabel={`${es.categories.addSubcategory}: ${category.name}`}
                        hitSlop={8}
                      >
                        <Text variant="caption" color={colors.primary}>
                          +
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => editCategory(category)}
                        accessibilityRole="button"
                        hitSlop={8}
                      >
                        <Text variant="caption" color={colors.primary}>
                          {es.common.edit}
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => confirmArchive(category)}
                        accessibilityRole="button"
                        hitSlop={8}
                      >
                        <Text variant="caption" color={colors.danger}>
                          {es.categories.archive}
                        </Text>
                      </Pressable>
                    </>
                  )}
                </View>

                {children.map((child) => (
                  <View
                    key={child.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: spacing.md,
                      marginLeft: spacing.xl,
                    }}
                  >
                    <CategoryIcon icon={child.icon} color={child.color} size={18} />
                    <Text variant="body" style={{ flex: 1 }}>
                      {child.name}
                    </Text>
                    {showArchived ? (
                      <Pressable
                        onPress={() => restore(child)}
                        accessibilityRole="button"
                        hitSlop={8}
                      >
                        <Text variant="caption" color={colors.primary}>
                          {es.categories.restore}
                        </Text>
                      </Pressable>
                    ) : (
                      <>
                        <Pressable
                          onPress={() => editCategory(child)}
                          accessibilityRole="button"
                          hitSlop={8}
                        >
                          <Text variant="caption" color={colors.primary}>
                            {es.common.edit}
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={() => confirmArchive(child)}
                          accessibilityRole="button"
                          hitSlop={8}
                        >
                          <Text variant="caption" color={colors.danger}>
                            {es.categories.archive}
                          </Text>
                        </Pressable>
                      </>
                    )}
                  </View>
                ))}
              </Card>
            ))}
          </View>
        )}
      </View>
    </Screen>
  );
}
