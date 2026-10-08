import Ionicons from '@expo/vector-icons/Ionicons';

export type IconSize = 16 | 20 | 24;

export type AppIconProps = {
  name: string;
  size?: IconSize;
  color: string;
  accessibilityLabel?: string;
};

const OUTLINE_SUFFIX = '-outline';
const FALLBACK = 'ellipsis-horizontal-outline';

export function AppIcon({ name, size = 20, color, accessibilityLabel }: AppIconProps) {
  const outlineName = name.endsWith(OUTLINE_SUFFIX) ? name : `${name}${OUTLINE_SUFFIX}`;
  const glyph =
    outlineName in Ionicons.glyphMap ? outlineName : name in Ionicons.glyphMap ? name : FALLBACK;

  return (
    <Ionicons
      name={glyph as keyof typeof Ionicons.glyphMap}
      size={size}
      color={color}
      accessibilityLabel={accessibilityLabel}
    />
  );
}
