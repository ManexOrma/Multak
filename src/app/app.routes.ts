import { Routes } from '@angular/router';
import { RUTA_INICIO } from './core/auth/ruta-interna';
import { authGuard } from './core/guards/auth.guard';
import { invitadoGuard } from './core/guards/invitado.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: RUTA_INICIO },
  {
    path: 'login',
    title: 'Entrar · Multas',
    canActivate: [invitadoGuard],
    loadComponent: () => import('./features/login/login').then((m) => m.Login),
  },
  {
    path: 'equipos',
    title: 'Mis equipos · Multas',
    canActivate: [authGuard],
    loadComponent: () => import('./features/equipos/equipos').then((m) => m.Equipos),
  },
  { path: '**', redirectTo: RUTA_INICIO },
];
