import { Component, inject, Injector } from '@angular/core';
import { TipoMulta } from '../../core/models/modelos';
import { DialogosService } from '../../shared/dialogos/dialogos.service';
import { Icono } from '../../shared/icono';
import { I18n } from '../../core/i18n/i18n.service';
import { AjustesService } from './ajustes.service';
import { TipoDialogo } from './tipo-dialogo';

@Component({
  selector: 'app-catalogo',
  imports: [Icono],
  template: `
    <section class="seccion" aria-labelledby="titulo-catalogo">
      <h2 id="titulo-catalogo">{{ t('ajustes.catalogo') }}</h2>

      <ul class="lista">
        @for (tipo of ajustes.tipos(); track tipo.id) {
          <li>
            <button type="button" class="fila" (click)="editar(tipo)">
              <span class="fila-texto" [class.texto-suave]="!tipo.activo">
                <span>{{ tipo.nombre }}</span>
                @if (!tipo.activo) {
                  <span class="fila-detalle">{{ t('ajustes.tipo-desactivado') }}</span>
                }
              </span>
              <span class="fila-valor" [class.texto-suave]="!tipo.activo">
                {{ i18n.euros(tipo.importe_centimos) }}
              </span>
              <app-icono class="chevron" nombre="chevron-derecha" [grosor]="2.5" />
            </button>
          </li>
        } @empty {
          <li class="vacio">{{ t('ajustes.catalogo-vacio') }}</li>
        }
        <li>
          <button type="button" class="fila nuevo" (click)="editar(null)">
            <app-icono nombre="mas" />
            <span class="fila-texto">{{ t('ajustes.anadir-tipo') }}</span>
          </button>
        </li>
      </ul>
      <p class="pie-grupo">{{ t('ajustes.catalogo-pie') }}</p>
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
  protected readonly i18n = inject(I18n);
  protected readonly t = this.i18n.t;
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
