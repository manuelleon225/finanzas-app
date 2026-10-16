import { connectivityText, mergePendingByDay, pendingNoticeText } from '../offlinePresentation';

describe('connectivityText', () => {
  it('sin conexión y sin pendientes', () => {
    expect(connectivityText(false, 0)).toBe('Sin conexión');
  });

  it('sin conexión con pendientes', () => {
    expect(connectivityText(false, 3)).toBe('Sin conexión · 3 por sincronizar');
  });

  it('con conexión y pendientes está sincronizando', () => {
    expect(connectivityText(true, 2)).toBe('Sincronizando…');
  });

  it('con conexión y sin pendientes no muestra nada', () => {
    expect(connectivityText(true, 0)).toBeNull();
  });
});

describe('pendingNoticeText', () => {
  it('incluye la cantidad', () => {
    expect(pendingNoticeText(4)).toContain('4');
  });
});

describe('mergePendingByDay', () => {
  it('antepone los pendientes al día existente', () => {
    const days = [
      { date: '2026-10-07', items: ['tx1', 'tx2'] },
      { date: '2026-10-06', items: ['tx3'] },
    ];
    const pending = [{ occurred_on: '2026-10-07', item: 'p1' }];
    const result = mergePendingByDay(days, pending);
    expect(result[0].date).toBe('2026-10-07');
    expect(result[0].items).toEqual(['p1', 'tx1', 'tx2']);
  });

  it('crea un día nuevo si no existe y ordena desc', () => {
    const days = [{ date: '2026-10-06', items: ['tx1'] }];
    const pending = [{ occurred_on: '2026-10-08', item: 'p1' }];
    const result = mergePendingByDay(days, pending);
    expect(result.map((day) => day.date)).toEqual(['2026-10-08', '2026-10-06']);
    expect(result[0].items).toEqual(['p1']);
  });

  it('sin pendientes conserva los días', () => {
    const days = [{ date: '2026-10-06', items: ['tx1'] }];
    expect(mergePendingByDay(days, [])).toEqual(days);
  });
});
