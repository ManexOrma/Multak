import { Component, inject, signal } from '@angular/core';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { I18n } from '../../core/i18n/i18n.service';

/** Para quien tiene el código pero no el enlace: lleva a /unirse/:codigo. */
@Component({
  selector: 'app-unirse-codigo',
  imports: [FormRoot, FormField],
  template: `
    <form [formRoot]="formulario" class="pila">
      <label for="unirse-codigo">{{ t('equipos.codigo') }}</label>
      <input
        id="unirse-codigo"
        class="codigo cifra"
        placeholder="VESTUAR2"
        enterkeyhint="go"
        autocomplete="off"
        autocapitalize="characters"
        spellcheck="false"
        [formField]="formulario.codigo"
        [attr.aria-invalid]="formulario.codigo().touched() && formulario.codigo().invalid()"
        aria-describedby="unirse-codigo-ayuda unirse-codigo-error"
      />
      <p id="unirse-codigo-error" class="error-campo">
        @if (formulario.codigo().touched() && formulario.codigo().invalid()) {
          {{ formulario.codigo().errors()[0].message }}
        }
      </p>
      <button type="submit" class="boton boton-secundario">{{ t('equipos.boton-unirme') }}</button>
      <p id="unirse-codigo-ayuda" class="pie-grupo">
        {{ t('equipos.codigo-ayuda') }}
      </p>
    </form>
  `,
  styles: `
    .codigo {
      text-transform: uppercase;
      letter-spacing: 0.2em;
      font-weight: 600;
    }

    .pie-grupo {
      margin-top: 2px;
    }
  `,
})
export class UnirseCodigo {
  protected readonly i18n = inject(I18n);
  protected readonly t = this.i18n.t;
  private readonly router = inject(Router);

  protected readonly modelo = signal({ codigo: '' });
  protected readonly formulario = form(
    this.modelo,
    (campo) => required(campo.codigo, { message: this.t('equipos.codigo-requerido') }),
    {
      submission: {
        action: async () => {
          const codigo = this.modelo()
            .codigo.toUpperCase()
            .replace(/[^A-Z0-9]/g, '');
          await this.router.navigate(['/unirse', codigo]);
        },
      },
    },
  );
}
