import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, inject, input } from '@angular/core';

/**
 * La tarjeta se inclina hacia el dedo (o el ratón) y un brillo la sigue, como una
 * tarjeta de Wallet en la mano. Escribe --inclina-x, --inclina-y, --brillo-x y
 * --brillo-y; el estilo de cada tarjeta decide cómo usarlas. Sin efecto con
 * movimiento reducido.
 */
@Directive({
  selector: '[appInclinar]',
  host: {
    class: 'inclinable',
    '(pointermove)': 'mover($event)',
    '(pointerdown)': 'mover($event)',
    '(pointerleave)': 'soltar()',
    '(pointercancel)': 'soltar()',
    '(pointerup)': 'soltar()',
  },
})
export class Inclinar {
  private readonly elemento = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly vista = inject(DOCUMENT).defaultView;

  /** Grados máximos de inclinación. */
  readonly appInclinar = input(8, { transform: (v: number | '') => (v === '' ? 8 : v) });

  private fotograma = 0;

  protected mover(evento: PointerEvent): void {
    if (!this.vista || this.vista.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const { left, top, width, height } = this.elemento.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (evento.clientX - left) / width));
    const y = Math.min(1, Math.max(0, (evento.clientY - top) / height));
    this.vista.cancelAnimationFrame(this.fotograma);
    this.fotograma = this.vista.requestAnimationFrame(() => {
      const grados = this.appInclinar();
      const estilo = this.elemento.style;
      this.elemento.classList.add('inclinada');
      estilo.setProperty('--inclina-x', `${((0.5 - y) * grados).toFixed(2)}deg`);
      estilo.setProperty('--inclina-y', `${((x - 0.5) * grados).toFixed(2)}deg`);
      estilo.setProperty('--brillo-x', `${(x * 100).toFixed(1)}%`);
      estilo.setProperty('--brillo-y', `${(y * 100).toFixed(1)}%`);
    });
  }

  protected soltar(): void {
    this.vista?.cancelAnimationFrame(this.fotograma);
    this.elemento.classList.remove('inclinada');
    for (const propiedad of ['--inclina-x', '--inclina-y', '--brillo-x', '--brillo-y']) {
      this.elemento.style.removeProperty(propiedad);
    }
  }
}
