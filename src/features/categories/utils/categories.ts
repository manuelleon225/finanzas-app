import type { Tables } from '@/types/database';

export type Category = Tables<'categories'>;

export const ICON_SET: string[] = [
  'fast-food-outline',
  'cart-outline',
  'bus-outline',
  'home-outline',
  'flash-outline',
  'medkit-outline',
  'school-outline',
  'game-controller-outline',
  'shirt-outline',
  'repeat-outline',
  'cash-outline',
  'wallet-outline',
  'card-outline',
  'trending-up-outline',
  'pricetag-outline',
  'gift-outline',
  'car-outline',
  'airplane-outline',
  'book-outline',
  'cafe-outline',
  'phone-portrait-outline',
  'fitness-outline',
  'ellipsis-horizontal-outline',
];

export const COLOR_PALETTE: string[] = [
  '#EF4444',
  '#F97316',
  '#F59E0B',
  '#EAB308',
  '#84CC16',
  '#22C55E',
  '#10B981',
  '#14B8A6',
  '#3B82F6',
  '#6366F1',
  '#A855F7',
  '#EC4899',
];

export type CategoryWithChildren = {
  category: Category;
  children: Category[];
};

export function groupCategoriesByParent(categories: Category[]): CategoryWithChildren[] {
  const childrenByParent = new Map<string, Category[]>();

  for (const category of categories) {
    if (category.parent_id) {
      const siblings = childrenByParent.get(category.parent_id) ?? [];
      siblings.push(category);
      childrenByParent.set(category.parent_id, siblings);
    }
  }

  return categories
    .filter((category) => !category.parent_id)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((category) => ({
      category,
      children: (childrenByParent.get(category.id) ?? []).sort(
        (a, b) => a.sort_order - b.sort_order,
      ),
    }));
}
