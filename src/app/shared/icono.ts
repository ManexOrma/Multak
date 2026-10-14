import { Component, input } from '@angular/core';

export type NombreIcono =
  | 'inicio'
  | 'multas'
  | 'gastos'
  | 'ajustes'
  | 'mas'
  | 'chevron-derecha'
  | 'chevron-izquierda'
  | 'cerrar'
  | 'compartir'
  | 'copiar'
  | 'check'
  | 'equipos'
  | 'salir'
  | 'tarjeta'
  | 'euro'
  | 'persona-mas';

/** Iconos de trazo uniforme (2px, extremos redondos) dibujados en SVG. Decorativos: aria-hidden. */
@Component({
  selector: 'app-icono',
  host: { class: 'icono' },
  template: `
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      [attr.stroke-width]="grosor()"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      @switch (nombre()) {
        @case ('inicio') {
          <path
            d="M3.5 10.2 12 3.5l8.5 6.7V19a1.5 1.5 0 0 1-1.5 1.5h-4.5v-6h-5v6H5A1.5 1.5 0 0 1 3.5 19z"
          />
        }
        @case ('multas') {
          <rect x="5" y="3" width="14" height="18" rx="2.5" />
          <path d="M9 8h6M9 12h6M9 16h3.5" />
        }
        @case ('gastos') {
          <path d="M6 3h12v18l-2.5-1.6L13 21l-2.5-1.6L8 21l-2-1.4z" />
          <path d="M9.5 8h5M9.5 12h5" />
        }
        @case ('ajustes') {
          <path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1" />
          <circle cx="15" cy="6" r="2" />
          <circle cx="9" cy="12" r="2" />
          <circle cx="17" cy="18" r="2" />
        }
        @case ('mas') {
          <path d="M12 5v14M5 12h14" />
        }
        @case ('chevron-derecha') {
          <path d="m9 5.5 6.5 6.5L9 18.5" />
        }
        @case ('chevron-izquierda') {
          <path d="M15 5.5 8.5 12l6.5 6.5" />
        }
        @case ('cerrar') {
          <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
        }
        @case ('compartir') {
          <path
            d="M12 14V3.5M8 7.5l4-4 4 4M6 11H5.5A1.5 1.5 0 0 0 4 12.5v7A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5v-7a1.5 1.5 0 0 0-1.5-1.5H18"
          />
        }
        @case ('copiar') {
          <rect x="8.5" y="8.5" width="12" height="12" rx="2.5" />
          <path
            d="M15.5 5.5V5A1.5 1.5 0 0 0 14 3.5H5A1.5 1.5 0 0 0 3.5 5v9A1.5 1.5 0 0 0 5 15.5h.5"
          />
        }
        @case ('check') {
          <path d="m5 12.5 4.5 4.5L19 7.5" />
        }
        @case ('equipos') {
          <circle cx="9" cy="8" r="3.5" />
          <path
            d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.6a3.5 3.5 0 0 1 0 6.8M18.5 14.4a6.5 6.5 0 0 1 3 5.6"
          />
        }
        @case ('salir') {
          <path
            d="M14.5 4h3A1.5 1.5 0 0 1 19 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-3M10 16.5 14.5 12 10 7.5M14.5 12H4"
          />
        }
        @case ('tarjeta') {
          <rect x="6.5" y="3" width="11" height="16" rx="2" transform="rotate(10 12 11)" />
        }
        @case ('euro') {
          <path d="M17.5 6.4A7 7 0 1 0 17.5 17.6M4.5 10h9M4.5 14h9" />
        }
        @case ('persona-mas') {
          <circle cx="10" cy="8" r="4" />
          <path d="M3 20.5a7 7 0 0 1 14 0M19.5 7.5v6M16.5 10.5h6" />
        }
      }
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      flex-shrink: 0;
      width: 24px;
      height: 24px;
    }

    svg {
      width: 100%;
      height: 100%;
    }
  `,
})
export class Icono {
  readonly nombre = input.required<NombreIcono>();
  readonly grosor = input(2);
}
