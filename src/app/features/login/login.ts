import {
  afterNextRender,
  Component,
  DestroyRef,
  inject,
  Injector,
  input,
  signal,
} from '@angular/core';
import { email, form, FormField, FormRoot, pattern, required } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/auth/auth.service';
import { Marca } from '../../shared/marca';
import { I18n } from '../../core/i18n/i18n.service';
import { rutaInterna } from '../../core/auth/ruta-interna';

const SEGUNDOS_ENTRE_ENVIOS = 60;

@Component({
  selector: 'app-login',
  imports: [FormRoot, FormField, RouterLink, Marca],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly i18n = inject(I18n);
  protected readonly t = this.i18n.t;
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);

  /** Query param `?volver=`: a dónde ir después de entrar. */
  readonly volver = input<string>();

  protected readonly googleActivo = environment.loginGoogle;
  protected readonly paso = signal<'email' | 'codigo'>('email');
  protected readonly error = signal<string | null>(null);
  protected readonly aviso = signal<string | null>(null);
  protected readonly segundosParaReenviar = signal(0);
  protected readonly reenviando = signal(false);

  protected readonly emailModelo = signal({ email: '' });
  protected readonly emailForm = form(
    this.emailModelo,
    (campo) => {
      required(campo.email, { message: this.t('login.email-requerido') });
      email(campo.email, { message: this.t('login.email-invalido') });
    },
    { submission: { action: () => this.enviarCodigo() } },
  );

  protected readonly codigoModelo = signal({ codigo: '' });
  protected readonly codigoForm = form(
    this.codigoModelo,
    (campo) => {
      required(campo.codigo, { message: this.t('login.codigo-requerido') });
      // Supabase manda 6 u 8 cifras según la configuración del proyecto: valen las dos.
      pattern(campo.codigo, /^\s*\d{6,8}\s*$/, { message: this.t('login.codigo-invalido') });
    },
    { submission: { action: () => this.verificarCodigo() } },
  );

  private temporizador: ReturnType<typeof setInterval> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearInterval(this.temporizador));
  }

  protected async entrarConGoogle(): Promise<void> {
    this.error.set(null);
    try {
      await this.auth.entrarConGoogle(rutaInterna(this.volver()));
    } catch (e) {
      this.error.set(this.i18n.error(e));
    }
  }

  protected async reenviarCodigo(): Promise<void> {
    if (this.segundosParaReenviar() > 0 || this.reenviando()) return;
    this.reenviando.set(true);
    this.error.set(null);
    this.aviso.set(null);
    try {
      await this.auth.enviarCodigo(this.email());
      this.aviso.set(this.t('login.reenviado'));
      this.empezarCuentaAtras();
    } catch (e) {
      this.error.set(this.i18n.error(e));
    } finally {
      this.reenviando.set(false);
    }
  }

  protected usarOtroEmail(): void {
    this.paso.set('email');
    this.error.set(null);
    this.aviso.set(null);
    this.codigoForm().reset({ codigo: '' });
    this.enfocar(() => this.emailForm.email().focusBoundControl());
  }

  protected email(): string {
    return this.emailModelo().email.trim();
  }

  private async enviarCodigo(): Promise<void> {
    this.error.set(null);
    try {
      await this.auth.enviarCodigo(this.email());
      this.paso.set('codigo');
      this.empezarCuentaAtras();
      this.enfocar(() => this.codigoForm.codigo().focusBoundControl());
    } catch (e) {
      this.error.set(this.i18n.error(e));
    }
  }

  private async verificarCodigo(): Promise<void> {
    this.error.set(null);
    this.aviso.set(null);
    try {
      await this.auth.verificarCodigo(this.email(), this.codigoModelo().codigo.replace(/\s/g, ''));
      await this.router.navigateByUrl(rutaInterna(this.volver()));
    } catch (e) {
      this.error.set(this.i18n.error(e));
      this.enfocar(() => this.codigoForm.codigo().focusBoundControl());
    }
  }

  private empezarCuentaAtras(): void {
    clearInterval(this.temporizador);
    this.segundosParaReenviar.set(SEGUNDOS_ENTRE_ENVIOS);
    this.temporizador = setInterval(() => {
      this.segundosParaReenviar.update((s) => s - 1);
      if (this.segundosParaReenviar() <= 0) clearInterval(this.temporizador);
    }, 1000);
  }

  private enfocar(accion: () => void): void {
    afterNextRender(accion, { injector: this.injector });
  }
}
