import { useState } from 'react';

import { IconButton, Input, type InputProps } from '@/components/ui';
import { es } from '@/i18n/es';

export type PasswordInputProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: InputProps['onBlur'];
  error?: string;
  autoComplete?: InputProps['autoComplete'];
};

export function PasswordInput({
  label,
  value,
  onChangeText,
  onBlur,
  error,
  autoComplete,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <Input
      label={label}
      value={value}
      onChangeText={onChangeText}
      onBlur={onBlur}
      error={error}
      secureTextEntry={!visible}
      autoComplete={autoComplete}
      rightAccessory={
        <IconButton
          icon={visible ? 'eye-off-outline' : 'eye-outline'}
          onPress={() => setVisible((current) => !current)}
          accessibilityLabel={visible ? es.auth.hidePassword : es.auth.showPassword}
        />
      }
    />
  );
}
