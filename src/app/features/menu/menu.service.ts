import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { Overlay } from '@angular/cdk/overlay';
import { inject, Service } from '@angular/core';
import { cerrarMenu } from './cerrar-menu';
import { MenuLateral } from './menu-lateral';

/** Menú lateral: equipos, tema, idioma y sesión. Uno abierto como mucho. */
@Service()
export class MenuService {
  private readonly dialog = inject(Dialog);
  private readonly overlay = inject(Overlay);
  private ref: DialogRef<unknown, MenuLateral> | null = null;

  abrir(equipoActual: string | null = null): void {
    if (this.ref) return;
    const ref = this.dialog.open(MenuLateral, {
      data: { equipoActual },
      panelClass: 'menu-lateral',
      ariaLabelledBy: 'menu-titulo',
      positionStrategy: this.overlay.position().global().left('0').top('0'),
      height: '100dvh',
      width: 'min(86vw, 340px)',
      maxWidth: '100vw',
      autoFocus: 'dialog',
      disableClose: true,
    });
    this.ref = ref;
    ref.backdropClick.subscribe(() => void cerrarMenu(ref));
    ref.keydownEvents.subscribe((evento) => {
      if (evento.key === 'Escape') void cerrarMenu(ref);
    });
    ref.closed.subscribe(() => (this.ref = null));
  }
}
