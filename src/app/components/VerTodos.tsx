import { useState } from 'react';
import { Package, PackageCheck, FileText, CreditCard, ClipboardList, Plane, Ship, Truck, ArrowRightLeft, Package2, PenLine, Search, ChevronRight } from 'lucide-react';
import { PageLayout } from './ui/PageLayout';

const TRAMITES = [
  { cat: 'Importaciones',  color: '#1a5276', icon: <Package className="w-5 h-5" />,       label: 'Declaración de Ingreso (DIN)',            sub: 'Pago electrónico de derechos',   vista: 'importaciones' as const },
  { cat: 'Importaciones',  color: '#1a5276', icon: <Package className="w-5 h-5" />,       label: 'Importación Temporal',                    sub: 'Sin pago de arancel temporario', vista: 'importaciones' as const },
  { cat: 'Importaciones',  color: '#1a5276', icon: <Package className="w-5 h-5" />,       label: 'Zona Franca',                             sub: 'Mercancías en zona exenta',      vista: 'importaciones' as const },
  { cat: 'Exportaciones',  color: '#1e8449', icon: <PackageCheck className="w-5 h-5" />,  label: 'Declaración Única de Salida (DUS)',        sub: 'Exportación estándar',            vista: 'exportaciones' as const },
  { cat: 'Exportaciones',  color: '#1e8449', icon: <PackageCheck className="w-5 h-5" />,  label: 'Exportación Simplificada',                sub: 'Sin agente de aduana',            vista: 'exportaciones' as const },
  { cat: 'Exportaciones',  color: '#1e8449', icon: <PackageCheck className="w-5 h-5" />,  label: 'Reintegro de Derechos',                   sub: 'Drawback',                        vista: 'exportaciones' as const },
  { cat: 'Declaraciones',  color: '#6c3483', icon: <FileText className="w-5 h-5" />,      label: 'Declaración de Tránsito Interno (DTI)',   sub: 'Tránsito por territorio nacional', vista: 'transito' as const },
  { cat: 'Declaraciones',  color: '#6c3483', icon: <FileText className="w-5 h-5" />,      label: 'Declaración Única de Salida — IVV',       sub: 'Exportaciones con IVV',            vista: 'exportaciones' as const },
  { cat: 'Declaraciones',  color: '#6c3483', icon: <ArrowRightLeft className="w-5 h-5" />, label: 'Rectificación de Declaración',           sub: 'Corrección de datos',              vista: 'declaraciones' as const },
  { cat: 'Manifiestos',    color: '#0e6db5', icon: <Plane className="w-5 h-5" />,         label: 'Manifiesto Aéreo',                        sub: 'Carga aérea internacional',       vista: 'manifiesto-aereo' as const },
  { cat: 'Manifiestos',    color: '#0e7a6e', icon: <Ship className="w-5 h-5" />,          label: 'Manifiesto Marítimo',                     sub: 'Carga marítima',                  vista: 'manifiesto-maritimo' as const },
  { cat: 'Manifiestos',    color: '#7a5c0e', icon: <Truck className="w-5 h-5" />,         label: 'Manifiesto Terrestre',                    sub: 'Carga por carretera',             vista: 'manifiesto-terrestre' as const },
  { cat: 'Manifiestos',    color: '#5a3a7a', icon: <ArrowRightLeft className="w-5 h-5" />, label: 'Manifiesto Ferroviario',                 sub: 'Carga por ferrocarril',            vista: null },
  { cat: 'Aranceles',      color: '#b7950b', icon: <CreditCard className="w-5 h-5" />,    label: 'Pago de Derechos Ad Valorem',             sub: 'IVA y aranceles',                  vista: 'pago-aranceles' as const },
  { cat: 'Aranceles',      color: '#b7950b', icon: <CreditCard className="w-5 h-5" />,    label: 'Consulta de Deuda Aduanera',              sub: 'Saldos pendientes',                vista: 'pago-aranceles' as const },
  { cat: 'Aranceles',      color: '#b7950b', icon: <CreditCard className="w-5 h-5" />,    label: 'Fraccionamiento de Deuda',                sub: 'Pago en cuotas',                   vista: 'pago-aranceles' as const },
  { cat: 'Certificados',   color: '#c0392b', icon: <ClipboardList className="w-5 h-5" />, label: 'Certificado de Origen',                   sub: 'Para exportaciones',               vista: 'permisos' as const },
  { cat: 'Certificados',   color: '#c0392b', icon: <ClipboardList className="w-5 h-5" />, label: 'Depósito Aduanero',                       sub: 'Autorización de depósito',         vista: 'permisos' as const },
  { cat: 'Certificados',   color: '#c0392b', icon: <ClipboardList className="w-5 h-5" />, label: 'Visación de Documentos',                  sub: 'Certificación oficial',            vista: 'permisos' as const },
  { cat: 'Operador',       color: '#374151', icon: <Package2 className="w-5 h-5" />,      label: 'Ingreso a SIGES',                         sub: 'Sistema de gestión',               vista: 'operador-comercio' as const },
  { cat: 'Operador',       color: '#374151', icon: <PenLine className="w-5 h-5" />,       label: 'Firma Electrónica',                       sub: 'Certificación digital',            vista: 'operador-comercio' as const },
  { cat: 'Operador',       color: '#374151', icon: <ClipboardList className="w-5 h-5" />, label: 'Inscripción de Productos',                sub: 'Registro de mercancías',           vista: 'operador-comercio' as const },
];

const CATS = ['Todos', 'Importaciones', 'Exportaciones', 'Declaraciones', 'Manifiestos', 'Aranceles', 'Certificados', 'Operador'];

interface Props { rut: string; onVolver: () => void; onSeleccionar: (vista: string) => void }

export function VerTodos({ rut, onVolver, onSeleccionar }: Props) {
  const [cat, setCat] = useState('Todos');
  const [q, setQ] = useState('');
  const [aviso, setAviso] = useState('');

  const seleccionar = (t: typeof TRAMITES[number]) => {
    if (t.vista) { onSeleccionar(t.vista); return; }
    setAviso(`"${t.label}" estará disponible próximamente.`);
    setTimeout(() => setAviso(''), 3000);
  };

  const lista = TRAMITES.filter(t => {
    const matchCat = cat === 'Todos' || t.cat === cat;
    const matchQ = !q || t.label.toLowerCase().includes(q.toLowerCase()) || t.sub.toLowerCase().includes(q.toLowerCase());
    return matchCat && matchQ;
  });

  return (
    <PageLayout titulo="Todos los Trámites en Línea" subtitulo={`${TRAMITES.length} trámites disponibles`} rut={rut} onVolver={onVolver}>
      {/* Búsqueda + filtros */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar trámite…"
            className="w-full pl-10 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a5276]/20 focus:border-[#1a5276]" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={`px-3 py-1 rounded-full text-xs border transition-all ${cat === c ? 'bg-[#1a5276] text-white border-[#1a5276]' : 'border-gray-200 text-gray-500 hover:border-[#1a5276] hover:text-[#1a5276]'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-4"><strong className="text-gray-600">{lista.length}</strong> trámites</p>

      {aviso && (
        <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl px-4 py-2.5">
          {aviso}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {lista.map(t => (
          <button key={t.label} onClick={() => seleccionar(t)} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 hover:border-gray-200 hover:shadow transition-all text-left group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: t.color + '15', color: t.color }}>
              {t.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-700 group-hover:text-[#1a5276] transition-colors truncate">{t.label}</p>
              <p className="text-[10px] text-gray-400 truncate">{t.sub}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#1a5276] flex-shrink-0 transition-colors" />
          </button>
        ))}
      </div>
    </PageLayout>
  );
}