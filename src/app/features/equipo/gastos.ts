import { Component, inject } from '@angular/core';
import { mensajeError } from '../../core/supabase/mensaje-error';
import { AvisosService } from '../../shared/avisos/avisos.service';
import { Cabecera } from '../../shared/cabecera';
import { DialogosService } from '../../shared/dialogos/dialogos.service';
import { fechaRelativa } from '../../shared/fechas';
import { EurosPipe } from '../../shared/pipes/euros.pipe';
import { AccionesEquipo } from './acciones-equipo';
import { EquipoService, Gasto } from './equipo.service';

/** El bote: cuánto se ha recaudado, en qué se ha gastado y cuánto queda. */
@Component({
  selector: 'app-gastos',
  imports: [Cabecera, EurosPipe],
  template: `
    <main class="pagina">
      <app-cabecera titulo="Gastos" />

      <section aria-label="Cuentas del bote">
        <p class="cifra-grande cifra">{{ equipo.resumen()?.bote_centimos ?? 0 | euros }}</p>
        <p class="nota">en el bote ahora mismo</p>
        <ul class="lista cuentas">
          <li class="fila">
            <span class="fila-texto">Recaudado</span>
            <span class="fila-valor">{{ equipo.resumen()?.recaudado_centimos ?? 0 | euros }}</span>
          </li>
          <li class="fila">
            <span class="fila-texto">Gastado</span>
            <span class="fila-valor">−{{ equipo.resumen()?.gastado_centimos ?? 0 | euros }}</span>
          </li>
          <li class="fila">
            <span class="fila-texto">Falta por cobrar</span>
            <span class="fila-valor texto-suave">{{
              equipo.resumen()?.pendiente_cobro_centimos ?? 0 | euros
            }}</span>
          </li>
        </ul>
      </section>

      @if (equipo.puedeGestionar()) {
        <button
          type="button"
          class="boton boton-secundario boton-ancho registrar"
          (click)="registrar()"
        >
          Registrar gasto
        </button>
      }

      <section class="seccion" aria-labelledby="gastos-titulo">
        <h2 id="gastos-titulo">En qué se ha gastado</h2>
        @if (equipo.gastos().length === 0) {
          <p class="estado-vacio">Aún no se ha gastado nada. El bote espera su cena.</p>
        } @else {
          <ul class="lista">
            @for (gasto of equipo.gastos(); track gasto.id) {
              <li>
                @if (equipo.puedeGestionar() && !gasto.anulado) {
                  <button type="button" class="fila" (click)="anular(gasto)">
                    <span class="fila-texto">
                      <span>{{ gasto.concepto }}</span>
                      <span class="fila-detalle"
                        >{{ fecha(gasto.fecha) }}{{ gasto.nota ? ' · ' + gasto.nota : '' }}</span
                      >
                    </span>
                    <span class="fila-valor">−{{ gasto.importe_centimos | euros }}</span>
                  </button>
                } @else {
                  <div class="fila" [class.anulado]="gasto.anulado">
                    <span class="fila-texto">
                      <span>{{ gasto.concepto }}</span>
                      <span class="fila-detalle"
                        >{{ fecha(gasto.fecha) }}{{ gasto.nota ? ' · ' + gasto.nota : '' }}</span
                      >
                    </span>
                    @if (gasto.anulado) {
                      <span class="etiqueta">Anulado</span>
                    }
                    <span class="fila-valor">−{{ gasto.importe_centimos | euros }}</span>
                  </div>
                }
              </li>
            }
          </ul>
          @if (equipo.puedeGestionar()) {
            <p class="pie-grupo">Toca un gasto para anularlo si se apuntó por error.</p>
          }
        }
      </section>
    </main>
  `,
  styles: `
    .cifra-grande {
      margin: 0 4px;
      font-size: 56px;
      line-height: 1.05;
      font-weight: 700;
      letter-spacing: -0.03em;
    }

    .nota {
      margin: 2px 4px 16px;
    }

    .registrar {
      margin-top: 16px;
    }

    .anulado {
      color: var(--texto-2);

      .fila-texto > :first-child,
      .fila-valor {
        text-decoration: line-through;
        text-decoration-thickness: 1.5px;
      }
    }
  `,
})
export class Gastos {
  protected readonly equipo = inject(EquipoService);
  private readonly acciones = inject(AccionesEquipo);
  private readonly dialogos = inject(DialogosService);
  private readonly avisos = inject(AvisosService);

  protected fecha(fechaISO: string): string {
    return fechaRelativa(fechaISO);
  }

  protected registrar(): void {
    void this.acciones.registrarGasto();
  }

  protected async anular(gasto: Gasto): Promise<void> {
    const confirmado = await this.dialogos.confirmar({
      titulo: '¿Anular este gasto?',
      mensaje: `${gasto.concepto}. El dinero volverá a contar en el bote y el gasto quedará tachado.`,
      aceptar: 'Anular',
      peligro: true,
    });
    if (!confirmado) return;
    try {
      await this.equipo.anularGasto(gasto.id);
      this.avisos.mostrar('Gasto anulado.');
    } catch (e) {
      this.avisos.mostrar(mensajeError(e));
    }
  }
}
