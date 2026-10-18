import { createContext, useContext, useMemo, useRef, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { es } from '@/i18n/es';
import { warning } from '@/lib/haptics';
import { durations, useTheme } from '@/theme';

import { AppIcon } from './AppIcon';
import { Text } from './Text';

const ACTION_WIDTH = 96;

type SwipeableRowGroupValue = {
  closeOthers: (close: () => void) => void;
  closeActive: () => void;
  release: (close: () => void) => void;
};

const SwipeableRowGroupContext = createContext<SwipeableRowGroupValue | null>(null);

export function useSwipeableRowGroup() {
  return useContext(SwipeableRowGroupContext);
}

export type SwipeableRowGroupProps = {
  children: ReactNode;
};

export function SwipeableRowGroup({ children }: SwipeableRowGroupProps) {
  const activeClose = useRef<(() => void) | null>(null);

  const value = useMemo<SwipeableRowGroupValue>(
    () => ({
      closeOthers: (close) => {
        if (activeClose.current && activeClose.current !== close) {
          activeClose.current();
        }
        activeClose.current = close;
      },
      closeActive: () => {
        activeClose.current?.();
        activeClose.current = null;
      },
      release: (close) => {
        if (activeClose.current === close) {
          activeClose.current = null;
        }
      },
    }),
    [],
  );

  return (
    <SwipeableRowGroupContext.Provider value={value}>{children}</SwipeableRowGroupContext.Provider>
  );
}

export type SwipeableRowProps = {
  onDelete: () => void;
  actionLabel?: string;
  actionIcon?: string;
  children: ReactNode;
};

export function SwipeableRow({
  onDelete,
  actionLabel = es.common.delete,
  actionIcon = 'trash-outline',
  children,
}: SwipeableRowProps) {
  const { colors } = useTheme();
  const group = useContext(SwipeableRowGroupContext);
  const translateX = useSharedValue(0);
  const isOpen = useSharedValue(false);

  function closeRow() {
    translateX.value = withTiming(0, { duration: durations.fast });
    isOpen.value = false;
  }

  function handleOpen() {
    group?.closeOthers(closeRow);
  }

  function handleDelete() {
    warning();
    closeRow();
    group?.release(closeRow);
    onDelete();
  }

  const pan = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .onUpdate((event) => {
      const start = isOpen.value ? -ACTION_WIDTH : 0;
      translateX.value = Math.min(0, Math.max(-ACTION_WIDTH, start + event.translationX));
    })
    .onEnd((event) => {
      const shouldOpen = translateX.value < -ACTION_WIDTH / 2 || event.velocityX < -500;

      if (shouldOpen) {
        translateX.value = withTiming(-ACTION_WIDTH, { duration: durations.fast });
        isOpen.value = true;
        runOnJS(handleOpen)();
      } else {
        translateX.value = withTiming(0, { duration: durations.fast });
        isOpen.value = false;
      }
    });

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.container}>
      <View style={[styles.actionContainer, { width: ACTION_WIDTH }]}>
        <Pressable
          onPress={handleDelete}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          style={[styles.action, { backgroundColor: colors.danger }]}
        >
          <AppIcon name={actionIcon} size={24} color={colors.onBrand} />
          <Text variant="micro" color={colors.onBrand}>
            {actionLabel}
          </Text>
        </Pressable>
      </View>

      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.content, { backgroundColor: colors.surface }, contentStyle]}>
          <Pressable
            onPress={() => group?.closeActive()}
            accessibilityRole="button"
            accessibilityActions={[{ name: 'delete', label: actionLabel }]}
            onAccessibilityAction={(event) => {
              if (event.nativeEvent.actionName === 'delete') {
                handleDelete();
              }
            }}
          >
            {children}
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  actionContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
  },
  action: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  content: {
    flexDirection: 'row',
  },
});
