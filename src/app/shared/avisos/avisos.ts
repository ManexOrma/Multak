import { Component, inject } from '@angular/core';
import { AvisosService } from './avisos.service';

/** Región viva siempre presente: el lector de pantalla anuncia cada aviso. */
@Component({
  selector: 'app-avisos',
  template: `
    <div class="avisos" role="status" aria-live="polite">
      @if (avisos.mensaje(); as mensaje) {
        <p class="aviso">{{ mensaje }}</p>
      }
    </div>
  `,
  styles: `
    .avisos {
      position: fixed;
      inset-inline: 1rem;
      bottom: calc(1rem + env(safe-area-inset-bottom));
      display: flex;
      justify-content: center;
      pointer-events: none;
      z-index: 1100;
    }

    .aviso {
      margin: 0;
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      background: CanvasText;
      color: Canvas;
      font-weight: 600;
    }
  `,
})
export class Avisos {
  protected readonly avisos = inject(AvisosService);
}
