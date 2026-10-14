import { DialogRef } from '@angular/cdk/dialog';

/** Cierra el menú deslizándolo hacia la izquierda (por donde entró). */
export async function cerrarMenu<R, C>(ref: DialogRef<R, C>): Promise<void> {
  const panel = ref.overlayRef.overlayElement.querySelector<HTMLElement>('.cdk-dialog-container');
  const vista = ref.overlayRef.overlayElement.ownerDocument.defaultView;
  if (panel && !vista?.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    ref.overlayRef.backdropElement?.classList.remove('cdk-overlay-backdrop-showing');
    await panel.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-100%)' }], {
      duration: 260,
      easing: 'cubic-bezier(0.32, 0.72, 0, 1)',
      fill: 'forwards',
    }).finished;
  }
  ref.close();
}
