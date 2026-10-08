import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import {
  AppIcon,
  Button,
  Card,
  Chip,
  Input,
  MoneyText,
  Screen,
  SegmentedControl,
  Text,
} from '@/components/ui';
import { useTheme, useThemeModeStore, type ThemeModePreference } from '@/theme';

type PreviewSegment = 'a' | 'b';

export default function DesignPreviewScreen() {
  const { colors, spacing } = useTheme();
  const mode = useThemeModeStore((state) => state.mode);
  const setMode = useThemeModeStore((state) => state.setMode);
  const [segment, setSegment] = useState<PreviewSegment>('a');
  const [chip, setChip] = useState(false);

  return (
    <Screen scroll={false}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          gap: spacing.lg,
          paddingTop: spacing.lg,
          paddingBottom: spacing.xxl2,
        }}
      >
        <View style={{ gap: spacing.xs }}>
          <Text variant="title">Sistema de diseño v2</Text>
          <Text variant="caption">Pantalla temporal de desarrollo. Se eliminará en R4.5.</Text>
        </View>

        <Card style={{ gap: spacing.sm }}>
          <Text variant="caption">Tema</Text>
          <SegmentedControl<ThemeModePreference>
            options={[
              { label: 'Sistema', value: 'system' },
              { label: 'Oscuro', value: 'dark' },
              { label: 'Claro', value: 'light' },
            ]}
            value={mode}
            onChange={setMode}
          />
        </Card>

        <Card style={{ gap: spacing.sm }}>
          <Text variant="caption">Text</Text>
          <Text variant="displayLg">displayLg 40</Text>
          <Text variant="display">display 34</Text>
          <Text variant="title">title 22</Text>
          <Text variant="subtitle">subtitle 17</Text>
          <Text variant="body">body 15</Text>
          <Text variant="bodyStrong">bodyStrong 15</Text>
          <Text variant="caption">caption 12</Text>
          <Text variant="micro">micro 11</Text>
        </Card>

        <Card style={{ gap: spacing.sm }}>
          <Text variant="caption">MoneyText</Text>
          <MoneyText amount={87500} kind="income" signed size="displayLg" />
          <MoneyText amount={87500} kind="expense" signed size="display" />
          <MoneyText amount={87500} kind="neutral" size="bodyStrong" />
        </Card>

        <Card style={{ gap: spacing.sm }}>
          <Text variant="caption">Button</Text>
          <Button title="Primary" />
          <Button title="Secondary" variant="secondary" />
          <Button title="Ghost" variant="ghost" />
          <Button title="Destructive" variant="destructive" />
          <Button title="Loading" loading />
          <Button title="Disabled" disabled />
        </Card>

        <Card style={{ gap: spacing.sm }}>
          <Text variant="caption">Input</Text>
          <Input label="Etiqueta" placeholder="Escribe algo" helperText="Texto de ayuda" />
          <Input label="Con error" placeholder="Escribe algo" error="Este campo es obligatorio" />
        </Card>

        <Card style={{ gap: spacing.sm }}>
          <Text variant="caption">Chip</Text>
          <View style={styles.row}>
            <Chip label="Base" selected={!chip} onPress={() => setChip(false)} />
            <Chip label="Extra" tone="extra" selected={chip} onPress={() => setChip(true)} />
          </View>
        </Card>

        <Card style={{ gap: spacing.sm }}>
          <Text variant="caption">SegmentedControl</Text>
          <SegmentedControl<PreviewSegment>
            options={[
              { label: 'A', value: 'a' },
              { label: 'B', value: 'b' },
            ]}
            value={segment}
            onChange={setSegment}
          />
        </Card>

        <Card style={{ gap: spacing.sm }}>
          <Text variant="caption">AppIcon (outline)</Text>
          <View style={styles.row}>
            <AppIcon name="home-outline" size={16} color={colors.textPrimary} />
            <AppIcon name="list-outline" size={20} color={colors.brand} />
            <AppIcon name="pie-chart-outline" size={24} color={colors.income} />
          </View>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
});
