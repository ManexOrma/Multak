import { Component, inject, signal } from '@angular/core';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { Router } from '@angular/router';

/** Para quien tiene el código pero no el enlace: lleva a /unirse/:codigo. */
@Component({
  selector: 'app-unirse-codigo',
  imports: [FormRoot, FormField],
  template: `
    <form [formRoot]="formulario" class="pila">
      <label for="unirse-codigo">Código de invitación</label>
      <input
        id="unirse-codigo"
        class="codigo"
        autocomplete="off"
        autocapitalize="characters"
        spellcheck="false"
        [formField]="formulario.codigo"
        [attr.aria-invalid]="formulario.codigo().touched() && formulario.codigo().invalid()"
        aria-describedby="unirse-codigo-ayuda unirse-codigo-error"
      />
      <p id="unirse-codigo-ayuda" class="texto-suave">Son 8 letras y números, p. ej. VESTUAR2.</p>
      <p id="unirse-codigo-error" class="error-campo">
        @if (formulario.codigo().touched() && formulario.codigo().invalid()) {
          {{ formulario.codigo().errors()[0].message }}
        }
      </p>
      <button type="submit" class="boton boton-secundario">Unirme</button>
    </form>
  `,
  styles: `
    .codigo {
      text-transform: uppercase;
      letter-spacing: 0.2em;
    }

    .texto-suave {
      margin: 0;
    }
  `,
})
export class UnirseCodigo {
  private readonly router = inject(Router);

  protected readonly modelo = signal({ codigo: '' });
  protected readonly formulario = form(
    this.modelo,
    (campo) => required(campo.codigo, { message: 'Escribe el código que te han pasado.' }),
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
