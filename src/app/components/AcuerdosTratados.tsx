import { useState } from 'react';
import { Globe, Search, ChevronDown, ChevronUp, CheckCircle2, Clock, MapPin, TrendingDown } from 'lucide-react';
import { PageLayout } from './ui/PageLayout';

type TipoAcuerdo = 'TLC' | 'ACE' | 'APC' | 'SGP' | 'Plurilateral';

interface Acuerdo {
  id: string; tipo: TipoAcuerdo; nombre: string; paises: string[]; bandera: string;
  fechaVigencia: string; descripcion: string; arancelGeneral: string; cobertura: string; estado: 'vigente' | 'en_negociacion';
}

const ACUERDOS: Acuerdo[] = [
  { id: 'a1', tipo: 'TLC', nombre: 'TLC Chile — Estados Unidos', paises: ['Estados Unidos'], bandera: '🇺🇸',
    fechaVigencia: '2004-01-01', estado: 'vigente', arancelGeneral: '0%', cobertura: '99.9% del universo arancelario',
    descripcion: 'Elimina aranceles en prácticamente todos los bienes. Incluye capítulos sobre servicios, inversión, propiedad intelectual, compras públicas y solución de controversias. Principal destino de exportaciones chilenas.',
  },
  { id: 'a2', tipo: 'TLC', nombre: 'TLC Chile — Unión Europea', paises: ['27 países UE'], bandera: '🇪🇺',
    fechaVigencia: '2003-02-01', estado: 'vigente', arancelGeneral: '0%', cobertura: '97% del comercio bilateral',
    descripcion: 'Acuerdo de Asociación amplio que cubre comercio de bienes, servicios e inversión. Actualmente en proceso de modernización (EU-Chile Advanced Framework Agreement) para ampliar capítulos de comercio digital y sostenibilidad.',
  },
  { id: 'a3', tipo: 'TLC', nombre: 'TLC Chile — China', paises: ['China'], bandera: '🇨🇳',
    fechaVigencia: '2006-10-01', estado: 'vigente', arancelGeneral: '0%', cobertura: '97.2% de partidas arancelarias',
    descripcion: 'Primer TLC de China con un país latinoamericano. Ampliado en 2019 con protocolo adicional que incorpora servicios e inversión. China es el principal socio comercial de Chile. Exportaciones clave: cobre, celulosa, vino.',
  },
  { id: 'a4', tipo: 'TLC', nombre: 'TLC Chile — Japón (JCEPA)', paises: ['Japón'], bandera: '🇯🇵',
    fechaVigencia: '2007-09-03', estado: 'vigente', arancelGeneral: '0–3%', cobertura: '90% del comercio',
    descripcion: 'Japan-Chile Economic Partnership Agreement. Elimina o reduce aranceles en bienes industriales y agrícolas. Incluye capítulos de inversión, propiedad intelectual y procedimientos aduaneros. Exportaciones clave: cobre, vino, frutas.',
  },
  { id: 'a5', tipo: 'TLC', nombre: 'TLC Chile — Corea del Sur', paises: ['Corea del Sur'], bandera: '🇰🇷',
    fechaVigencia: '2004-04-01', estado: 'vigente', arancelGeneral: '0%', cobertura: '99.5% del universo arancelario',
    descripcion: 'Primer TLC de Corea del Sur en Latinoamérica. Eliminación arancelaria casi total. Exportaciones clave: cobre, celulosa, salmón. Importaciones: vehículos, maquinaria electrónica, acero.',
  },
  { id: 'a6', tipo: 'TLC', nombre: 'TLC Chile — Canadá', paises: ['Canadá'], bandera: '🇨🇦',
    fechaVigencia: '1997-07-05', estado: 'vigente', arancelGeneral: '0%', cobertura: '99%',
    descripcion: 'Primer TLC de Chile con un país del G7. Eliminación total de aranceles. Incluye capítulos de inversión y servicios. Importante para exportaciones de cobre, celulosa, vino y frutas frescas.',
  },
  { id: 'a7', tipo: 'TLC', nombre: 'TLC Chile — México', paises: ['México'], bandera: '🇲🇽',
    fechaVigencia: '1999-08-01', estado: 'vigente', arancelGeneral: '0%', cobertura: '99%',
    descripcion: 'Acuerdo de Complementación Económica N° 41, ampliado y profundizado como TLC. Eliminación arancelaria total. Cobertura amplia en bienes, servicios e inversión. Exportaciones chilenas: cobre, vinos, frutas.',
  },
  { id: 'a8', tipo: 'TLC', nombre: 'TLC Chile — Australia', paises: ['Australia'], bandera: '🇦🇺',
    fechaVigencia: '2009-03-06', estado: 'vigente', arancelGeneral: '0%', cobertura: '97%',
    descripcion: 'Chile-Australia Free Trade Agreement (CHAFTA). Eliminación arancelaria en la mayoría de los bienes. Incluye capítulos de inversión, servicios y propiedad intelectual. Exportaciones clave: cobre y productos mineros.',
  },
  { id: 'a9', tipo: 'Plurilateral', nombre: 'Acuerdo CPTPP (ex TPP-11)', paises: ['Australia', 'Brunéi', 'Canadá', 'Japón', 'Malasia', 'México', 'Nueva Zelanda', 'Perú', 'Singapur', 'Vietnam'], bandera: '🌏',
    fechaVigencia: '2019-02-14', estado: 'vigente', arancelGeneral: '0–5%', cobertura: '95% del universo arancelario',
    descripcion: 'Comprehensive and Progressive Agreement for Trans-Pacific Partnership. Acuerdo plurilateral de nueva generación que incluye comercio digital, propiedad intelectual, empresas estatales, trabajo y medioambiente. 11 países miembros, representando el 13% del PIB mundial.',
  },
  { id: 'a10', tipo: 'Plurilateral', nombre: 'Alianza del Pacífico', paises: ['Colombia', 'México', 'Perú'], bandera: '🌊',
    fechaVigencia: '2016-05-01', estado: 'vigente', arancelGeneral: '0–3%', cobertura: '92% de los bienes',
    descripcion: 'Bloque de integración regional. Chile, Colombia, México y Perú liberalizan el 92% del comercio de bienes. Incluye libre movilidad de personas, capítulo de inversión y plataforma de innovación. Chile es miembro fundador.',
  },
  { id: 'a11', tipo: 'ACE', nombre: 'ACE N° 35 — MERCOSUR', paises: ['Argentina', 'Brasil', 'Paraguay', 'Uruguay'], bandera: '🇦🇷',
    fechaVigencia: '1996-10-01', estado: 'vigente', arancelGeneral: '0%', cobertura: '100% de los bienes negociados',
    descripcion: 'Acuerdo de Complementación Económica N° 35 en el marco de la ALADI. Eliminación arancelaria para el 100% del comercio bilateral. Principal acuerdo con el bloque del MERCOSUR, que representa el mayor mercado sudamericano.',
  },
  { id: 'a12', tipo: 'ACE', nombre: 'ACE N° 65 — Bolivia', paises: ['Bolivia'], bandera: '🇧🇴',
    fechaVigencia: '2010-04-01', estado: 'vigente', arancelGeneral: '0%', cobertura: '100%',
    descripcion: 'Acuerdo de Complementación Económica que permite libre comercio bilateral con Bolivia. Importante para el comercio fronterizo terrestre en las regiones de Tarapacá y Arica y Parinacota.',
  },
  { id: 'a13', tipo: 'SGP', nombre: 'Sistema Generalizado de Preferencias (SGP)', paises: ['Países en desarrollo'], bandera: '🌍',
    fechaVigencia: '1999-01-01', estado: 'vigente', arancelGeneral: '0–6%', cobertura: 'Productos seleccionados',
    descripcion: 'Chile otorga preferencias arancelarias unilaterales a países en desarrollo conforme al SGP. Aplica reducciones del 50–100% en el arancel general para importaciones provenientes de países de menor desarrollo relativo.',
  },
  { id: 'a14', tipo: 'TLC', nombre: 'TLC Chile — India (en negociación)', paises: ['India'], bandera: '🇮🇳',
    fechaVigencia: '—', estado: 'en_negociacion', arancelGeneral: 'Por definir', cobertura: 'Por definir',
    descripcion: 'Negociaciones en curso para un Acuerdo de Asociación Económica Amplio (CEPA). India representa el quinto mayor mercado del mundo. El acuerdo buscará eliminar aranceles en bienes y servicios clave para ambas economías.',
  },
];

const TIPOS_FILTRO: (TipoAcuerdo | 'Todos')[] = ['Todos', 'TLC', 'ACE', 'APC', 'SGP', 'Plurilateral'];

interface Props { rut: string; onVolver: () => void }

export function AcuerdosTratados({ rut, onVolver }: Props) {
  const [q, setQ]             = useState('');
  const [tipo, setTipo]       = useState<TipoAcuerdo | 'Todos'>('Todos');
  const [estadoF, setEstadoF] = useState<'todos' | 'vigente' | 'en_negociacion'>('todos');
  const [abierto, setAbierto] = useState<string | null>(null);

  const lista = ACUERDOS.filter(a => {
    const matchQ = !q || a.nombre.toLowerCase().includes(q.toLowerCase()) || a.paises.join(' ').toLowerCase().includes(q.toLowerCase());
    const matchT = tipo === 'Todos' || a.tipo === tipo;
    const matchE = estadoF === 'todos' || a.estado === estadoF;
    return matchQ && matchT && matchE;
  });

  const vigentes = ACUERDOS.filter(a => a.estado === 'vigente').length;

  return (
    <PageLayout titulo="Acuerdos y Tratados Comerciales" subtitulo="Red de acuerdos de libre comercio de Chile" rut={rut} onVolver={onVolver}>

      {/* Métricas resumen */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Acuerdos vigentes',    val: vigentes,                           color: 'bg-green-50 border-green-200 text-green-700' },
          { label: 'En negociación',        val: ACUERDOS.length - vigentes,        color: 'bg-amber-50 border-amber-200 text-amber-700' },
          { label: 'Países con acceso',     val: '65+',                              color: 'bg-blue-50 border-blue-200 text-blue-700' },
          { label: 'Cobertura del PIB',     val: '90%',                              color: 'bg-purple-50 border-purple-200 text-purple-700' },
        ].map(m => (
          <div key={m.label} className={`border rounded-2xl p-4 text-center ${m.color}`}>
            <p className="text-2xl font-bold">{m.val}</p>
            <p className="text-xs mt-1 opacity-80">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por país o nombre del acuerdo…"
            className="w-full pl-10 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a5276]/20 focus:border-[#1a5276]" />
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-[10px] text-gray-400 uppercase font-medium tracking-wide">Tipo:</span>
          {TIPOS_FILTRO.map(t => (
            <button key={t} onClick={() => setTipo(t)}
              className={`px-3 py-1.5 rounded-full text-xs border font-medium transition-all ${tipo === t ? 'bg-[#1a5276] text-white border-[#1a5276]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
              {t}
            </button>
          ))}
          <span className="text-[10px] text-gray-400 uppercase font-medium tracking-wide ml-2">Estado:</span>
          {[['todos', 'Todos'], ['vigente', 'Vigente'], ['en_negociacion', 'En negociación']].map(([v, l]) => (
            <button key={v} onClick={() => setEstadoF(v as typeof estadoF)}
              className={`px-3 py-1.5 rounded-full text-xs border font-medium transition-all ${estadoF === v ? 'bg-[#1a5276] text-white border-[#1a5276]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-4"><strong className="text-gray-600">{lista.length}</strong> acuerdos encontrados</p>

      <div className="space-y-2">
        {lista.map(a => (
          <div key={a.id} className={`bg-white rounded-2xl border overflow-hidden transition-all ${abierto === a.id ? 'border-[#1a5276]/30 shadow-sm' : 'border-gray-100 hover:border-gray-200'}`}>
            <button onClick={() => setAbierto(abierto === a.id ? null : a.id)}
              className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50/50 transition-colors">
              <div className="text-3xl flex-shrink-0">{a.bandera}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="text-[10px] font-semibold bg-[#1a5276]/10 text-[#1a5276] border border-[#1a5276]/20 rounded-full px-2 py-0.5">{a.tipo}</span>
                  <span className={`text-[10px] font-medium rounded-full px-2 py-0.5 border ${a.estado === 'vigente' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                    {a.estado === 'vigente' ? '● Vigente' : '⏳ En negociación'}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-800 truncate">{a.nombre}</p>
                <p className="text-[10px] text-gray-400">{a.paises.join(', ')} · Desde {a.fechaVigencia !== '—' ? new Date(a.fechaVigencia).toLocaleDateString('es-CL', { month: 'long', year: 'numeric' }) : 'TBD'}</p>
              </div>
              <div className="text-right hidden sm:block flex-shrink-0">
                <p className="text-xs font-bold text-[#1a5276]">{a.arancelGeneral}</p>
                <p className="text-[10px] text-gray-400">arancel</p>
              </div>
              {abierto === a.id ? <ChevronUp className="w-4 h-4 text-[#1a5276] flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
            </button>

            {abierto === a.id && (
              <div className="px-5 pb-5 border-t border-gray-100 pt-4 bg-gray-50/50">
                <p className="text-sm text-gray-600 leading-relaxed mb-4">{a.descripcion}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Vigencia desde', val: a.fechaVigencia !== '—' ? new Date(a.fechaVigencia).toLocaleDateString('es-CL') : '—', icon: <Clock className="w-3.5 h-3.5" /> },
                    { label: 'Arancel general', val: a.arancelGeneral, icon: <TrendingDown className="w-3.5 h-3.5" /> },
                    { label: 'Cobertura', val: a.cobertura, icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
                    { label: 'Países socios', val: a.paises.length > 1 ? `${a.paises.length} países` : a.paises[0], icon: <MapPin className="w-3.5 h-3.5" /> },
                  ].map(d => (
                    <div key={d.label} className="bg-white rounded-xl border border-gray-200 p-3">
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mb-1">{d.icon}{d.label}</div>
                      <p className="text-xs font-semibold text-gray-700">{d.val}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </PageLayout>
  );
}
