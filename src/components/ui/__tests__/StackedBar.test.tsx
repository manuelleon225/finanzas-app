import { render } from '@testing-library/react-native';

import { StackedBar, stackedLayout } from '../StackedBar';

const segments = [
  { value: 70, color: '#111111', label: 'Base' },
  { value: 30, color: '#222222', label: 'Extra' },
];

describe('stackedLayout', () => {
  it('reparte las proporciones sobre el total', () => {
    const { total, items } = stackedLayout(segments);
    expect(total).toBe(100);
    expect(items.map((item) => item.widthPercent)).toEqual(['70%', '30%']);
  });

  it('con total 0 no genera segmentos', () => {
    const { total, items } = stackedLayout([
      { value: 0, color: '#111111' },
      { value: 0, color: '#222222' },
    ]);
    expect(total).toBe(0);
    expect(items).toHaveLength(0);
  });

  it('ignora totales negativos', () => {
    const { items } = stackedLayout([{ value: -10, color: '#111111' }]);
    expect(items).toHaveLength(0);
  });
});

describe('StackedBar', () => {
  it('expone la leyenda como resumen accesible', async () => {
    const { getByLabelText, getByText } = await render(<StackedBar segments={segments} legend />);
    expect(getByLabelText('Base, Extra')).toBeTruthy();
    expect(getByText('Base')).toBeTruthy();
    expect(getByText('Extra')).toBeTruthy();
  });

  it('con total 0 no muestra leyenda', async () => {
    const { queryByText } = await render(
      <StackedBar segments={[{ value: 0, color: '#111111', label: 'Base' }]} legend />,
    );
    expect(queryByText('Base')).toBeNull();
  });
});
