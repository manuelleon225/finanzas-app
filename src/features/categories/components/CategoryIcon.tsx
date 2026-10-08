import { AppIcon, type IconSize } from '@/components/ui/AppIcon';

export type CategoryIconProps = {
  icon: string;
  color: string;
  size?: number;
};

export function CategoryIcon({ icon, color, size = 20 }: CategoryIconProps) {
  const resolved = size <= 18 ? 16 : size <= 22 ? 20 : 24;
  return <AppIcon name={icon} size={resolved as IconSize} color={color} />;
}
