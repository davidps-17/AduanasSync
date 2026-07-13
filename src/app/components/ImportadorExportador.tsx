import { useState } from 'react';
import { Search, Building2, Package, PackageCheck, CheckCircle2, XCircle, AlertCircle, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { PageLayout } from './ui/PageLayout';

type TipoOperador = 'Importador' | 'Exportador' | 'Ambos' | 'Agente de Aduana';

interface Operador {
  rut: string; razonSocial: string; tipo: TipoOperador; region: string;
  giro: string; estado: 'activo' | 'suspendido' | 'inhabilitado';
  fechaInscripcion: string; volumenAnual: string; operacionesUltAno: number;
  rubros: string[];
}

const OPERADORES: Operador[] = [
  { rut: '76.123.456-7', razonSocial: 'Comercializadora del Pacífico SpA', tipo: 'Ambos', region: 'Metropolitana',
    giro: 'Importación y exportación de productos mineros y químicos', estado: 'activo',
    fechaInscripcion: '2015-03-12', volumenAnual: 'USD 45M', operacionesUltAno: 342,
    rubros: ['Minería', 'Química', 'Manufactura'],
  },
  { rut: '79.456.789-K', razonSocial: 'Frutas y Derivados del Sur S.A.', tipo: 'Exportador', region: 'O\'Higgins',
    giro: 'Exportación de frutas frescas, congeladas y derivados agrícolas', estado: 'activo',
    fechaInscripcion: '2008-07-21', volumenAnual: 'USD 120M', operacionesUltAno: 890,
    rubros: ['Agricultura', 'Alimentos', 'Fruticultura'],
  },
  { rut: '77.891.234-5', razonSocial: 'Importaciones Tecnológicas ANDES Ltda.', tipo: 'Importador', region: 'Metropolitana',
    giro: 'Importación de equipos electrónicos, TI y telecomunicaciones', estado: 'activo',
    fechaInscripcion: '2012-11-08', volumenAnual: 'USD 22M', operacionesUltAno: 215,
    rubros: ['Electrónica', 'Tecnología', 'TI'],
  },
  { rut: '80.234.567-3', razonSocial: 'Viña Exportadora del Valle Central S.A.', tipo: 'Exportador', region: 'Maule',
    giro: 'Exportación de vinos, piscos y bebidas alcohólicas', estado: 'activo',
    fechaInscripcion: '1998-04-30', volumenAnual: 'USD 78M', operacionesUltAno: 460,
    rubros: ['Vitivinicultura', 'Alimentos y Bebidas'],
  },
  { rut: '76.567.890-1', razonSocial: 'Agencias Marítimas Pacífico Norte Ltda.', tipo: 'Agente de Aduana', region: 'Tarapacá',
    giro: 'Agencia de aduana y logística internacional', estado: 'activo',
    fechaInscripcion: '2003-09-15', volumenAnual: '—', operacionesUltAno: 1240,
    rubros: ['Logística', 'Agencia de Aduana'],
  },
  { rut: '78.345.678-9', razonSocial: 'Cobre y Metales del Norte S.A.', tipo: 'Exportador', region: 'Antofagasta',
    giro: 'Exportación de cobre refinado, concentrado y subproductos mineros', estado: 'activo',
    fechaInscripcion: '2001-02-14', volumenAnual: 'USD 890M', operacionesUltAno: 156,
    rubros: ['Minería', 'Metalurgia'],
  },
  { rut: '79.012.345-6', razonSocial: 'Textiles Globales Chile SpA', tipo: 'Importador', region: 'Valparaíso',
    giro: 'Importación de telas, confecciones y accesorios textiles', estado: 'suspendido',
    fechaInscripcion: '2017-06-22', volumenAnual: 'USD 8M', operacionesUltAno: 0,
    rubros: ['Textil', 'Confección'],
  },
  { rut: '77.678.901-4', razonSocial: 'Salmonera Bio Bio Exports Ltda.', tipo: 'Exportador', region: 'Los Lagos',
    giro: 'Exportación de salmón fresco, congelado y ahumado', estado: 'activo',
    fechaInscripcion: '2005-11-30', volumenAnual: 'USD 210M', operacionesUltAno: 678,
    rubros: ['Pesca', 'Acuicultura', 'Alimentos'],
  },
];

const REGIONES = ['Todas', 'Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Metropolitana', 'Valparaíso', 'O\'Higgins', 'Maule', 'Biobío', 'Los Lagos'];
const TIPOS: (TipoOperador | 'Todos')[] = ['Todos', 'Importador', 'Exportador', 'Ambos', 'Agente de Aduana'];

const estadoBadge: Record<string, string> = {
  activo:       'bg-green-100 text-green-700 border-green-200',
  suspendido:   'bg-amber-100 text-amber-700 border-amber-200',
  inhabilitado: 'bg-red-100 text-red-700 border-red-200',
};
const tipoIcon: Record<TipoOperador, React.ReactNode> = {
  'Importador':      <Package className="w-4 h-4" />,
  'Exportador':      <PackageCheck className="w-4 h-4" />,
  'Ambos':           <><Package className="w-4 h-4" /><PackageCheck className="w-4 h-4" /></>,
  'Agente de Aduana':<Building2 className="w-4 h-4" />,
};

interface Props { rut: string; onVolver: () => void }

export function ImportadorExportador({ rut, onVolver }: Props) {
  const [q, setQ]           = useState('');
  const [tipo, setTipo]     = useState<TipoOperador | 'Todos'>('Todos');
  const [region, setRegion] = useState('Todas');
  const [estadoF, setEstadoF] = useState<'todos' | 'activo' | 'suspendido'>('todos');
  const [abierto, setAbierto] = useState<string | null>(null);
  const [busquedaRut, setBusquedaRut] = useState('');

  const lista = OPERADORES.filter(o => {
    const matchQ   = !q || o.razonSocial.toLowerCase().includes(q.toLowerCase()) || o.rut.includes(q) || o.giro.toLowerCase().includes(q.toLowerCase());
    const matchT   = tipo === 'Todos' || o.tipo === tipo;
    const matchR   = region === 'Todas' || o.region === region;
    const matchE   = estadoF === 'todos' || o.estado === estadoF;
    return matchQ && matchT && matchR && matchE;
  });

  const activos = OPERADORES.filter(o => o.estado === 'activo').length;

  return (
    <PageLayout titulo="Registro de Importadores y Exportadores" subtitulo="Registro Nacional de Operadores de Comercio Exterior de Chile" rut={rut} onVolver={onVolver}>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Operadores activos', val: activos,                                                  cls: 'bg-green-50 border-green-200 text-green-700' },
          { label: 'Importadores',       val: OPERADORES.filter(o => o.tipo === 'Importador' || o.tipo === 'Ambos').length, cls: 'bg-blue-50 border-blue-200 text-blue-700' },
          { label: 'Exportadores',       val: OPERADORES.filter(o => o.tipo === 'Exportador' || o.tipo === 'Ambos').length, cls: 'bg-[#1a5276]/10 border-[#1a5276]/20 text-[#1a5276]' },
          { label: 'Agentes de Aduana', val: OPERADORES.filter(o => o.tipo === 'Agente de Aduana').length, cls: 'bg-purple-50 border-purple-200 text-purple-700' },
        ].map(m => (
          <div key={m.label} className={`border rounded-2xl p-4 text-center ${m.cls}`}>
            <p className="text-2xl font-bold">{m.val}</p>
            <p className="text-xs mt-1 opacity-80">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por razón social, RUT o giro…"
            className="w-full pl-10 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a5276]/20 focus:border-[#1a5276]" />
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
          {TIPOS.map(t => (
            <button key={t} onClick={() => setTipo(t)}
              className={`px-3 py-1.5 rounded-full text-xs border font-medium transition-all ${tipo === t ? 'bg-[#1a5276] text-white border-[#1a5276]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
              {t}
            </button>
          ))}
          <select value={region} onChange={e => setRegion(e.target.value)}
            className="px-3 py-1.5 rounded-full text-xs border border-gray-200 text-gray-500 bg-white focus:outline-none">
            {REGIONES.map(r => <option key={r}>{r}</option>)}
          </select>
          <select value={estadoF} onChange={e => setEstadoF(e.target.value as typeof estadoF)}
            className="px-3 py-1.5 rounded-full text-xs border border-gray-200 text-gray-500 bg-white focus:outline-none">
            <option value="todos">Estado: Todos</option>
            <option value="activo">Activo</option>
            <option value="suspendido">Suspendido</option>
          </select>
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-4"><strong className="text-gray-600">{lista.length}</strong> operadores encontrados</p>

      {/* Lista */}
      <div className="space-y-2">
        {lista.map(o => (
          <div key={o.rut} className={`bg-white rounded-2xl border overflow-hidden transition-all ${abierto === o.rut ? 'border-[#1a5276]/30 shadow-sm' : 'border-gray-100 hover:border-gray-200'}`}>
            <button onClick={() => setAbierto(abierto === o.rut ? null : o.rut)}
              className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50/50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#1a5276]/8 flex items-center justify-center text-[#1a5276] flex-shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className={`text-[10px] font-semibold border rounded-full px-2 py-0.5 ${estadoBadge[o.estado]}`}>
                    {o.estado === 'activo' ? '● Activo' : o.estado === 'suspendido' ? '⚠ Suspendido' : '✕ Inhabilitado'}
                  </span>
                  <span className="text-[10px] font-medium bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 flex items-center gap-1">
                    {o.tipo}
                  </span>
                  <span className="text-[10px] text-gray-400">{o.region}</span>
                </div>
                <p className="text-sm font-semibold text-gray-800 truncate">{o.razonSocial}</p>
                <p className="text-[10px] text-gray-400 font-mono">RUT: {o.rut}</p>
              </div>
              <div className="text-right hidden sm:block flex-shrink-0">
                <p className="text-xs font-bold text-[#1a5276]">{o.volumenAnual}</p>
                <p className="text-[10px] text-gray-400">vol. anual</p>
              </div>
              {abierto === o.rut ? <ChevronUp className="w-4 h-4 text-[#1a5276] flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
            </button>

            {abierto === o.rut && (
              <div className="px-5 pb-5 border-t border-gray-100 pt-4 bg-gray-50/50">
                <p className="text-xs text-gray-600 mb-4 leading-relaxed">{o.giro}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {[
                    ['Tipo de Operador', o.tipo],
                    ['Región', o.region],
                    ['Inscripción', new Date(o.fechaInscripcion).toLocaleDateString('es-CL')],
                    ['Operaciones últ. año', o.operacionesUltAno.toString()],
                  ].map(([k, v]) => (
                    <div key={k} className="bg-white rounded-xl border border-gray-200 p-3">
                      <p className="text-[10px] text-gray-400 mb-0.5">{k}</p>
                      <p className="text-xs font-semibold text-gray-700">{v}</p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {o.rubros.map(r => (
                    <span key={r} className="text-[10px] bg-[#1a5276]/8 text-[#1a5276] border border-[#1a5276]/20 rounded-full px-2.5 py-1">{r}</span>
                  ))}
                </div>
                {o.estado !== 'activo' && (
                  <div className="mt-3 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    Este operador tiene el estado <strong>{o.estado}</strong>. No puede realizar operaciones aduaneras hasta regularizar su situación.
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {lista.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Building2 className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Sin resultados</p>
          <p className="text-xs text-gray-400 mt-1">Ajuste los filtros de búsqueda.</p>
        </div>
      )}

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700 leading-relaxed">
          Para inscribirse como Operador de Comercio Exterior, utilice el módulo <strong>"Operador Comercio Exterior"</strong> en Trámites en Línea. El proceso de evaluación toma entre 5 y 10 días hábiles.
        </p>
      </div>
    </PageLayout>
  );
}
