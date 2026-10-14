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
    // Arriba, como las notificaciones de iOS: no tapa el botón amarillo ni las pestañas.
    .avisos {
      position: fixed;
      inset-inline: 16px;
      top: calc(8px + var(--seguro-arriba));
      z-index: 1100;
      display: flex;
      justify-content: center;
      pointer-events: none;
    }

    .aviso {
      max-width: 26rem;
      margin: 0;
      padding: 12px 18px;
      border-radius: 16px;
      background: var(--barra);
      -webkit-backdrop-filter: blur(24px) saturate(180%);
      backdrop-filter: blur(24px) saturate(180%);
      color: var(--texto);
      font-size: 15px;
      line-height: 20px;
      font-weight: 600;
      text-align: center;
      box-shadow: var(--sombra-flotante);
      transition:
        opacity 260ms var(--ease-out),
        transform 260ms var(--ease-out);

      @starting-style {
        opacity: 0;
        transform: translateY(-12px) scale(0.97);
      }
    }
  `,
})
export class Avisos {
  protected readonly avisos = inject(AvisosService);
}
