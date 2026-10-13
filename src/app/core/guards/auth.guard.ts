import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

/** Rutas privadas: sin sesión, manda a /login y recuerda a dónde volver. */
export const authGuard: CanActivateFn = async (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.esperarSesion();
  return auth.haySesion()
    ? true
    : router.createUrlTree(['/login'], { queryParams: { volver: state.url } });
};
