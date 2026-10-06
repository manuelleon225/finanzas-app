import { zodResolver } from '@hookform/resolvers/zod';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, View } from 'react-native';
import { z } from 'zod';

import { Button, Chip, Input, LoadingState, Screen, Text } from '@/components/ui';
import { useSession } from '@/features/auth/hooks/AuthProvider';
import type { CategoryKind } from '@/features/categories/api/categories';
import { CategoryIcon } from '@/features/categories/components/CategoryIcon';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
} from '@/features/categories/hooks/useCategories';
import {
  COLOR_PALETTE,
  ICON_SET,
  validateCategoryName,
} from '@/features/categories/utils/categories';
import { es } from '@/i18n/es';
import { useTheme } from '@/theme';

const categorySchema = z.object({
  name: z.string().trim().min(1, es.categories.nameRequired),
  icon: z.string().min(1, es.categories.iconRequired),
  color: z.string().min(1, es.categories.colorRequired),
  parentId: z.string().nullable(),
});

type CategoryForm = z.infer<typeof categorySchema>;

export default function CategoryFormScreen() {
  const router = useRouter();
  const { spacing, radii, colors } = useTheme();
  const { session, loading: sessionLoading } = useSession();
  const params = useLocalSearchParams<{ kind?: string; id?: string; parentId?: string }>();
  const kind = (params.kind === 'income' ? 'income' : 'expense') as CategoryKind;
  const id = typeof params.id === 'string' && params.id.length > 0 ? params.id : undefined;
  const parentIdParam =
    typeof params.parentId === 'string' && params.parentId.length > 0 ? params.parentId : undefined;
  const isEditing = !!id;

  const { data: categories, isLoading } = useCategories(kind);
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const category = isEditing ? categories?.find((entry) => entry.id === id) : undefined;
  const hasChildren = isEditing
    ? (categories ?? []).some((entry) => entry.parent_id === id)
    : false;
  const parentName = parentIdParam
    ? categories?.find((entry) => entry.id === parentIdParam)?.name
    : undefined;

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      icon: ICON_SET[0],
      color: COLOR_PALETTE[0],
      parentId: parentIdParam ?? null,
    },
  });

  useEffect(() => {
    if (isEditing && category) {
      reset({
        name: category.name,
        icon: category.icon,
        color: category.color,
        parentId: category.parent_id,
      });
    }
  }, [isEditing, category, reset]);

  if (sessionLoading) {
    return <LoadingState />;
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  if (isEditing && isLoading) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }

  const parentOptions = (categories ?? []).filter((entry) => !entry.parent_id && entry.id !== id);
  const isPending = createCategory.isPending || updateCategory.isPending;

  const onSubmit = handleSubmit((values) => {
    const nameError = validateCategoryName({
      name: values.name,
      kind,
      parentId: values.parentId,
      editingId: id,
      categories: categories ?? [],
    });

    if (nameError) {
      setError('name', { type: 'manual', message: nameError });
      return;
    }

    const payload = {
      name: values.name.trim(),
      icon: values.icon,
      color: values.color,
      kind,
      parent_id: hasChildren ? null : values.parentId,
    };

    if (isEditing) {
      updateCategory.mutate(
        { id: id as string, input: payload },
        { onSuccess: () => router.back() },
      );
    } else {
      createCategory.mutate(payload, { onSuccess: () => router.back() });
    }
  });

  return (
    <Screen scroll>
      <View style={{ gap: spacing.lg, marginTop: spacing.lg }}>
        <Text variant="title">
          {isEditing
            ? es.categories.editCategory
            : parentIdParam
              ? es.categories.newSubcategory
              : es.categories.newCategory}
        </Text>

        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <Input
              label={es.categories.name}
              placeholder={es.categories.namePlaceholder}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={errors.name?.message}
            />
          )}
        />

        <Controller
          name="icon"
          control={control}
          render={({ field }) => (
            <View style={{ gap: spacing.sm }}>
              <Text variant="caption">{es.categories.icon}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                {ICON_SET.map((icon) => {
                  const selected = field.value === icon;
                  return (
                    <Pressable
                      key={icon}
                      onPress={() => field.onChange(icon)}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      style={[
                        {
                          width: 44,
                          height: 44,
                          borderRadius: radii.md,
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderWidth: 2,
                          borderColor: selected ? colors.primary : colors.border,
                          backgroundColor: selected ? colors.primary : colors.surface,
                        },
                      ]}
                    >
                      <CategoryIcon
                        icon={icon}
                        color={selected ? colors.onPrimary : colors.textSecondary}
                        size={22}
                      />
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}
        />

        <Controller
          name="color"
          control={control}
          render={({ field }) => (
            <View style={{ gap: spacing.sm }}>
              <Text variant="caption">{es.categories.color}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                {COLOR_PALETTE.map((color) => {
                  const selected = field.value === color;
                  return (
                    <Pressable
                      key={color}
                      onPress={() => field.onChange(color)}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      style={[
                        {
                          width: 32,
                          height: 32,
                          borderRadius: radii.pill,
                          backgroundColor: color,
                          borderWidth: 2,
                          borderColor: selected ? colors.textPrimary : 'transparent',
                        },
                      ]}
                    />
                  );
                })}
              </View>
            </View>
          )}
        />

        {parentIdParam || hasChildren ? (
          <View style={{ gap: spacing.xs }}>
            <Text variant="caption">
              {hasChildren
                ? es.categories.cannotBeSubcategory
                : `${es.categories.subcategoryOf}: ${parentName ?? '…'}`}
            </Text>
          </View>
        ) : (
          <Controller
            name="parentId"
            control={control}
            render={({ field }) => (
              <View style={{ gap: spacing.sm }}>
                <Text variant="caption">{es.categories.parent}</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                  <Chip
                    label={es.categories.noParent}
                    selected={field.value == null}
                    onPress={() => field.onChange(null)}
                  />
                  {parentOptions.map((option) => {
                    const selected = field.value === option.id;
                    return (
                      <Chip
                        key={option.id}
                        label={option.name}
                        selected={selected}
                        onPress={() => field.onChange(selected ? null : option.id)}
                      />
                    );
                  })}
                </View>
                <Text variant="caption">{es.categories.parentHelper}</Text>
              </View>
            )}
          />
        )}

        <Button
          title={es.categories.saveCategory}
          onPress={() => void onSubmit()}
          loading={isPending}
          disabled={isPending}
        />
      </View>
    </Screen>
  );
}
