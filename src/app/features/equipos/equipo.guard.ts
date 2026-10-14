import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Rol } from '../../core/models/modelos';
import { EquiposService } from './equipos.service';

/**
 * Rutas de un equipo (/e/:equipoId/...): solo para miembros activos y, si se
 * indican, con alguno de esos roles. Es comodidad de navegación: la seguridad
 * real la ponen las RLS.
 */
export function equipoGuard(roles?: Rol[]): CanActivateFn {
  return async (route) => {
    const router = inject(Router);
    const equipoId = route.paramMap.get('equipoId') ?? route.parent?.paramMap.get('equipoId');
    if (!equipoId) return router.parseUrl('/equipos');

    try {
      const ficha = await inject(EquiposService).miFichaActiva(equipoId);
      if (!ficha) return router.parseUrl('/equipos');
      if (roles && !roles.includes(ficha.rol)) return router.createUrlTree(['/e', equipoId]);
      return true;
    } catch {
      return router.parseUrl('/equipos');
    }
  };
}
