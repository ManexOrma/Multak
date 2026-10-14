/** Un toque corto de vibración en Android al confirmar algo importante (iOS no lo permite en la web). */
export function vibrar(patron: number | number[] = 12): void {
  try {
    globalThis.navigator?.vibrate?.(patron);
  } catch {
    // Sin vibración: no pasa nada.
  }
}
