import { Component, inject, input, model } from '@angular/core';
import { I18n } from '../core/i18n/i18n.service';
import { COLORES_KLUB, ColorKlub } from '../core/tema/klub';
import { Icono } from './icono';

/** Elegir el color del club: muestras con las rayas de la camiseta. */
@Component({
  selector: 'app-selector-color',
  imports: [Icono],
  template: `
    <fieldset class="muestras" [attr.aria-describedby]="ayudaId()">
      <legend class="etiqueta-campo">{{ t('color.titulo') }}</legend>
      @for (color of colores; track color) {
        <label class="muestra" [attr.data-klub]="color">
          <input
            type="radio"
            [name]="nombre()"
            [value]="color"
            [checked]="valor() === color"
            [disabled]="desactivado()"
            (change)="valor.set(color)"
          />
          <span class="rayas" aria-hidden="true">
            @if (valor() === color) {
              <span class="marca"><app-icono nombre="check" [grosor]="3" /></span>
            }
          </span>
          <span class="nombre">{{ nombreColor(color) }}</span>
        </label>
      }
    </fieldset>
  `,
  styles: `
    .muestras {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 10px 8px;
      margin: 0;
      padding: 0;
      border: 0;
    }

    legend {
      grid-column: 1 / -1;
      margin-bottom: 8px;
      padding: 0;
    }

    .muestra {
      display: grid;
      justify-items: center;
      gap: 6px;
      margin: 0;
      padding: 8px 2px;
      border-radius: var(--radio);
      color: var(--texto);
      cursor: pointer;
      transition: background-color 140ms var(--ease-out);

      &:has(input:checked) {
        background: var(--celda);
        box-shadow: var(--sombra-celda);
      }

      &:has(input:focus-visible) {
        outline: 3px solid var(--klub-tinta);
        outline-offset: 1px;
      }

      &:active .rayas {
        transform: scale(0.9);
      }
    }

    input {
      position: absolute;
      opacity: 0;
      pointer-events: none;
    }

    .rayas {
      position: relative;
      display: grid;
      place-items: center;
      width: 44px;
      height: 44px;
      border-radius: 15px;
      background: repeating-linear-gradient(90deg, var(--klub) 0 20%, #fff 20% 40%);
      box-shadow:
        inset 0 0 0 2px var(--klub),
        0 4px 10px color-mix(in srgb, var(--klub) 28%, transparent);
      transition: transform 260ms var(--ease-muelle);
    }

    .muestra:has(input:checked) .rayas {
      transform: scale(1.08) rotate(-4deg);
    }

    .marca {
      display: grid;
      place-items: center;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--klub);
      color: #fff;
      box-shadow: 0 0 0 2px #fff;
      animation: marca-entra 320ms var(--ease-muelle);

      app-icono {
        width: 14px;
        height: 14px;
      }
    }

    @keyframes marca-entra {
      from {
        transform: scale(0.3);
        opacity: 0;
      }
    }

    .nombre {
      font-size: 12px;
      font-weight: 600;
      text-align: center;
    }
  `,
})
export class SelectorColor {
  protected readonly t = inject(I18n).t;
  protected readonly colores = COLORES_KLUB;

  readonly valor = model.required<ColorKlub>();
  /** name del grupo de radios (único por pantalla). */
  readonly nombre = input('color-club');
  readonly ayudaId = input<string | null>(null);
  readonly desactivado = input(false);

  protected nombreColor(color: ColorKlub): string {
    return this.t(`color.${color}`);
  }
}
