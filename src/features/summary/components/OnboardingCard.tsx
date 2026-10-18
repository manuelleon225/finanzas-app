import { View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { Card } from '@/components/ui/Card';
import { IconTile } from '@/components/ui/IconTile';
import { ListRow } from '@/components/ui/ListRow';
import { Text } from '@/components/ui/Text';
import { es } from '@/i18n/es';
import { useTheme } from '@/theme';

import type { OnboardingStep, OnboardingStepId } from '../utils/onboarding';

export type OnboardingCardProps = {
  steps: OnboardingStep[];
  onPressStep: (id: OnboardingStepId) => void;
};

export function OnboardingCard({ steps, onPressStep }: OnboardingCardProps) {
  const { colors, spacing } = useTheme();

  return (
    <Card style={{ gap: spacing.sm }}>
      <Text variant="subtitle">{es.home.onboardingTitle}</Text>
      {steps.map((step) => (
        <ListRow
          key={step.id}
          leading={<IconTile icon={step.icon} tileKey={step.tileKey} size={32} />}
          title={step.label}
          trailing={
            step.done ? (
              <View testID="onboarding-step-done">
                <AppIcon name="checkmark-circle" filled size={20} color={colors.income} />
              </View>
            ) : (
              <AppIcon name="chevron-forward-outline" size={20} color={colors.textMuted} />
            )
          }
          onPress={() => onPressStep(step.id)}
        />
      ))}
    </Card>
  );
}
