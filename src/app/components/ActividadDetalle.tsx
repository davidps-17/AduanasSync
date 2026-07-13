import { CheckCircle2, Clock, AlertTriangle, CreditCard, Package, PackageCheck, FileText, ArrowLeft, Download, Printer, Image as ImageIcon, MapPin, Calendar, Tag, DollarSign } from 'lucide-react';
import { PageLayout } from './ui/PageLayout';

type EstadoKey = 'en_proceso' | 'completado' | 'alerta' | 'pendiente';

interface Paso { label: string; completado: boolean; fecha: string | null; descripcion?: string }

interface Tramite {
  numero: string; tipo: string; descripcion: string;
  estado: EstadoKey; fechaIngreso: string; fechaActualizacion: string;
  imagen: string; imagenAlt: string;
  aduana: string; valorUSD: string;
  pasos: Paso[];
  alerta?: string;
  documentos: string[];
}

const estadoConfig: Record<EstadoKey, { label: string; color: string; bg: string; icon: React.ReactNode; dot: string }> = {
  en_proceso: { label: 'En Proceso',          color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200',   icon: <Clock className="w-4 h-4 animate-pulse" />, dot: 'bg-blue-500' },
  completado:  { label: 'Completado',          color: 'text-green-700',  bg: 'bg-green-50 border-green-200', icon: <CheckCircle2 className="w-4 h-4" />,         dot: 'bg-green-500' },
  alerta:      { label: 'Requiere Atención',   color: 'text-red-700',    bg: 'bg-red-50 border-red-200',     icon: <AlertTriangle className="w-4 h-4" />,        dot: 'bg-red-400' },
  pendiente:   { label: 'Pendiente de Pago',   color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200', icon: <CreditCard className="w-4 h-4" />,           dot: 'bg-amber-400' },
};

const tipoIcon: Record<string, React.ReactNode> = {
  'Importación':          <Package className="w-5 h-5" />,
  'Exportación':          <PackageCheck className="w-5 h-5" />,
  'Declaración aduanera': <FileText className="w-5 h-5" />,
  'Pago aranceles':       <CreditCard className="w-5 h-5" />,
};

const TRAMITES: Tramite[] = [
  {
    numero: 'IMP-2026-00431',
    tipo: 'Importación',
    descripcion: 'Importación de maquinaria industrial — Partida 84.79',
    estado: 'en_proceso',
    fechaIngreso: '2026-06-02',
    fechaActualizacion: '2026-06-10',
    imagen: 'https://images.unsplash.com/photo-1717386255773-1e3037c81788?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=900',
    imagenAlt: 'Maquinaria industrial en galpón de fábrica',
    aduana: 'Aduana Valparaíso',
    valorUSD: '48.500',
    documentos: ['Factura comercial (INV-2026-8821)', 'Packing list', 'Conocimiento de embarque BL-CN8821', 'Declaración de importación DIN'],
    pasos: [
      { label: 'Presentación de documentos',  completado: true,  fecha: '2026-06-02', descripcion: 'Documentos recibidos y validados por el sistema SICEX.' },
      { label: 'Revisión documental',          completado: true,  fecha: '2026-06-04', descripcion: 'Aforo documental completado. Se asignó canal amarillo para revisión física.' },
      { label: 'Aforo físico',                 completado: false, fecha: null,          descripcion: 'En espera de inspección por funcionario de Aduanas.' },
      { label: 'Liquidación de derechos',      completado: false, fecha: null,          descripcion: 'Pendiente resultado de aforo físico.' },
      { label: 'Autorización de retiro',       completado: false, fecha: null,          descripcion: 'Se habilitará tras pago de derechos.' },
    ],
  },
  {
    numero: 'EXP-2026-00187',
    tipo: 'Exportación',
    descripcion: 'Exportación de productos vitivinícolas — Partida 22.04',
    estado: 'completado',
    fechaIngreso: '2026-05-28',
    fechaActualizacion: '2026-06-06',
    imagen: 'https://images.unsplash.com/photo-1665254575295-3a1b464f6de0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=900',
    imagenAlt: 'Viñedo con hileras de vides bajo cielo azul',
    aduana: 'Aduana San Antonio',
    valorUSD: '124.800',
    documentos: ['DUS N° 2026-00187', 'Certificado fitosanitario SAG', 'Conocimiento de embarque BL-SA0187', 'Certificado de origen (TLC Chile-UE)'],
    pasos: [
      { label: 'Declaración de exportación (DUS)', completado: true, fecha: '2026-05-28', descripcion: 'DUS presentada y validada.' },
      { label: 'Inspección fitosanitaria',          completado: true, fecha: '2026-05-30', descripcion: 'SAG certificó el lote. Sin observaciones.' },
      { label: 'Verificación de carga',             completado: true, fecha: '2026-06-03', descripcion: 'Carga verificada en contenedor MSCU7821034.' },
      { label: 'Autorización de embarque',          completado: true, fecha: '2026-06-05', descripcion: 'Nave MV Antares. Zarpe autorizado.' },
      { label: 'Cierre de exportación',             completado: true, fecha: '2026-06-06', descripcion: 'Exportación cerrada exitosamente. Destino: Rotterdam, Países Bajos.' },
    ],
  },
  {
    numero: 'DEC-2026-00892',
    tipo: 'Declaración aduanera',
    descripcion: 'Tránsito aduanero — Mercancía en contenedor MSCU7821034',
    estado: 'alerta',
    fechaIngreso: '2026-06-08',
    fechaActualizacion: '2026-06-10',
    imagen: 'https://images.unsplash.com/photo-1718289518008-2a6e78a87488?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=900',
    imagenAlt: 'Contenedores de carga apilados en puerto',
    aduana: 'Aduana Antofagasta',
    valorUSD: '37.200',
    alerta: 'Documentación incompleta: se requiere certificado de origen. Plazo máximo: 48 horas para presentar o se procederá al comiso.',
    documentos: ['DTI N° 2026-00892', 'Manifiesto de carga', 'Factura comercial (pendiente certificado origen)'],
    pasos: [
      { label: 'Registro de tránsito',     completado: true,  fecha: '2026-06-08', descripcion: 'Tránsito interno registrado en el sistema.' },
      { label: 'Validación de manifiesto', completado: true,  fecha: '2026-06-09', descripcion: 'Manifiesto validado. Se detectó falta de certificado de origen.' },
      { label: 'Revisión de riesgo',       completado: false, fecha: null,          descripcion: '⚠ Bloqueado por documentación incompleta.' },
      { label: 'Autorización de tránsito', completado: false, fecha: null,          descripcion: 'Pendiente resolución de observación.' },
    ],
  },
  {
    numero: 'PAG-2026-00054',
    tipo: 'Pago aranceles',
    descripcion: 'Liquidación de derechos ad valorem e IVA — DIN 2026-00431',
    estado: 'pendiente',
    fechaIngreso: '2026-06-09',
    fechaActualizacion: '2026-06-09',
    imagen: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=900',
    imagenAlt: 'Documento de liquidación de impuestos junto a smartphone',
    aduana: 'Aduana SCL',
    valorUSD: '8.742',
    documentos: ['Liquidación N° 2026-00054', 'DIN base: IMP-2026-00431'],
    pasos: [
      { label: 'Generación de liquidación', completado: true,  fecha: '2026-06-09', descripcion: 'Ad valorem USD 2.910 + IVA USD 5.597 + tasas USD 235.' },
      { label: 'Pago de derechos',          completado: false, fecha: null,          descripcion: '⏳ Pendiente de pago. Vence 2026-06-16.' },
      { label: 'Confirmación de pago',      completado: false, fecha: null,          descripcion: 'Se habilitará automáticamente tras acreditación.' },
    ],
  },
];

interface Props { numero: string; rut: string; onVolver: () => void }

export function ActividadDetalle({ numero, rut, onVolver }: Props) {
  const t = TRAMITES.find(x => x.numero === numero);
  if (!t) return (
    <PageLayout titulo="Detalle de Trámite" rut={rut} onVolver={onVolver}>
      <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
        <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
        <p className="text-gray-500 font-medium">Trámite no encontrado</p>
      </div>
    </PageLayout>
  );

  const cfg = estadoConfig[t.estado];
  const completados = t.pasos.filter(p => p.completado).length;
  const progreso    = Math.round((completados / t.pasos.length) * 100);

  return (
    <PageLayout titulo={`Detalle — ${t.numero}`} subtitulo={t.tipo} rut={rut} onVolver={onVolver}>
      <div className="space-y-5">

        {/* Hero imagen + info principal */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="relative h-56">
            <img src={t.imagen} alt={t.imagenAlt} className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).parentElement!.classList.add('bg-gray-100'); (e.target as HTMLImageElement).style.display = 'none'; }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
              <div>
                <p className="text-white/80 text-xs mb-1">{t.imagenAlt}</p>
                <h2 className="text-white font-bold text-lg leading-tight">{t.descripcion}</h2>
              </div>
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold border rounded-full px-3 py-1.5 ${cfg.bg} ${cfg.color}`}>
                {cfg.icon} {cfg.label}
              </span>
            </div>
          </div>

          {/* Meta datos */}
          <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: <Tag className="w-4 h-4" />,      label: 'N° Trámite',  val: t.numero,              mono: true },
              { icon: <MapPin className="w-4 h-4" />,   label: 'Aduana',      val: t.aduana },
              { icon: <Calendar className="w-4 h-4" />, label: 'Ingreso',     val: t.fechaIngreso },
              { icon: <DollarSign className="w-4 h-4" />,label: 'Valor USD',  val: `USD ${t.valorUSD}` },
            ].map(d => (
              <div key={d.label} className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mb-1">{d.icon} {d.label}</div>
                <p className={`text-xs font-semibold text-gray-700 truncate ${(d as any).mono ? 'font-mono' : ''}`}>{d.val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Alerta si la hay */}
        {t.alerta && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700 mb-0.5">Acción requerida</p>
              <p className="text-xs text-red-600 leading-relaxed">{t.alerta}</p>
            </div>
          </div>
        )}

        {/* Progreso + línea de tiempo */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">Estado del trámite</h3>
            <span className="text-xs text-gray-400">{completados}/{t.pasos.length} etapas</span>
          </div>

          <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-6">
            <div className={`h-full rounded-full transition-all duration-700 ${
              t.estado === 'completado' ? 'bg-green-500' :
              t.estado === 'alerta'    ? 'bg-red-400' :
              t.estado === 'pendiente' ? 'bg-amber-400' : 'bg-[#1a5276]'
            }`} style={{ width: `${progreso}%` }} />
          </div>

          <div className="space-y-0">
            {t.pasos.map((paso, i) => (
              <div key={paso.label} className="flex gap-4 items-start">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-colors ${
                    paso.completado
                      ? 'bg-green-500 border-green-500 text-white'
                      : i === completados
                      ? 'bg-white border-[#1a5276] text-[#1a5276]'
                      : 'bg-white border-gray-200 text-gray-300'
                  }`}>
                    {paso.completado ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-[10px] font-bold">{i + 1}</span>}
                  </div>
                  {i < t.pasos.length - 1 && (
                    <div className={`w-0.5 h-10 mt-1 ${paso.completado ? 'bg-green-200' : 'bg-gray-100'}`} />
                  )}
                </div>
                <div className="pb-4 flex-1 min-w-0">
                  <p className={`text-sm font-medium ${paso.completado ? 'text-gray-800' : i === completados ? 'text-[#1a5276]' : 'text-gray-400'}`}>
                    {paso.label}
                  </p>
                  {paso.descripcion && (
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{paso.descripcion}</p>
                  )}
                  {paso.fecha && (
                    <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {paso.fecha}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Documentos */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Documentos asociados</h3>
          <div className="space-y-2">
            {t.documentos.map(doc => (
              <div key={doc} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                <div className="w-8 h-8 rounded-lg bg-[#1a5276]/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-[#1a5276]" />
                </div>
                <span className="text-xs text-gray-700 flex-1">{doc}</span>
                <button className="text-[10px] text-[#1a5276] font-medium hover:underline flex items-center gap-1">
                  <Download className="w-3.5 h-3.5" /> Descargar
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-3">
          <button onClick={onVolver} className="flex items-center gap-2 text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 px-5 py-2.5 rounded-xl transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver
          </button>
          <button className="flex items-center gap-2 text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 px-5 py-2.5 rounded-xl transition-colors">
            <Printer className="w-4 h-4" /> Imprimir
          </button>
          {t.estado === 'pendiente' && (
            <button className="flex-1 bg-[#1a5276] text-white text-sm font-medium py-2.5 rounded-xl hover:bg-[#143d5a] transition-colors flex items-center justify-center gap-2">
              <CreditCard className="w-4 h-4" /> Pagar ahora
            </button>
          )}
          {t.estado === 'alerta' && (
            <button className="flex-1 bg-red-600 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" /> Subsanar observación
            </button>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
