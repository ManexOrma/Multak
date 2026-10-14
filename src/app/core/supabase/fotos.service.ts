import { inject, Service, signal } from '@angular/core';
import { exigir } from './mensaje-error';
import { SupabaseService } from './supabase.service';

const BUCKET = 'equipos';
const LADO = 1080; // nítida a todo lo ancho en la portada (pantallas 3x)
const VALIDEZ_S = 60 * 60;

const ruta = (equipoId: string) => `${equipoId}/foto.jpg`;

/**
 * Fotos de equipo en Storage (bucket privado: solo los miembros las ven).
 * Las URL firmadas se guardan por equipo y versión para no pedirlas en cada pantalla.
 */
@Service()
export class FotosService {
  private readonly supabase = inject(SupabaseService).client;
  private readonly urls = signal<ReadonlyMap<string, string>>(new Map());
  private readonly pedidas = new Set<string>();

  /** URL de la foto (o null mientras se pide o si no hay). Reactiva. */
  url(equipoId: string, version: number | null | undefined): string | null {
    if (!version) return null;
    const clave = `${equipoId}:${version}`;
    const url = this.urls().get(clave);
    if (!url && !this.pedidas.has(clave)) {
      this.pedidas.add(clave);
      void this.pedir(equipoId, clave);
    }
    return url ?? null;
  }

  /** Reduce la imagen a 1080×1080 (recorte centrado, JPEG) y la sube. Devuelve la nueva versión. */
  async subir(equipoId: string, archivo: File, versionActual: number | null): Promise<number> {
    const imagen = await reducir(archivo);
    exigir(
      await this.supabase.storage
        .from(BUCKET)
        .upload(ruta(equipoId), imagen, { upsert: true, contentType: 'image/jpeg' }),
    );
    const version = (versionActual ?? 0) + 1;
    await this.marcarVersion(equipoId, version);
    return version;
  }

  async quitar(equipoId: string): Promise<void> {
    exigir(await this.supabase.storage.from(BUCKET).remove([ruta(equipoId)]));
    await this.marcarVersion(equipoId, null);
  }

  private async marcarVersion(equipoId: string, version: number | null): Promise<void> {
    const filas = exigir(
      await this.supabase
        .from('equipos')
        .update({ foto_version: version })
        .eq('id', equipoId)
        .select('id'),
    );
    if (filas.length === 0) throw { code: '42501', message: '' };
  }

  private async pedir(equipoId: string, clave: string): Promise<void> {
    const { data } = await this.supabase.storage
      .from(BUCKET)
      .createSignedUrl(ruta(equipoId), VALIDEZ_S);
    if (data?.signedUrl) {
      this.urls.update((mapa) => new Map(mapa).set(clave, data.signedUrl));
    }
  }
}

/** Recorte cuadrado centrado a LADO px, en JPEG. */
async function reducir(archivo: File): Promise<Blob> {
  const bitmap = await createImageBitmap(archivo);
  const lado = Math.min(bitmap.width, bitmap.height);
  const lienzo = document.createElement('canvas');
  lienzo.width = LADO;
  lienzo.height = LADO;
  const contexto = lienzo.getContext('2d');
  if (!contexto) throw new Error('canvas');
  contexto.drawImage(
    bitmap,
    (bitmap.width - lado) / 2,
    (bitmap.height - lado) / 2,
    lado,
    lado,
    0,
    0,
    LADO,
    LADO,
  );
  bitmap.close();
  return new Promise((resolver, rechazar) =>
    lienzo.toBlob(
      (blob) => (blob ? resolver(blob) : rechazar(new Error('toBlob'))),
      'image/jpeg',
      0.82,
    ),
  );
}
