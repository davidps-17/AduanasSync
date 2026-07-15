/* ══════════════════════════════════════════════════
   Store compartido de trámites
   Sin backend: guarda los trámites en MEMORIA (no localStorage),
   así aparecen de inmediato en "Actividad Reciente" del Dashboard
   y en su propio detalle, pero se borran solos al recargar la página
   (comportamiento intencional: es solo para la sesión actual).
══════════════════════════════════════════════════ */

export type EstadoTramite = 'en_proceso' | 'completado' | 'alerta' | 'pendiente';

export interface PasoTramite {
  label: string;
  completado: boolean;
  fecha: string | null;
  descripcion?: string;
}

export interface TramiteGuardado {
  numero: string;
  tipo: string;
  descripcion: string;
  estado: EstadoTramite;
  fechaIngreso: string;        // YYYY-MM-DD
  fechaActualizacion: string;  // YYYY-MM-DD
  aduana?: string;
  valorUSD?: string;
  imagen?: string;
  imagenAlt?: string;
  documentos: string[];
  pasos: PasoTramite[];
  alerta?: string;
  rut: string;
}

export const EVENTO_ACTUALIZACION = 'aduanasync-tramites-actualizados';

/* Array en memoria: vive mientras la pestaña esté abierta y se reinicia
   solo (vacío) cada vez que se recarga la página. */
let _tramites: TramiteGuardado[] = [];

/** Guarda un trámite nuevo, más reciente primero */
export function guardarTramite(t: TramiteGuardado): void {
  _tramites = [t, ..._tramites];
  window.dispatchEvent(new Event(EVENTO_ACTUALIZACION));
}

/** Lista todos los trámites guardados, opcionalmente filtrados por RUT */
export function listarTramites(rut?: string): TramiteGuardado[] {
  return rut ? _tramites.filter(t => t.rut === rut) : _tramites;
}

/** Busca un trámite por su número de folio */
export function obtenerTramite(numero: string): TramiteGuardado | null {
  return _tramites.find(t => t.numero === numero) ?? null;
}

/** Formatea una fecha YYYY-MM-DD como "Hoy" / "Ayer" / "DD/MM" para listados cortos */
export function formatearFechaCorta(iso: string): string {
  if (!iso) return '—';
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const [y, m, d] = iso.split('-').map(Number);
  const fecha = new Date(y, (m ?? 1) - 1, d ?? 1);
  const diffDias = Math.round((hoy.getTime() - fecha.getTime()) / 86400000);
  if (diffDias === 0) return 'Hoy';
  if (diffDias === 1) return 'Ayer';
  return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}`;
}