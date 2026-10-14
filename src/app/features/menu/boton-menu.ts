import { Component, computed, inject, input } from '@angular/core';
import { I18n } from '../../core/i18n/i18n.service';
import { FotosService } from '../../core/supabase/fotos.service';
import { Escudo } from '../../shared/escudo';
import { Icono } from '../../shared/icono';
import { EquipoService } from '../equipo/equipo.service';
import { MenuService } from './menu.service';

/**
 * Botón discreto arriba a la izquierda: la foto (o iniciales) del equipo con un
 * pequeño distintivo de menú. Abre el menú lateral (equipos, tema, idioma, sesión).
 */
@Component({
  selector: 'app-boton-menu',
  imports: [Escudo, Icono],
  template: `
    <button type="button" [attr.aria-label]="t('menu.abrir')" (click)="abrir()">
      @if (ficha(); as f) {
        <app-escudo [color]="f.color" [foto]="foto()" [tamano]="tamano()" />
        <span class="distintivo" aria-hidden="true"><app-icono nombre="menu" [grosor]="3" /></span>
      } @else {
        <span class="solo-icono"><app-icono nombre="menu" [grosor]="2.4" /></span>
      }
    </button>
  `,
  styles: `
    button {
      position: relative;
      display: grid;
      place-items: center;
      width: 44px;
      height: 44px;
      margin-left: -5px;
      padding: 0;
      border: 0;
      background: none;
      cursor: pointer;
      transition: transform 160ms var(--ease-out);

      &:active {
        transform: scale(0.9);
      }

      &:active app-escudo {
        transform: rotate(-8deg);
      }
    }

    :host([junto-titulo]) button {
      width: auto;
      height: auto;
      margin: 0 4px 0 0;
    }

    .solo-icono {
      display: grid;
      place-items: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--celda);
      color: var(--texto);
      box-shadow: var(--sombra-celda);

      app-icono {
        width: 20px;
        height: 20px;
      }
    }

    .distintivo {
      position: absolute;
      right: 1px;
      bottom: 3px;
      display: grid;
      place-items: center;
      width: 17px;
      height: 17px;
      border-radius: 50%;
      background: var(--celda);
      color: var(--texto);
      box-shadow: 0 1px 3px rgb(0 0 0 / 0.2);

      app-icono {
        width: 11px;
        height: 11px;
      }
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
