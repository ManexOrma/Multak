import { Component, computed, inject, signal } from '@angular/core';
import { Cabecera } from '../../shared/cabecera';
import { fechaRelativa } from '../../shared/fechas';
import { EurosPipe } from '../../shared/pipes/euros.pipe';
import { EquipoService, Multa } from './equipo.service';
import { FilaMulta } from './fila-multa';

interface GrupoDia {
  fecha: string;
  titulo: string;
  multas: Multa[];
}

/** Historial de multas del equipo, por días y filtrable por jugador. */
@Component({
  selector: 'app-historial-multas',
  imports: [Cabecera, EurosPipe, FilaMulta],
  template: `
    <main class="pagina">
      <app-cabecera titulo="Multas" />

      <div class="filtros" role="group" aria-label="Filtrar por jugador">
        <button
          type="button"
          class="chip"
          [attr.aria-pressed]="filtro() === null"
          (click)="filtro.set(null)"
        >
          Todos
        </button>
        @for (saldo of equipo.saldos(); track saldo.miembro_id) {
          <button
            type="button"
            class="chip"
            [attr.aria-pressed]="filtro() === saldo.miembro_id"
            (click)="filtro.set(saldo.miembro_id)"
          >
            {{ saldo.nombre }}
          </button>
        }
      </div>

      <p class="total nota" aria-live="polite">
        {{ cuenta() === 1 ? '1 multa' : cuenta() + ' multas' }} · {{ totalVigente() | euros }} sin
        contar las anuladas
      </p>

      @for (grupo of grupos(); track grupo.fecha) {
        <section class="dia" [attr.aria-label]="grupo.titulo">
          <h2 class="nota">{{ grupo.titulo }}</h2>
          <ul class="lista lista--avatares">
            @for (multa of grupo.multas; track multa.id) {
              <li><app-fila-multa [multa]="multa" [conFecha]="false" /></li>
            }
          </ul>
        </section>
      } @empty {
        <p class="estado-vacio">
          @if (filtro()) {
            Ninguna multa para este jugador. Por ahora.
          } @else {
            Aún no hay multas. Pon la primera.
          }
        </p>
      }

      @if (equipo.puedeGestionar() && cuenta() > 0) {
        <p class="pie-grupo">Toca una multa para anularla. Se quedará tachada, no se borra.</p>
      }
    </main>
  `,
  styles: `
    .filtros {
      display: flex;
      gap: 8px;
      margin: 0 -16px 12px;
      padding: 2px 16px 6px;
      overflow-x: auto;
      scroll-snap-type: x proximity;
      scrollbar-width: none;

      &::-webkit-scrollbar {
        display: none;
      }
    }

    .chip {
      flex-shrink: 0;
      min-height: 36px;
      padding: 0 14px;
      font: inherit;
      font-size: 15px;
      font-weight: 500;
      border: 0;
      border-radius: 18px;
      background: var(--celda);
      color: var(--texto);
      scroll-snap-align: start;
      cursor: pointer;
      transition:
        background-color 140ms var(--ease-out),
        color 140ms var(--ease-out),
        transform 140ms var(--ease-out);

      &:active {
        transform: scale(0.96);
      }

      &[aria-pressed='true'] {
        background: var(--texto);
        color: var(--fondo);
      }
    }

    .total {
      margin: 0 4px 16px;
    }

    .dia {
      margin-bottom: 20px;

      h2 {
        margin: 0 16px 6px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.02em;
      }
    }
  `,
})
export class HistorialMultas {
  protected readonly equipo = inject(EquipoService);
  protected readonly filtro = signal<string | null>(null);

  private readonly filtradas = computed(() => {
    const filtro = this.filtro();
    const multas = this.equipo.multas();
    return filtro ? multas.filter((m) => m.miembro_id === filtro) : multas;
  });

  protected readonly cuenta = computed(() => this.filtradas().length);
  protected readonly totalVigente = computed(() =>
    this.filtradas()
      .filter((m) => !m.anulada)
      .reduce((total, m) => total + m.importe_centimos, 0),
  );

  protected readonly grupos = computed(() => {
    const grupos: GrupoDia[] = [];
    for (const multa of this.filtradas()) {
      const ultimo = grupos.at(-1);
      if (ultimo?.fecha === multa.fecha) ultimo.multas.push(multa);
      else grupos.push({ fecha: multa.fecha, titulo: fechaRelativa(multa.fecha), multas: [multa] });
    }
    return grupos;
  });
}
