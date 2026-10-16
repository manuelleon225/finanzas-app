import * as Linking from 'expo-linking';
import { useEffect, useRef } from 'react';

import { completeAuthLink } from '../api/auth';
import { useAuthLinkStore } from '../store/useAuthLinkStore';
import { parseAuthLink } from '../utils/authLink';

/**
 * Escucha los deep links entrantes (recuperación de contraseña y confirmación
 * de correo), canja el código por una sesión y marca el estado del flujo.
 * Se monta una sola vez, cerca de la raíz de la app.
 */
export function useAuthDeepLink() {
  const startRecovery = useAuthLinkStore((state) => state.startRecovery);
  const clearLinkError = useAuthLinkStore((state) => state.clearLinkError);
  const setLinkError = useAuthLinkStore((state) => state.setLinkError);
  const handled = useRef(new Set<string>());

  useEffect(() => {
    let active = true;

    async function handle(rawUrl: string | null) {
      if (!rawUrl || handled.current.has(rawUrl)) {
        return;
      }
      handled.current.add(rawUrl);

      const link = parseAuthLink(rawUrl);
      if (link.kind === 'none') {
        return;
      }
      if (link.kind === 'error') {
        setLinkError({ flow: link.flow, reason: link.reason });
        return;
      }

      clearLinkError();
      if (link.flow === 'recovery') {
        // Marcar ANTES de crear la sesión para que el guardia no redirija.
        startRecovery();
      }

      try {
        await completeAuthLink(link);
      } catch {
        setLinkError({ flow: link.flow, reason: 'invalid' });
      }
    }

    void Linking.getInitialURL().then((url) => {
      if (active) {
        void handle(url);
      }
    });

    const subscription = Linking.addEventListener('url', (event) => {
      void handle(event.url);
    });

    return () => {
      active = false;
      subscription.remove();
    };
  }, [clearLinkError, setLinkError, startRecovery]);
}
