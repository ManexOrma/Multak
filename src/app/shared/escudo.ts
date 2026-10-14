import { Component, computed, input } from '@angular/core';
import { colorKlub } from '../core/tema/klub';

/**
 * Escudo del equipo: su foto o, si no tiene, las rayas de la camiseta en el color
 * del club. Decorativo (el nombre del equipo siempre va al lado).
 */
@Component({
  selector: 'app-escudo',
  host: {
    class: 'escudo',
    'aria-hidden': 'true',
    '[attr.data-klub]': 'klub()',
    '[class.con-foto]': '!!foto()',
    '[style.width.px]': 'tamano()',
    '[style.height.px]': 'tamano()',
    '[style.border-radius.px]': 'tamano() * 0.34',
  },
  template: `
    @if (foto(); as url) {
      <img [src]="url" alt="" [width]="tamano()" [height]="tamano()" decoding="async" />
    }
  `,
  styles: `
    :host {
      position: relative;
      flex-shrink: 0;
      display: block;
      overflow: hidden;
      background: repeating-linear-gradient(90deg, var(--klub) 0 20%, #fff 20% 40%);
      box-shadow:
        inset 0 0 0 2px var(--klub),
        0 6px 14px color-mix(in srgb, var(--klub) 30%, transparent);
      transition: transform 260ms var(--ease-muelle);
    }

    // Brillo de tela arriba a la izquierda.
    :host::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: linear-gradient(150deg, rgb(255 255 255 / 0.28), transparent 55%);
      pointer-events: none;
    }

    :host(.con-foto) {
      background: var(--klub);
    }

    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      animation: foto-aparece 300ms var(--ease-out);
    }

    @keyframes foto-aparece {
      from {
        opacity: 0;
      }
    }
  `,
})
export class Escudo {
  readonly color = input<string | null | undefined>();
  readonly foto = input<string | null | undefined>();
  readonly tamano = input(40);

  protected readonly klub = computed(() => colorKlub(this.color()));
}
