import { Routes } from '@angular/router';
import { RUTA_INICIO } from './core/auth/ruta-interna';
import { authGuard } from './core/guards/auth.guard';
import { invitadoGuard } from './core/guards/invitado.guard';
import { equipoGuard } from './features/equipos/equipo.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: RUTA_INICIO },
  {
    path: 'login',
    title: 'Entrar · Multak',
    canActivate: [invitadoGuard],
    loadComponent: () => import('./features/login/login').then((m) => m.Login),
  },
  {
    path: 'privacidad',
    title: 'Privacidad · Multak',
    loadComponent: () => import('./features/privacidad/privacidad').then((m) => m.Privacidad),
  },
  {
    path: 'equipos',
    title: 'Mis equipos · Multak',
    canActivate: [authGuard],
    loadComponent: () => import('./features/equipos/equipos').then((m) => m.Equipos),
  },
  {
    // Llega por WhatsApp. Sin sesión, el guard manda a /login?volver=/unirse/CODIGO.
    path: 'unirse/:codigo',
    title: 'Unirme a un equipo · Multak',
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
        title: 'Equipo · Multak',
        loadComponent: () => import('./features/equipo/inicio-equipo').then((m) => m.InicioEquipo),
      },
      {
        path: 'multas',
        title: 'Multas · Multak',
        loadComponent: () =>
          import('./features/equipo/historial-multas').then((m) => m.HistorialMultas),
      },
      {
        path: 'jugador/:miembroId',
        title: 'Jugador · Multak',
        loadComponent: () => import('./features/equipo/jugador').then((m) => m.Jugador),
      },
      {
        path: 'gastos',
        title: 'Gastos · Multak',
        loadComponent: () => import('./features/equipo/gastos').then((m) => m.Gastos),
      },
      {
        path: 'ajustes',
        title: 'Ajustes · Multak',
        canActivate: [equipoGuard(['admin', 'tesorero'])],
        loadComponent: () => import('./features/ajustes/ajustes').then((m) => m.Ajustes),
      },
    ],
  },
  { path: '**', redirectTo: RUTA_INICIO },
];
