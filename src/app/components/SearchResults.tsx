import { useState, useEffect } from 'react';
import { Search, FileText, Package, PackageCheck, CreditCard, ClipboardList, HelpCircle, ChevronRight, X, Filter } from 'lucide-react';
import { PageLayout } from './ui/PageLayout';

const CATALOGO = [
  { id: 1, cat: 'Importaciones',  icon: <Package className="w-4 h-4" />,      color: '#1a5276', titulo: 'Declaración de Importación (DIN)', desc: 'Declare mercancías de ingreso al territorio nacional.' },
  { id: 2, cat: 'Importaciones',  icon: <Package className="w-4 h-4" />,      color: '#1a5276', titulo: 'Consulta de Aforo', desc: 'Verifique el estado de aforo de su declaración.' },
  { id: 3, cat: 'Exportaciones',  icon: <PackageCheck className="w-4 h-4" />, color: '#1e8449', titulo: 'Declaración Única de Salida (DUS)', desc: 'Tramite la exportación de bienes al extranjero.' },
  { id: 4, cat: 'Exportaciones',  icon: <PackageCheck className="w-4 h-4" />, color: '#1e8449', titulo: 'Exportación Simplificada', desc: 'Para exportaciones de bajo monto sin agente.' },
  { id: 5, cat: 'Declaraciones',  icon: <FileText className="w-4 h-4" />,     color: '#6c3483', titulo: 'Declaración de Tránsito (DTI)', desc: 'Autorice el tránsito de mercancías por territorio nacional.' },
  { id: 6, cat: 'Declaraciones',  icon: <FileText className="w-4 h-4" />,     color: '#6c3483', titulo: 'Rectificación de Declaración', desc: 'Corrija datos de una declaración ya presentada.' },
  { id: 7, cat: 'Aranceles',      icon: <CreditCard className="w-4 h-4" />,   color: '#b7950b', titulo: 'Pago de Derechos Ad Valorem', desc: 'Pague derechos de importación e IVA en línea.' },
  { id: 8, cat: 'Aranceles',      icon: <CreditCard className="w-4 h-4" />,   color: '#b7950b', titulo: 'Consulta de Deuda Aduanera', desc: 'Revise saldos y deudas pendientes de pago.' },
  { id: 9, cat: 'Certificados',   icon: <ClipboardList className="w-4 h-4" />, color: '#c0392b', titulo: 'Certificado de Origen', desc: 'Solicite certificación de origen para exportaciones.' },
  { id: 10, cat: 'Certificados',  icon: <ClipboardList className="w-4 h-4" />, color: '#c0392b', titulo: 'Permiso de Importación Temporal', desc: 'Ingrese bienes temporalmente sin pago de arancel.' },
  { id: 11, cat: 'Ayuda',         icon: <HelpCircle className="w-4 h-4" />,   color: '#6b7280', titulo: 'Preguntas Frecuentes', desc: 'Resuelva dudas sobre trámites aduaneros.' },
  { id: 12, cat: 'Ayuda',         icon: <HelpCircle className="w-4 h-4" />,   color: '#6b7280', titulo: 'Normativas Vigentes', desc: 'Acceda a resoluciones, circulares y leyes aduaneras.' },
];

const CATS = ['Todos', 'Importaciones', 'Exportaciones', 'Declaraciones', 'Aranceles', 'Certificados', 'Ayuda'];

interface Props { query: string; rut: string; onVolver: () => void }

export function SearchResults({ query: queryInicial, rut, onVolver }: Props) {
  const [query, setQuery] = useState(queryInicial);
  const [inputVal, setInputVal] = useState(queryInicial);
  const [catActiva, setCatActiva] = useState('Todos');

  useEffect(() => { setQuery(queryInicial); setInputVal(queryInicial); }, [queryInicial]);

  const resultados = CATALOGO.filter(r => {
    const matchCat = catActiva === 'Todos' || r.cat === catActiva;
    const matchQ = !query.trim() || r.titulo.toLowerCase().includes(query.toLowerCase()) || r.desc.toLowerCase().includes(query.toLowerCase()) || r.cat.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQ;
  });

  return (
    <PageLayout titulo="Resultados de búsqueda" rut={rut} onVolver={onVolver}>
      {/* Buscador */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && setQuery(inputVal)}
              placeholder="Busca trámites, normativas, certificados…"
              className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a5276]/20 focus:border-[#1a5276]"
            />
            {inputVal && (
              <button onClick={() => { setInputVal(''); setQuery(''); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button onClick={() => setQuery(inputVal)} className="bg-[#1a5276] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#143d5a] transition-colors flex items-center gap-2">
            <Search className="w-4 h-4" /> Buscar
          </button>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 flex-wrap mt-4">
          <Filter className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          {CATS.map(c => (
            <button key={c} onClick={() => setCatActiva(c)}
              className={`px-3 py-1 rounded-full text-xs border transition-all ${catActiva === c ? 'bg-[#1a5276] text-white border-[#1a5276]' : 'border-gray-200 text-gray-500 hover:border-[#1a5276] hover:text-[#1a5276]'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Meta */}
      <p className="text-xs text-gray-400 mb-4">
        {query ? <><strong className="text-gray-600">{resultados.length}</strong> resultado{resultados.length !== 1 ? 's' : ''} para "<strong className="text-gray-600">{query}</strong>"</> : <><strong className="text-gray-600">{resultados.length}</strong> trámites disponibles</>}
      </p>

      {/* Resultados */}
      {resultados.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <Search className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium mb-1">Sin resultados</p>
          <p className="text-xs text-gray-400">Intente con otros términos o cambie el filtro de categoría.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {resultados.map(r => (
            <div key={r.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 hover:border-gray-200 hover:shadow transition-all group">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: r.color + '18', color: r.color }}>
                {r.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 group-hover:text-[#1a5276] transition-colors">{r.titulo}</p>
                <p className="text-xs text-gray-400 mt-0.5">{r.desc}</p>
              </div>
              <span className="text-[10px] text-gray-400 border border-gray-100 rounded-full px-2.5 py-1 flex-shrink-0">{r.cat}</span>
              <button className="flex items-center gap-1 text-xs text-[#1a5276] font-medium hover:underline flex-shrink-0">
                Iniciar <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
