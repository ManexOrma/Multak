import { DialogRef } from '@angular/cdk/dialog';
import { Component, inject, signal } from '@angular/core';
import { form, FormField, FormRoot, maxLength, required, validate } from '@angular/forms/signals';
import { I18n } from '../../core/i18n/i18n.service';
import { AvisosService } from '../../shared/avisos/avisos.service';
import { cerrarHoja } from '../../shared/dialogos/dialogos.service';
import { hoyISO } from '../../shared/fechas';
import { eurosACentimos } from '../../shared/importe';
import { EquipoService } from './equipo.service';

/** Registrar un gasto pagado con el bote (cena, material…). */
@Component({
  selector: 'app-registrar-gasto',
  imports: [FormRoot, FormField],
  template: `
    <div class="hoja-cabecera">
      <span></span>
      <h2 id="registrar-gasto-titulo">{{ t('gasto.titulo') }}</h2>
      <button type="button" class="boton-enlace" (click)="cancelar()">
        {{ t('comun.cancelar') }}
      </button>
    </div>
    <p class="nota disponible">
      {{ t('gasto.hay', { importe: i18n.euros(equipo.resumen()?.bote_centimos ?? 0) }) }}
    </p>

    <form [formRoot]="formulario" class="pila">
      <label for="gasto-concepto">{{ t('gasto.concepto') }}</label>
      <input
        id="gasto-concepto"
        autocomplete="off"
        [placeholder]="t('gasto.concepto-ejemplo')"
        [formField]="formulario.concepto"
        [attr.aria-invalid]="formulario.concepto().touched() && formulario.concepto().invalid()"
        aria-describedby="gasto-concepto-error"
      />
      <p id="gasto-concepto-error" class="error-campo">
        @if (formulario.concepto().touched() && formulario.concepto().invalid()) {
          {{ formulario.concepto().errors()[0].message }}
        }
      </p>

      <label for="gasto-importe">{{ t('comun.importe') }}</label>
      <input
        id="gasto-importe"
        class="cifra"
        inputmode="decimal"
        autocomplete="off"
        placeholder="60"
        [formField]="formulario.importe"
        [attr.aria-invalid]="formulario.importe().touched() && formulario.importe().invalid()"
        aria-describedby="gasto-importe-error"
      />
      <p id="gasto-importe-error" class="error-campo">
        @if (formulario.importe().touched() && formulario.importe().invalid()) {
          {{ formulario.importe().errors()[0].message }}
        }
      </p>

      <label for="gasto-fecha">{{ t('comun.fecha') }}</label>
      <input id="gasto-fecha" type="date" [formField]="formulario.fecha" />

      <label for="gasto-nota">{{ t('comun.nota-opcional') }}</label>
      <input id="gasto-nota" autocomplete="off" [formField]="formulario.nota" />

      <p class="error" role="alert">{{ error() }}</p>
      <button type="submit" class="boton boton-principal" [disabled]="formulario().submitting()">
        {{ formulario().submitting() ? t('pago.registrando') : t('gastos.registrar') }}
      </button>
    </form>
  `,
  styles: `
    .disponible {
      margin: -4px 4px 16px;
    }
  `,
})
export class RegistrarGasto {
  protected readonly i18n = inject(I18n);
  protected readonly t = this.i18n.t;
  private readonly ref = inject<DialogRef<boolean>>(DialogRef);
  protected readonly equipo = inject(EquipoService);
  private readonly avisos = inject(AvisosService);

  protected readonly error = signal<string | null>(null);
  protected readonly modelo = signal({ concepto: '', importe: '', fecha: hoyISO(), nota: '' });
  protected readonly formulario = form(
    this.modelo,
    (campo) => {
      required(campo.concepto, { message: this.t('gasto.concepto-requerido') });
      maxLength(campo.concepto, 60, { message: this.t('comun.max-caracteres', { n: 60 }) });
      required(campo.importe, { message: this.t('comun.importe-requerido') });
      validate(campo.importe, ({ value }) =>
        value() && eurosACentimos(value()) === null
          ? { kind: 'importe', message: this.t('comun.importe-invalido') }
          : undefined,
      );
      required(campo.fecha, { message: this.t('comun.fecha-requerida') });
      maxLength(campo.nota, 500, { message: this.t('comun.max-caracteres', { n: 500 }) });
    },
    { submission: { action: () => this.registrar() } },
  );

  protected cancelar(): void {
    void cerrarHoja(this.ref, false);
  }

  private async registrar(): Promise<void> {
    this.error.set(null);
    const { concepto, importe, fecha, nota } = this.modelo();
    try {
      await this.equipo.registrarGasto({
        concepto: concepto.trim(),
        importeCentimos: eurosACentimos(importe) ?? 0,
        fecha,
        nota: nota.trim() || null,
      });
      this.avisos.mostrar(this.t('gasto.registrado'));
      await cerrarHoja(this.ref, true);
    } catch (e) {
      this.error.set(this.i18n.error(e));
    }
  }
}
