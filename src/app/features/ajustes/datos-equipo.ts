import {
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';
import { form, FormField, FormRoot, maxLength, required } from '@angular/forms/signals';
import { I18n } from '../../core/i18n/i18n.service';
import { FotosService } from '../../core/supabase/fotos.service';
import { AvisosService } from '../../shared/avisos/avisos.service';
import { ColoresKlub, normalizarColores } from '../../core/tema/klub';
import { TemaService } from '../../core/tema/tema.service';
import { Escudo } from '../../shared/escudo';
import { SelectorColor } from '../../shared/selector-color';
import { Icono } from '../../shared/icono';
import { EquiposService } from '../equipos/equipos.service';
import { AjustesService } from './ajustes.service';

/** Nombre, foto y colores del club (solo admin). */
@Component({
  selector: 'app-datos-equipo',
  imports: [FormRoot, FormField, Escudo, Icono, SelectorColor],
  template: `
    <section class="seccion" aria-labelledby="titulo-datos">
      <h2 id="titulo-datos">{{ t('ajustes.datos') }}</h2>

      <div class="foto">
        <app-escudo
          [color]="colores().color"
          [secundario]="colores().secundario"
          [foto]="urlFoto()"
          [tamano]="88"
          [class.subiendo]="subiendo()"
        />
        <div class="foto-acciones">
          <p class="etiqueta-campo">{{ t('ajustes.foto') }}</p>
          <button
            type="button"
            class="boton boton-secundario"
            [disabled]="subiendo()"
            (click)="elegirFoto()"
          >
            <app-icono nombre="camara" />
            {{
              subiendo()
                ? t('ajustes.foto-subiendo')
                : version()
                  ? t('ajustes.foto-cambiar')
                  : t('ajustes.foto-poner')
            }}
          </button>
          @if (version() && !subiendo()) {
            <button type="button" class="boton-enlace boton-enlace--peligro" (click)="quitarFoto()">
              {{ t('ajustes.foto-quitar') }}
            </button>
          }
          <p class="pie-grupo">{{ t('ajustes.foto-ayuda') }}</p>
        </div>
        <input #selector type="file" accept="image/*" hidden (change)="subirFoto($event)" />
      </div>

      <div class="color">
        <app-selector-color
          nombre="color-ajustes"
          ayudaId="color-ayuda"
          [valor]="colores()"
          (valorChange)="cambiarColores($event)"
        />
        <p id="color-ayuda" class="pie-grupo">{{ t('color.ayuda') }}</p>
      </div>

      <form [formRoot]="formulario" class="pila">
        <label for="equipo-nombre">{{ t('equipos.nombre-equipo') }}</label>
        <input
          id="equipo-nombre"
          autocomplete="off"
          [formField]="formulario.nombre"
          [attr.aria-invalid]="formulario.nombre().touched() && formulario.nombre().invalid()"
          aria-describedby="equipo-nombre-error"
        />
        <p id="equipo-nombre-error" class="error-campo">
          @if (formulario.nombre().touched() && formulario.nombre().invalid()) {
            {{ formulario.nombre().errors()[0].message }}
          }
        </p>
        <button type="submit" class="boton boton-secundario" [disabled]="formulario().submitting()">
          {{ t('ajustes.guardar-nombre') }}
        </button>
        <p class="error" role="alert">{{ error() }}</p>
      </form>
    </section>
  `,
  styles: `
    .foto {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;
      padding: 16px;
      border-radius: var(--radio-grupo);
      background: var(--celda);
      box-shadow: var(--sombra-celda);
    }

    .color {
      margin-bottom: 24px;

      .pie-grupo {
        margin-top: 4px;
      }
    }

    .foto-acciones {
      display: grid;
      justify-items: start;
      gap: 6px;

      .etiqueta-campo {
        margin: 0;
      }

      .boton {
        min-height: 40px;
        padding: 0 14px;
        font-size: 15px;
      }

      .boton-enlace {
        min-height: 32px;
        font-size: 15px;
      }

      .pie-grupo {
        margin: 0;
      }
    }

    .subiendo {
      animation: latido 1s var(--ease-in-out) infinite alternate;
    }

    @keyframes latido {
      to {
        opacity: 0.45;
        transform: scale(0.96);
      }
    }
  `,
})
export class DatosEquipo {
  protected readonly i18n = inject(I18n);
  protected readonly t = this.i18n.t;
  protected readonly ajustes = inject(AjustesService);
  private readonly equipos = inject(EquiposService);
  private readonly fotos = inject(FotosService);
  private readonly avisos = inject(AvisosService);
  private readonly selector = viewChild.required<ElementRef<HTMLInputElement>>('selector');

  protected readonly error = signal<string | null>(null);
  protected readonly subiendo = signal(false);
  private readonly tema = inject(TemaService);
  /** Colores en pantalla: los guardados, o los que se están eligiendo. */
  protected readonly colores = linkedSignal(() => {
    const equipo = this.ajustes.equipo();
    return normalizarColores(equipo?.color, equipo?.color_secundario);
  });
  private guardadoPendiente: ReturnType<typeof setTimeout> | undefined;
  protected readonly version = computed(() => this.ajustes.equipo()?.foto_version ?? null);
  protected readonly urlFoto = computed(() => {
    const equipo = this.ajustes.equipo();
    return equipo ? this.fotos.url(equipo.id, equipo.foto_version) : null;
  });

  protected readonly modelo = signal({ nombre: this.ajustes.equipo()?.nombre ?? '' });
  protected readonly formulario = form(
    this.modelo,
    (campo) => {
      required(campo.nombre, { message: this.t('equipos.nombre-equipo-requerido') });
      maxLength(campo.nombre, 60, { message: this.t('comun.max-caracteres', { n: 60 }) });
    },
    { submission: { action: () => this.guardar() } },
  );

  constructor() {
    // Si sales de Ajustes justo después de elegir, se guarda igual.
    inject(DestroyRef).onDestroy(() => {
      if (this.guardadoPendiente) {
        clearTimeout(this.guardadoPendiente);
        void this.guardarColores();
      }
    });
  }

  protected elegirFoto(): void {
    this.selector().nativeElement.click();
  }

  protected async subirFoto(evento: Event): Promise<void> {
    const entrada = evento.target as HTMLInputElement;
    const archivo = entrada.files?.[0];
    entrada.value = '';
    const equipo = this.ajustes.equipo();
    if (!archivo || !equipo) return;
    this.subiendo.set(true);
    this.error.set(null);
    try {
      await this.fotos.subir(equipo.id, archivo, equipo.foto_version);
      await Promise.all([this.ajustes.recargarEquipo(), this.equipos.cargar()]);
      this.avisos.mostrar(this.t('ajustes.foto-lista'));
    } catch {
      this.error.set(this.t('error.foto'));
    } finally {
      this.subiendo.set(false);
    }
  }

  protected async quitarFoto(): Promise<void> {
    const equipo = this.ajustes.equipo();
    if (!equipo) return;
    this.error.set(null);
    try {
      await this.fotos.quitar(equipo.id);
      await Promise.all([this.ajustes.recargarEquipo(), this.equipos.cargar()]);
      this.avisos.mostrar(this.t('ajustes.foto-quitada'));
    } catch (e) {
      this.error.set(this.i18n.error(e));
    }
  }

  /** Se ve al momento; se guarda cuando dejas de tocar colores (sin un aviso por toque). */
  protected cambiarColores(colores: ColoresKlub): void {
    this.colores.set(colores);
    this.tema.ponerKlub(colores.color, colores.secundario);
    clearTimeout(this.guardadoPendiente);
    this.guardadoPendiente = setTimeout(() => void this.guardarColores(), 800);
  }

  private async guardarColores(): Promise<void> {
    this.guardadoPendiente = undefined;
    const { color, secundario } = this.colores();
    const equipo = this.ajustes.equipo();
    if (equipo?.color === color && equipo.color_secundario === secundario) return;
    this.error.set(null);
    try {
      await this.ajustes.cambiarColores(color, secundario);
      await this.equipos.cargar();
      this.avisos.mostrar(this.t('color.guardado'));
    } catch (e) {
      // Vuelve a los colores guardados.
      const guardados = normalizarColores(equipo?.color, equipo?.color_secundario);
      this.colores.set(guardados);
      this.tema.ponerKlub(guardados.color, guardados.secundario);
      this.error.set(this.i18n.error(e));
    }
  }

  private async guardar(): Promise<void> {
    this.error.set(null);
    try {
      await this.ajustes.renombrarEquipo(this.modelo().nombre.trim());
      await this.equipos.cargar();
      this.avisos.mostrar(this.t('ajustes.nombre-guardado'));
    } catch (e) {
      this.error.set(this.i18n.error(e));
    }
  }
}
