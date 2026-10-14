import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { I18n } from '../../core/i18n/i18n.service';
import { MiEquipo } from '../../core/models/modelos';
import { FotosService } from '../../core/supabase/fotos.service';
import { Escudo } from '../../shared/escudo';
import { Cabecera } from '../../shared/cabecera';
import { Icono } from '../../shared/icono';
import { BotonMenu } from '../menu/boton-menu';
import { CrearEquipo } from './crear-equipo';
import { EquiposService } from './equipos.service';
import { UnirseCodigo } from './unirse-codigo';

@Component({
  selector: 'app-equipos',
  imports: [RouterLink, Cabecera, BotonMenu, Escudo, Icono, CrearEquipo, UnirseCodigo],
  template: `
    <main class="pagina">
      <app-cabecera [titulo]="t('equipos.titulo')">
        <app-boton-menu inicio />
      </app-cabecera>

      @if (error()) {
        <p class="error" role="alert">{{ error() }}</p>
        <button type="button" class="boton boton-secundario" (click)="cargar()">
          {{ t('comun.reintentar') }}
        </button>
      } @else if (equipos.misEquipos(); as lista) {
        @if (lista.length === 0) {
          <p class="estado-vacio">{{ t('equipos.vacio') }}</p>
        } @else {
          <ul class="lista lista--equipos">
            @for (equipo of lista; track equipo.miembro_id; let i = $index) {
              <li [style.--i]="i">
                @if (equipo.activo) {
                  <a class="fila" [routerLink]="['/e', equipo.equipo_id]">
                    <app-escudo
                      [color]="equipo.color"
                      [foto]="fotos.url(equipo.equipo_id, equipo.foto_version)"
                      [tamano]="44"
                    />
                    <span class="fila-texto">
                      <span class="titular">{{ equipo.equipo_nombre }}</span>
                      <span class="fila-detalle">{{ equipo.mi_nombre }} · {{ rol(equipo) }}</span>
                    </span>
                    <app-icono class="chevron" nombre="chevron-derecha" [grosor]="2.5" />
                  </a>
                } @else {
                  <div class="fila">
                    <app-escudo [color]="equipo.color" [tamano]="44" />
                    <span class="fila-texto">
                      <span class="titular texto-suave">{{ equipo.equipo_nombre }}</span>
                      <span class="fila-detalle">
                        {{ equipo.pendiente ? t('equipos.esperando') : t('equipos.desactivada') }}
                      </span>
                    </span>
                    <span class="etiqueta">
                      {{ equipo.pendiente ? t('equipos.pendiente') : t('equipos.desactivado') }}
                    </span>
                  </div>
                }
              </li>
            }
          </ul>
        }
      } @else {
        <p class="nota" role="status">{{ t('equipos.cargando') }}</p>
      }

      <section class="seccion" aria-labelledby="titulo-unirse">
        <h2 id="titulo-unirse">{{ t('equipos.unirme') }}</h2>
        <app-unirse-codigo />
      </section>

      <section class="seccion" aria-labelledby="titulo-crear">
        <h2 id="titulo-crear">{{ t('equipos.crear') }}</h2>
        <app-crear-equipo />
      </section>

      <footer class="cuenta">
        <p class="nota">{{ t('menu.como', { email: auth.usuario()?.email ?? '' }) }}</p>
        <button type="button" class="boton boton-peligro boton-ancho" (click)="cerrarSesion()">
          <app-icono nombre="salir" />
          {{ t('equipos.cerrar-sesion') }}
        </button>
        <a class="privacidad" routerLink="/privacidad">{{ t('menu.privacidad') }}</a>
      </footer>
    </main>
  `,
  styles: `
    .lista--equipos {
      --sangria-separador: 72px;

      li {
        animation: fila-entra 380ms var(--ease-out) both;
        animation-delay: calc(var(--i, 0) * 50ms);
      }
    }

    @keyframes fila-entra {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
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
  protected readonly fotos = inject(FotosService);
  private readonly i18n = inject(I18n);
  protected readonly t = this.i18n.t;
  private readonly router = inject(Router);

  protected readonly error = signal<string | null>(null);

  constructor() {
    void this.cargar();
  }

  protected rol(equipo: MiEquipo): string {
    return this.t(`rol.${equipo.rol}`);
  }

  protected async cargar(): Promise<void> {
    this.error.set(null);
    try {
      await this.equipos.cargar();
    } catch (e) {
      this.error.set(this.i18n.error(e));
    }
  }

  protected async cerrarSesion(): Promise<void> {
    await this.auth.cerrarSesion();
    await this.router.navigateByUrl('/login');
  }
}
