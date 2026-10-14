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
 * con [inicio], a la izquierda; con [junto-titulo], delante del título grande. Con
 * `portada`, el título grande va sobre la foto del club (o sus colores) a todo lo ancho.
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
      @if (portada()) {
        <!-- Portada: la foto del club a todo lo ancho (o sus colores) con el nombre encima. -->
        <div class="portada" [class.con-foto]="!!fotoPortada()">
          @if (fotoPortada(); as url) {
            <img class="portada-foto" [src]="url" alt="" decoding="async" />
          } @else {
            <span class="portada-rayas" aria-hidden="true"></span>
          }
          <span class="portada-velo" aria-hidden="true"></span>
          <h1 #grande class="titulo-grande portada-titulo">{{ titulo() }}</h1>
        </div>
      } @else {
        <div class="titulo-fila">
          <ng-content select="[junto-titulo]" />
          <h1 #grande class="titulo-grande">{{ titulo() }}</h1>
        </div>
      }
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

    // --- Portada ------------------------------------------------------------------
    // A todo lo ancho y por debajo de la barra (que flota encima, transparente hasta
    // que se pliega). Abajo, el nombre del equipo en grande.

    .portada {
      position: relative;
      isolation: isolate;
      display: flex;
      align-items: flex-end;
      min-height: calc(clamp(220px, 62vw, 340px) + var(--seguro-arriba));
      margin: calc(-44px - var(--seguro-arriba)) -16px 0;
      padding: 0 20px 22px;
      overflow: hidden;
      border-radius: 0 0 32px 32px;
      color: var(--sobre-klub);
      background: linear-gradient(150deg, var(--klub), var(--klub-sakon));
      box-shadow: 0 14px 34px color-mix(in srgb, var(--klub) 24%, transparent);
      animation: portada-entra 700ms var(--ease-out) both;
    }

    .con-foto {
      color: #fff;
      background: #1e1612;
    }

    .portada-foto {
      position: absolute;
      inset: 0;
      z-index: -2;
      width: 100%;
      height: 100%;
      object-fit: cover;
      animation: foto-respira 900ms var(--ease-out) both;
    }

    // Al hacer scroll, la foto se queda un poco atrás (paralaje), como en Apple Music.
    @supports (animation-timeline: scroll()) {
      .portada-foto {
        animation:
          foto-respira 900ms var(--ease-out) both,
          paralaje linear both;
        animation-timeline: auto, scroll();
        animation-range:
          normal,
          0 340px;
      }
    }

    // Sin foto: rayas anchas de camiseta en los dos colores, a la derecha.
    .portada-rayas {
      position: absolute;
      inset: 0 0 0 45%;
      z-index: -2;
      background: repeating-linear-gradient(90deg, var(--klub-2) 0 34px, transparent 34px 68px);
      // Se desvanecen hacia la izquierda y hacia abajo, donde va el nombre.
      mask-image:
        linear-gradient(90deg, transparent, #000 45%),
        linear-gradient(180deg, #000 30%, transparent 78%);
      mask-composite: intersect;
      opacity: 0.9;
    }

    // Velo oscuro abajo para que el nombre se lea sobre cualquier foto.
    .con-foto .portada-velo {
      position: absolute;
      inset: 0;
      z-index: -1;
      background: linear-gradient(
        180deg,
        rgb(0 0 0 / 0.35) 0%,
        transparent 30%,
        transparent 45%,
        rgb(0 0 0 / 0.68) 100%
      );
    }

    .portada-titulo {
      font-size: 38px;
      line-height: 42px;

      .con-foto & {
        text-shadow: 0 2px 12px rgb(0 0 0 / 0.35);
      }
    }

    @keyframes portada-entra {
      from {
        opacity: 0;
      }
    }

    @keyframes foto-respira {
      from {
        transform: scale(1.08);
      }
    }

    @keyframes paralaje {
      to {
        transform: translateY(28%) scale(1.06);
      }
    }

    // Tablet y PC: portada como tarjeta, sin meterse bajo la barra.
    @media (min-width: 768px) {
      .portada {
        min-height: 260px;
        margin: 8px 0 0;
        border-radius: 32px;
      }
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
  /** Portada a todo lo ancho (Inicio del equipo), con la foto del club si la hay. */
  readonly portada = input(false);
  readonly fotoPortada = input<string | null>(null);

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
