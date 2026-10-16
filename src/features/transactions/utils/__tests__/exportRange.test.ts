import { exportRangeBounds } from '../exportRange';

const TODAY = new Date(2026, 9, 15);

describe('exportRangeBounds', () => {
  it('mes actual', () => {
    expect(exportRangeBounds('month', TODAY)).toEqual({ from: '2026-10-01', to: '2026-10-31' });
  });

  it('año actual', () => {
    expect(exportRangeBounds('year', TODAY)).toEqual({ from: '2026-01-01', to: '2026-12-31' });
  });

  it('todo el historial', () => {
    expect(exportRangeBounds('all', TODAY)).toEqual({ from: null, to: null });
  });
});
