import { useState } from 'react';
import { View } from 'react-native';

import {
  Button,
  Card,
  Chip,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
  MoneyText,
  Screen,
  SegmentedControl,
  Text,
} from '@/components/ui';
import { es } from '@/i18n/es';
import { useTheme } from '@/theme';

type PreviewSegment = 'base' | 'extra';

export default function DesignPreviewScreen() {
  const { spacing } = useTheme();
  const [segment, setSegment] = useState<PreviewSegment>('base');
  const [chip, setChip] = useState(false);
  const [text, setText] = useState('');

  return (
    <Screen scroll>
      <View style={{ gap: spacing.xl }}>
        <View style={{ gap: spacing.xs }}>
          <Text variant="title">{es.designPreview.title}</Text>
          <Text variant="caption">{es.designPreview.subtitle}</Text>
        </View>

        <Card>
          <Text variant="subtitle">Text</Text>
          <View style={{ gap: spacing.xs, marginTop: spacing.sm }}>
            <Text variant="title">Title</Text>
            <Text variant="subtitle">Subtitle</Text>
            <Text variant="body">Body text</Text>
            <Text variant="caption">Caption text</Text>
            <Text variant="money">Money text</Text>
          </View>
        </Card>

        <Card>
          <Text variant="subtitle">MoneyText</Text>
          <View style={{ gap: spacing.xs, marginTop: spacing.sm }}>
            <MoneyText amount={2500000} kind="income" signed />
            <MoneyText amount={125000} kind="expense" signed />
            <MoneyText amount={0} kind="neutral" />
          </View>
        </Card>

        <Card>
          <Text variant="subtitle">Button</Text>
          <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
            <Button title="Primary" onPress={() => undefined} />
            <Button title="Secondary" variant="secondary" onPress={() => undefined} />
            <Button title="Ghost" variant="ghost" onPress={() => undefined} />
            <Button title="Loading" loading onPress={() => undefined} />
            <Button title="Disabled" disabled onPress={() => undefined} />
          </View>
        </Card>

        <Card>
          <Text variant="subtitle">Input</Text>
          <View style={{ marginTop: spacing.sm }}>
            <Input
              label="Etiqueta"
              placeholder="Escribe algo"
              value={text}
              onChangeText={setText}
              helperText="Texto de ayuda"
            />
            <View style={{ height: spacing.md }} />
            <Input label="Con error" placeholder="Escribe algo" error="Este campo es obligatorio" />
          </View>
        </Card>

        <Card>
          <Text variant="subtitle">Chip</Text>
          <View
            style={{
              flexDirection: 'row',
              gap: spacing.sm,
              marginTop: spacing.sm,
              flexWrap: 'wrap',
            }}
          >
            <Chip label="Base" selected={!chip} onPress={() => setChip(false)} />
            <Chip label="Extra" selected={chip} onPress={() => setChip(true)} />
          </View>
        </Card>

        <Card>
          <Text variant="subtitle">SegmentedControl</Text>
          <View style={{ marginTop: spacing.sm }}>
            <SegmentedControl<PreviewSegment>
              options={[
                { label: 'Base', value: 'base' },
                { label: 'Extra', value: 'extra' },
              ]}
              value={segment}
              onChange={setSegment}
            />
          </View>
        </Card>

        <Card>
          <Text variant="subtitle">Estados</Text>
          <View style={{ gap: spacing.md, marginTop: spacing.sm }}>
            <View style={{ height: 120 }}>
              <LoadingState />
            </View>
            <View style={{ height: 180 }}>
              <EmptyState actionLabel="Agregar" onAction={() => undefined} />
            </View>
            <View style={{ height: 180 }}>
              <ErrorState onRetry={() => undefined} />
            </View>
          </View>
        </Card>
      </View>
    </Screen>
  );
}
