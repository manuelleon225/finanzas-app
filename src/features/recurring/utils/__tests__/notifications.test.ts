import { computeReminderPlans, type ReminderRule } from '../notifications';

const baseRule: ReminderRule = {
  id: 'r1',
  frequency: 'monthly',
  start_date: '2026-01-15',
  end_date: null,
  amount: 800000,
  note: 'Arriendo',
  categoryName: 'Vivienda',
};

describe('computeReminderPlans', () => {
  it('programa un día antes a las 9:00 con anticipación de 1', () => {
    const plans = computeReminderPlans([baseRule], {
      todayISO: '2026-01-01',
      horizonDays: 30,
      anticipationDays: 1,
    });
    expect(plans).toHaveLength(1);
    expect(plans[0].occurrenceDate).toBe('2026-01-15');
    expect(plans[0].triggerDate.getFullYear()).toBe(2026);
    expect(plans[0].triggerDate.getMonth()).toBe(0);
    expect(plans[0].triggerDate.getDate()).toBe(14);
    expect(plans[0].triggerDate.getHours()).toBe(9);
    expect(plans[0].title).toBe('Mañana vence: Arriendo');
    expect(plans[0].body).toBe(`Arriendo — $${'\u00a0'}800.000`);
  });

  it('programa el mismo día a las 9:00 con anticipación de 0', () => {
    const plans = computeReminderPlans([baseRule], {
      todayISO: '2026-01-01',
      horizonDays: 30,
      anticipationDays: 0,
    });
    expect(plans[0].triggerDate.getDate()).toBe(15);
    expect(plans[0].triggerDate.getHours()).toBe(9);
    expect(plans[0].title).toBe('Hoy vence: Arriendo');
  });

  it('usa el nombre de la categoría si no hay nota', () => {
    const plans = computeReminderPlans([{ ...baseRule, note: null }], {
      todayISO: '2026-01-01',
      horizonDays: 30,
      anticipationDays: 1,
    });
    expect(plans[0].title).toBe('Mañana vence: Vivienda');
  });

  it('excluye ocurrencias fuera del horizonte de 30 días', () => {
    const farRule = { ...baseRule, start_date: '2026-02-15' };
    const plans = computeReminderPlans([farRule], {
      todayISO: '2026-01-01',
      horizonDays: 30,
      anticipationDays: 1,
    });
    expect(plans).toEqual([]);
  });

  it('devuelve lista vacía sin reglas', () => {
    expect(
      computeReminderPlans([], { todayISO: '2026-01-01', horizonDays: 30, anticipationDays: 1 }),
    ).toEqual([]);
  });

  it('ordena por fecha de disparo', () => {
    const plans = computeReminderPlans(
      [
        { ...baseRule, start_date: '2026-01-10' },
        { ...baseRule, id: 'r2', start_date: '2026-01-05' },
      ],
      { todayISO: '2026-01-01', horizonDays: 30, anticipationDays: 1 },
    );
    expect(plans.map((plan) => plan.occurrenceDate)).toEqual(['2026-01-05', '2026-01-10']);
  });
});
