import { Component, inject, Injector } from '@angular/core';
import { TipoMulta } from '../../core/models/modelos';
import { DialogosService } from '../../shared/dialogos/dialogos.service';
import { Icono } from '../../shared/icono';
import { EurosPipe } from '../../shared/pipes/euros.pipe';
import { AjustesService } from './ajustes.service';
import { TipoDialogo } from './tipo-dialogo';

@Component({
  selector: 'app-catalogo',
  imports: [EurosPipe, Icono],
  template: `
    <section class="seccion" aria-labelledby="titulo-catalogo">
      <h2 id="titulo-catalogo">Catálogo de multas</h2>

      <ul class="lista">
        @for (tipo of ajustes.tipos(); track tipo.id) {
          <li>
            <button type="button" class="fila" (click)="editar(tipo)">
              <span class="fila-texto" [class.texto-suave]="!tipo.activo">
                <span>{{ tipo.nombre }}</span>
                @if (!tipo.activo) {
                  <span class="fila-detalle">Desactivado: no sale al poner multas</span>
                }
              </span>
              <span class="fila-valor" [class.texto-suave]="!tipo.activo">
                {{ tipo.importe_centimos | euros }}
              </span>
              <app-icono class="chevron" nombre="chevron-derecha" [grosor]="2.5" />
            </button>
          </li>
        } @empty {
          <li class="vacio">Aún no hay tipos de multa. Añade el primero.</li>
        }
        <li>
          <button type="button" class="fila nuevo" (click)="editar(null)">
            <app-icono nombre="mas" />
            <span class="fila-texto">Añadir tipo de multa</span>
          </button>
        </li>
      </ul>
      <p class="pie-grupo">Cambiar un importe no afecta a las multas ya puestas.</p>
    </section>
  `,
  styles: `
    .nuevo {
      color: var(--tinte);

      app-icono {
        width: 22px;
        height: 22px;
      }
    }

    .vacio {
      padding: 16px;
      color: var(--texto-2);
    }
  `,
})
export class Catalogo {
  protected readonly ajustes = inject(AjustesService);
  private readonly dialogos = inject(DialogosService);
  private readonly injector = inject(Injector);

  protected editar(tipo: TipoMulta | null): void {
    void this.dialogos.abrirHoja<void, TipoMulta | null>(
      TipoDialogo,
      tipo,
      'tipo-dialogo-titulo',
      this.injector,
    );
  }
}
