import { isAuthApiError, isAuthError } from '@supabase/supabase-js';
import { ClaveTexto } from '../i18n/es';

/** Lanza el error de una respuesta de Supabase o devuelve sus datos. */
export function exigir<T>(respuesta: { data: T; error: unknown }): NonNullable<T> {
  if (respuesta.error) throw respuesta.error;
  return respuesta.data as NonNullable<T>;
}

/** Mensajes que lanzan las RPCs y triggers de la BD (en castellano) → clave traducible. */
const MENSAJES_BD: Record<string, ClaveTexto> = {
  'Acepta antes la solicitud de esta persona.': 'error.db.aceptar-antes',
  'El equipo tiene que tener al menos un admin. Nombra a otro admin antes.':
    'error.db.ultimo-admin',
  'Es una solicitud: acéptala o recházala.': 'error.db.es-solicitud',
  'Esa ficha ya no está libre. Elige otra o entra como nuevo.': 'error.db.ficha-ocupada',
  'Esa solicitud ya no está pendiente.': 'error.db.solicitud-resuelta',
  'Escribe tu nombre para unirte.': 'error.db.falta-nombre',
  'Ese código de invitación no existe. Revisa el enlace o pide uno nuevo.':
    'error.db.codigo-inexistente',
  'Ese jugador no está activo en el equipo.': 'error.db.jugador-inactivo',
  'Ese miembro aún no ha sido aceptado en el equipo.': 'error.db.no-aceptado',
  'Ese tipo de multa no existe o está desactivado.': 'error.db.tipo-inexistente',
  'Esta ficha no tiene ninguna cuenta vinculada.': 'error.db.sin-cuenta',
  'Esta multa ya estaba anulada.': 'error.db.multa-anulada',
  'Este gasto ya estaba anulado.': 'error.db.gasto-anulado',
  'Este pago ya estaba anulado.': 'error.db.pago-anulado',
  'No puedes anular esta multa.': 'error.db.no-anular-multa',
  'No puedes anular este gasto.': 'error.db.no-anular-gasto',
  'No puedes anular este pago.': 'error.db.no-anular-pago',
  'Solo se puede dar un rol a alguien con cuenta. Pídele que se una con el enlace.':
    'error.db.rol-sin-cuenta',
  'Solo un admin del equipo puede gestionar sus miembros.': 'error.db.solo-admin-miembros',
  'Solo un admin puede cambiar el enlace de invitación.': 'error.db.solo-admin-enlace',
  'Tienes que iniciar sesión.': 'error.db.sin-sesion',
  'Tu ficha en este equipo está desactivada. Pide a un admin que la reactive.':
    'error.db.ficha-desactivada',
  'Tu solicitud ya está enviada. Falta que un admin la acepte.': 'error.db.solicitud-enviada',
  'Ya estás en este equipo.': 'error.db.ya-dentro',
};

/**
 * Clave del mensaje para el usuario según el error (Supabase Auth, PostgREST o red).
 * Las RPCs ya dicen qué pasó y cómo arreglarlo; los errores internos de Postgres
 * se sustituyen por uno genérico.
 */
export function claveError(error: unknown): ClaveTexto {
  if (isAuthApiError(error)) {
    switch (error.code) {
      case 'otp_expired':
        return 'error.auth.codigo';
      case 'over_email_send_rate_limit':
      case 'over_request_rate_limit':
        return 'error.auth.demasiados';
      case 'email_address_invalid':
        return 'error.auth.email';
      case 'signup_disabled':
        return 'error.auth.registro';
    }
    return 'error.auth.generico';
  }
  if (isAuthError(error)) return error.status === 0 ? 'error.conexion' : 'error.auth.generico';

  const { code, message } = (error ?? {}) as { code?: unknown; message?: unknown };
  const texto = typeof message === 'string' ? message : '';
  const deBd = MENSAJES_BD[texto];
  if (deBd && (code === 'P0001' || code === '42501')) return deBd;
  if (code === '42501') return 'error.permiso';
  if (code === '23514' || code === '22P02' || code === '23502') return 'error.datos';
  if (/failed to fetch|networkerror|load failed/i.test(texto)) return 'error.conexion';
  return 'error.generico';
}
