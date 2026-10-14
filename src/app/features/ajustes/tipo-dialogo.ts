import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject, signal } from '@angular/core';
import { form, FormField, FormRoot, maxLength, required, validate } from '@angular/forms/signals';
import { TipoMulta } from '../../core/models/modelos';
import { I18n } from '../../core/i18n/i18n.service';
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
      <button type="button" class="boton-enlace" (click)="cancelar()">
        {{ t('comun.cancelar') }}
      </button>
      <h2 id="tipo-dialogo-titulo">{{ tipo ? t('tipo.editar') : t('tipo.nuevo') }}</h2>
      <span></span>
    </div>

    <form [formRoot]="formulario" class="pila">
      <label for="tipo-nombre">{{ t('miembro.nombre') }}</label>
      <input
        id="tipo-nombre"
        autocomplete="off"
        [placeholder]="t('tipo.nombre-ejemplo')"
        [formField]="formulario.nombre"
        [attr.aria-invalid]="formulario.nombre().touched() && formulario.nombre().invalid()"
        aria-describedby="tipo-nombre-error"
      />
      <p id="tipo-nombre-error" class="error-campo">
        @if (formulario.nombre().touched() && formulario.nombre().invalid()) {
          {{ formulario.nombre().errors()[0].message }}
        }
      </p>

      <label for="tipo-importe">{{ t('comun.importe') }}</label>
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
          {{ t('tipo.importe-ayuda') }}
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
          {{ t('tipo.activo') }}
        </label>
      }

      <p class="error" role="alert">{{ error() }}</p>

      <button type="submit" class="boton boton-principal" [disabled]="formulario().submitting()">
        {{ tipo ? t('comun.guardar') : t('tipo.anadir') }}
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
  protected readonly i18n = inject(I18n);
  protected readonly t = this.i18n.t;
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
      required(campo.nombre, { message: this.t('tipo.nombre-requerido') });
      maxLength(campo.nombre, 60, { message: this.t('comun.max-caracteres', { n: 60 }) });
      required(campo.importe, { message: this.t('comun.importe-requerido') });
      validate(campo.importe, ({ value }) =>
        value() && eurosACentimos(value()) === null
          ? { kind: 'importe', message: this.t('comun.importe-invalido') }
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
        this.avisos.mostrar(this.t('tipo.guardado'));
      } else {
        await this.ajustes.crearTipo(nombre.trim(), importeCentimos);
        this.avisos.mostrar(this.t('tipo.anadido'));
      }
      await cerrarHoja(this.ref);
    } catch (e) {
      this.error.set(this.i18n.error(e));
    }
  }
}
