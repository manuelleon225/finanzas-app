import type { ReactElement, ReactNode } from 'react';
import { ScrollView, View, type RefreshControlProps, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getTopInsetColor } from '@/lib/systemBars';
import { useTheme } from '@/theme';

import { BlockHeader } from './BlockHeader';
import { Sheet } from './Sheet';
import { SystemBars } from './SystemBars';

export type ScreenScaffoldVariant = 'block' | 'plain';

export type ScreenScaffoldProps = {
  variant?: ScreenScaffoldVariant;
  header?: ReactNode;
  children: ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  refreshControl?: ReactElement<RefreshControlProps>;
};

export function ScreenScaffold({
  variant = 'plain',
  header,
  children,
  scroll = true,
  style,
  contentContainerStyle,
  refreshControl,
}: ScreenScaffoldProps) {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const bottomPadding = insets.bottom + spacing.xl;
  const isBlock = variant === 'block';

  const scrollView = (extraPadding: ViewStyle) => (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[extraPadding, contentContainerStyle]}
      keyboardShouldPersistTaps="handled"
      refreshControl={refreshControl}
    >
      {children}
    </ScrollView>
  );

  return (
    <View style={[{ flex: 1, backgroundColor: colors.bg }, style]}>
      <View
        testID="top-inset-fill"
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: insets.top,
          backgroundColor: colors[getTopInsetColor(variant)],
        }}
      />
      <SystemBars variant={isBlock ? 'block' : 'plain'} />

      {isBlock ? (
        <>
          <BlockHeader>{header}</BlockHeader>
          <Sheet>
            {scroll ? (
              scrollView({ paddingTop: spacing.lg, paddingBottom: bottomPadding })
            ) : (
              <View style={{ flex: 1, paddingBottom: bottomPadding }}>{children}</View>
            )}
          </Sheet>
        </>
      ) : (
        <>
          <View style={{ paddingTop: insets.top + spacing.md, paddingHorizontal: spacing.screen }}>
            {header}
          </View>
          {scroll ? (
            scrollView({ padding: spacing.screen, paddingBottom: bottomPadding })
          ) : (
            <View
              style={{ flex: 1, paddingHorizontal: spacing.screen, paddingBottom: bottomPadding }}
            >
              {children}
            </View>
          )}
        </>
      )}
    </View>
  );
}
