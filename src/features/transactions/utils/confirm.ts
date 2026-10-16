import type { TablesUpdate } from '@/types/database';

/**
 * Payload para confirmar un movimiento pendiente: pasa a 'posted' con el monto
 * indicado (el usuario puede ajustarlo, p. ej. servicios de monto variable).
 */
export function confirmationUpdate(amount: number): TablesUpdate<'transactions'> {
  return { status: 'posted', amount };
}
