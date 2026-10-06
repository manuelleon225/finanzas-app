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
import { useArchiveCategory, useCategories } from '@/features/categories/hooks/useCategories';
import { groupCategoriesByParent } from '@/features/categories/utils/categories';
import { es } from '@/i18n/es';
import { useTheme } from '@/theme';

type KindOption = 'expense' | 'income';

export default function CategoriesScreen() {
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const { session, loading: sessionLoading } = useSession();
  const [kind, setKind] = useState<KindOption>('expense');
  const { data, isLoading, isError, refetch } = useCategories(kind as CategoryKind);
  const archiveCategory = useArchiveCategory();

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

  const groups = groupCategoriesByParent(data ?? []);

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

        <Button
          title={es.categories.newCategory}
          onPress={() => router.push({ pathname: '/category-form', params: { kind } })}
        />

        {groups.length === 0 ? (
          <EmptyState
            title={es.categories.emptyTitle}
            description={es.categories.emptyDescription}
            actionLabel={es.categories.newCategory}
            onAction={() => router.push({ pathname: '/category-form', params: { kind } })}
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
