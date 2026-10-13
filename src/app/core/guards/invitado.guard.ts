import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { rutaInterna } from '../auth/ruta-interna';

/** /login solo sin sesión: con sesión (también al volver de Google) va a `volver`. */
export const invitadoGuard: CanActivateFn = async (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.esperarSesion();
  return auth.haySesion() ? router.parseUrl(rutaInterna(route.queryParamMap.get('volver'))) : true;
};
