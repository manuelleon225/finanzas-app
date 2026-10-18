import { buildBarChartLayout } from '../layout';

describe('buildBarChartLayout', () => {
  it('máximo cero: todas las barras miden 2 px', () => {
    const layout = buildBarChartLayout({
      data: [{ label: 'Ene', values: [0, 0] }],
      width: 100,
      height: 180,
    });
    expect(layout.groups[0].bars[0].height).toBe(2);
    expect(layout.groups[0].bars[1].height).toBe(2);
  });

  it('un mes', () => {
    const layout = buildBarChartLayout({
      data: [{ label: 'Ene', values: [10, 5] }],
      width: 100,
      height: 180,
    });
    expect(layout.groups).toHaveLength(1);
    expect(layout.groups[0].touchRect.height).toBe(180);
  });

  it('seis meses', () => {
    const data = Array.from({ length: 6 }, (_, index) => ({
      label: `M${index}`,
      values: [index + 1, index + 2],
    }));
    const layout = buildBarChartLayout({ data, width: 300, height: 180 });
    expect(layout.groups).toHaveLength(6);
  });

  it('valores iguales escalan al máximo', () => {
    const layout = buildBarChartLayout({
      data: [{ label: 'Ene', values: [10, 10] }],
      width: 100,
      height: 180,
    });
    expect(layout.groups[0].bars[0].height).toBe(180);
    expect(layout.groups[0].bars[1].height).toBe(180);
  });

  it('barra mínima para valor cero con máximo > 0', () => {
    const layout = buildBarChartLayout({
      data: [{ label: 'Ene', values: [10, 0] }],
      width: 100,
      height: 180,
    });
    expect(layout.groups[0].bars[1].height).toBe(0);
  });
});
