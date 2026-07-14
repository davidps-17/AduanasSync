import { useState } from 'react';
import { Search, ChevronRight, Clock, CheckCircle2, AlertTriangle, CreditCard } from 'lucide-react';
import { PageLayout } from './ui/PageLayout';

type EstadoKey = 'en_proceso' | 'completado' | 'alerta' | 'pendiente';

const estadoConfig: Record<EstadoKey, { label: string; dot: string; textColor: string; icon: JSX.Element }> = {
  en_proceso: { label: 'En proceso',        dot: 'bg-blue-500',  textColor: 'text-blue-600',  icon: <Clock className="w-3.5 h-3.5" /> },
  completado: { label: 'Completado',        dot: 'bg-green-500', textColor: 'text-green-600', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  alerta:     { label: 'Requiere atención', dot: 'bg-red-500',   textColor: 'text-red-600',   icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  pendiente:  { label: 'Pendiente de pago', dot: 'bg-amber-500', textColor: 'text-amber-600',  icon: <CreditCard className="w-3.5 h-3.5" /> },
};

export interface ItemActividad { num: string; tipo: string; estado: EstadoKey; fecha: string }

interface Props {
  rut: string;
  actividad: ItemActividad[];
  onVerDetalle: (numero: string) => void;
  onVolver: () => void;
}

const FILTROS: { key: 'todos' | EstadoKey; label: string }[] = [
  { key: 'todos',      label: 'Todos' },
  { key: 'en_proceso', label: 'En proceso' },
  { key: 'completado', label: 'Completados' },
  { key: 'alerta',     label: 'Requieren atención' },
  { key: 'pendiente',  label: 'Pendientes de pago' },
];

export function TodaActividad({ rut, actividad, onVerDetalle, onVolver }: Props) {
  const [q, setQ] = useState('');
  const [filtro, setFiltro] = useState<'todos' | EstadoKey>('todos');

  const lista = actividad.filter(a => {
    const matchFiltro = filtro === 'todos' || a.estado === filtro;
    const matchQ = !q || a.num.toLowerCase().includes(q.toLowerCase()) || a.tipo.toLowerCase().includes(q.toLowerCase());
    return matchFiltro && matchQ;
  });

  return (
    <PageLayout titulo="Mis Trámites" subtitulo={`${actividad.length} trámites en total`} rut={rut} onVolver={onVolver}>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por folio o tipo de trámite…"
            className="w-full pl-10 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a5276]/20 focus:border-[#1a5276]" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {FILTROS.map(f => (
            <button key={f.key} onClick={() => setFiltro(f.key)}
              className={`px-3 py-1 rounded-full text-xs border transition-all ${filtro === f.key ? 'bg-[#1a5276] text-white border-[#1a5276]' : 'border-gray-200 text-gray-500 hover:border-[#1a5276] hover:text-[#1a5276]'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-4"><strong className="text-gray-600">{lista.length}</strong> resultado(s)</p>

      {lista.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-sm text-gray-400">
          No se encontraron trámites con ese filtro.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
          {lista.map(a => {
            const cfg = estadoConfig[a.estado];
            return (
              <button key={a.num} onClick={() => onVerDetalle(a.num)}
                className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left group">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-mono text-gray-700 group-hover:text-[#1a5276] transition-colors">{a.num}</p>
                  <p className="text-xs text-gray-400">{a.tipo}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[11px] text-gray-400 mb-0.5">{a.fecha}</p>
                  <p className={`text-[11px] font-medium flex items-center gap-1 justify-end ${cfg.textColor}`}>
                    {cfg.icon} {cfg.label}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#1a5276] flex-shrink-0 transition-colors" />
              </button>
            );
          })}
        </div>
      )}
    </PageLayout>
  );
}