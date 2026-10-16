import { hasMorePages, nextOffset } from '../pagination';

describe('hasMorePages', () => {
  it('pide otra página cuando la página viene llena', () => {
    expect(hasMorePages(1000, 1000)).toBe(true);
  });

  it('se detiene cuando la página viene incompleta', () => {
    expect(hasMorePages(999, 1000)).toBe(false);
    expect(hasMorePages(0, 1000)).toBe(false);
  });

  it('maneja páginas mayores al tamaño', () => {
    expect(hasMorePages(1200, 1000)).toBe(true);
  });
});

describe('nextOffset', () => {
  it('avanza por bloques', () => {
    expect(nextOffset(0, 1000)).toBe(1000);
    expect(nextOffset(1000, 1000)).toBe(2000);
  });
});
