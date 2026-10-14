import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { NOMBRE_ROL } from '../../core/models/modelos';
import { mensajeError } from '../../core/supabase/mensaje-error';
import { CrearEquipo } from './crear-equipo';
import { EquiposService } from './equipos.service';
import { UnirseCodigo } from './unirse-codigo';

@Component({
  selector: 'app-equipos',
  imports: [RouterLink, CrearEquipo, UnirseCodigo],
  template: `
    <main class="pagina">
      <header class="cabecera">
        <h1>Mis equipos</h1>
        <button type="button" class="boton-enlace" (click)="cerrarSesion()">Cerrar sesión</button>
      </header>
      <p class="texto-suave">{{ auth.usuario()?.email }}</p>

      @if (error()) {
        <p class="error" role="alert">{{ error() }}</p>
        <button type="button" class="boton boton-secundario" (click)="cargar()">Reintentar</button>
      } @else if (equipos.misEquipos(); as lista) {
        @if (lista.length === 0) {
          <p class="estado-vacio">
            Aún no estás en ningún equipo. Únete con el código que te hayan pasado o crea uno.
          </p>
        } @else {
          <ul class="lista">
            @for (equipo of lista; track equipo.miembro_id) {
              <li>
                @if (equipo.activo) {
                  <a class="fila" [routerLink]="['/e', equipo.equipo_id]">
                    <span>
                      <strong>{{ equipo.equipo_nombre }}</strong>
                      <br />
                      <span class="texto-suave">
                        {{ equipo.mi_nombre }} · {{ nombreRol[equipo.rol] }}
                      </span>
                    </span>
                    <span aria-hidden="true">›</span>
                  </a>
                } @else {
                  <div class="fila">
                    <span>
                      <strong>{{ equipo.equipo_nombre }}</strong>
                      <br />
                      <span class="texto-suave">{{ equipo.mi_nombre }}</span>
                    </span>
                    <span class="etiqueta">
                      {{ equipo.pendiente ? 'Pendiente de aprobación' : 'Desactivado' }}
                    </span>
                  </div>
                }
              </li>
            }
          </ul>
        }
      } @else {
        <p role="status">Cargando tus equipos…</p>
      }

      <section class="seccion" aria-labelledby="titulo-unirse">
        <h2 id="titulo-unirse">Unirme a un equipo</h2>
        <app-unirse-codigo />
      </section>

      <section class="seccion" aria-labelledby="titulo-crear">
        <h2 id="titulo-crear">Crear un equipo</h2>
        <app-crear-equipo />
      </section>
    </main>
  `,
  styles: `
    .cabecera {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;

      h1 {
        margin: 0;
      }
    }

    .texto-suave {
      margin-top: 0;
    }
  `,
})
export class Equipos {
  protected readonly auth = inject(AuthService);
  protected readonly equipos = inject(EquiposService);
  private readonly router = inject(Router);

  protected readonly nombreRol = NOMBRE_ROL;
  protected readonly error = signal<string | null>(null);

  constructor() {
    void this.cargar();
  }

  protected async cargar(): Promise<void> {
    this.error.set(null);
    try {
      await this.equipos.cargar();
    } catch (e) {
      this.error.set(mensajeError(e));
    }
  }

  protected async cerrarSesion(): Promise<void> {
    await this.auth.cerrarSesion();
    await this.router.navigateByUrl('/login');
  }
}
