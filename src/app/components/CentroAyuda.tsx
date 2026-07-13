import { useState } from 'react';
import { HelpCircle, Search, ChevronDown, ChevronUp, Phone, Mail, MapPin, FileText, BookOpen, MessageSquare, Clock } from 'lucide-react';
import { PageLayout } from './ui/PageLayout';

const CATEGORIAS = [
  { icon: <FileText className="w-5 h-5" />, label: 'Normativas y Leyes', desc: 'Ordenanza de Aduanas, circulares y resoluciones vigentes.', color: '#1a5276' },
  { icon: <BookOpen className="w-5 h-5" />, label: 'Guías de Usuario', desc: 'Manuales paso a paso para cada trámite en línea.', color: '#1e8449' },
  { icon: <MessageSquare className="w-5 h-5" />, label: 'Preguntas Frecuentes', desc: 'Respuestas a las consultas más comunes.', color: '#6c3483' },
  { icon: <Clock className="w-5 h-5" />, label: 'Tiempos de Proceso', desc: 'Plazos estimados para cada tipo de trámite.', color: '#b7950b' },
];

const FAQS = [
  {
    q: '¿Qué documentos necesito para importar mercancías?',
    a: 'Para importar necesita: Factura comercial, Packing list, Conocimiento de embarque (B/L o AWB), Declaración de importación (DIN), Certificados de origen si aplica, y según la mercancía, certificados sanitarios o fitosanitarios del SAG o ISP.',
  },
  {
    q: '¿Cuál es la franquicia de equipaje para viajeros?',
    a: 'Los viajeros que ingresan a Chile tienen una franquicia exenta de USD 500 (o equivalente) por persona adulta. Los menores de 18 años tienen franquicia de USD 250. El excedente paga un arancel del 6% sobre el valor que supera la franquicia.',
  },
  {
    q: '¿Cuánto demora el aforo aduanero?',
    a: 'El aforo puede ser documental (revisión de documentos, 1–2 días hábiles) o físico (inspección de la mercancía, 2–5 días hábiles). El Servicio Nacional de Aduanas aplica gestión de riesgo para seleccionar el tipo de aforo.',
  },
  {
    q: '¿Cómo puedo pagar los aranceles en línea?',
    a: 'Puede pagar a través del módulo de Pago Electrónico de AduanaSync, que acepta tarjetas de débito, crédito y transferencia bancaria. También puede pagar en las cajas habilitadas en las Aduanas regionales.',
  },
  {
    q: '¿Qué es la Declaración Única de Salida (DUS)?',
    a: 'La DUS es el documento oficial que acredita la exportación de mercancías desde Chile. Es obligatoria para todas las exportaciones y debe ser tramitada con anticipación al embarque de la mercancía.',
  },
  {
    q: '¿Necesito un Agente de Aduana?',
    a: 'Para importaciones superiores a USD 1.000 y exportaciones superiores a USD 2.000 es obligatorio tramitar a través de un Agente de Aduana habilitado. Para montos menores puede tramitar directamente como importador/exportador.',
  },
];

interface Props { rut: string; onVolver: () => void }

export function CentroAyuda({ rut, onVolver }: Props) {
  const [q, setQ] = useState('');
  const [abierta, setAbierta] = useState<number | null>(null);

  const faqsFiltradas = FAQS.filter(f => !q || f.q.toLowerCase().includes(q.toLowerCase()) || f.a.toLowerCase().includes(q.toLowerCase()));

  return (
    <PageLayout titulo="Centro de Ayuda" subtitulo="Normativas, guías y preguntas frecuentes" rut={rut} onVolver={onVolver}>

      {/* Hero */}
      <div className="bg-[#1a5276] rounded-2xl p-8 mb-6 text-center text-white">
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
            <HelpCircle className="w-7 h-7" />
          </div>
        </div>
        <h2 className="font-bold mb-2">¿En qué podemos ayudarte?</h2>
        <p className="text-blue-200 text-sm mb-5">Encuentra guías, normativas y respuestas a tus preguntas</p>
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Busca en el centro de ayuda…"
            className="w-full pl-10 py-2.5 text-sm rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-white/50 pr-4" />
        </div>
      </div>

      {/* Categorías */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {CATEGORIAS.map(c => (
          <button key={c.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-left hover:shadow-md hover:border-gray-200 transition-all group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-white" style={{ backgroundColor: c.color }}>
              {c.icon}
            </div>
            <p className="text-sm font-semibold text-gray-700 group-hover:text-[#1a5276] mb-1 transition-colors">{c.label}</p>
            <p className="text-xs text-gray-400 leading-relaxed">{c.desc}</p>
          </button>
        ))}
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <h3 className="font-semibold text-gray-800 mb-5">Preguntas Frecuentes</h3>
        {faqsFiltradas.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-6">Sin resultados para "<strong>{q}</strong>"</p>
        )}
        <div className="space-y-2">
          {faqsFiltradas.map((f, i) => (
            <div key={i} className={`border rounded-xl overflow-hidden transition-all ${abierta === i ? 'border-[#1a5276]/30' : 'border-gray-100'}`}>
              <button
                onClick={() => setAbierta(abierta === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700 pr-4">{f.q}</span>
                {abierta === i ? <ChevronUp className="w-4 h-4 text-[#1a5276] flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
              </button>
              {abierta === i && (
                <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3 bg-gray-50">
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contacto */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: <Phone className="w-5 h-5" />, label: 'Teléfono', valor: '600 748 0000', sub: 'Lun–Vie 8:30–17:30', color: '#1a5276' },
          { icon: <Mail className="w-5 h-5" />, label: 'Correo Electrónico', valor: 'consultas@aduana.cl', sub: 'Respuesta en 48 hrs', color: '#1e8449' },
          { icon: <MapPin className="w-5 h-5" />, label: 'Oficinas Regionales', valor: 'Ver todas las sedes', sub: 'Presencial con hora', color: '#c0392b' },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: c.color }}>
              {c.icon}
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">{c.label}</p>
              <p className="text-sm font-semibold text-gray-700">{c.valor}</p>
              <p className="text-[10px] text-gray-400">{c.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </PageLayout>
  );
}
