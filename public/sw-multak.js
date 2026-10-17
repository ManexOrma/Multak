// Service worker de Multak: el de Angular (caché, push y clics en los avisos) y, encima,
// el puntito en el icono de la app cuando llega un aviso que aún no has visto (Badging
// API: iPhone con la app instalada y ordenador; en Android el punto lo pone el sistema
// mientras haya notificaciones). Al abrir la app se borra (NotificacionesService).
importScripts('./ngsw-worker.js');

self.addEventListener('push', (evento) => {
  evento.waitUntil(ponerPuntito());
});

async function ponerPuntito() {
  if (!('setAppBadge' in self.navigator)) return;
  // Deja que el service worker de Angular muestre la notificación y cuenta las que hay.
  await new Promise((resolver) => setTimeout(resolver, 300));
  const avisos = await self.registration.getNotifications();
  await self.navigator.setAppBadge(Math.max(avisos.length, 1)).catch(() => undefined);
}
