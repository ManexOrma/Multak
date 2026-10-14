import { Component, input } from '@angular/core';

/** Logotipo de Multak: la tarjeta amarilla y el nombre. */
@Component({
  selector: 'app-marca',
  template: `
    <span class="tarjeta" aria-hidden="true"></span>
    @if (conNombre()) {
      <span class="nombre">Multak</span>
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: 14px;
    }

    .tarjeta {
      width: 30px;
      height: 40px;
      border-radius: 6px;
      background: var(--amarillo);
      box-shadow:
        0 6px 14px rgb(0 0 0 / 0.16),
        0 1px 2px rgb(0 0 0 / 0.1);
      rotate: -9deg;
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
}
