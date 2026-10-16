import { LoadingState, Screen } from '@/components/ui';
import { AuthLinkErrorView } from '@/features/auth/components/AuthLinkError';
import { useAuthLinkStore } from '@/features/auth/store/useAuthLinkStore';
import { es } from '@/i18n/es';

export default function ConfirmEmailScreen() {
  const linkError = useAuthLinkStore((state) => state.linkError);

  if (linkError) {
    return <AuthLinkErrorView flow={linkError.flow} reason={linkError.reason} />;
  }

  return (
    <Screen>
      <LoadingState message={es.auth.confirmingEmail} />
    </Screen>
  );
}
