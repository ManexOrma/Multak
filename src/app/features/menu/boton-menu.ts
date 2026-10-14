import { Component, computed, inject, input } from '@angular/core';
import { I18n } from '../../core/i18n/i18n.service';
import { FotosService } from '../../core/supabase/fotos.service';
import { Escudo } from '../../shared/escudo';
import { Icono } from '../../shared/icono';
import { EquipoService } from '../equipo/equipo.service';
import { MenuService } from './menu.service';

/**
 * Botón del menú lateral (equipos, tema, idioma, sesión): las tres líneas en su propio
 * círculo a la izquierda y, al lado y suelto, el escudo del equipo. Todo es un solo
 * botón (objetivo táctil grande), pero se ven como dos piezas.
 */
@Component({
  selector: 'app-boton-menu',
  imports: [Escudo, Icono],
  template: `
    <button type="button" [attr.aria-label]="t('menu.abrir')" (click)="abrir()">
      <span class="lineas"><app-icono nombre="menu" [grosor]="2.4" /></span>
      @if (ficha(); as f) {
        <app-escudo
          [color]="f.color"
          [secundario]="f.color_secundario"
          [foto]="foto()"
          [tamano]="tamano()"
        />
      }
    </button>
  `,
  styles: `
    button {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 44px;
      min-height: 44px;
      margin-left: -4px;
      padding: 0;
      border: 0;
      background: none;
      color: var(--texto);
      cursor: pointer;
    }

    :host([junto-titulo]) button {
      margin: 0;
    }

    .lineas {
      display: grid;
      place-items: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--celda);
      box-shadow: var(--sombra-celda);
      transition: transform 160ms var(--ease-out);

      app-icono {
        width: 20px;
        height: 20px;
        transition: transform 260ms var(--ease-muelle);
      }
    }

    button:active .lineas {
      transform: scale(0.92);

      app-icono {
        transform: rotate(-90deg);
      }
    }

    button:active app-escudo {
      transform: rotate(-8deg) scale(0.96);
    }
  `,
})
export class BotonMenu {
  private readonly menu = inject(MenuService);
  private readonly fotos = inject(FotosService);
  private readonly equipo = inject(EquipoService, { optional: true });
  protected readonly t = inject(I18n).t;

  readonly tamano = input(34);

  /** Fuera de un equipo (p. ej. «Mis equipos») es solo el icono de menú. */
  protected readonly ficha = computed(() => this.equipo?.miFicha() ?? null);
  protected readonly foto = computed(() => {
    const ficha = this.equipo?.miFicha();
    return ficha ? this.fotos.url(ficha.equipo_id, ficha.foto_version) : null;
  });

  protected abrir(): void {
    this.menu.abrir(this.equipo?.miFicha()?.equipo_id ?? null);
  }
}
