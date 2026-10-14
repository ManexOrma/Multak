import { DOCUMENT } from '@angular/common';
import { computed, inject, Service, signal } from '@angular/core';
import { Session } from '@supabase/supabase-js';
import { SupabaseService } from '../supabase/supabase.service';

/** Sesión y login: código de un solo uso por email (OTP) o Google. */
@Service()
export class AuthService {
  private readonly supabase = inject(SupabaseService).client;
  private readonly document = inject(DOCUMENT);
  private readonly sesionActual = signal<Session | null>(null);
  private readonly sesionInicial: Promise<void>;

  readonly sesion = this.sesionActual.asReadonly();
  readonly usuario = computed(() => this.sesionActual()?.user ?? null);
  readonly haySesion = computed(() => this.sesionActual() !== null);
  /** Nombre que da Google (si entró con Google), para proponerlo en los formularios. */
  readonly nombreSugerido = computed(() => {
    const datos = this.usuario()?.user_metadata ?? {};
    const nombre = datos['full_name'] ?? datos['name'];
    return typeof nombre === 'string' ? nombre : '';
  });

  constructor() {
    this.sesionInicial = new Promise((resolve) => {
      this.supabase.auth.onAuthStateChange((evento, sesion) => {
        this.sesionActual.set(sesion);
        if (evento === 'INITIAL_SESSION') resolve();
      });
    });
  }

  /** Resuelve cuando Supabase ha recuperado (o descartado) la sesión guardada. */
  esperarSesion(): Promise<void> {
    return this.sesionInicial;
  }

  /** Envía un código de 6 cifras al email. Si la cuenta no existe, la crea. */
  async enviarCodigo(email: string): Promise<void> {
    const { error } = await this.supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    if (error) throw error;
  }

  async verificarCodigo(email: string, codigo: string): Promise<void> {
    const { error } = await this.supabase.auth.verifyOtp({ email, token: codigo, type: 'email' });
    if (error) throw error;
  }

  /** Sale hacia Google; al volver, /login recoge la sesión y lleva a `volver`. */
  async entrarConGoogle(volver: string): Promise<void> {
    const redirectTo = new URL('/login', this.document.location.origin);
    redirectTo.searchParams.set('volver', volver);
    const { error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirectTo.toString() },
    });
    if (error) throw error;
  }

  /** Cierra la sesión solo en este dispositivo (la app instalada y el navegador son independientes). */
  async cerrarSesion(): Promise<void> {
    await this.supabase.auth.signOut({ scope: 'local' });
  }
}
