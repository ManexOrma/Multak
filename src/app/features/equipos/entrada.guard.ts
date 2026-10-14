import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { EquiposService } from './equipos.service';

/**
 * Al abrir la app («/»): con un solo equipo, o con el último abierto, se entra
 * directo en él; si no, a «Mis equipos». Desde el menú siempre se puede cambiar.
 */
export const entradaGuard: CanActivateFn = async () => {
  const router = inject(Router);
  try {
    const equipoId = await inject(EquiposService).equipoDeEntrada();
    return router.parseUrl(equipoId ? `/e/${equipoId}` : '/equipos');
  } catch {
    return router.parseUrl('/equipos');
  }
};
