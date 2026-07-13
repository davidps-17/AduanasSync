import { useState } from 'react';
import {
  Newspaper, Search, ChevronRight, Calendar, Tag,
  Megaphone, AlertCircle, FileText, TrendingUp, ExternalLink, X,
} from 'lucide-react';
import { PageLayout } from './ui/PageLayout';

type CatNoticia = 'Comunicado' | 'Resolución' | 'Noticia' | 'Aviso' | 'Circular';

interface Noticia {
  id: string; cat: CatNoticia; titulo: string; resumen: string;
  contenido: string; fecha: string; importante: boolean; imagen?: string;
}

const NOTICIAS: Noticia[] = [
  {
    id: 'n1', cat: 'Comunicado', importante: true,
    titulo: 'Aduana implementa nuevo sistema de despacho electrónico integrado con SII y SAG',
    resumen: 'A partir del 1° de agosto de 2026, todas las importaciones de alimentos y productos agrícolas deberán tramitarse a través del sistema integrado SICEX 3.0, que conecta en tiempo real con el SII y el SAG.',
    contenido: 'El Servicio Nacional de Aduanas informa que desde el 1° de agosto de 2026 entra en vigencia la nueva plataforma SICEX 3.0, que integra en una sola interfaz los procesos de declaración aduanera, certificación sanitaria del SAG y validación tributaria del SII. Esta modernización reducirá los tiempos de despacho en un 40% y eliminará la presentación de documentos físicos en ventanilla. Los agentes de aduana y operadores habilitados deben actualizar sus credenciales antes del 15 de julio. Para mayor información, contacte a su Aduana regional o visite sicex.aduana.cl.',
    fecha: '2026-06-10',
    imagen: 'https://images.unsplash.com/photo-1518770660439-4636190af475?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
  },
  {
    id: 'n2', cat: 'Aviso', importante: true,
    titulo: 'Actualización de franquicias para viajeros — Temporada de invierno 2026',
    resumen: 'Se recuerda a los viajeros que retornan al país que la franquicia exenta es de USD 500 por adulto y USD 250 por menor. Los bienes adquiridos en zonas francas tienen tratamiento diferenciado.',
    contenido: 'Con motivo de la temporada vacacional de invierno 2026, el Servicio Nacional de Aduanas recuerda a todos los viajeros que regresan al territorio nacional las normas de franquicia de equipaje: USD 500 para adultos, USD 250 para menores de 18 años. Las compras realizadas en Zonas Francas de Iquique y Punta Arenas se rigen por cuotas diferenciadas establecidas en el DS 341. El excedente tributa el 6% de arancel ad valorem más IVA. Se puede declarar en línea a través de AduanaSync antes de viajar para agilizar el ingreso.',
    fecha: '2026-06-08',
    imagen: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
  },
  {
    id: 'n3', cat: 'Noticia', importante: false,
    titulo: 'Chile y Vietnam profundizan cooperación aduanera en el marco del CPTPP',
    resumen: 'Delegaciones de ambos países sostuvieron reuniones técnicas para facilitar el reconocimiento mutuo de programas OEA y establecer procedimientos aduaneros simplificados.',
    contenido: 'En el marco de la implementación del Acuerdo CPTPP, representantes del Servicio Nacional de Aduanas de Chile y la Autoridad Aduanera de Vietnam se reunieron en Santiago para avanzar en el Acuerdo de Reconocimiento Mutuo de Operadores Económicos Autorizados (OEA-ARM). El acuerdo permitirá que las empresas certificadas OEA en Chile gocen de beneficios de despacho expedito en Vietnam y viceversa. Chile ya cuenta con ARM vigentes con EE.UU., UE y México.',
    fecha: '2026-06-05',
  },
  {
    id: 'n4', cat: 'Circular', importante: false,
    titulo: 'Circular N° 218/2026 — Nuevos procedimientos para despacho de envíos de comercio electrónico',
    resumen: 'Se establecen nuevas instrucciones para el despacho aduanero de envíos provenientes de plataformas de comercio electrónico transfronterizo (e-commerce), incluyendo requisitos de identificación del comprador.',
    contenido: 'La Circular N° 218/2026 establece que todos los envíos provenientes de plataformas de comercio electrónico (Alibaba, Amazon, Shein, etc.) con valor superior a USD 30 deberán declarar obligatoriamente el RUT del destinatario final. Los operadores de courier tienen plazo hasta el 30 de septiembre para adecuar sus sistemas. Los envíos con valor entre USD 30 y USD 500 pagan IVA simplificado del 19%. Los superiores a USD 500 siguen el régimen general de importación.',
    fecha: '2026-06-03',
  },
  {
    id: 'n5', cat: 'Resolución', importante: false,
    titulo: 'Res. Ex. N° 4.521 — Actualización de la nómina de productos sujetos a restricción de importación',
    resumen: 'Se modifica la nómina de bienes cuya importación requiere autorización previa del SERNAPESCA, ISP o SAG, incorporando nuevas categorías de alimentos procesados y cosméticos.',
    contenido: 'La Resolución Ex. N° 4.521 de 2026 actualiza la nómina de productos que requieren autorización previa de organismos fiscalizadores para su importación a Chile. Se incorporan: (1) alimentos con aditivos no autorizados por el MINSAL, (2) cosméticos con ingredientes prohibidos por el ISP, (3) especies hidrobiológicas de nueva inclusión en CITES, y (4) productos fitosanitarios sin registro SAG. Los importadores afectados tienen 60 días para regularizar sus registros.',
    fecha: '2026-05-28',
  },
  {
    id: 'n6', cat: 'Noticia', importante: false,
    titulo: 'Tiempo de despacho en Aduana SCL se reduce a 4,2 horas en promedio durante mayo 2026',
    resumen: 'La implementación del sistema de gestión de riesgo inteligente permitió reducir los tiempos de aforo en el aeropuerto Arturo Merino Benítez, beneficiando a más de 45.000 envíos mensuales.',
    contenido: 'El Servicio Nacional de Aduanas reporta que durante mayo de 2026 el tiempo promedio de despacho en la Aduana del Aeropuerto de Santiago (SCL) se redujo de 6,8 a 4,2 horas, gracias a la implementación del módulo de gestión de riesgo inteligente basado en análisis de datos históricos y comportamiento de los operadores. El 78% de las declaraciones fueron despachadas en modalidad "canal verde" (solo revisión documental). Los envíos de e-commerce courier registraron el mayor beneficio.',
    fecha: '2026-05-22',
  },
  {
    id: 'n7', cat: 'Aviso', importante: false,
    titulo: 'Mantenimiento programado del sistema SICEX — Domingo 22 de junio de 2026',
    resumen: 'El sistema SICEX estará fuera de servicio el domingo 22 de junio entre las 02:00 y las 08:00 horas para actualización de plataforma. No se procesarán declaraciones durante ese período.',
    contenido: 'El Servicio Nacional de Aduanas informa que el sistema SICEX estará fuera de servicio por mantenimiento programado el domingo 22 de junio de 2026, entre las 02:00 y las 08:00 horas (hora de Chile continental). Durante ese período no será posible presentar declaraciones de ingreso, declaraciones de salida ni solicitudes de tránsito. Se recomienda a los operadores anticipar sus tramitaciones. El sistema de pago electrónico también estará inhabilitado durante ese período.',
    fecha: '2026-05-20',
  },
  {
    id: 'n8', cat: 'Comunicado', importante: false,
    titulo: 'Aduana lanza programa de certificación OEA para PYMEs exportadoras',
    resumen: 'El nuevo programa simplifica los requisitos de certificación OEA para empresas con menos de 50 trabajadores, reduciendo tiempos y costos de certificación en un 60%.',
    contenido: 'El Servicio Nacional de Aduanas lanza el programa "OEA PYMEs 2026", que simplifica el proceso de certificación como Operador Económico Autorizado para empresas medianas y pequeñas exportadoras. El programa reduce los requisitos documentales, establece acompañamiento técnico gratuito durante el proceso y extiende los plazos de cumplimiento de estándares de seguridad. Las empresas interesadas pueden postular hasta el 31 de agosto en oea.aduana.cl.',
    fecha: '2026-05-15',
  },
  {
    id: 'n9', cat: 'Noticia', importante: false,
    titulo: 'Exportaciones chilenas de cobre superan USD 4.200 millones en mayo 2026',
    resumen: 'Las exportaciones de cobre refinado y concentrado registraron un aumento del 7,3% respecto a mayo 2025, impulsadas por la recuperación de la demanda desde China y el alza en precios internacionales.',
    contenido: 'Según datos del Servicio Nacional de Aduanas publicados en el Informe Mensual de Comercio Exterior (IMCE), las exportaciones de cobre y sus derivados alcanzaron USD 4.218 millones en mayo de 2026, representando un 38,4% del total exportado por Chile en el mes. El cobre catódico fue el principal producto (USD 2.840M), seguido del concentrado de cobre (USD 1.120M) y el molibdeno (USD 258M). China absorbió el 71% de las exportaciones cupríferas.',
    fecha: '2026-05-10',
  },
];

const CATEGORIAS: (CatNoticia | 'Todas')[] = ['Todas', 'Comunicado', 'Resolución', 'Noticia', 'Aviso', 'Circular'];

const catStyle: Record<CatNoticia, { bg: string; text: string; icon: React.ReactNode }> = {
  'Comunicado': { bg: 'bg-[#1a5276]/10 border-[#1a5276]/20', text: 'text-[#1a5276]', icon: <Megaphone className="w-3.5 h-3.5" /> },
  'Resolución': { bg: 'bg-purple-100 border-purple-200',      text: 'text-purple-700', icon: <FileText className="w-3.5 h-3.5" /> },
  'Noticia':    { bg: 'bg-green-100 border-green-200',         text: 'text-green-700',  icon: <Newspaper className="w-3.5 h-3.5" /> },
  'Aviso':      { bg: 'bg-amber-100 border-amber-200',         text: 'text-amber-700',  icon: <AlertCircle className="w-3.5 h-3.5" /> },
  'Circular':   { bg: 'bg-gray-100 border-gray-200',           text: 'text-gray-600',   icon: <FileText className="w-3.5 h-3.5" /> },
};

function ModalNoticia({ n, onClose }: { n: Noticia; onClose: () => void }) {
  const st = catStyle[n.cat];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {n.imagen && (
          <div className="h-52 overflow-hidden rounded-t-2xl">
            <img src={n.imagen} alt={n.titulo} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold border rounded-full px-3 py-1 ${st.bg} ${st.text}`}>
                {st.icon} {n.cat}
              </span>
              {n.importante && (
                <span className="text-xs font-semibold bg-red-100 text-red-700 border border-red-200 rounded-full px-2.5 py-0.5">⚡ Destacado</span>
              )}
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <h2 className="text-gray-800 font-bold leading-snug">{n.titulo}</h2>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(n.fecha).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <p className="text-sm text-gray-600 leading-relaxed border-l-4 border-[#1a5276]/30 pl-4 italic">{n.resumen}</p>
          <p className="text-sm text-gray-700 leading-relaxed">{n.contenido}</p>
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-400">Servicio Nacional de Aduanas de Chile</p>
            <button className="flex items-center gap-1.5 text-xs text-[#1a5276] font-medium hover:underline">
              <ExternalLink className="w-3.5 h-3.5" /> Ver en aduana.cl
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface Props { rut: string; onVolver: () => void }

export function AduanaInforma({ rut, onVolver }: Props) {
  const [q, setQ]           = useState('');
  const [cat, setCat]       = useState<CatNoticia | 'Todas'>('Todas');
  const [seleccionada, setSeleccionada] = useState<Noticia | null>(null);

  const destacadas = NOTICIAS.filter(n => n.importante);
  const lista = NOTICIAS.filter(n => {
    const matchQ = !q || n.titulo.toLowerCase().includes(q.toLowerCase()) || n.resumen.toLowerCase().includes(q.toLowerCase());
    const matchC = cat === 'Todas' || n.cat === cat;
    return matchQ && matchC;
  });

  return (
    <PageLayout titulo="Aduana Informa" subtitulo="Comunicados, noticias y avisos oficiales del Servicio Nacional de Aduanas" rut={rut} onVolver={onVolver}>

      {/* Noticias destacadas */}
      {!q && cat === 'Todas' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {destacadas.map(n => {
            const st = catStyle[n.cat];
            return (
              <button key={n.id} onClick={() => setSeleccionada(n)}
                className="bg-[#1a5276] rounded-2xl overflow-hidden text-left group hover:shadow-xl transition-all">
                {n.imagen && (
                  <div className="h-36 overflow-hidden">
                    <img src={n.imagen} alt={n.titulo} className="w-full h-full object-cover opacity-60 group-hover:opacity-70 transition-opacity" />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-semibold bg-white/20 text-white rounded-full px-2.5 py-0.5 flex items-center gap-1">
                      {st.icon} {n.cat}
                    </span>
                    <span className="text-[10px] text-white/70">
                      {new Date(n.fecha).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <p className="text-white font-semibold text-sm leading-snug mb-1 line-clamp-2">{n.titulo}</p>
                  <p className="text-blue-200 text-xs line-clamp-2 leading-relaxed">{n.resumen}</p>
                  <div className="flex items-center gap-1 text-white/80 text-xs mt-3 group-hover:gap-2 transition-all">
                    Leer más <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar en Aduana Informa…"
            className="w-full pl-10 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a5276]/20 focus:border-[#1a5276]" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIAS.map(c => {
            const st = c !== 'Todas' ? catStyle[c] : null;
            return (
              <button key={c} onClick={() => setCat(c)}
                className={`px-3 py-1.5 rounded-full text-xs border font-medium transition-all flex items-center gap-1.5 ${cat === c ? 'bg-[#1a5276] text-white border-[#1a5276]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                {st && <span className={cat === c ? 'text-white' : st.text}>{st.icon}</span>}
                {c}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-4"><strong className="text-gray-600">{lista.length}</strong> publicaciones encontradas</p>

      {/* Lista de noticias */}
      <div className="space-y-2">
        {lista.map(n => {
          const st = catStyle[n.cat];
          return (
            <button key={n.id} onClick={() => setSeleccionada(n)}
              className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-start gap-4 text-left hover:border-gray-200 hover:shadow transition-all group">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${st.bg} ${st.text}`}>
                {st.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`text-[10px] font-semibold border rounded-full px-2 py-0.5 ${st.bg} ${st.text}`}>{n.cat}</span>
                  {n.importante && <span className="text-[10px] font-semibold bg-red-100 text-red-700 border border-red-200 rounded-full px-2 py-0.5">⚡ Destacado</span>}
                  <span className="text-[10px] text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(n.fecha).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-800 group-hover:text-[#1a5276] transition-colors line-clamp-2">{n.titulo}</p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{n.resumen}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#1a5276] flex-shrink-0 mt-1 transition-colors" />
            </button>
          );
        })}
      </div>

      {lista.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Newspaper className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Sin publicaciones</p>
          <p className="text-xs text-gray-400 mt-1">Pruebe con otros términos de búsqueda.</p>
        </div>
      )}

      <p className="text-center text-[10px] text-gray-400 mt-8">
        Fuente oficial: <span className="text-[#1a5276]">aduana.cl</span> — Servicio Nacional de Aduanas de Chile
      </p>

      {seleccionada && <ModalNoticia n={seleccionada} onClose={() => setSeleccionada(null)} />}
    </PageLayout>
  );
}
