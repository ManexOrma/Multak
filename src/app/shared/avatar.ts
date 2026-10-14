import { Component, computed, input } from '@angular/core';

/** Iniciales de un nombre: «Iker» → «IK», «Patxi García» → «PG». */
export function iniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

@Component({
  selector: 'app-avatar',
  host: {
    class: 'avatar',
    'aria-hidden': 'true',
    '[style.width.px]': 'tamano()',
    '[style.height.px]': 'tamano()',
    '[style.font-size.px]': 'tamano() * 0.4',
  },
  template: `{{ letras() }}`,
})
export class Avatar {
  readonly nombre = input.required<string>();
  /** Id estable del miembro (se mantiene por compatibilidad de las plantillas). */
  readonly semilla = input<string | null | undefined>();
  readonly tamano = input(36);

  protected readonly letras = computed(() => iniciales(this.nombre()));
}
