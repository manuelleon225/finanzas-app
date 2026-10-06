import { useQuery } from '@tanstack/react-query';
import { Pressable, StyleSheet, View } from 'react-native';

import { ErrorState, LoadingState, Text } from '@/components/ui';
import { es } from '@/i18n/es';
import { useTheme } from '@/theme';

import type { CategoryKind } from '../api/categories';
import { getCategoriesByIds } from '../api/categories';
import { useCategories } from '../hooks/useCategories';
import { mergeCategories } from '../utils/categories';
import { CategoryIcon } from './CategoryIcon';

export type CategoryPickerProps = {
  kind: CategoryKind;
  value: string | null;
  onChange: (id: string) => void;
  additionIds?: string[];
};

export function CategoryPicker({ kind, value, onChange, additionIds }: CategoryPickerProps) {
  const activeQuery = useCategories(kind);
  const { colors, radii, spacing } = useTheme();

  const additionsQuery = useQuery({
    queryKey: ['categories', 'byIds', additionIds ?? []],
    queryFn: () => getCategoriesByIds(additionIds ?? []),
    enabled: (additionIds?.length ?? 0) > 0,
  });

  const categories = mergeCategories(activeQuery.data ?? [], additionsQuery.data ?? []);
  const loadingAdditions = (additionIds?.length ?? 0) > 0 && additionsQuery.isLoading;

  if (activeQuery.isLoading || loadingAdditions) {
    return <LoadingState />;
  }

  if (activeQuery.isError || additionsQuery.isError) {
    return <ErrorState onRetry={() => void activeQuery.refetch()} />;
  }

  if (categories.length === 0) {
    return <Text variant="caption">{es.categories.emptyDescription}</Text>;
  }

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
      {categories.map((category) => {
        const selected = category.id === value;
        return (
          <Pressable
            key={category.id}
            onPress={() => onChange(category.id)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={[
              styles.chip,
              {
                borderColor: selected ? colors.primary : colors.border,
                backgroundColor: selected ? colors.primary : colors.surface,
                borderRadius: radii.pill,
                paddingHorizontal: spacing.md,
              },
            ]}
          >
            <CategoryIcon
              icon={category.icon}
              color={selected ? colors.onPrimary : category.color}
              size={16}
            />
            <Text variant="caption" color={selected ? colors.onPrimary : colors.textPrimary}>
              {category.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 44,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
