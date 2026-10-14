import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject, signal } from '@angular/core';
import { form, FormField, FormRoot, maxLength, required, validate } from '@angular/forms/signals';
import { TipoMulta } from '../../core/models/modelos';
import { mensajeError } from '../../core/supabase/mensaje-error';
import { AvisosService } from '../../shared/avisos/avisos.service';
import { cerrarHoja } from '../../shared/dialogos/dialogos.service';
import { centimosATexto, eurosACentimos } from '../../shared/importe';
import { AjustesService } from './ajustes.service';

/** Alta (data null) o edición de un tipo de multa. */
@Component({
  selector: 'app-tipo-dialogo',
  imports: [FormRoot, FormField],
  template: `
    <div class="hoja-cabecera">
      <button type="button" class="boton-enlace" (click)="cancelar()">Cancelar</button>
      <h2 id="tipo-dialogo-titulo">{{ tipo ? 'Editar tipo de multa' : 'Nuevo tipo de multa' }}</h2>
      <span></span>
    </div>

    <form [formRoot]="formulario" class="pila">
      <label for="tipo-nombre">Nombre</label>
      <input
        id="tipo-nombre"
        autocomplete="off"
        placeholder="p. ej. Llegar tarde"
        [formField]="formulario.nombre"
        [attr.aria-invalid]="formulario.nombre().touched() && formulario.nombre().invalid()"
        aria-describedby="tipo-nombre-error"
      />
      <p id="tipo-nombre-error" class="error-campo">
        @if (formulario.nombre().touched() && formulario.nombre().invalid()) {
          {{ formulario.nombre().errors()[0].message }}
        }
      </p>

      <label for="tipo-importe">Importe (€)</label>
      <input
        id="tipo-importe"
        inputmode="decimal"
        autocomplete="off"
        placeholder="2,50"
        [formField]="formulario.importe"
        [attr.aria-invalid]="formulario.importe().touched() && formulario.importe().invalid()"
        aria-describedby="tipo-importe-ayuda tipo-importe-error"
      />
      @if (tipo) {
        <p id="tipo-importe-ayuda" class="texto-suave ayuda">
          Cambiarlo no afecta a las multas ya puestas.
        </p>
      }
      <p id="tipo-importe-error" class="error-campo">
        @if (formulario.importe().touched() && formulario.importe().invalid()) {
          {{ formulario.importe().errors()[0].message }}
        }
      </p>

      @if (tipo) {
        <label class="casilla">
          <input type="checkbox" [formField]="formulario.activo" />
          Activo (si no, no aparece al poner multas)
        </label>
      }

      <p class="error" role="alert">{{ error() }}</p>

      <button type="submit" class="boton boton-principal" [disabled]="formulario().submitting()">
        {{ tipo ? 'Guardar' : 'Añadir al catálogo' }}
      </button>
    </form>
  `,
  styles: `
    .ayuda {
      margin: 0;
    }
  `,
})
export class TipoDialogo {
  protected readonly tipo = inject<TipoMulta | null>(DIALOG_DATA);
  private readonly ref = inject<DialogRef<void>>(DialogRef);
  private readonly ajustes = inject(AjustesService);
  private readonly avisos = inject(AvisosService);

  protected readonly error = signal<string | null>(null);
  protected readonly modelo = signal({
    nombre: this.tipo?.nombre ?? '',
    importe: this.tipo ? centimosATexto(this.tipo.importe_centimos) : '',
    activo: this.tipo?.activo ?? true,
  });
  protected readonly formulario = form(
    this.modelo,
    (campo) => {
      required(campo.nombre, { message: 'Ponle un nombre.' });
      maxLength(campo.nombre, 60, { message: 'Como mucho 60 caracteres.' });
      required(campo.importe, { message: 'Pon el importe.' });
      validate(campo.importe, ({ value }) =>
        value() && eurosACentimos(value()) === null
          ? { kind: 'importe', message: 'Pon un importe entre 0,01 y 1.000 €, p. ej. 2,50.' }
          : undefined,
      );
    },
    { submission: { action: () => this.guardar() } },
  );

  protected cancelar(): void {
    void cerrarHoja(this.ref);
  }

  private async guardar(): Promise<void> {
    this.error.set(null);
    const { nombre, importe, activo } = this.modelo();
    const importeCentimos = eurosACentimos(importe) ?? 0;
    try {
      if (this.tipo) {
        await this.ajustes.editarTipo(this.tipo.id, {
          nombre: nombre.trim(),
          importe_centimos: importeCentimos,
          activo,
        });
        this.avisos.mostrar('Tipo de multa guardado.');
      } else {
        await this.ajustes.crearTipo(nombre.trim(), importeCentimos);
        this.avisos.mostrar('Tipo de multa añadido.');
      }
      await cerrarHoja(this.ref);
    } catch (e) {
      this.error.set(mensajeError(e));
    }
  }
}
