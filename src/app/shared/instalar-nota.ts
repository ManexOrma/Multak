import { Component, inject } from '@angular/core';
import { I18n } from '../core/i18n/i18n.service';

/** Invitación a instalar la app tras unirse. La pantalla /instalar completa llega en la fase 5. */
@Component({
  selector: 'app-instalar-nota',
  template: `
    <section class="nota" aria-labelledby="instalar-nota-titulo">
      <h2 id="instalar-nota-titulo">{{ t('instalar.titulo') }}</h2>
      <p>{{ t('instalar.texto') }}</p>
      <ul>
        <li>{{ t('instalar.iphone') }}</li>
        <li>{{ t('instalar.android') }}</li>
      </ul>
      <p>{{ t('instalar.aviso') }}</p>
    </section>
  `,
  styles: `
    .nota {
      margin-top: 32px;
      padding: 16px;
      border-radius: var(--radio);
      background: var(--celda);
      font-size: 15px;
      line-height: 20px;

      h2 {
        margin: 0 0 8px;
        font-size: 17px;
        font-weight: 600;
      }

      ul {
        margin: 8px 0;
        padding-inline-start: 20px;
      }
    }
  `,
})
export class InstalarNota {
  protected readonly t = inject(I18n).t;
}
