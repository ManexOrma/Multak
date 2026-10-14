import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { NOMBRE_ROL } from '../../core/models/modelos';
import { mensajeError } from '../../core/supabase/mensaje-error';
import { Avatar } from '../../shared/avatar';
import { Cabecera } from '../../shared/cabecera';
import { Icono } from '../../shared/icono';
import { CrearEquipo } from './crear-equipo';
import { EquiposService } from './equipos.service';
import { UnirseCodigo } from './unirse-codigo';

@Component({
  selector: 'app-equipos',
  imports: [RouterLink, Cabecera, Avatar, Icono, CrearEquipo, UnirseCodigo],
  template: `
    <main class="pagina">
      <app-cabecera titulo="Mis equipos" />

      @if (error()) {
        <p class="error" role="alert">{{ error() }}</p>
        <button type="button" class="boton boton-secundario" (click)="cargar()">Reintentar</button>
      } @else if (equipos.misEquipos(); as lista) {
        @if (lista.length === 0) {
          <p class="estado-vacio">
            Aún no estás en ningún equipo. Únete con el código que te hayan pasado o crea el tuyo.
          </p>
        } @else {
          <ul class="lista lista--equipos">
            @for (equipo of lista; track equipo.miembro_id) {
              <li>
                @if (equipo.activo) {
                  <a class="fila" [routerLink]="['/e', equipo.equipo_id]">
                    <app-avatar
                      [nombre]="equipo.equipo_nombre"
                      [semilla]="equipo.equipo_id"
                      [tamano]="44"
                    />
                    <span class="fila-texto">
                      <span class="titular">{{ equipo.equipo_nombre }}</span>
                      <span class="fila-detalle"
                        >{{ equipo.mi_nombre }} · {{ nombreRol[equipo.rol] }}</span
                      >
                    </span>
                    <app-icono class="chevron" nombre="chevron-derecha" [grosor]="2.5" />
                  </a>
                } @else {
                  <div class="fila">
                    <app-avatar
                      [nombre]="equipo.equipo_nombre"
                      [semilla]="equipo.equipo_id"
                      [tamano]="44"
                    />
                    <span class="fila-texto">
                      <span class="titular texto-suave">{{ equipo.equipo_nombre }}</span>
                      <span class="fila-detalle">
                        {{
                          equipo.pendiente
                            ? 'Esperando a que un admin te acepte'
                            : 'Tu ficha está desactivada'
                        }}
                      </span>
                    </span>
                    <span class="etiqueta">{{
                      equipo.pendiente ? 'Pendiente' : 'Desactivado'
                    }}</span>
                  </div>
                }
              </li>
            }
          </ul>
        }
      } @else {
        <p class="nota" role="status">Cargando tus equipos…</p>
      }

      <section class="seccion" aria-labelledby="titulo-unirse">
        <h2 id="titulo-unirse">Unirme a un equipo</h2>
        <app-unirse-codigo />
      </section>

      <section class="seccion" aria-labelledby="titulo-crear">
        <h2 id="titulo-crear">Crear un equipo</h2>
        <app-crear-equipo />
      </section>

      <footer class="cuenta">
        <p class="nota">Has entrado como {{ auth.usuario()?.email }}</p>
        <button type="button" class="boton boton-peligro boton-ancho" (click)="cerrarSesion()">
          <app-icono nombre="salir" />
          Cerrar sesión
        </button>
        <a class="privacidad" routerLink="/privacidad">Privacidad</a>
      </footer>
    </main>
  `,
  styles: `
    .lista--equipos {
      --sangria-separador: 72px;
    }

    .cuenta {
      display: grid;
      gap: 10px;
      margin-top: 48px;
      text-align: center;
    }

    .privacidad {
      justify-self: center;
      padding: 8px;
      font-size: 13px;
      color: var(--texto-2);
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
