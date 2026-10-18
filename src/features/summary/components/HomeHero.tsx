import { Pressable, StyleSheet, View } from 'react-native';

import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { AppIcon } from '@/components/ui/AppIcon';
import { Avatar } from '@/components/ui/Avatar';
import { MonthSelector } from '@/components/ui/MonthSelector';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { es } from '@/i18n/es';
import { useTheme } from '@/theme';

import {
  cushionText,
  daysToPaymentText,
  heroAccessibilityLabel,
  heroSpentText,
} from '../utils/home';

export type HomeHeroProps = {
  displayName: string;
  monthAnchor: Date;
  onMonthChange: (next: Date) => void;
  loading: boolean;
  firstUse: boolean;
  noMargin: boolean;
  remainingToday: number;
  allowanceToday: number;
  spentToday: number;
  progress: number;
  daysToIncome: number;
  usedFallbackHorizon: boolean;
  extraCushion: number;
  onHelpPress: () => void;
};

export function HomeHero({
  displayName,
  monthAnchor,
  onMonthChange,
  loading,
  firstUse,
  noMargin,
  remainingToday,
  allowanceToday,
  spentToday,
  progress,
  daysToIncome,
  usedFallbackHorizon,
  extraCushion,
  onHelpPress,
}: HomeHeroProps) {
  const { colors, radii, spacing } = useTheme();

  return (
    <View style={{ gap: spacing.lg }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing.md,
        }}
      >
        <View style={styles.grow}>
          <Text variant="caption" color={colors.onBrandMuted}>
            {es.home.greeting}, {displayName || '…'}
          </Text>
          <MonthSelector
            value={monthAnchor}
            onChange={onMonthChange}
            labelVariant="bodyStrong"
            tone="onBlock"
          />
        </View>
        <Avatar name={displayName} size={36} onBlock />
      </View>

      <View style={{ gap: spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <Text variant="caption" color={colors.onBrandMuted}>
            {es.home.availableToday}
          </Text>
          <Pressable
            onPress={onHelpPress}
            accessibilityRole="button"
            accessibilityLabel={es.home.helpTitle}
            hitSlop={{ top: 14, bottom: 14, left: 10, right: 10 }}
          >
            <AppIcon name="help-circle-outline" size={16} color={colors.onBrandMuted} />
          </Pressable>
        </View>

        {loading ? (
          <Skeleton tone="onBlock" width="55%" height={40} />
        ) : (
          <AnimatedNumber
            value={remainingToday}
            variant="display"
            color={colors.onBrand}
            accessibilityLabel={heroAccessibilityLabel(remainingToday, allowanceToday)}
          />
        )}

        {loading ? (
          <Skeleton tone="onBlock" width="100%" height={6} />
        ) : firstUse ? (
          <Text variant="caption" color={colors.onBrandMuted}>
            {es.home.firstUseBlock}
          </Text>
        ) : (
          <>
            <ProgressBar value={progress} tone="onBlock" />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                gap: spacing.md,
              }}
            >
              <Text variant="caption" color={colors.onBrandMuted}>
                {heroSpentText(spentToday, allowanceToday)}
              </Text>
              <Text variant="caption" color={colors.onBrandMuted}>
                {daysToPaymentText(daysToIncome, usedFallbackHorizon)}
              </Text>
            </View>
            {noMargin ? (
              <Text variant="caption" color={colors.onBrandMuted}>
                {es.home.noMarginTitle}. {es.home.noMarginHelp}
              </Text>
            ) : null}
            {extraCushion > 0 ? (
              <View
                style={[
                  styles.pill,
                  {
                    backgroundColor: colors.blockSoft,
                    borderRadius: radii.pill,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                  },
                ]}
              >
                <Text variant="caption" color={colors.onBrand}>
                  {cushionText(extraCushion)}
                </Text>
              </View>
            ) : null}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grow: {
    flex: 1,
  },
  pill: {
    alignSelf: 'flex-start',
  },
});
