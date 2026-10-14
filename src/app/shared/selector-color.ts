import { Component, computed, inject, input, linkedSignal, model, signal } from '@angular/core';
import { I18n } from '../core/i18n/i18n.service';
import { ClaveColor, COMBINACIONES, ColoresKlub } from '../core/tema/klub';
import { Escudo } from './escudo';
import { Icono } from './icono';
import { PaletaColor } from './paleta-color';

const PERSONALIZADO = 'personalizado';

/**
 * Elegir los colores del club: combinaciones hechas (el color con rayas blancas) o
 * «Personalizado»: el color principal y el de las rayas, cada uno con un selector
 * completo (arrastrar en el cuadro, barra de tono y código hex).
 */
@Component({
  selector: 'app-selector-color',
  imports: [Icono, Escudo, PaletaColor],
  template: `
    <fieldset class="muestras" [attr.aria-describedby]="ayudaId()">
      <legend class="etiqueta-campo">{{ t('color.titulo') }}</legend>
      @for (combinacion of combinaciones; track combinacion.clave) {
        <label class="muestra">
          <input
            type="radio"
            [name]="nombre()"
            [checked]="modo() === combinacion.clave"
            [disabled]="desactivado()"
            (change)="elegirCombinacion(combinacion)"
          />
          <span
            class="rayas"
            aria-hidden="true"
            [style.--m1]="combinacion.color"
            [style.--m2]="combinacion.secundario"
          >
            @if (modo() === combinacion.clave) {
              <span class="marca"><app-icono nombre="check" [grosor]="3" /></span>
            }
          </span>
          <span class="nombre">{{ nombreColor(combinacion.clave) }}</span>
        </label>
      }
      <label class="muestra">
        <input
          type="radio"
          [name]="nombre()"
          [checked]="modo() === personalizado"
          [disabled]="desactivado()"
          (change)="modo.set(personalizado)"
        />
        <span class="rayas arcoiris" aria-hidden="true">
          @if (modo() === personalizado) {
            <span class="marca"><app-icono nombre="check" [grosor]="3" /></span>
          }
        </span>
        <span class="nombre">{{ t('color.personalizado') }}</span>
      </label>
    </fieldset>

    @if (modo() === personalizado) {
      <div class="personalizado">
        <div class="vista" aria-hidden="true">
          <app-escudo [color]="valor().color" [secundario]="valor().secundario" [tamano]="64" />
        </div>
        <!-- Qué color estás cambiando: el principal o el de las rayas. -->
        <fieldset class="segmentado">
          <legend>{{ t('color.editando') }}</legend>
          @for (parte of partes; track parte.campo) {
            <label>
              <input
                type="radio"
                [name]="nombre() + '-parte'"
                [checked]="editando() === parte.campo"
                (change)="editando.set(parte.campo)"
              />
              <span class="punto-mini" [style.background]="valor()[parte.campo]"></span>
              {{ t(parte.clave) }}
            </label>
          }
        </fieldset>
        <app-paleta-color
          [id]="nombre()"
          [valor]="valor()[editando()]"
          (valorChange)="elegir(editando(), $event)"
        />
      </div>
    }
  `,
  styles: `
    .muestras {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 10px 8px;
      margin: 0;
      padding: 0;
      border: 0;
    }

    @media (min-width: 420px) {
      .muestras {
        grid-template-columns: repeat(5, minmax(0, 1fr));
      }
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
      background: repeating-linear-gradient(90deg, var(--m1) 0 20%, var(--m2) 20% 40%);
      box-shadow:
        inset 0 0 0 2px var(--m1),
        0 4px 10px color-mix(in srgb, var(--m1) 28%, transparent);
      transition: transform 260ms var(--ease-muelle);
    }

    .arcoiris {
      background: conic-gradient(
        #c8102e,
        #f07c00,
        #ffcc00,
        #3cb371,
        #4aa3df,
        #5b2a86,
        #e4579b,
        #c8102e
      );
      box-shadow: 0 4px 10px rgb(0 0 0 / 0.15);
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
      background: var(--texto);
      color: var(--fondo);
      box-shadow: 0 0 0 2px var(--fondo);
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

    // --- Personalizado: dos paletas y la vista previa del escudo ---------------------

    .personalizado {
      display: grid;
      gap: 14px;
      margin-top: 12px;
      padding: 16px;
      border-radius: var(--radio-grupo);
      background: var(--celda);
      box-shadow: var(--sombra-celda);
      animation: abre 320ms var(--ease-out);
    }

    @keyframes abre {
      from {
        opacity: 0;
        transform: translateY(-6px);
      }
    }

    .vista {
      display: grid;
      place-items: center;

      app-escudo {
        transition:
          transform 300ms var(--ease-muelle),
          background 200ms var(--ease-out);
      }
    }

    .punto-mini {
      width: 14px;
      height: 14px;
      margin-right: 6px;
      border-radius: 50%;
      box-shadow: inset 0 0 0 1px rgb(0 0 0 / 0.2);
    }

    .segmentado label {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  `,
})
export class SelectorColor {
  protected readonly t = inject(I18n).t;
  protected readonly combinaciones = COMBINACIONES;
  /** Qué color se está cambiando en «Personalizado». */
  protected readonly editando = signal<keyof ColoresKlub>('color');
  protected readonly personalizado = PERSONALIZADO;
  protected readonly partes = [
    { campo: 'color', clave: 'color.principal' },
    { campo: 'secundario', clave: 'color.secundario' },
  ] as const;

  readonly valor = model.required<ColoresKlub>();
  /** name del grupo de radios (único por pantalla). */
  readonly nombre = input('color-club');
  readonly ayudaId = input<string | null>(null);
  readonly desactivado = input(false);

  /** Combinación elegida, o «personalizado» si los colores no son de ninguna. */
  private readonly combinacionActual = computed(() => {
    const { color, secundario } = this.valor();
    return (
      COMBINACIONES.find((c) => c.color === color && c.secundario === secundario)?.clave ??
      PERSONALIZADO
    );
  });
  protected readonly modo = linkedSignal<string>(() => this.combinacionActual());

  protected elegirCombinacion(combinacion: (typeof COMBINACIONES)[number]): void {
    this.valor.set({ color: combinacion.color, secundario: combinacion.secundario });
  }

  protected elegir(campo: keyof ColoresKlub, hex: string): void {
    this.valor.set({ ...this.valor(), [campo]: hex });
  }

  protected nombreColor(clave: ClaveColor): string {
    return this.t(`color.${clave}`);
  }
}
