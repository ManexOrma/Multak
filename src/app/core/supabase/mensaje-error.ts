/** Lanza el error de una respuesta de Supabase o devuelve sus datos. */
export function exigir<T>(respuesta: { data: T; error: unknown }): NonNullable<T> {
  if (respuesta.error) throw respuesta.error;
  return respuesta.data as NonNullable<T>;
}

/**
 * Traduce un error de Supabase (PostgREST) a un mensaje para el usuario.
 * Las RPCs y triggers ya lanzan mensajes en español que dicen qué pasó y cómo
 * arreglarlo; los errores internos de Postgres se sustituyen por uno genérico.
 */
export function mensajeError(error: unknown): string {
  const { code, message } = (error ?? {}) as { code?: unknown; message?: unknown };
  const texto = typeof message === 'string' ? message : '';

  if (code === 'P0001' && texto) return texto;
  if (code === '42501') {
    return texto && !/^(permission denied|new row violates)/i.test(texto)
      ? texto
      : 'No tienes permiso para hacer esto.';
  }
  if (code === '23514' || code === '22P02' || code === '23502') {
    return 'Algún dato no es válido. Revísalo y vuelve a intentarlo.';
  }
  if (/failed to fetch|networkerror|load failed/i.test(texto)) {
    return 'No hay conexión. Comprueba tu internet y vuelve a intentarlo.';
  }
  return 'Algo ha fallado. Vuelve a intentarlo en un momento.';
}
