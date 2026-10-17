// Envío de notificaciones push (Web Push con VAPID), compartido por las funciones.

import webpush from 'npm:web-push@3.6.7';

export type Idioma = 'eu' | 'es';

export interface Mensaje {
  titulo: string;
  cuerpo: string;
}

webpush.setVapidDetails(
  Deno.env.get('VAPID_SUBJECT') ?? 'mailto:multakapp@gmail.com',
  Deno.env.get('VAPID_PUBLIC_KEY')!,
  Deno.env.get('VAPID_PRIVATE_KEY')!,
);

// A mano: el runtime de las funciones no trae los datos de idioma de eu ni es.
export const euros = (centimos: number) => {
  const [enteros, decimales] = (centimos / 100).toFixed(2).split('.');
  return `${enteros.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${decimales} €`;
};

/** Uno al azar: los avisos con gracia no se repiten siempre igual. */
export const alAzar = <T>(opciones: readonly T[]): T =>
  opciones[Math.floor(Math.random() * opciones.length)];

/**
 * Envía un aviso a todos los dispositivos de esos usuarios, cada uno en su idioma.
 * Las suscripciones muertas (404/410) se borran. Devuelve cuántos se enviaron.
 */
export async function enviarAUsuarios(
  // deno-lint-ignore no-explicit-any
  admin: any,
  usuarios: string[],
  mensaje: (idioma: Idioma) => Mensaje,
  url: string,
  etiqueta: string,
): Promise<number> {
  if (usuarios.length === 0) return 0;
  const { data: suscripciones } = await admin
    .from('suscripciones_push')
    .select('id, endpoint, p256dh, auth, idioma')
    .in('usuario_id', usuarios);

  let enviados = 0;
  await Promise.all(
    (suscripciones ?? []).map(
      async (s: { id: string; endpoint: string; p256dh: string; auth: string; idioma: string }) => {
        const idioma: Idioma = s.idioma === 'es' ? 'es' : 'eu';
        const { titulo, cuerpo } = mensaje(idioma);
        // Formato que entiende el service worker de Angular (ngsw).
        const carga = {
          notification: {
            title: titulo,
            body: cuerpo,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-96x96.png',
            lang: idioma,
            tag: etiqueta,
            data: {
              onActionClick: { default: { operation: 'navigateLastFocusedOrOpen', url } },
            },
          },
        };
        try {
          await webpush.sendNotification(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
            JSON.stringify(carga),
            { TTL: 60 * 60 * 24 },
          );
          enviados++;
        } catch (e) {
          const estado = (e as { statusCode?: number }).statusCode;
          if (estado === 404 || estado === 410) {
            await admin.from('suscripciones_push').delete().eq('id', s.id);
          } else {
            console.error('push', estado, (e as Error).message);
          }
        }
      },
    ),
  );
  return enviados;
}
