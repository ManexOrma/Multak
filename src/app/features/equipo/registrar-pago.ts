import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject, signal } from '@angular/core';
import { form, FormField, FormRoot, maxLength, required, validate } from '@angular/forms/signals';
import { MetodoPago, NOMBRE_METODO } from '../../core/models/modelos';
import { mensajeError } from '../../core/supabase/mensaje-error';
import { AvisosService } from '../../shared/avisos/avisos.service';
import { Avatar } from '../../shared/avatar';
import { cerrarHoja } from '../../shared/dialogos/dialogos.service';
import { hoyISO } from '../../shared/fechas';
import { centimosATexto, eurosACentimos } from '../../shared/importe';
import { EurosPipe } from '../../shared/pipes/euros.pipe';
import { EquipoService } from './equipo.service';

const METODOS: MetodoPago[] = ['bizum', 'efectivo', 'otro'];

/** Registrar un pago hecho fuera de la app (Bizum o efectivo). */
@Component({
  selector: 'app-registrar-pago',
  imports: [FormRoot, FormField, Avatar, EurosPipe],
  template: `
    <div class="hoja-cabecera">
      <span></span>
      <h2 id="registrar-pago-titulo">Registrar pago</h2>
      <button type="button" class="boton-enlace" (click)="cancelar()">Cancelar</button>
    </div>

    @if (jugador; as j) {
      <div class="quien">
        <app-avatar [nombre]="j.nombre ?? ''" [semilla]="j.miembro_id" [tamano]="44" />
        <div>
          <p class="titular">{{ j.nombre }}</p>
          <p class="nota">
            @if ((j.saldo_centimos ?? 0) > 0) {
              Debe {{ j.saldo_centimos | euros }}
            } @else {
              Está al día
            }
          </p>
        </div>
      </div>
    }

    <form [formRoot]="formulario" class="pila">
      <label for="pago-importe">Importe (€)</label>
      <input
        id="pago-importe"
        class="cifra"
        inputmode="decimal"
        autocomplete="off"
        placeholder="5"
        [formField]="formulario.importe"
        [attr.aria-invalid]="formulario.importe().touched() && formulario.importe().invalid()"
        aria-describedby="pago-importe-error"
      />
      <p id="pago-importe-error" class="error-campo">
        @if (formulario.importe().touched() && formulario.importe().invalid()) {
          {{ formulario.importe().errors()[0].message }}
        }
      </p>

      <p id="pago-metodo-etiqueta" class="etiqueta-campo">Cómo ha pagado</p>
      <fieldset class="segmentado" aria-labelledby="pago-metodo-etiqueta">
        <legend>Cómo ha pagado</legend>
        @for (metodo of metodos; track metodo) {
          <label>
            <input type="radio" [value]="metodo" [formField]="formulario.metodo" />
            {{ nombreMetodo[metodo] }}
          </label>
        }
      </fieldset>

      <label for="pago-fecha" class="separado">Fecha</label>
      <input id="pago-fecha" type="date" [formField]="formulario.fecha" />

      <label for="pago-nota">Nota (opcional)</label>
      <input id="pago-nota" autocomplete="off" [formField]="formulario.nota" />

      <p class="error" role="alert">{{ error() }}</p>
      <button type="submit" class="boton boton-principal" [disabled]="formulario().submitting()">
        {{ formulario().submitting() ? 'Registrando…' : 'Registrar pago' }}
      </button>
    </form>
  `,
  styles: `
    .quien {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0 4px 16px;
    }

    .separado {
      margin-top: 12px;
    }
  `,
})
export class RegistrarPago {
  private readonly datos = inject<{ miembroId: string }>(DIALOG_DATA);
  private readonly ref = inject<DialogRef<boolean>>(DialogRef);
  private readonly equipo = inject(EquipoService);
  private readonly avisos = inject(AvisosService);

  protected readonly jugador = this.equipo.saldoDe(this.datos.miembroId);
  protected readonly metodos = METODOS;
  protected readonly nombreMetodo = NOMBRE_METODO;
  protected readonly error = signal<string | null>(null);

  protected readonly modelo = signal({
    // Lo normal es pagar lo que se debe: lo proponemos.
    importe:
      (this.jugador?.saldo_centimos ?? 0) > 0
        ? centimosATexto(this.jugador?.saldo_centimos ?? 0)
        : '',
    metodo: 'bizum' as MetodoPago,
    fecha: hoyISO(),
    nota: '',
  });
  protected readonly formulario = form(
    this.modelo,
    (campo) => {
      required(campo.importe, { message: 'Pon el importe pagado.' });
      validate(campo.importe, ({ value }) =>
        value() && eurosACentimos(value()) === null
          ? { kind: 'importe', message: 'Pon un importe entre 0,01 y 1.000 €, p. ej. 5.' }
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
    const { importe, metodo, fecha, nota } = this.modelo();
    try {
      await this.equipo.registrarPago({
        miembroId: this.datos.miembroId,
        importeCentimos: eurosACentimos(importe) ?? 0,
        metodo,
        fecha,
        nota: nota.trim() || null,
      });
      this.avisos.mostrar('Pago registrado.');
      await cerrarHoja(this.ref, true);
    } catch (e) {
      this.error.set(mensajeError(e));
    }
  }
}
