import { Clipboard } from '@angular/cdk/clipboard';
import { DOCUMENT } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { mensajeError } from '../../core/supabase/mensaje-error';
import { AvisosService } from '../../shared/avisos/avisos.service';
import { DialogosService } from '../../shared/dialogos/dialogos.service';
import { Icono } from '../../shared/icono';
import { AjustesService } from './ajustes.service';

@Component({
  selector: 'app-invitacion',
  imports: [Icono],
  template: `
    <section class="seccion" aria-labelledby="titulo-invitacion">
      <h2 id="titulo-invitacion">Invitar al equipo</h2>
      <div class="pase">
        <p class="nota">Código de invitación</p>
        <p class="codigo cifra">{{ ajustes.equipo()?.codigo_invitacion }}</p>
        <p class="enlace">{{ enlace() }}</p>
        <div class="acciones">
          <a class="boton boton-principal" [href]="enlaceWhatsapp()" target="_blank" rel="noopener">
            <app-icono nombre="compartir" />
            Compartir por WhatsApp
          </a>
          <button type="button" class="boton boton-secundario" (click)="copiar()">
            <app-icono nombre="copiar" />
            Copiar enlace
          </button>
          @if (puedeCompartir) {
            <button type="button" class="boton boton-secundario" (click)="compartir()">
              Más opciones
            </button>
          }
        </div>
      </div>
      <p class="pie-grupo">
        Quien entre podrá reclamar su ficha al momento o pedir entrar como nuevo (eso lo aceptas
        tú).
      </p>
      <button
        type="button"
        class="boton-enlace boton-enlace--peligro cambiar"
        (click)="regenerar()"
      >
        Cambiar el enlace
      </button>
      <p class="error" role="alert">{{ error() }}</p>
    </section>
  `,
  styles: `
    .pase {
      padding: 16px;
      border-radius: var(--radio);
      background: var(--celda);
    }

    .codigo {
      margin-top: 2px;
      font-size: 34px;
      line-height: 40px;
      font-weight: 700;
      letter-spacing: 0.08em;
    }

    .enlace {
      margin-top: 2px;
      font-size: 13px;
      line-height: 18px;
      color: var(--texto-2);
      overflow-wrap: anywhere;
    }

    .acciones {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 10px;
      margin-top: 16px;
    }

    .cambiar {
      margin: 4px 16px 0;
      font-size: 15px;
    }
  `,
})
export class Invitacion {
  protected readonly ajustes = inject(AjustesService);
  private readonly avisos = inject(AvisosService);
  private readonly dialogos = inject(DialogosService);
  private readonly clipboard = inject(Clipboard);
  private readonly document = inject(DOCUMENT);
  private readonly navegador = this.document.defaultView?.navigator;

  protected readonly puedeCompartir = typeof this.navegador?.share === 'function';
  protected readonly error = signal<string | null>(null);

  protected readonly enlace = computed(
    () => `${this.document.location.origin}/unirse/${this.ajustes.equipo()?.codigo_invitacion}`,
  );
  private readonly mensaje = computed(
    () => `Únete a ${this.ajustes.equipo()?.nombre} en Multak para ver las multas y el bote:`,
  );
  protected readonly enlaceWhatsapp = computed(
    () => `https://wa.me/?text=${encodeURIComponent(`${this.mensaje()} ${this.enlace()}`)}`,
  );

  protected copiar(): void {
    if (this.clipboard.copy(this.enlace())) this.avisos.mostrar('Enlace copiado.');
  }

  protected async compartir(): Promise<void> {
    try {
      await this.navegador?.share({ title: 'Multak', text: this.mensaje(), url: this.enlace() });
    } catch {
      // Cancelar el menú de compartir no es un error.
    }
  }

  protected async regenerar(): Promise<void> {
    const confirmado = await this.dialogos.confirmar({
      titulo: '¿Cambiar el enlace?',
      mensaje:
        'El enlace y el código actuales dejarán de funcionar. Quien ya está en el equipo no se ve afectado.',
      aceptar: 'Cambiar',
      peligro: true,
    });
    if (!confirmado) return;
    this.error.set(null);
    try {
      await this.ajustes.regenerarCodigo();
      this.avisos.mostrar('Enlace nuevo listo. Compártelo.');
    } catch (e) {
      this.error.set(mensajeError(e));
    }
  }
}
