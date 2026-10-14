import { NgOptimizedImage } from '@angular/common';
import { Component, input } from '@angular/core';

/**
 * Logotipo de Multak: el icono de la app y el nombre. Va a contraste: el icono negro en
 * el tema claro y el beige en el oscuro (lo decide styles.scss, que sabe el tema elegido).
 */
@Component({
  selector: 'app-marca',
  imports: [NgOptimizedImage],
  template: `
    <img
      class="icono-marca marca-claro"
      ngSrc="icons/marca-oscuro.png"
      alt=""
      [width]="tamano()"
      [height]="tamano()"
      [priority]="prioridad()"
    />
    <img
      class="icono-marca marca-oscuro"
      ngSrc="icons/marca-claro.png"
      alt=""
      [width]="tamano()"
      [height]="tamano()"
      [priority]="prioridad()"
    />
    @if (conNombre()) {
      <span class="nombre">Multak</span>
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: 12px;
    }

    .icono-marca {
      border-radius: 22%;
      box-shadow:
        0 6px 14px rgb(0 0 0 / 0.14),
        0 1px 2px rgb(0 0 0 / 0.1);
    }

    .nombre {
      font-size: 34px;
      line-height: 41px;
      font-weight: 800;
      letter-spacing: -0.03em;
    }
  `,
})
export class Marca {
  readonly conNombre = input(true);
  readonly tamano = input(44);
  /** En la pantalla de login es lo más grande: se carga con prioridad. */
  readonly prioridad = input(false);
}
