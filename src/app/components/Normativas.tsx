import { useState } from 'react';
import { FileText, Search, ExternalLink, ChevronDown, ChevronUp, BookOpen, Scale, AlertCircle, Calendar } from 'lucide-react';
import { PageLayout } from './ui/PageLayout';

type CatNorma = 'Ley' | 'Decreto' | 'Resolución' | 'Circular' | 'Ordenanza';

interface Norma {
  id: string; tipo: CatNorma; numero: string; titulo: string;
  descripcion: string; fecha: string; organismo: string; vigente: boolean;
}

const NORMAS: Norma[] = [
  /* ── LEYES ── */
  { id: 'n1',  tipo: 'Ordenanza', numero: 'DFL N° 30/2005',  vigente: true,  organismo: 'Ministerio de Hacienda',
    titulo: 'Ordenanza de Aduanas',
    fecha: '2005-03-04',
    descripcion: 'Texto refundido, coordinado y sistematizado. Regula el ingreso, salida y tránsito de mercancías por el territorio nacional, estableciendo los regímenes aduaneros, el aforo, las infracciones y sanciones.',
  },
  { id: 'n2',  tipo: 'Ley', numero: 'Ley N° 20.936',  vigente: true,  organismo: 'Congreso Nacional',
    titulo: 'Ley que establece una nueva normativa sobre transmisión de energía eléctrica',
    fecha: '2016-07-25',
    descripcion: 'En materia aduanera, regula la importación de equipos y materiales de generación eléctrica renovable con franquicias específicas para el sector energético.',
  },
  { id: 'n3',  tipo: 'Ley', numero: 'Ley N° 18.768',  vigente: true,  organismo: 'Congreso Nacional',
    titulo: 'Normas sobre Simplificación del Sistema Tributario y Aduanero',
    fecha: '1988-12-29',
    descripcion: 'Establece disposiciones sobre simplificación del sistema tributario, introduciendo modificaciones a la Ordenanza de Aduanas en materia de plazos, procedimientos y sanciones.',
  },
  { id: 'n4',  tipo: 'Ley', numero: 'Ley N° 21.420',  vigente: true,  organismo: 'Congreso Nacional',
    titulo: 'Reducción o eliminación de exenciones tributarias que carecen de justificación',
    fecha: '2022-02-04',
    descripcion: 'Modifica exenciones del IVA aplicables a servicios digitales transfronterizos y servicios de comercio electrónico. Impacta directamente en las importaciones de bienes adquiridos por internet.',
  },
  /* ── DECRETOS ── */
  { id: 'n5',  tipo: 'Decreto', numero: 'DS N° 1.148/2022', vigente: true,  organismo: 'Ministerio de Hacienda',
    titulo: 'Reglamento del Sistema de Garantías Aduaneras',
    fecha: '2022-09-15',
    descripcion: 'Regula la constitución, administración y liquidación de garantías exigidas por el Servicio Nacional de Aduanas en los distintos regímenes suspensivos (tránsito, admisión temporal, depósito).',
  },
  { id: 'n6',  tipo: 'Decreto', numero: 'DS N° 341/1977',  vigente: true,  organismo: 'Ministerio de Hacienda',
    titulo: 'Reglamento de Zonas Francas',
    fecha: '1977-06-30',
    descripcion: 'Establece el marco regulatorio para las Zonas Francas de Iquique (ZOFRI) y Punta Arenas (PARENAZON). Define beneficios arancelarios, requisitos operativos y obligaciones de los usuarios.',
  },
  { id: 'n7',  tipo: 'Decreto', numero: 'DS N° 1.454/2023', vigente: true,  organismo: 'Ministerio de Hacienda',
    titulo: 'Arancel Aduanero Consolidado',
    fecha: '2023-01-01',
    descripcion: 'Establece la nomenclatura arancelaria basada en el Sistema Armonizado (SA 2022) y las tasas de derechos ad valorem. Incluye la totalidad de partidas y subpartidas arancelarias vigentes en Chile.',
  },
  /* ── RESOLUCIONES ── */
  { id: 'n8',  tipo: 'Resolución', numero: 'Res. Ex. N° 8.867/2022', vigente: true, organismo: 'Servicio Nacional de Aduanas',
    titulo: 'Procedimiento de Valoración Aduanera según Acuerdo de Valoración OMC',
    fecha: '2022-11-10',
    descripcion: 'Regula la aplicación de los métodos de valoración aduanera establecidos en el Acuerdo sobre Valoración en Aduana de la OMC (GATT 1994, Art. VII). Define el valor de transacción y métodos alternativos.',
  },
  { id: 'n9',  tipo: 'Resolución', numero: 'Res. Ex. N° 5.342/2023', vigente: true, organismo: 'Servicio Nacional de Aduanas',
    titulo: 'Normas para la Declaración de Ingreso Electrónica (DIN-E)',
    fecha: '2023-06-01',
    descripcion: 'Establece los requisitos técnicos, plazos y procedimientos para la presentación electrónica de Declaraciones de Ingreso a través del sistema SICEX. Define validaciones, correcciones y rectificaciones.',
  },
  { id: 'n10', tipo: 'Resolución', numero: 'Res. Ex. N° 3.100/2021', vigente: true, organismo: 'Servicio Nacional de Aduanas',
    titulo: 'Procedimiento para Importaciones de Envíos de Bajo Valor (Courier)',
    fecha: '2021-08-15',
    descripcion: 'Regula el despacho simplificado de envíos postales y courier con valor CIF hasta USD 1.000. Establece los requisitos documentales, el pago simplificado de IVA y el aforo documental expedito.',
  },
  { id: 'n11', tipo: 'Resolución', numero: 'Res. Ex. N° 6.700/2023', vigente: true, organismo: 'Servicio Nacional de Aduanas',
    titulo: 'Reglamento de Operadores Económicos Autorizados (OEA)',
    fecha: '2023-09-20',
    descripcion: 'Establece los requisitos, procedimientos de certificación y beneficios del programa OEA en Chile. Los operadores certificados acceden a despacho expedito, aforos reducidos y facilidades de garantía.',
  },
  /* ── CIRCULARES ── */
  { id: 'n12', tipo: 'Circular', numero: 'Circular N° 167/2024', vigente: true, organismo: 'Servicio Nacional de Aduanas',
    titulo: 'Instrucciones sobre Franquicia Aduanera para Viajeros',
    fecha: '2024-01-15',
    descripcion: 'Actualiza los montos de franquicia para viajeros: USD 500 para adultos, USD 250 para menores de 18 años. Regula el procedimiento de declaración jurada de equipaje y el cobro del arancel del 6% sobre el excedente.',
  },
  { id: 'n13', tipo: 'Circular', numero: 'Circular N° 203/2024', vigente: true, organismo: 'Servicio Nacional de Aduanas',
    titulo: 'Instrucciones para el Despacho de Mercancías Peligrosas (IMDG/IATA)',
    fecha: '2024-03-10',
    descripcion: 'Establece los procedimientos aduaneros específicos para mercancías clasificadas como peligrosas según los códigos IMDG (marítimo) e IATA (aéreo). Requiere documentación especial y aforo físico obligatorio.',
  },
  { id: 'n14', tipo: 'Circular', numero: 'Circular N° 89/2023',  vigente: true, organismo: 'Servicio Nacional de Aduanas',
    titulo: 'Procedimientos de Subasta de Bienes Comisados y Caídos en Comiso',
    fecha: '2023-06-20',
    descripcion: 'Regula el proceso de remate de mercancías que han caído en comiso por infracción aduanera o que no han sido retiradas en plazo. Establece tasaciones, avisos, bases de licitación y adjudicación.',
  },
];

const TIPOS: CatNorma[] = ['Ley', 'Decreto', 'Resolución', 'Circular', 'Ordenanza'];
const tipoBadge: Record<CatNorma, string> = {
  'Ley':        'bg-blue-100 text-blue-700 border-blue-200',
  'Decreto':    'bg-purple-100 text-purple-700 border-purple-200',
  'Resolución': 'bg-amber-100 text-amber-700 border-amber-200',
  'Circular':   'bg-green-100 text-green-700 border-green-200',
  'Ordenanza':  'bg-red-100 text-red-700 border-red-200',
};

interface Props { rut: string; onVolver: () => void }

export function Normativas({ rut, onVolver }: Props) {
  const [q, setQ]           = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<CatNorma | 'Todos'>('Todos');
  const [abierta, setAbierta] = useState<string | null>(null);

  const lista = NORMAS.filter(n => {
    const matchQ = !q || n.titulo.toLowerCase().includes(q.toLowerCase()) || n.numero.toLowerCase().includes(q.toLowerCase()) || n.descripcion.toLowerCase().includes(q.toLowerCase());
    const matchT = tipoFiltro === 'Todos' || n.tipo === tipoFiltro;
    return matchQ && matchT;
  });

  return (
    <PageLayout titulo="Normativas Aduaneras" subtitulo="Marco legal vigente del Servicio Nacional de Aduanas de Chile" rut={rut} onVolver={onVolver}>

      {/* Hero */}
      <div className="bg-[#1a5276] rounded-2xl p-6 mb-6 flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <Scale className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-white font-bold mb-1">Marco Normativo Aduanero Chileno</h2>
          <p className="text-blue-200 text-sm leading-relaxed">
            Ordenanzas, leyes, decretos, resoluciones y circulares vigentes que regulan el comercio exterior y las operaciones aduaneras en Chile.
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar normativa por número o título…"
            className="w-full pl-10 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a5276]/20 focus:border-[#1a5276]" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['Todos', ...TIPOS] as (CatNorma | 'Todos')[]).map(t => (
            <button key={t} onClick={() => setTipoFiltro(t)}
              className={`px-3 py-1.5 rounded-full text-xs border font-medium transition-all ${tipoFiltro === t ? 'bg-[#1a5276] text-white border-[#1a5276]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-4"><strong className="text-gray-600">{lista.length}</strong> normativas encontradas</p>

      {/* Lista acordeón */}
      <div className="space-y-2">
        {lista.map(n => (
          <div key={n.id} className={`bg-white rounded-2xl border overflow-hidden transition-all ${abierta === n.id ? 'border-[#1a5276]/30 shadow-sm' : 'border-gray-100 hover:border-gray-200'}`}>
            <button onClick={() => setAbierta(abierta === n.id ? null : n.id)}
              className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50/50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#1a5276]/8 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-[#1a5276]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className={`text-[10px] font-semibold border rounded-full px-2 py-0.5 ${tipoBadge[n.tipo]}`}>{n.tipo}</span>
                  <span className="text-[10px] font-mono text-gray-400">{n.numero}</span>
                  {n.vigente && <span className="text-[10px] text-green-600 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">● Vigente</span>}
                </div>
                <p className="text-sm font-medium text-gray-800 truncate">{n.titulo}</p>
                <p className="text-[10px] text-gray-400">{n.organismo} — {new Date(n.fecha).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              {abierta === n.id ? <ChevronUp className="w-4 h-4 text-[#1a5276] flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
            </button>

            {abierta === n.id && (
              <div className="px-5 pb-5 border-t border-gray-100 pt-4 bg-gray-50/50">
                <p className="text-sm text-gray-600 leading-relaxed mb-4">{n.descripcion}</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Calendar className="w-3.5 h-3.5" />
                    Publicación: {new Date(n.fecha).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <BookOpen className="w-3.5 h-3.5" /> {n.organismo}
                  </div>
                  <button className="ml-auto flex items-center gap-1.5 text-xs text-[#1a5276] font-medium hover:underline">
                    <ExternalLink className="w-3.5 h-3.5" /> Ver texto completo (Ley Chile)
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {lista.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Sin resultados</p>
          <p className="text-xs text-gray-400 mt-1">Intente con otros términos de búsqueda.</p>
        </div>
      )}

      <div className="mt-8 bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 leading-relaxed">
          La información normativa publicada en AduanaSync es de carácter referencial. Para efectos legales, siempre consulte la versión oficial en el <strong>Diario Oficial de Chile</strong> o en el sitio web del <strong>Servicio Nacional de Aduanas</strong> (aduana.cl).
        </p>
      </div>
    </PageLayout>
  );
}
