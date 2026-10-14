import {
  Component,
  ElementRef,
  inject,
  input,
  linkedSignal,
  model,
  viewChild,
} from '@angular/core';
import { I18n } from '../core/i18n/i18n.service';

interface Hsv {
  h: number; // 0–360
  s: number; // 0–1
  v: number; // 0–1
}

function hexAHsv(hex: string): Hsv {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
  }
  return { h: (h * 60 + 360) % 360, s: max ? d / max : 0, v: max };
}

function hsvAHex({ h, s, v }: Hsv): string {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
  };
  return (
    '#' +
    [f(5), f(3), f(1)]
      .map((c) =>
        Math.round(c * 255)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
  );
}

const HEX = /^#?([0-9a-f]{6})$/i;

/**
 * Selector de color completo: un cuadro para arrastrar (saturación y brillo), una
 * barra de tono y el código hex para afinar. Con teclado: flechas en el cuadro.
 */
@Component({
  selector: 'app-paleta-color',
  template: `
    <div
      #cuadro
      class="cuadro"
      role="slider"
      tabindex="0"
      [attr.aria-label]="t('color.cuadro')"
      aria-valuemin="0"
      aria-valuemax="100"
      [attr.aria-valuenow]="porcentaje(hsv().s)"
      [attr.aria-valuetext]="valor()"
      [style.--tono]="'hsl(' + hsv().h + ' 100% 50%)'"
      (pointerdown)="empezar($event)"
      (pointermove)="arrastrar($event)"
      (pointerup)="soltar($event)"
      (pointercancel)="soltar($event)"
      (keydown)="teclado($event)"
    >
      <span
        class="tirador"
        [style.left.%]="hsv().s * 100"
        [style.top.%]="(1 - hsv().v) * 100"
        [style.background]="valor()"
      ></span>
    </div>

    <input
      class="tono"
      type="range"
      min="0"
      max="359"
      [attr.aria-label]="t('color.tono')"
      [value]="hsv().h"
      (input)="cambiarTono($event)"
    />

    <div class="hex">
      <span class="muestra" [style.background]="valor()" aria-hidden="true"></span>
      <label [for]="id() + '-hex'">{{ t('color.codigo') }}</label>
      <input
        [id]="id() + '-hex'"
        class="cifra"
        autocomplete="off"
        spellcheck="false"
        maxlength="7"
        [value]="valor()"
        (change)="escribirHex($event)"
        (keydown.enter)="escribirHex($event)"
      />
    </div>
  `,
  styles: `
    :host {
      display: grid;
      gap: 14px;
    }

    .cuadro {
      position: relative;
      height: 180px;
      border-radius: 16px;
      // Blanco → tono (horizontal) y transparente → negro (vertical).
      background:
        linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, var(--tono));
      box-shadow: inset 0 0 0 1px rgb(0 0 0 / 0.08);
      touch-action: none;
      cursor: crosshair;
      outline: none;

      &:focus-visible {
        box-shadow:
          inset 0 0 0 1px rgb(0 0 0 / 0.08),
          0 0 0 3px var(--klub-tinta);
      }
    }

    .tirador {
      position: absolute;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 3px solid #fff;
      box-shadow:
        0 0 0 1px rgb(0 0 0 / 0.25),
        0 3px 10px rgb(0 0 0 / 0.3);
      translate: -50% -50%;
      pointer-events: none;
      transition: scale 160ms var(--ease-muelle);

      .arrastrando & {
        scale: 1.2;
      }
    }

    .tono {
      appearance: none;
      width: 100%;
      height: 28px;
      min-height: 0;
      margin: 0;
      padding: 0;
      border-radius: 14px;
      background: linear-gradient(
        to right,
        #f00 0%,
        #ff0 17%,
        #0f0 33%,
        #0ff 50%,
        #00f 67%,
        #f0f 83%,
        #f00 100%
      );
      box-shadow: inset 0 0 0 1px rgb(0 0 0 / 0.08);
      cursor: pointer;

      &::-webkit-slider-thumb {
        appearance: none;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 3px solid #fff;
        background: transparent;
        box-shadow:
          0 0 0 1px rgb(0 0 0 / 0.25),
          0 3px 10px rgb(0 0 0 / 0.3);
      }

      &::-moz-range-thumb {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        border: 3px solid #fff;
        background: transparent;
        box-shadow: 0 0 0 1px rgb(0 0 0 / 0.25);
      }

      &:focus-visible {
        box-shadow: 0 0 0 3px var(--klub-tinta);
      }
    }

    .hex {
      display: grid;
      grid-template-columns: auto auto 1fr;
      align-items: center;
      gap: 10px;

      label {
        margin: 0;
      }

      input {
        min-height: 44px;
        text-transform: lowercase;
      }
    }

    .muestra {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      box-shadow: inset 0 0 0 1px rgb(0 0 0 / 0.15);
    }
  `,
})
export class PaletaColor {
  protected readonly t = inject(I18n).t;
  private readonly cuadro = viewChild.required<ElementRef<HTMLElement>>('cuadro');

  readonly valor = model.required<string>();
  /** Prefijo de ids (único por pantalla). */
  readonly id = input('paleta');

  /**
   * HSV en pantalla. Se guarda aparte del hex para no perder el tono al llegar al
   * gris o al negro mientras arrastras.
   */
  protected readonly hsv = linkedSignal<string, Hsv>({
    source: this.valor,
    computation: (hex, anterior) => {
      if (anterior && hsvAHex(anterior.value) === hex) return anterior.value;
      return hexAHsv(hex);
    },
  });
  protected readonly porcentaje = (x: number) => Math.round(x * 100);

  private arrastrando = false;

  protected empezar(evento: PointerEvent): void {
    this.arrastrando = true;
    this.cuadro().nativeElement.classList.add('arrastrando');
    this.cuadro().nativeElement.setPointerCapture(evento.pointerId);
    this.moverA(evento);
  }

  protected arrastrar(evento: PointerEvent): void {
    if (this.arrastrando) this.moverA(evento);
  }

  protected soltar(evento: PointerEvent): void {
    this.arrastrando = false;
    this.cuadro().nativeElement.classList.remove('arrastrando');
    this.cuadro().nativeElement.releasePointerCapture?.(evento.pointerId);
  }

  protected teclado(evento: KeyboardEvent): void {
    const paso = evento.shiftKey ? 0.1 : 0.02;
    const { h, s, v } = this.hsv();
    const cambios: Record<string, Hsv> = {
      ArrowLeft: { h, s: s - paso, v },
      ArrowRight: { h, s: s + paso, v },
      ArrowUp: { h, s, v: v + paso },
      ArrowDown: { h, s, v: v - paso },
    };
    const nuevo = cambios[evento.key];
    if (!nuevo) return;
    evento.preventDefault();
    this.poner({ h, s: limitar(nuevo.s), v: limitar(nuevo.v) });
  }

  protected cambiarTono(evento: Event): void {
    const h = Number((evento.target as HTMLInputElement).value);
    this.poner({ ...this.hsv(), h });
  }

  protected escribirHex(evento: Event): void {
    const entrada = evento.target as HTMLInputElement;
    const m = HEX.exec(entrada.value.trim());
    if (m) this.valor.set('#' + m[1].toLowerCase());
    else entrada.value = this.valor();
  }

  private moverA(evento: PointerEvent): void {
    const { left, top, width, height } = this.cuadro().nativeElement.getBoundingClientRect();
    this.poner({
      h: this.hsv().h,
      s: limitar((evento.clientX - left) / width),
      v: limitar(1 - (evento.clientY - top) / height),
    });
  }

  private poner(hsv: Hsv): void {
    this.hsv.set(hsv);
    this.valor.set(hsvAHex(hsv));
  }
}

const limitar = (x: number) => Math.min(1, Math.max(0, x));
