import { View } from 'react-native';

import { getTileColors, useTheme, type TileKey } from '@/theme';

import { AppIcon } from './AppIcon';

export type IconTileSize = 32 | 40 | 48;

export type IconTileProps = {
  icon: string;
  tileKey: TileKey;
  size?: IconTileSize;
  accessibilityLabel?: string;
};

const RADII: Record<IconTileSize, number> = { 32: 10, 40: 12, 48: 14 };
const ICON_SIZES: Record<IconTileSize, number> = { 32: 18, 40: 22, 48: 26 };

export function IconTile({ icon, tileKey, size = 40, accessibilityLabel }: IconTileProps) {
  const { mode } = useTheme();
  const tile = getTileColors(tileKey, mode);
  const isLabeled = accessibilityLabel != null;

  return (
    <View
      testID="icon-tile"
      accessible={isLabeled}
      accessibilityRole={isLabeled ? 'image' : undefined}
      accessibilityLabel={accessibilityLabel}
      style={{
        width: size,
        height: size,
        borderRadius: RADII[size],
        backgroundColor: tile.bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <AppIcon name={icon} size={ICON_SIZES[size]} color={tile.icon} filled />
    </View>
  );
}
