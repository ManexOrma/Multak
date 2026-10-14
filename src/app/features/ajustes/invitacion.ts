import { Clipboard } from '@angular/cdk/clipboard';
import { DOCUMENT } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { mensajeError } from '../../core/supabase/mensaje-error';
import { AvisosService } from '../../shared/avisos/avisos.service';
import { DialogosService } from '../../shared/dialogos/dialogos.service';
import { AjustesService } from './ajustes.service';

@Component({
  selector: 'app-invitacion',
  template: `
    <section class="seccion" aria-labelledby="titulo-invitacion">
      <h2 id="titulo-invitacion">Invitar al equipo</h2>
      <p>
        Comparte este enlace en el grupo de WhatsApp. Quien entre podrá reclamar su ficha o pedir
        entrar como nuevo (eso lo aceptas tú).
      </p>

      <p class="enlace">{{ enlace() }}</p>
      <p class="texto-suave">
        Código: <strong class="codigo">{{ ajustes.equipo()?.codigo_invitacion }}</strong>
      </p>

      <div class="acciones">
        <a class="boton boton-principal" [href]="enlaceWhatsapp()" target="_blank" rel="noopener">
          Compartir por WhatsApp
        </a>
        <button type="button" class="boton boton-secundario" (click)="copiar()">
          Copiar enlace
        </button>
        @if (puedeCompartir) {
          <button type="button" class="boton boton-secundario" (click)="compartir()">
            Más opciones…
          </button>
        }
      </div>

      <button type="button" class="boton-enlace" (click)="regenerar()">Cambiar el enlace</button>
      <p class="error" role="alert">{{ error() }}</p>
    </section>
  `,
  styles: `
    .enlace {
      margin: 0;
      padding: 0.75rem;
      border: 2px solid var(--borde);
      border-radius: var(--radio);
      overflow-wrap: anywhere;
      font-family: ui-monospace, monospace;
    }

    .codigo {
      letter-spacing: 0.15em;
    }

    .acciones {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-bottom: 0.5rem;
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
    () => `Únete a ${this.ajustes.equipo()?.nombre} en Multas para ver las multas y el bote:`,
  );
  protected readonly enlaceWhatsapp = computed(
    () => `https://wa.me/?text=${encodeURIComponent(`${this.mensaje()} ${this.enlace()}`)}`,
  );

  protected copiar(): void {
    if (this.clipboard.copy(this.enlace())) this.avisos.mostrar('Enlace copiado.');
  }

  protected async compartir(): Promise<void> {
    try {
      await this.navegador?.share({ title: 'Multas', text: this.mensaje(), url: this.enlace() });
    } catch {
      // Cancelar el menú de compartir no es un error.
    }
  }

  protected async regenerar(): Promise<void> {
    const confirmado = await this.dialogos.confirmar({
      titulo: '¿Cambiar el enlace?',
      mensaje:
        'El enlace y el código actuales dejarán de funcionar. Quien ya está en el equipo no se ve afectado.',
      aceptar: 'Cambiar enlace',
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
