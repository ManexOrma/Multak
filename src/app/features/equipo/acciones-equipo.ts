import { inject, Injector, Service, signal } from '@angular/core';
import { DialogosService } from '../../shared/dialogos/dialogos.service';
import { PonerMulta } from './poner-multa';
import { RegistrarGasto } from './registrar-gasto';
import { RegistrarPago } from './registrar-pago';

/**
 * Acciones de tesorero y admin que se abren como hoja desde cualquier pantalla
 * del equipo. Se provee en la estructura del equipo, junto a EquipoService.
 */
@Service({ autoProvided: false })
export class AccionesEquipo {
  private readonly dialogos = inject(DialogosService);
  private readonly injector = inject(Injector);

  /** Jugador en pantalla (su ficha): «Poner multa» lo trae ya elegido. */
  readonly jugadorEnPantalla = signal<string | null>(null);

  /** Poner multa; con `miembroId`, el jugador ya viene elegido (2 toques). */
  ponerMulta(miembroId?: string): Promise<boolean | undefined> {
    return this.dialogos.abrirHoja<boolean, { miembroId?: string }>(
      PonerMulta,
      { miembroId: miembroId ?? this.jugadorEnPantalla() ?? undefined },
      'poner-multa-titulo',
      this.injector,
    );
  }

  registrarPago(miembroId: string): Promise<boolean | undefined> {
    return this.dialogos.abrirHoja<boolean, { miembroId: string }>(
      RegistrarPago,
      { miembroId },
      'registrar-pago-titulo',
      this.injector,
    );
  }

  registrarGasto(): Promise<boolean | undefined> {
    return this.dialogos.abrirHoja<boolean, null>(
      RegistrarGasto,
      null,
      'registrar-gasto-titulo',
      this.injector,
    );
  }
}
