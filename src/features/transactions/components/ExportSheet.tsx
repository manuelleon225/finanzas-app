import { useState } from 'react';
import { View } from 'react-native';

import { BottomSheet, Button, Chip, Text } from '@/components/ui';
import { es } from '@/i18n/es';
import { useSnackbarStore } from '@/lib/snackbar';
import { useTheme } from '@/theme';

import { exportTransactionsToCsv } from '../api/export';
import type { ExportRange } from '../utils/exportRange';

export type ExportSheetProps = {
  visible: boolean;
  onClose: () => void;
};

export function ExportSheet({ visible, onClose }: ExportSheetProps) {
  const { colors, spacing } = useTheme();
  const showSnackbar = useSnackbarStore((state) => state.show);
  const [range, setRange] = useState<ExportRange>('month');
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleExport() {
    setExporting(true);
    setMessage(null);

    try {
      const result = await exportTransactionsToCsv(range);
      if (result === 'empty') {
        setMessage(es.export.empty);
        return;
      }
      showSnackbar(es.export.success.replace('{count}', String(result.count)));
      onClose();
    } catch {
      setMessage(es.export.error);
    } finally {
      setExporting(false);
    }
  }

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={{ gap: spacing.md }}>
        <Text variant="subtitle">{es.export.title}</Text>

        <View style={{ gap: spacing.sm }}>
          <Text variant="caption">{es.export.range}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            <Chip
              label={es.export.rangeMonth}
              selected={range === 'month'}
              onPress={() => setRange('month')}
            />
            <Chip
              label={es.export.rangeYear}
              selected={range === 'year'}
              onPress={() => setRange('year')}
            />
            <Chip
              label={es.export.rangeAll}
              selected={range === 'all'}
              onPress={() => setRange('all')}
            />
          </View>
        </View>

        {exporting ? <Text variant="caption">{es.export.exporting}</Text> : null}
        {message ? (
          <Text variant="caption" color={colors.danger}>
            {message}
          </Text>
        ) : null}

        <Button
          title={es.export.export}
          onPress={() => void handleExport()}
          loading={exporting}
          disabled={exporting}
        />
      </View>
    </BottomSheet>
  );
}
