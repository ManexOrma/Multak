import { DialogRef } from '@angular/cdk/dialog';
import { Component, inject, signal } from '@angular/core';
import { form, FormField, FormRoot, maxLength, required, validate } from '@angular/forms/signals';
import { mensajeError } from '../../core/supabase/mensaje-error';
import { AvisosService } from '../../shared/avisos/avisos.service';
import { cerrarHoja } from '../../shared/dialogos/dialogos.service';
import { hoyISO } from '../../shared/fechas';
import { eurosACentimos } from '../../shared/importe';
import { EurosPipe } from '../../shared/pipes/euros.pipe';
import { EquipoService } from './equipo.service';

/** Registrar un gasto pagado con el bote (cena, material…). */
@Component({
  selector: 'app-registrar-gasto',
  imports: [FormRoot, FormField, EurosPipe],
  template: `
    <div class="hoja-cabecera">
      <span></span>
      <h2 id="registrar-gasto-titulo">Registrar gasto</h2>
      <button type="button" class="boton-enlace" (click)="cancelar()">Cancelar</button>
    </div>
    <p class="nota disponible">
      Hay {{ equipo.resumen()?.bote_centimos ?? 0 | euros }} en el bote.
    </p>

    <form [formRoot]="formulario" class="pila">
      <label for="gasto-concepto">Concepto</label>
      <input
        id="gasto-concepto"
        autocomplete="off"
        placeholder="p. ej. Cena de fin de temporada"
        [formField]="formulario.concepto"
        [attr.aria-invalid]="formulario.concepto().touched() && formulario.concepto().invalid()"
        aria-describedby="gasto-concepto-error"
      />
      <p id="gasto-concepto-error" class="error-campo">
        @if (formulario.concepto().touched() && formulario.concepto().invalid()) {
          {{ formulario.concepto().errors()[0].message }}
        }
      </p>

      <label for="gasto-importe">Importe (€)</label>
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

      <label for="gasto-fecha">Fecha</label>
      <input id="gasto-fecha" type="date" [formField]="formulario.fecha" />

      <label for="gasto-nota">Nota (opcional)</label>
      <input id="gasto-nota" autocomplete="off" [formField]="formulario.nota" />

      <p class="error" role="alert">{{ error() }}</p>
      <button type="submit" class="boton boton-principal" [disabled]="formulario().submitting()">
        {{ formulario().submitting() ? 'Registrando…' : 'Registrar gasto' }}
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
  private readonly ref = inject<DialogRef<boolean>>(DialogRef);
  protected readonly equipo = inject(EquipoService);
  private readonly avisos = inject(AvisosService);

  protected readonly error = signal<string | null>(null);
  protected readonly modelo = signal({ concepto: '', importe: '', fecha: hoyISO(), nota: '' });
  protected readonly formulario = form(
    this.modelo,
    (campo) => {
      required(campo.concepto, { message: 'Escribe en qué se ha gastado.' });
      maxLength(campo.concepto, 60, { message: 'Como mucho 60 caracteres.' });
      required(campo.importe, { message: 'Pon el importe.' });
      validate(campo.importe, ({ value }) =>
        value() && eurosACentimos(value()) === null
          ? { kind: 'importe', message: 'Pon un importe entre 0,01 y 1.000 €, p. ej. 60.' }
          : undefined,
      );
      required(campo.fecha, { message: 'Elige la fecha.' });
      maxLength(campo.nota, 500, { message: 'Como mucho 500 caracteres.' });
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
      this.avisos.mostrar('Gasto registrado.');
      await cerrarHoja(this.ref, true);
    } catch (e) {
      this.error.set(mensajeError(e));
    }
  }
}
