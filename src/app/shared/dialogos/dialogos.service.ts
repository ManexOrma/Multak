import { Dialog } from '@angular/cdk/dialog';
import { ComponentType } from '@angular/cdk/portal';
import { inject, Injector, Service } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Confirmar, OpcionesConfirmar } from './confirmar';

/** Abre diálogos modales accesibles (foco atrapado, Escape cierra, foco de vuelta al cerrar). */
@Service()
export class DialogosService {
  private readonly dialog = inject(Dialog);

  /**
   * El componente debe tener un título con id `idTitulo`. Resuelve con lo que devuelva al cerrar.
   * Pasa `injector` si el diálogo necesita servicios provistos en el componente que lo abre.
   */
  abrir<R, D>(
    componente: ComponentType<unknown>,
    data: D,
    idTitulo: string,
    injector?: Injector,
  ): Promise<R | undefined> {
    const ref = this.dialog.open<R, D>(componente, {
      data,
      injector,
      ariaLabelledBy: idTitulo,
      panelClass: 'dialogo',
      width: 'calc(100vw - 2rem)',
      maxWidth: '28rem',
      autoFocus: 'first-tabbable',
    });
    return firstValueFrom(ref.closed);
  }

  async confirmar(opciones: OpcionesConfirmar): Promise<boolean> {
    const respuesta = await this.abrir<boolean, OpcionesConfirmar>(
      Confirmar,
      opciones,
      'confirmar-titulo',
    );
    return respuesta === true;
  }
}
