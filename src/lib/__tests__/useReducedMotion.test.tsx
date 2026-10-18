import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { PressableScale } from '@/components/ui/PressableScale';
import { useReducedMotion } from '@/lib/useReducedMotion';

function Probe() {
  useReducedMotion();
  return null;
}

describe('useReducedMotion', () => {
  it('se ejecuta sin error', () => {
    render(<Probe />);
  });
});

describe('PressableScale', () => {
  it('renderiza sin error', () => {
    render(<PressableScale />);
  });
});
