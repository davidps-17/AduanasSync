/* ══════════════════════════════════════════════════
   Store compartido de trámites
   Sin backend: usa localStorage para que un trámite
   enviado en cualquier formulario (Turista, Importación,
   etc.) aparezca de inmediato en "Actividad Reciente"
   del Dashboard y en su propio detalle.
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

const KEY = 'aduanasync_tramites_v1';
export const EVENTO_ACTUALIZACION = 'aduanasync-tramites-actualizados';

function leerTodos(): TramiteGuardado[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function escribirTodos(tramites: TramiteGuardado[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(tramites));
    window.dispatchEvent(new Event(EVENTO_ACTUALIZACION));
  } catch {
    /* localStorage no disponible (modo privado, etc.) — se pierde el historial silenciosamente */
  }
}

/** Guarda un trámite nuevo, más reciente primero */
export function guardarTramite(t: TramiteGuardado): void {
  const todos = leerTodos();
  escribirTodos([t, ...todos]);
}

/** Lista todos los trámites guardados, opcionalmente filtrados por RUT */
export function listarTramites(rut?: string): TramiteGuardado[] {
  const todos = leerTodos();
  return rut ? todos.filter(t => t.rut === rut) : todos;
}

/** Busca un trámite por su número de folio */
export function obtenerTramite(numero: string): TramiteGuardado | null {
  return leerTodos().find(t => t.numero === numero) ?? null;
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