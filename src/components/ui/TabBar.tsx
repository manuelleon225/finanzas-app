import { Fragment } from 'react';
import { useRouter } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { es } from '@/i18n/es';
import { tap } from '@/lib/haptics';
import { useTheme } from '@/theme';

import { AppIcon } from './AppIcon';
import { Text } from './Text';

type RouteMeta = {
  icon: string;
  label: string;
};

const ROUTE_META: Record<string, RouteMeta> = {
  index: { icon: 'home-outline', label: es.tabs.home },
  movements: { icon: 'list-outline', label: es.tabs.movements },
  plan: { icon: 'pie-chart-outline', label: es.tabs.plan },
  more: { icon: 'ellipsis-horizontal-outline', label: es.tabs.more },
};

const PLUS_INDEX = 2;

function PlusButton({ onPress, label }: { onPress: () => void; label: string }) {
  const { colors } = useTheme();

  return (
    <View style={styles.plusSlot}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={[styles.plus, { backgroundColor: colors.brand }]}
      >
        <AppIcon name="add-outline" size={24} color={colors.onBrand} />
      </Pressable>
    </View>
  );
}

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const router = useRouter();
  const { colors, componentHeights } = useTheme();
  const insets = useSafeAreaInsets();

  function openQuickAdd() {
    tap();
    router.push('/transaction-form');
  }

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          height: componentHeights.tabBar + insets.bottom,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const meta = ROUTE_META[route.name];
        const label = descriptors[route.key]?.options.title ?? meta?.label ?? route.name;

        function handlePress() {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        }

        return (
          <Fragment key={route.key}>
            {index === PLUS_INDEX ? (
              <PlusButton onPress={openQuickAdd} label={es.transactionForm.add} />
            ) : null}
            <Pressable
              onPress={handlePress}
              accessibilityRole="button"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={label}
              style={styles.item}
            >
              <AppIcon
                name={meta?.icon ?? 'ellipse-outline'}
                size={24}
                color={focused ? colors.brand : colors.textSecondary}
              />
              <Text variant="micro" color={focused ? colors.brand : colors.textSecondary}>
                {label}
              </Text>
            </Pressable>
          </Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingTop: 8,
    minHeight: 44,
  },
  plusSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plus: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: -14 }],
  },
});
