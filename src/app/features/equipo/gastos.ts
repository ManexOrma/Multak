import { Component, inject } from '@angular/core';
import { I18n } from '../../core/i18n/i18n.service';
import { AvisosService } from '../../shared/avisos/avisos.service';
import { Cabecera } from '../../shared/cabecera';
import { CifraAnimada } from '../../shared/cifra-animada';
import { DialogosService } from '../../shared/dialogos/dialogos.service';
import { BotonMenu } from '../menu/boton-menu';
import { AccionesEquipo } from './acciones-equipo';
import { EquipoService, Gasto } from './equipo.service';

/** El bote: cuánto se ha recaudado, en qué se ha gastado y cuánto queda. */
@Component({
  selector: 'app-gastos',
  imports: [Cabecera, BotonMenu, CifraAnimada],
  template: `
    <main class="pagina">
      <app-cabecera [titulo]="t('gastos.titulo')">
        <app-boton-menu inicio class="solo-movil" />
      </app-cabecera>

      <section [attr.aria-label]="t('gastos.cuentas')">
        <app-cifra class="cifra-grande" [centimos]="equipo.resumen()?.bote_centimos ?? 0" />
        <p class="nota">{{ t('gastos.en-bote') }}</p>
        <ul class="lista cuentas">
          <li class="fila">
            <span class="fila-texto">{{ t('gastos.recaudado') }}</span>
            <app-cifra class="fila-valor" [centimos]="equipo.resumen()?.recaudado_centimos ?? 0" />
          </li>
          <li class="fila">
            <span class="fila-texto">{{ t('gastos.gastado') }}</span>
            <span class="fila-valor"
              >−{{ i18n.euros(equipo.resumen()?.gastado_centimos ?? 0) }}</span
            >
          </li>
          <li class="fila">
            <span class="fila-texto">{{ t('gastos.por-cobrar') }}</span>
            <span class="fila-valor texto-suave">{{
              i18n.euros(equipo.resumen()?.pendiente_cobro_centimos ?? 0)
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
          {{ t('gastos.registrar') }}
        </button>
      }

      <section class="seccion" aria-labelledby="gastos-titulo">
        <h2 id="gastos-titulo">{{ t('gastos.en-que') }}</h2>
        @if (equipo.gastos().length === 0) {
          <p class="estado-vacio">{{ fraseVacia }}</p>
        } @else {
          <ul class="lista">
            @for (gasto of equipo.gastos(); track gasto.id; let i = $index) {
              <li [style.--i]="i">
                @if (equipo.puedeGestionar() && !gasto.anulado) {
                  <button type="button" class="fila" (click)="anular(gasto)">
                    <span class="fila-texto">
                      <span>{{ gasto.concepto }}</span>
                      <span class="fila-detalle">{{ detalle(gasto) }}</span>
                    </span>
                    <span class="fila-valor">−{{ i18n.euros(gasto.importe_centimos) }}</span>
                  </button>
                } @else {
                  <div class="fila" [class.anulado]="gasto.anulado">
                    <span class="fila-texto">
                      <span>{{ gasto.concepto }}</span>
                      <span class="fila-detalle">{{ detalle(gasto) }}</span>
                    </span>
                    @if (gasto.anulado) {
                      <span class="etiqueta">{{ t('comun.anulado') }}</span>
                    }
                    <span class="fila-valor">−{{ i18n.euros(gasto.importe_centimos) }}</span>
                  </div>
                }
              </li>
            }
          </ul>
          @if (equipo.puedeGestionar()) {
            <p class="pie-grupo">{{ t('gastos.anular-pista') }}</p>
          }
        }
      </section>
    </main>
  `,
  styles: `
    .cifra-grande {
      display: block;
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

    .lista > li {
      animation: fila-entra 420ms var(--ease-out) both;
      animation-delay: calc(var(--i, 0) * 35ms);
    }

    @keyframes fila-entra {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
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
  protected readonly i18n = inject(I18n);
  protected readonly t = this.i18n.t;
  protected readonly equipo = inject(EquipoService);
  private readonly acciones = inject(AccionesEquipo);
  private readonly dialogos = inject(DialogosService);
  private readonly avisos = inject(AvisosService);

  protected readonly fraseVacia = this.i18n.frase('gracia.sin-gastos');

  protected detalle(gasto: Gasto): string {
    return [this.i18n.fecha(gasto.fecha), gasto.nota].filter(Boolean).join(' · ');
  }

  protected registrar(): void {
    void this.acciones.registrarGasto();
  }

  protected async anular(gasto: Gasto): Promise<void> {
    const confirmado = await this.dialogos.confirmar({
      titulo: this.t('gastos.anular-titulo'),
      mensaje: this.t('gastos.anular-texto', { concepto: gasto.concepto }),
      aceptar: this.t('comun.anular'),
      peligro: true,
    });
    if (!confirmado) return;
    try {
      await this.equipo.anularGasto(gasto.id);
      this.avisos.mostrar(this.t('gastos.anulado'));
    } catch (e) {
      this.avisos.mostrar(this.i18n.error(e));
    }
  }
}
