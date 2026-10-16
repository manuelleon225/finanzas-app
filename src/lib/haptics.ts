import * as Haptics from 'expo-haptics';

async function safeRun(run: () => Promise<void>): Promise<void> {
  try {
    await run();
  } catch {
    // Los haptics son opcionales: si el dispositivo no los soporta, no deben romper la UI.
  }
}

export function tap(): void {
  void safeRun(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

export function select(): void {
  void safeRun(() => Haptics.selectionAsync());
}

export function success(): void {
  void safeRun(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}

export function warning(): void {
  void safeRun(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
}

export function error(): void {
  void safeRun(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error));
}
