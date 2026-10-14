import {
  afterNextRender,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18n } from '../core/i18n/i18n.service';
import { Icono } from './icono';

/**
 * Cabecera de iOS: título grande en la página y barra de navegación translúcida
 * arriba. Al hacer scroll, el título grande se esconde bajo la barra y su versión
 * pequeña aparece en ella. Lo que se proyecta con [acciones] va a la derecha de la barra;
 * con [inicio], a la izquierda; con [junto-titulo], delante del título grande.
 */
@Component({
  selector: 'app-cabecera',
  imports: [RouterLink, Icono],
  template: `
    <div class="barra" [class.plegada]="plegada()">
      <div class="lado">
        <ng-content select="[inicio]" />
        @if (atras(); as destino) {
          <a class="atras" [class.solo-movil]="atrasSoloMovil()" [routerLink]="destino">
            <app-icono nombre="chevron-izquierda" [grosor]="2.5" />
            <span>{{ atrasTexto() ?? t('comun.atras') }}</span>
          </a>
        }
      </div>
      <span class="titulo-barra" [attr.aria-hidden]="!plegada()">{{ titulo() }}</span>
      <div class="lado lado--fin"><ng-content select="[acciones]" /></div>
    </div>
    <div class="cuerpo">
      <div class="titulo-fila">
        <ng-content select="[junto-titulo]" />
        <h1 #grande class="titulo-grande">{{ titulo() }}</h1>
      </div>
      <ng-content />
    </div>
  `,
  styles: `
    // El host no crea caja: así la barra se queda pegada arriba en toda la página
    // (sticky dentro de la página, no solo mientras se ve la cabecera).
    :host {
      display: contents;
    }

    .cuerpo {
      margin-bottom: 20px;
    }

    .barra {
      position: sticky;
      top: 0;
      z-index: 20;
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      gap: 8px;
      height: calc(44px + var(--seguro-arriba));
      margin: 0 -16px;
      padding: var(--seguro-arriba) 16px 0;
      transition:
        background-color 200ms var(--ease-out),
        box-shadow 200ms var(--ease-out);
    }

    .barra.plegada {
      background: var(--barra);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      backdrop-filter: blur(20px) saturate(180%);
      box-shadow: 0 0.5px 0 var(--separador);
    }

    .lado {
      display: flex;
      align-items: center;
      gap: 4px;
      min-width: 0;
    }

    .lado--fin {
      justify-content: flex-end;
    }

    .atras {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      min-height: 44px;
      margin-left: -8px;
      padding-right: 8px;
      color: var(--tinte);
      white-space: nowrap;

      app-icono {
        width: 26px;
        height: 26px;
      }

      span {
        overflow: hidden;
        text-overflow: ellipsis;
      }

      &:active {
        opacity: 0.5;
      }
    }

    @media (min-width: 768px) {
      .solo-movil {
        display: none;
      }
    }

    .titulo-barra {
      max-width: 50vw;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 17px;
      font-weight: 600;
      opacity: 0;
      transform: translateY(4px);
      transition:
        opacity 200ms var(--ease-out),
        transform 200ms var(--ease-out);
    }

    .plegada .titulo-barra {
      opacity: 1;
      transform: none;
    }

    .titulo-fila {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 4px;
    }

    h1 {
      min-width: 0;
      overflow-wrap: anywhere;
    }
  `,
})
export class Cabecera {
  readonly titulo = input.required<string>();
  /** Destino del botón «atrás» (routerLink) y su texto, como en iOS. */
  readonly atras = input<string | unknown[] | null>(null);
  readonly atrasTexto = input<string | null>(null);
  protected readonly t = inject(I18n).t;
  /** Oculta «atrás» en pantallas anchas, donde ya lo da la barra lateral. */
  readonly atrasSoloMovil = input(false);

  protected readonly plegada = signal(false);
  private readonly grande = viewChild.required<ElementRef<HTMLElement>>('grande');

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const observador = new IntersectionObserver(
        ([entrada]) => this.plegada.set(!entrada.isIntersecting),
        { rootMargin: '-60px 0px 0px 0px' },
      );
      observador.observe(this.grande().nativeElement);
      destroyRef.onDestroy(() => observador.disconnect());
    });
  }
}
