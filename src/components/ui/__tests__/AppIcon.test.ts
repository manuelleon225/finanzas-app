import { hasGlyph, resolveIconName } from '../AppIcon';

describe('resolveIconName', () => {
  it('conserva el contorno cuando filled=false', () => {
    expect(resolveIconName('home-outline', false)).toBe('home-outline');
    expect(resolveIconName('home', false)).toBe('home-outline');
  });

  it('resuelve la versión rellena cuando filled=true', () => {
    expect(resolveIconName('home-outline', true)).toBe('home');
    expect(resolveIconName('home', true)).toBe('home');
  });

  it('cae al glifo por defecto cuando el nombre no existe', () => {
    expect(resolveIconName('icono-inexistente', false)).toBe('ellipsis-horizontal-outline');
    expect(resolveIconName('icono-inexistente', true)).toBe('ellipsis-horizontal-outline');
    expect(resolveIconName('icono-inexistente-outline', true)).toBe('ellipsis-horizontal-outline');
  });
});

describe('hasGlyph', () => {
  it('detecta glifos existentes y ausentes', () => {
    expect(hasGlyph('home')).toBe(true);
    expect(hasGlyph('home-outline')).toBe(true);
    expect(hasGlyph('piggy-bank')).toBe(false);
  });
});
