import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

/** Provisional hasta la fase 3 (lista de equipos, crear y unirse). */
@Component({
  selector: 'app-equipos',
  template: `
    <main class="equipos">
      <h1>Mis equipos</h1>
      <p>
        Has entrado como <strong>{{ auth.usuario()?.email }}</strong
        >.
      </p>
      <p>Aquí verás tus equipos, podrás crear uno o unirte con un código.</p>
      <button type="button" class="boton-enlace" (click)="cerrarSesion()">Cerrar sesión</button>
    </main>
  `,
  styles: `
    .equipos {
      max-width: 40rem;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    .boton-enlace {
      min-height: 2.75rem;
      padding: 0;
      font: inherit;
      text-decoration: underline;
      border: 0;
      background: none;
      color: inherit;
      cursor: pointer;
    }
  `,
})
export class Equipos {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected async cerrarSesion(): Promise<void> {
    await this.auth.cerrarSesion();
    await this.router.navigateByUrl('/login');
  }
}
