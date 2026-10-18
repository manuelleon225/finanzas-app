import { render } from '@testing-library/react-native';

import { colors, tint } from '@/theme';

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

  it('en default usa riel surfaceHigh y relleno brand', async () => {
    const { getByRole, getByTestId } = await render(<ProgressBar value={0.5} />);
    expect(getByRole('progressbar')).toHaveStyle({ backgroundColor: colors.dark.surfaceHigh });
    expect(getByTestId('progress-fill')).toHaveStyle({ backgroundColor: colors.dark.brand });
  });

  it('onBlock usa riel blockTrack y relleno onBrand', async () => {
    const { getByRole, getByTestId } = await render(<ProgressBar value={0.5} tone="onBlock" />);
    expect(getByRole('progressbar')).toHaveStyle({ backgroundColor: colors.dark.blockTrack });
    expect(getByTestId('progress-fill')).toHaveStyle({ backgroundColor: colors.dark.onBrand });
  });

  it('status pinta ok, near y over', async () => {
    const ok = await render(<ProgressBar value={0.5} status="ok" />);
    expect(ok.getByTestId('progress-fill')).toHaveStyle({ backgroundColor: colors.dark.brand });

    const near = await render(<ProgressBar value={0.9} status="near" />);
    expect(near.getByTestId('progress-fill')).toHaveStyle({
      backgroundColor: tint(colors.dark.expense, 0.65),
    });

    const over = await render(<ProgressBar value={1.2} status="over" />);
    expect(over.getByTestId('progress-fill')).toHaveStyle({ backgroundColor: colors.dark.expense });
  });
});
