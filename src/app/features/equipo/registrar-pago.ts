import { DOCUMENT } from '@angular/common';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject, signal } from '@angular/core';
import { form, FormField, FormRoot, maxLength, required, validate } from '@angular/forms/signals';
import { I18n } from '../../core/i18n/i18n.service';
import { MetodoPago } from '../../core/models/modelos';
import { AvisosService } from '../../shared/avisos/avisos.service';
import { Avatar } from '../../shared/avatar';
import { cerrarHoja } from '../../shared/dialogos/dialogos.service';
import { hoyISO } from '../../shared/fechas';
import { lanzarConfeti } from '../../shared/confeti';
import { vibrar } from '../../shared/vibrar';
import { centimosATexto, eurosACentimos } from '../../shared/importe';
import { EquipoService } from './equipo.service';

const METODOS: MetodoPago[] = ['bizum', 'efectivo', 'otro'];

/** Registrar un pago hecho fuera de la app (Bizum o efectivo). */
@Component({
  selector: 'app-registrar-pago',
  imports: [FormRoot, FormField, Avatar],
  template: `
    <div class="hoja-cabecera">
      <span></span>
      <h2 id="registrar-pago-titulo">{{ t('pago.titulo') }}</h2>
      <button type="button" class="boton-enlace" (click)="cancelar()">
        {{ t('comun.cancelar') }}
      </button>
    </div>

    @if (jugador; as j) {
      <div class="quien">
        <app-avatar [nombre]="j.nombre ?? ''" [tamano]="44" />
        <div>
          <p class="titular">{{ j.nombre }}</p>
          <p class="nota">
            {{
              (j.saldo_centimos ?? 0) > 0
                ? t('pago.debe', { importe: i18n.euros(j.saldo_centimos ?? 0) })
                : t('pago.al-dia')
            }}
          </p>
        </div>
      </div>
    }

    <form [formRoot]="formulario" class="pila">
      <label for="pago-importe">{{ t('comun.importe') }}</label>
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

      <p id="pago-metodo-etiqueta" class="etiqueta-campo">{{ t('pago.como') }}</p>
      <fieldset class="segmentado" aria-labelledby="pago-metodo-etiqueta">
        <legend>{{ t('pago.como') }}</legend>
        @for (metodo of metodos; track metodo) {
          <label>
            <input type="radio" [value]="metodo" [formField]="formulario.metodo" />
            {{ textoMetodo(metodo) }}
          </label>
        }
      </fieldset>

      <label for="pago-fecha" class="separado">{{ t('comun.fecha') }}</label>
      <input id="pago-fecha" type="date" [formField]="formulario.fecha" />

      <label for="pago-nota">{{ t('comun.nota-opcional') }}</label>
      <input id="pago-nota" autocomplete="off" [formField]="formulario.nota" />

      <p class="error" role="alert">{{ error() }}</p>
      <button type="submit" class="boton boton-principal" [disabled]="formulario().submitting()">
        {{ formulario().submitting() ? t('pago.registrando') : t('pago.boton') }}
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
  protected readonly i18n = inject(I18n);
  protected readonly t = this.i18n.t;
  private readonly datos = inject<{ miembroId: string }>(DIALOG_DATA);
  private readonly ref = inject<DialogRef<boolean>>(DialogRef);
  private readonly equipo = inject(EquipoService);
  private readonly avisos = inject(AvisosService);
  private readonly documento = inject(DOCUMENT);

  protected readonly jugador = this.equipo.saldoDe(this.datos.miembroId);
  protected readonly metodos = METODOS;
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
      required(campo.importe, { message: this.t('pago.requerido') });
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

  protected textoMetodo(metodo: MetodoPago): string {
    return this.t(`metodo.${metodo}`);
  }

  protected cancelar(): void {
    void cerrarHoja(this.ref, false);
  }

  private async registrar(): Promise<void> {
    this.error.set(null);
    const { importe, metodo, fecha, nota } = this.modelo();
    const deuda = this.jugador?.saldo_centimos ?? 0;
    const pagado = eurosACentimos(importe) ?? 0;
    try {
      await this.equipo.registrarPago({
        miembroId: this.datos.miembroId,
        importeCentimos: eurosACentimos(importe) ?? 0,
        metodo,
        fecha,
        nota: nota.trim() || null,
      });
      this.avisos.mostrar(this.i18n.frase('gracia.pago-registrado'));
      vibrar();
      await cerrarHoja(this.ref, true);
      // Ha saldado su deuda: ¡confeti!
      if (deuda > 0 && pagado >= deuda) lanzarConfeti(this.documento);
    } catch (e) {
      this.error.set(this.i18n.error(e));
    }
  }
}
