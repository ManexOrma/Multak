import { DOCUMENT } from '@angular/common';
import { Component, DestroyRef, effect, inject, input, signal, untracked } from '@angular/core';
import { I18n } from '../core/i18n/i18n.service';

const DURACION_MS = 650;
const salidaSuave = (x: number) => 1 - Math.pow(1 - x, 4);

/**
 * Importe que cuenta hasta su nuevo valor cuando cambia (como los marcadores de
 * Fitness). Con movimiento reducido salta directamente. El lector de pantalla
 * solo recibe el valor final.
 */
@Component({
  selector: 'app-cifra',
  host: { class: 'cifra' },
  template: `<span aria-hidden="true">{{ texto() }}</span
    ><span class="solo-lector">{{ final() }}</span>`,
})
export class CifraAnimada {
  private readonly i18n = inject(I18n);
  private readonly vista = inject(DOCUMENT).defaultView;

  readonly centimos = input.required<number>();

  protected readonly texto = signal('');
  protected readonly final = signal('');
  private mostrado: number | null = null;
  private fotograma = 0;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.vista?.cancelAnimationFrame(this.fotograma));
    effect(() => {
      const destino = this.centimos();
      untracked(() => this.animarHasta(destino));
    });
  }

  private animarHasta(destino: number): void {
    this.final.set(this.i18n.euros(destino));
    const reducido = this.vista?.matchMedia('(prefers-reduced-motion: reduce)').matches ?? true;
    const desde = this.mostrado;
    if (desde === null || desde === destino || reducido || !this.vista) {
      this.mostrado = destino;
      this.texto.set(this.i18n.euros(destino));
      return;
    }
    this.vista.cancelAnimationFrame(this.fotograma);
    const inicio = this.vista.performance.now();
    const paso = (ahora: number) => {
      const progreso = Math.min(1, (ahora - inicio) / DURACION_MS);
      const valor = Math.round(desde + (destino - desde) * salidaSuave(progreso));
      this.mostrado = valor;
      this.texto.set(this.i18n.euros(valor));
      if (progreso < 1) this.fotograma = this.vista!.requestAnimationFrame(paso);
    };
    this.fotograma = this.vista.requestAnimationFrame(paso);
  }
}
