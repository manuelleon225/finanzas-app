import { confirmationUpdate } from '../confirm';

describe('confirmationUpdate', () => {
  it('pasa el movimiento a posted con el monto indicado', () => {
    expect(confirmationUpdate(12345)).toEqual({ status: 'posted', amount: 12345 });
  });
});
