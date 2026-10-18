/* eslint-disable react-hooks/rules-of-hooks */
import { AccessibilityInfo } from 'react-native';
import { useEffect, useState } from 'react';

let useReanimatedReducedMotion: (() => boolean) | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  useReanimatedReducedMotion = require('react-native-reanimated').useReducedMotion;
} catch {
  useReanimatedReducedMotion = null;
}

export function useReducedMotion(): boolean {
  if (useReanimatedReducedMotion) {
    try {
      return !!useReanimatedReducedMotion();
    } catch {
      // fallback below
    }
  }

  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (mounted) {
        setReduced(value);
      }
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (value) => {
      setReduced(value);
    });
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);
  return reduced;
}
