import { es } from '@/i18n/es';

import { accountSubtitle } from '../accountRow';

describe('accountSubtitle', () => {
  it('muestra el tipo en español cuando el nombre es distinto', () => {
    expect(accountSubtitle({ name: 'Banco Popular', type: 'bank', countsAsLiquid: true })).toBe(
      'Banco',
    );
    expect(accountSubtitle({ name: 'Tarjeta', type: 'credit_card', countsAsLiquid: false })).toBe(
      'Tarjeta de crédito',
    );
  });

  it('si el nombre coincide con el tipo y es líquida, muestra "Cuenta para gastar"', () => {
    expect(accountSubtitle({ name: 'Efectivo', type: 'cash', countsAsLiquid: true })).toBe(
      es.accounts.countsAsLiquid,
    );
  });

  it('si el nombre coincide con el tipo y no es líquida, avisa que no cuenta', () => {
    expect(
      accountSubtitle({ name: 'Tarjeta de crédito', type: 'credit_card', countsAsLiquid: false }),
    ).toBe(es.accounts.doesNotCountAsLiquid);
  });

  it('ignora mayúsculas, espacios y tildes al comparar el nombre con el tipo', () => {
    expect(
      accountSubtitle({
        name: '  tarjeta de credito ',
        type: 'credit_card',
        countsAsLiquid: false,
      }),
    ).toBe(es.accounts.doesNotCountAsLiquid);
  });
});
