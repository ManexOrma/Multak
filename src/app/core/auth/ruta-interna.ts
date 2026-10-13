/** Ruta a la que se va tras el login si no hay `volver` válido. */
export const RUTA_INICIO = '/equipos';

/**
 * Devuelve `volver` solo si es una ruta interna de la app (evita redirecciones
 * abiertas a otros dominios, como `//malo.com` o `https://malo.com`).
 */
export function rutaInterna(volver: string | null | undefined): string {
  if (!volver || !volver.startsWith('/') || volver.startsWith('//') || volver.startsWith('/\\')) {
    return RUTA_INICIO;
  }
  return volver;
}
