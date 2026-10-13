import { isAuthApiError, isAuthError } from '@supabase/supabase-js';

/** Traduce los errores de Supabase Auth a un mensaje que dice qué pasó y cómo arreglarlo. */
export function mensajeErrorAuth(error: unknown): string {
  if (isAuthApiError(error)) {
    switch (error.code) {
      case 'otp_expired':
        return 'El código no es correcto o ha caducado. Revísalo o pide uno nuevo.';
      case 'over_email_send_rate_limit':
      case 'over_request_rate_limit':
        return 'Has pedido demasiados códigos seguidos. Espera unos minutos y vuelve a intentarlo.';
      case 'email_address_invalid':
        return 'Ese email no parece válido. Revísalo.';
      case 'signup_disabled':
        return 'Ahora mismo no se pueden crear cuentas nuevas. Inténtalo más tarde.';
    }
  }
  if (isAuthError(error) && error.status === 0) {
    return 'No hay conexión. Comprueba tu internet y vuelve a intentarlo.';
  }
  return 'Algo ha fallado al entrar. Vuelve a intentarlo en un momento.';
}
