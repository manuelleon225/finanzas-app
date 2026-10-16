import { useSnackbarStore } from '@/lib/snackbar';

import { Snackbar } from './Snackbar';

export function SnackbarHost() {
  const message = useSnackbarStore((state) => state.message);
  const action = useSnackbarStore((state) => state.action);
  const dismiss = useSnackbarStore((state) => state.dismiss);

  return (
    <Snackbar
      message={message}
      onDismiss={dismiss}
      actionLabel={action?.label}
      onAction={
        action
          ? () => {
              action.onPress();
              dismiss();
            }
          : undefined
      }
    />
  );
}
