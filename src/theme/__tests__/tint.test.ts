import { tint } from '../tint';

describe('tint', () => {
  it('convierte un hex de 6 dígitos a rgba con la opacidad pedida', () => {
    expect(tint('#EF4444', 0.16)).toBe('rgba(239, 68, 68, 0.16)');
  });

  it('convierte un hex de 3 dígitos', () => {
    expect(tint('#fff', 1)).toBe('rgba(255, 255, 255, 1)');
  });

  it('acepta la opacidad del tema claro en fondos suaves', () => {
    expect(tint('#F5B544', 0.12)).toBe('rgba(245, 181, 68, 0.12)');
  });
});
