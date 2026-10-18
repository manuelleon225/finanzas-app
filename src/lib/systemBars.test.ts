import { getStatusBarStyle, getTopInsetColor } from './systemBars';

describe('getStatusBarStyle', () => {
  it('variant "block" siempre usa íconos claros', () => {
    expect(getStatusBarStyle('dark', 'block')).toBe('light');
    expect(getStatusBarStyle('light', 'block')).toBe('light');
  });

  it('variant "plain" usa oscuros en claro y claros en oscuro', () => {
    expect(getStatusBarStyle('light', 'plain')).toBe('dark');
    expect(getStatusBarStyle('dark', 'plain')).toBe('light');
  });
});

describe('getTopInsetColor', () => {
  it('variant "block" pinta la zona segura superior con brand', () => {
    expect(getTopInsetColor('block')).toBe('brand');
  });

  it('variant "plain" pinta la zona segura superior con bg', () => {
    expect(getTopInsetColor('plain')).toBe('bg');
  });
});
