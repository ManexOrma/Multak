import { Component, inject, Injector } from '@angular/core';
import { TipoMulta } from '../../core/models/modelos';
import { DialogosService } from '../../shared/dialogos/dialogos.service';
import { EurosPipe } from '../../shared/pipes/euros.pipe';
import { AjustesService } from './ajustes.service';
import { TipoDialogo } from './tipo-dialogo';

@Component({
  selector: 'app-catalogo',
  imports: [EurosPipe],
  template: `
    <section class="seccion" aria-labelledby="titulo-catalogo">
      <h2 id="titulo-catalogo">Catálogo de multas</h2>

      @if (ajustes.tipos().length === 0) {
        <p class="estado-vacio">Aún no hay tipos de multa. Añade el primero.</p>
      } @else {
        <ul class="lista">
          @for (tipo of ajustes.tipos(); track tipo.id) {
            <li>
              <button type="button" class="fila" (click)="editar(tipo)">
                <span [class.texto-suave]="!tipo.activo">{{ tipo.nombre }}</span>
                <span class="derecha">
                  @if (!tipo.activo) {
                    <span class="etiqueta">Desactivado</span>
                  }
                  <strong>{{ tipo.importe_centimos | euros }}</strong>
                  <span aria-hidden="true">›</span>
                </span>
              </button>
            </li>
          }
        </ul>
      }

      <p>
        <button type="button" class="boton boton-secundario" (click)="editar(null)">
          Añadir tipo de multa
        </button>
      </p>
    </section>
  `,
  styles: `
    .derecha {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      white-space: nowrap;
    }
  `,
})
export class Catalogo {
  protected readonly ajustes = inject(AjustesService);
  private readonly dialogos = inject(DialogosService);
  private readonly injector = inject(Injector);

  protected editar(tipo: TipoMulta | null): void {
    void this.dialogos.abrir<void, TipoMulta | null>(
      TipoDialogo,
      tipo,
      'tipo-dialogo-titulo',
      this.injector,
    );
  }
}
