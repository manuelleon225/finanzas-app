import Ionicons from '@expo/vector-icons/Ionicons';

export type IconSize = 16 | 20 | 24;

export type AppIconProps = {
  name: string;
  size?: number;
  color: string;
  filled?: boolean;
  accessibilityLabel?: string;
};

const OUTLINE_SUFFIX = '-outline';
const FALLBACK = 'ellipsis-horizontal-outline';

const glyphMap = Ionicons.glyphMap as Record<string, number>;

export function hasGlyph(name: string): boolean {
  return name in glyphMap;
}

// Resuelve el nombre guardado (normalmente con sufijo "-outline") al glifo de
// Ionicons. Con filled=true usa la variante rellena si existe en el mapa.
export function resolveIconName(name: string, filled = false): string {
  const outlineName = name.endsWith(OUTLINE_SUFFIX) ? name : `${name}${OUTLINE_SUFFIX}`;
  const baseName = outlineName.slice(0, -OUTLINE_SUFFIX.length);

  if (filled && hasGlyph(baseName)) {
    return baseName;
  }

  if (hasGlyph(outlineName)) {
    return outlineName;
  }

  return hasGlyph(name) ? name : FALLBACK;
}

export function AppIcon({
  name,
  size = 20,
  color,
  filled = false,
  accessibilityLabel,
}: AppIconProps) {
  return (
    <Ionicons
      name={resolveIconName(name, filled) as keyof typeof Ionicons.glyphMap}
      size={size}
      color={color}
      accessibilityLabel={accessibilityLabel}
    />
  );
}
