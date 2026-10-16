import { render } from '@testing-library/react-native';

import { clampProgress, ProgressBar } from '../ProgressBar';

describe('clampProgress', () => {
  it('no baja de 0', () => {
    expect(clampProgress(-0.5)).toBe(0);
  });

  it('no pasa de 1', () => {
    expect(clampProgress(2)).toBe(1);
  });

  it('conserva valores entre 0 y 1', () => {
    expect(clampProgress(0.4)).toBe(0.4);
  });

  it('maneja NaN como 0', () => {
    expect(clampProgress(Number.NaN)).toBe(0);
  });
});

describe('ProgressBar', () => {
  it('expone el valor acotado a la accesibilidad', async () => {
    const { getByRole } = await render(<ProgressBar value={1.5} />);
    expect(getByRole('progressbar').props.accessibilityValue).toEqual({
      min: 0,
      max: 100,
      now: 100,
    });
  });

  it('redondea el valor a un porcentaje', async () => {
    const { getByRole } = await render(<ProgressBar value={0.42} />);
    expect(getByRole('progressbar').props.accessibilityValue.now).toBe(42);
  });
});
