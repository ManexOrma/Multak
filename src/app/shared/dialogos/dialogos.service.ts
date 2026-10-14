import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { Overlay } from '@angular/cdk/overlay';
import { ComponentType } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import { inject, Injector, Service } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Confirmar, OpcionesConfirmar } from './confirmar';

/** Ancho a partir del cual la hoja se muestra como panel centrado. */
const ANCHO_PANEL = '(min-width: 700px)';

/**
 * Cierra una hoja con la animación de salida (baja por donde entró) y después
 * resuelve el diálogo. Con movimiento reducido, cierra al momento.
 */
export async function cerrarHoja<R>(ref: DialogRef<R>, resultado?: R): Promise<void> {
  const contenedor =
    ref.overlayRef.overlayElement.querySelector<HTMLElement>('.cdk-dialog-container');
  const vista = ref.overlayRef.overlayElement.ownerDocument.defaultView;
  const reducido = vista?.matchMedia('(prefers-reduced-motion: reduce)').matches ?? true;
  const panel = vista?.matchMedia(ANCHO_PANEL).matches ?? false;
  if (contenedor && !reducido) {
    const salida = panel
      ? [{ opacity: 1 }, { opacity: 0, transform: 'scale(0.97)' }]
      : [{ transform: 'translateY(0)' }, { transform: 'translateY(100%)' }];
    ref.overlayRef.backdropElement?.classList.remove('cdk-overlay-backdrop-showing');
    await contenedor.animate(salida, {
      duration: panel ? 160 : 280,
      easing: 'cubic-bezier(0.32, 0.72, 0, 1)',
      fill: 'forwards',
    }).finished;
  }
  ref.close(resultado);
}

/** Abre diálogos y hojas accesibles (foco atrapado, Escape cierra, foco de vuelta al cerrar). */
@Service()
export class DialogosService {
  private readonly dialog = inject(Dialog);
  private readonly overlay = inject(Overlay);
  private readonly document = inject(DOCUMENT);

  /**
   * Diálogo centrado. El componente debe tener un título con id `idTitulo`.
   * Pasa `injector` si necesita servicios provistos en el componente que lo abre.
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
      width: 'calc(100vw - 3rem)',
      maxWidth: '20rem',
      autoFocus: 'first-tabbable',
    });
    return firstValueFrom(ref.closed);
  }

  /**
   * Hoja que sube desde abajo en el móvil (panel centrado en pantallas anchas).
   * El componente cierra con `cerrarHoja(ref, resultado)` para animar la salida.
   */
  abrirHoja<R, D>(
    componente: ComponentType<unknown>,
    data: D,
    idTitulo: string,
    injector?: Injector,
  ): Promise<R | undefined> {
    const panel = this.document.defaultView?.matchMedia(ANCHO_PANEL).matches ?? false;
    const posicion = this.overlay.position().global().centerHorizontally();
    const ref = this.dialog.open<R, D>(componente, {
      data,
      injector,
      ariaLabelledBy: idTitulo,
      panelClass: 'hoja',
      width: panel ? '30rem' : '100%',
      maxWidth: panel ? 'calc(100vw - 2rem)' : '100vw',
      positionStrategy: panel ? posicion.centerVertically() : posicion.bottom('0'),
      autoFocus: 'dialog',
      disableClose: true,
    });
    ref.backdropClick.subscribe(() => void cerrarHoja(ref));
    ref.keydownEvents.subscribe((evento) => {
      if (evento.key === 'Escape') void cerrarHoja(ref);
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
