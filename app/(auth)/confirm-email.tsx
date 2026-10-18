import { LoadingState } from '@/components/ui';
import { AuthLinkErrorView } from '@/features/auth/components/AuthLinkError';
import { AuthScaffold } from '@/features/auth/components/AuthScaffold';
import { useAuthLinkStore } from '@/features/auth/store/useAuthLinkStore';
import { es } from '@/i18n/es';

export default function ConfirmEmailScreen() {
  const linkError = useAuthLinkStore((state) => state.linkError);

  if (linkError) {
    return <AuthLinkErrorView flow={linkError.flow} reason={linkError.reason} />;
  }

  return (
    <AuthScaffold title={es.auth.confirmingEmail}>
      <LoadingState />
    </AuthScaffold>
  );
}
