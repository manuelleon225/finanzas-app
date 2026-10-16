import { create } from 'zustand';

import type { AuthLinkErrorReason, AuthLinkFlow } from '../utils/authLink';

export type AuthLinkError = {
  flow: AuthLinkFlow | null;
  reason: AuthLinkErrorReason;
};

type AuthLinkState = {
  isRecoverySession: boolean;
  linkError: AuthLinkError | null;
  startRecovery: () => void;
  endRecovery: () => void;
  setLinkError: (error: AuthLinkError) => void;
  clearLinkError: () => void;
};

/**
 * Estado en memoria (no persistido) del flujo de enlaces de autenticación.
 * `isRecoverySession` evita que el guardia de rutas mande a las pestañas a quien
 * llegó desde un enlace de recuperación antes de cambiar la contraseña.
 */
export const useAuthLinkStore = create<AuthLinkState>((set) => ({
  isRecoverySession: false,
  linkError: null,
  startRecovery: () => set({ isRecoverySession: true, linkError: null }),
  endRecovery: () => set({ isRecoverySession: false }),
  setLinkError: (linkError) => set({ linkError }),
  clearLinkError: () => set({ linkError: null }),
}));
