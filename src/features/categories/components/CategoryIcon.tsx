import Ionicons from '@expo/vector-icons/Ionicons';

const FALLBACK_ICON = 'ellipsis-horizontal-outline';

export type CategoryIconProps = {
  icon: string;
  color: string;
  size?: number;
};

export function CategoryIcon({ icon, color, size = 20 }: CategoryIconProps) {
  const name = (icon in Ionicons.glyphMap ? icon : FALLBACK_ICON) as keyof typeof Ionicons.glyphMap;
  return <Ionicons name={name} color={color} size={size} />;
}
