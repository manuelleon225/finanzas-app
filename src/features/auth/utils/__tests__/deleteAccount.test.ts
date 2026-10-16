import {
  DELETE_CONFIRMATION_WORD,
  isDeleteConfirmationValid,
  resetLocalState,
  type ResetLocalStateDeps,
} from '../deleteAccount';

describe('isDeleteConfirmationValid', () => {
  it('acepta la palabra exacta', () => {
    expect(isDeleteConfirmationValid(DELETE_CONFIRMATION_WORD)).toBe(true);
  });

  it('ignora espacios alrededor', () => {
    expect(isDeleteConfirmationValid('  ELIMINAR  ')).toBe(true);
  });

  it('no distingue mayúsculas de minúsculas', () => {
    expect(isDeleteConfirmationValid('eliminar')).toBe(true);
    expect(isDeleteConfirmationValid('Eliminar')).toBe(true);
  });

  it('rechaza texto vacío', () => {
    expect(isDeleteConfirmationValid('')).toBe(false);
    expect(isDeleteConfirmationValid('   ')).toBe(false);
  });

  it('rechaza una palabra distinta o incompleta', () => {
    expect(isDeleteConfirmationValid('ELIMINA')).toBe(false);
    expect(isDeleteConfirmationValid('ELIMINARX')).toBe(false);
    expect(isDeleteConfirmationValid('borrar')).toBe(false);
  });
});

function makeDeps(): jest.Mocked<ResetLocalStateDeps> {
  return {
    signOutLocal: jest.fn().mockResolvedValue(undefined),
    clearQueryCache: jest.fn(),
    clearPersistedCache: jest.fn().mockResolvedValue(undefined),
    cancelNotifications: jest.fn().mockResolvedValue(undefined),
    resetStores: jest.fn(),
  };
}

describe('resetLocalState', () => {
  it('cierra la sesión, cancela notificaciones y limpia todo el estado', async () => {
    const deps = makeDeps();

    await resetLocalState(deps);

    expect(deps.signOutLocal).toHaveBeenCalledTimes(1);
    expect(deps.cancelNotifications).toHaveBeenCalledTimes(1);
    expect(deps.clearQueryCache).toHaveBeenCalledTimes(1);
    expect(deps.clearPersistedCache).toHaveBeenCalledTimes(1);
    expect(deps.resetStores).toHaveBeenCalledTimes(1);
  });

  it('vacía el caché persistido antes de restablecer los stores', async () => {
    const deps = makeDeps();

    await resetLocalState(deps);

    expect(deps.clearPersistedCache.mock.invocationCallOrder[0]).toBeLessThan(
      deps.resetStores.mock.invocationCallOrder[0],
    );
  });

  it('limpia el caché y los stores aunque falle cerrar sesión o cancelar notificaciones', async () => {
    const deps = makeDeps();
    deps.signOutLocal.mockRejectedValue(new Error('sin red'));
    deps.cancelNotifications.mockRejectedValue(new Error('no soportado'));

    await expect(resetLocalState(deps)).resolves.toBeUndefined();

    expect(deps.clearQueryCache).toHaveBeenCalledTimes(1);
    expect(deps.clearPersistedCache).toHaveBeenCalledTimes(1);
    expect(deps.resetStores).toHaveBeenCalledTimes(1);
  });
});
