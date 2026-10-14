import { Component } from '@angular/core';

/** Invitación a instalar la app tras unirse. La pantalla /instalar completa llega en la fase 5. */
@Component({
  selector: 'app-instalar-nota',
  template: `
    <section class="nota" aria-labelledby="instalar-nota-titulo">
      <h2 id="instalar-nota-titulo">Instala la app</h2>
      <p>Tenla a mano en el móvil, como una app más:</p>
      <ul>
        <li>
          <strong>iPhone</strong>: en Safari, pulsa Compartir → «Añadir a pantalla de inicio».
        </li>
        <li><strong>Android</strong>: en Chrome, menú ⋮ → «Instalar aplicación».</li>
      </ul>
      <p>
        <strong>En iPhone</strong>, al abrir la app instalada tendrás que volver a entrar con tu
        email: la app y Safari no comparten la sesión. Tu equipo ya estará ahí.
      </p>
    </section>
  `,
  styles: `
    .nota {
      margin-top: 2rem;
      padding: 1rem;
      border: 2px solid var(--borde);
      border-radius: var(--radio);

      h2 {
        margin: 0 0 0.5rem;
        font-size: 1.125rem;
      }

      ul {
        padding-inline-start: 1.25rem;
      }

      p:last-child {
        margin-bottom: 0;
      }
    }
  `,
})
export class InstalarNota {}
