import { useEffect, type ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { es } from '@/i18n/es';
import { durations, useTheme } from '@/theme';

export type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
};

export function BottomSheet({ visible, onClose, children }: BottomSheetProps) {
  const { colors, radii, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const translateY = useSharedValue(screenHeight);
  const maxHeight = screenHeight * 0.85;
  const reduceMotion = useReducedMotion();

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      translateY.value = Math.max(0, event.translationY);
    })
    .onEnd((event) => {
      if (event.translationY > 120 || event.velocityY > 600) {
        runOnJS(onClose)();
      } else {
        translateY.value = reduceMotion ? 0 : withTiming(0, { duration: durations.fast });
      }
    });

  useEffect(() => {
    const target = visible ? 0 : screenHeight;
    translateY.value = reduceMotion ? target : withTiming(target, { duration: durations.standard });
  }, [visible, translateY, screenHeight, reduceMotion]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) {
    return null;
  }

  return (
    <Modal transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: colors.scrim }]}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={es.common.close}
        />
        <GestureDetector gesture={pan}>
          <Animated.View
            accessibilityViewIsModal
            style={[
              styles.sheet,
              {
                backgroundColor: colors.surface,
                borderTopLeftRadius: radii.xl,
                borderTopRightRadius: radii.xl,
                maxHeight,
                paddingHorizontal: spacing.xl,
                paddingTop: spacing.sm,
                paddingBottom: insets.bottom + spacing.lg,
              },
              sheetStyle,
            ]}
          >
            <View
              style={[
                styles.handle,
                { backgroundColor: colors.textMuted, marginBottom: spacing.md },
              ]}
            />
            {children}
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    alignSelf: 'stretch',
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
  },
});
