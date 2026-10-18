import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import {
  AppIcon,
  BottomSheet,
  EmptyState,
  ErrorState,
  IconButton,
  IconTile,
  ListRow,
  LoadingState,
  ScreenHeader,
  ScreenScaffold,
  SegmentedControl,
  Skeleton,
  Text,
} from '@/components/ui';
import { resolveCategoryTile } from '@/components/ui/tileHelpers';
import type { Category, CategoryKind } from '@/features/categories/api/categories';
import {
  useArchiveCategory,
  useCategories,
  useRestoreCategory,
} from '@/features/categories/hooks/useCategories';
import { categorySubtitle, groupCategoriesByParent } from '@/features/categories/utils/categories';
import { useSession } from '@/features/auth/hooks/AuthProvider';
import { es } from '@/i18n/es';
import { useSnackbarStore } from '@/lib/snackbar';
import { componentHeights, useTheme } from '@/theme';

type KindOption = 'expense' | 'income';

type MenuAction = {
  key: string;
  label: string;
  icon: string;
  danger?: boolean;
  onPress: () => void;
};

function CategoryRow({
  category,
  indented = false,
  subtitle,
  onMenu,
}: {
  category: Category;
  indented?: boolean;
  subtitle?: string;
  onMenu: () => void;
}) {
  const { spacing } = useTheme();
  const tile = resolveCategoryTile({
    name: category.name,
    kind: category.kind,
    icon: category.icon,
    color: category.color,
  });

  return (
    <ListRow
      leading={<IconTile icon={tile.icon} tileKey={tile.tileKey} size={indented ? 32 : 40} />}
      title={category.name}
      subtitle={subtitle}
      trailing={
        <IconButton
          icon="ellipsis-horizontal"
          onPress={onMenu}
          accessibilityLabel={`${es.categories.moreActions}: ${category.name}`}
        />
      }
      style={indented ? { marginLeft: spacing.xl } : undefined}
    />
  );
}

function MenuRow({ action }: { action: MenuAction }) {
  const { colors, radii, spacing } = useTheme();

  return (
    <Pressable
      onPress={action.onPress}
      accessibilityRole="button"
      accessibilityLabel={action.label}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        minHeight: componentHeights.listRow,
        paddingHorizontal: spacing.sm,
        borderRadius: radii.md,
        backgroundColor: pressed ? colors.surfaceRaised : 'transparent',
      })}
    >
      <AppIcon
        name={action.icon}
        size={20}
        color={action.danger ? colors.danger : colors.textPrimary}
      />
      <Text variant="body" color={action.danger ? colors.danger : undefined}>
        {action.label}
      </Text>
    </Pressable>
  );
}

export default function CategoriesScreen() {
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const showSnackbar = useSnackbarStore((state) => state.show);
  const { session, loading: sessionLoading } = useSession();
  const [kind, setKind] = useState<KindOption>('expense');
  const [showArchived, setShowArchived] = useState(false);
  const [active, setActive] = useState<Category | null>(null);

  const activeCategories = useCategories(kind as CategoryKind);
  const archivedCategories = useCategories(kind as CategoryKind, { archived: true });
  const archiveCategory = useArchiveCategory();
  const restoreCategory = useRestoreCategory();

  const current = showArchived ? archivedCategories : activeCategories;
  const groups = groupCategoriesByParent(current.data ?? []);
  const archivedCount = archivedCategories.data?.length ?? 0;

  if (sessionLoading) {
    return <LoadingState />;
  }

  if (!session) {
    return <Redirect href="/login" />;
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

    restoreCategory.mutate(category.id, {
      onSuccess: () => {
        const hasArchivedChildren = (archivedCategories.data ?? []).some(
          (entry) => entry.parent_id === category.id,
        );
        showSnackbar(
          hasArchivedChildren ? es.categories.restoreMotherNotice : es.categories.restoreSuccess,
        );
      },
    });
  }

  function activeActions(category: Category): MenuAction[] {
    if (showArchived) {
      return [
        {
          key: 'restore',
          label: es.categories.restore,
          icon: 'arrow-undo-outline',
          onPress: () => restore(category),
        },
      ];
    }

    const actions: MenuAction[] = [
      {
        key: 'edit',
        label: es.common.edit,
        icon: 'create-outline',
        onPress: () =>
          router.push({ pathname: '/category-form', params: { kind, id: category.id } }),
      },
    ];

    if (!category.parent_id) {
      actions.push({
        key: 'add-subcategory',
        label: es.categories.addSubcategory,
        icon: 'add-circle-outline',
        onPress: () =>
          router.push({
            pathname: '/category-form',
            params: { kind, parentId: category.id },
          }),
      });
    }

    actions.push({
      key: 'archive',
      label: es.categories.archive,
      icon: 'archive-outline',
      danger: true,
      onPress: () => confirmArchive(category),
    });

    return actions;
  }

  const actions = active ? activeActions(active) : [];

  return (
    <ScreenScaffold
      variant="plain"
      contentContainerStyle={{ gap: spacing.md }}
      header={
        <ScreenHeader
          left={
            <IconButton
              icon="chevron-back-outline"
              onPress={() => router.back()}
              accessibilityLabel={es.common.back}
            />
          }
          title={es.categories.title}
          actions={
            showArchived ? undefined : (
              <IconButton
                icon="add-outline"
                onPress={() => router.push({ pathname: '/category-form', params: { kind } })}
                accessibilityLabel={es.categories.newCategory}
              />
            )
          }
        />
      }
    >
      <SegmentedControl<KindOption>
        options={[
          { label: es.categories.tabExpense, value: 'expense' },
          { label: es.categories.tabIncome, value: 'income' },
        ]}
        value={kind}
        onChange={setKind}
      />

      {current.isLoading ? (
        <View style={{ gap: spacing.sm }}>
          <Skeleton variant="card" height={64} />
          <Skeleton variant="card" height={64} />
          <Skeleton variant="card" height={64} />
        </View>
      ) : current.isError ? (
        <ErrorState onRetry={() => void current.refetch()} />
      ) : groups.length === 0 ? (
        showArchived ? (
          <EmptyState
            icon="archive-outline"
            title={es.categories.archivedEmptyTitle}
            description={es.categories.archivedEmptyDescription}
          />
        ) : (
          <EmptyState
            icon="pricetags-outline"
            title={es.categories.emptyTitle}
            description={es.categories.emptyDescription}
            actionLabel={es.categories.newCategory}
            onAction={() => router.push({ pathname: '/category-form', params: { kind } })}
          />
        )
      ) : (
        <View>
          {groups.map(({ category, children }) => (
            <View key={category.id}>
              <CategoryRow
                category={category}
                subtitle={categorySubtitle(children.length)}
                onMenu={() => setActive(category)}
              />
              {children.map((child) => (
                <CategoryRow
                  key={child.id}
                  category={child}
                  indented
                  onMenu={() => setActive(child)}
                />
              ))}
            </View>
          ))}
        </View>
      )}

      <Pressable
        onPress={() => setShowArchived((value) => !value)}
        accessibilityRole="button"
        accessibilityLabel={showArchived ? es.categories.hideArchived : es.categories.showArchived}
        accessibilityState={{ selected: showArchived }}
        hitSlop={{ top: 14, bottom: 14, left: 8, right: 8 }}
        style={{ alignSelf: 'flex-start', paddingVertical: spacing.sm }}
      >
        <Text variant="caption" color={colors.brandText}>
          {showArchived
            ? es.categories.hideArchived
            : `${es.categories.showArchived}${archivedCount > 0 ? ` (${archivedCount})` : ''}`}
        </Text>
      </Pressable>

      <BottomSheet visible={active !== null} onClose={() => setActive(null)}>
        <View style={{ gap: spacing.xs }}>
          {actions.map((action) => (
            <MenuRow
              key={action.key}
              action={{
                ...action,
                onPress: () => {
                  setActive(null);
                  action.onPress();
                },
              }}
            />
          ))}
        </View>
      </BottomSheet>
    </ScreenScaffold>
  );
}
