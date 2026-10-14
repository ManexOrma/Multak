import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  signal,
  viewChild,
} from '@angular/core';
import { form, FormField, FormRoot, maxLength, required, validate } from '@angular/forms/signals';
import { mensajeError } from '../../core/supabase/mensaje-error';
import { AvisosService } from '../../shared/avisos/avisos.service';
import { Avatar } from '../../shared/avatar';
import { cerrarHoja } from '../../shared/dialogos/dialogos.service';
import { fechaRelativa, hoyISO } from '../../shared/fechas';
import { Icono } from '../../shared/icono';
import { eurosACentimos } from '../../shared/importe';
import { EurosPipe } from '../../shared/pipes/euros.pipe';
import { EquipoService, Saldo, TipoActivo } from './equipo.service';

type Paso = 'jugador' | 'tipo' | 'libre' | 'confirmar';

interface Motivo {
  tipo: TipoActivo | null;
  concepto: string;
  importeCentimos: number;
}

/** Poner multa en 3 toques: jugador → tipo → confirmar. La acción estrella de Multak. */
@Component({
  selector: 'app-poner-multa',
  imports: [FormRoot, FormField, Avatar, Icono, EurosPipe],
  templateUrl: './poner-multa.html',
  styleUrl: './poner-multa.scss',
})
export class PonerMulta {
  private readonly datos = inject<{ miembroId?: string }>(DIALOG_DATA);
  private readonly ref = inject<DialogRef<boolean>>(DialogRef);
  protected readonly equipo = inject(EquipoService);
  private readonly avisos = inject(AvisosService);
  private readonly injector = inject(Injector);

  protected readonly jugador = signal<Saldo | null>(
    this.equipo.multables().find((m) => m.miembro_id === this.datos.miembroId) ?? null,
  );
  protected readonly paso = signal<Paso>(this.jugador() ? 'tipo' : 'jugador');
  protected readonly motivo = signal<Motivo | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly guardando = signal(false);

  private readonly tarjeta = viewChild<ElementRef<HTMLElement>>('tarjeta');

  /** El primer paso de esta hoja (si el jugador venía elegido, es «tipo»). */
  private readonly primerPaso: Paso = this.paso();
  protected readonly puedeVolver = computed(() => this.paso() !== this.primerPaso);

  protected readonly libreModelo = signal({ concepto: '', importe: '' });
  protected readonly libreForm = form(
    this.libreModelo,
    (campo) => {
      required(campo.concepto, { message: 'Escribe el motivo de la multa.' });
      maxLength(campo.concepto, 60, { message: 'Como mucho 60 caracteres.' });
      required(campo.importe, { message: 'Pon el importe.' });
      validate(campo.importe, ({ value }) =>
        value() && eurosACentimos(value()) === null
          ? { kind: 'importe', message: 'Pon un importe entre 0,01 y 1.000 €, p. ej. 2,50.' }
          : undefined,
      );
    },
    {
      submission: {
        action: async () => {
          const { concepto, importe } = this.libreModelo();
          this.elegirMotivo({
            tipo: null,
            concepto: concepto.trim(),
            importeCentimos: eurosACentimos(importe) ?? 0,
          });
        },
      },
    },
  );

  protected readonly detalleModelo = signal({ fecha: hoyISO(), nota: '' });
  protected readonly fechaTexto = computed(() => fechaRelativa(this.detalleModelo().fecha));
  protected readonly detalleForm = form(
    this.detalleModelo,
    (campo) => {
      required(campo.fecha, { message: 'Elige la fecha.' });
      maxLength(campo.nota, 500, { message: 'Como mucho 500 caracteres.' });
    },
    { submission: { action: () => this.poner() } },
  );

  protected elegirJugador(jugador: Saldo): void {
    this.jugador.set(jugador);
    this.irA('tipo');
  }

  protected elegirTipo(tipo: TipoActivo): void {
    this.elegirMotivo({ tipo, concepto: tipo.nombre, importeCentimos: tipo.importe_centimos });
  }

  protected otraMulta(): void {
    this.irA('libre');
  }

  protected volver(): void {
    const anterior: Record<Paso, Paso> = {
      jugador: 'jugador',
      tipo: 'jugador',
      libre: 'tipo',
      confirmar: this.motivo()?.tipo ? 'tipo' : 'libre',
    };
    this.error.set(null);
    this.irA(anterior[this.paso()]);
  }

  protected cancelar(): void {
    void cerrarHoja(this.ref, false);
  }

  private elegirMotivo(motivo: Motivo): void {
    this.motivo.set(motivo);
    this.irA('confirmar');
  }

  private irA(paso: Paso): void {
    this.paso.set(paso);
    // El foco va al título de cada paso para que el lector de pantalla lo anuncie.
    afterNextRender(
      () => this.ref.overlayRef.overlayElement.querySelector<HTMLElement>('[data-paso]')?.focus(),
      { injector: this.injector },
    );
  }

  private async poner(): Promise<void> {
    const jugador = this.jugador();
    const motivo = this.motivo();
    if (!jugador?.miembro_id || !motivo || this.guardando()) return;
    this.guardando.set(true);
    this.error.set(null);
    const { fecha, nota } = this.detalleModelo();
    try {
      await this.equipo.ponerMulta(
        motivo.tipo
          ? {
              miembroId: jugador.miembro_id,
              tipoId: motivo.tipo.id,
              fecha,
              nota: nota.trim() || null,
            }
          : {
              miembroId: jugador.miembro_id,
              concepto: motivo.concepto,
              importeCentimos: motivo.importeCentimos,
              fecha,
              nota: nota.trim() || null,
            },
      );
      await this.lanzarTarjeta();
      this.avisos.mostrar(`Multa puesta a ${jugador.nombre}.`);
      await cerrarHoja(this.ref, true);
      this.equipo.resaltar(jugador.miembro_id);
    } catch (e) {
      this.error.set(mensajeError(e));
      this.guardando.set(false);
    }
  }

  /** La tarjeta amarilla se levanta, gira un poco y sale volando: «¡multa puesta!». */
  private async lanzarTarjeta(): Promise<void> {
    const tarjeta = this.tarjeta()?.nativeElement;
    const vista = tarjeta?.ownerDocument.defaultView;
    if (!tarjeta || vista?.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    await tarjeta.animate(
      [
        { transform: 'translateY(0) rotate(0) scale(1)' },
        { transform: 'translateY(-14px) rotate(-3deg) scale(1.03)', offset: 0.35 },
        { transform: 'translateY(-110vh) rotate(-12deg) scale(1.03)' },
      ],
      { duration: 620, easing: 'cubic-bezier(0.77, 0, 0.175, 1)', fill: 'forwards' },
    ).finished;
  }
}
