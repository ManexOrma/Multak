import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { invitadoGuard } from './core/guards/invitado.guard';
import { entradaGuard } from './features/equipos/entrada.guard';
import { equipoGuard } from './features/equipos/equipo.guard';

// Los títulos son claves de traducción (los traduce TituloTraducido).
export const routes: Routes = [
  // Al abrir la app: directo al equipo (si solo hay uno o al último abierto) o a «Mis equipos».
  { path: '', pathMatch: 'full', canActivate: [authGuard, entradaGuard], children: [] },
  {
    path: 'login',
    title: 'titulo.login',
    canActivate: [invitadoGuard],
    loadComponent: () => import('./features/login/login').then((m) => m.Login),
  },
  {
    path: 'privacidad',
    title: 'titulo.privacidad',
    loadComponent: () => import('./features/privacidad/privacidad').then((m) => m.Privacidad),
  },
  {
    path: 'equipos',
    title: 'titulo.equipos',
    canActivate: [authGuard],
    loadComponent: () => import('./features/equipos/equipos').then((m) => m.Equipos),
  },
  {
    // Llega por WhatsApp. Sin sesión, el guard manda a /login?volver=/unirse/CODIGO.
    path: 'unirse/:codigo',
    title: 'titulo.unirse',
    canActivate: [authGuard],
    loadComponent: () => import('./features/unirse/unirse').then((m) => m.Unirse),
  },
  {
    path: 'e/:equipoId',
    canActivate: [authGuard, equipoGuard()],
    loadComponent: () => import('./features/equipo/equipo-shell').then((m) => m.EquipoShell),
    children: [
      {
        path: '',
        title: 'titulo.equipo',
        loadComponent: () => import('./features/equipo/inicio-equipo').then((m) => m.InicioEquipo),
      },
      {
        path: 'multas',
        title: 'titulo.multas',
        loadComponent: () =>
          import('./features/equipo/calendario-multas').then((m) => m.CalendarioMultas),
      },
      {
        path: 'jugador/:miembroId',
        title: 'titulo.jugador',
        loadComponent: () => import('./features/equipo/jugador').then((m) => m.Jugador),
      },
      {
        path: 'gastos',
        title: 'titulo.gastos',
        loadComponent: () => import('./features/equipo/gastos').then((m) => m.Gastos),
      },
      {
        path: 'ajustes',
        title: 'titulo.ajustes',
        canActivate: [equipoGuard(['admin', 'tesorero'])],
        loadComponent: () => import('./features/ajustes/ajustes').then((m) => m.Ajustes),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
