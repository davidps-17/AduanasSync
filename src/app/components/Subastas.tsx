import { useState, useEffect, useRef } from 'react';
import {
  Gavel, Plus, Search, SlidersHorizontal, ChevronDown, X,
  Clock, TrendingUp, Tag, Image as ImageIcon, ArrowUpDown,
  CheckCircle2, AlertCircle, Eye, ArrowLeft, Upload,
  AArrowDown, AArrowUp, ArrowDownNarrowWide, ArrowUpNarrowWide,
  Calendar, DollarSign, Star,
} from 'lucide-react';
import { PageLayout } from './ui/PageLayout';

/* ══════════════════════════════════════════════════
   TIPOS
══════════════════════════════════════════════════ */
type Condicion = 'nuevo' | 'semi-nuevo' | 'usado';
type OrdenKey  = 'precio-desc' | 'precio-asc' | 'nombre-asc' | 'nombre-desc';

interface Puja  { id: string; monto: number; postor: string; fecha: string }
interface Subasta {
  id: string; titulo: string; descripcion: string; imagen: string;
  condicion: Condicion; categoria: string;
  precioBase: number; precioActual: number; incrementoMinimo: number;
  fechaInicio: string; fechaFin: string; pujas: Puja[];
}

/* ══════════════════════════════════════════════════
   DATOS MOCK
══════════════════════════════════════════════════ */
const SUBASTAS_INICIALES: Subasta[] = [
  {
    id: '1', titulo: 'Camioneta Toyota Hilux 2019 — Doble Cabina 4x4', condicion: 'usado', categoria: 'Vehículos',
    descripcion: 'Camioneta de doble cabina, motor 2.8 turbo diésel, tracción 4x4. Comisada en Aduana Antofagasta por internación irregular. 85.000 km. Documentos en regla, transferencia inmediata ante Notaría.',
    imagen: 'https://images.unsplash.com/photo-1529482735174-d3e9a95bde21?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    precioBase: 8500000, precioActual: 9200000, incrementoMinimo: 100000,
    fechaInicio: '2026-06-10T09:00', fechaFin: '2026-06-20T18:00',
    pujas: [
      { id: 'p1', monto: 8700000, postor: 'Usuario ***34', fecha: '2026-06-11T10:15' },
      { id: 'p2', monto: 9000000, postor: 'Usuario ***87', fecha: '2026-06-12T14:30' },
      { id: 'p3', monto: 9200000, postor: 'Usuario ***21', fecha: '2026-06-13T09:00' },
    ],
  },
  {
    id: '2', titulo: 'Laptop Dell XPS 15" — Lote 3 unidades (caja original)', condicion: 'nuevo', categoria: 'Electrónica',
    descripcion: 'Tres notebooks Dell XPS 15 en caja original sellada, procesador Intel Core i7-13700H, 16GB RAM DDR5, SSD NVMe 512GB. Retenidos en Aduana SCL por documentación incompleta.',
    imagen: 'https://images.unsplash.com/photo-1600453364898-255c24a205d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    precioBase: 3200000, precioActual: 3200000, incrementoMinimo: 50000,
    fechaInicio: '2026-06-15T08:00', fechaFin: '2026-06-25T20:00',
    pujas: [],
  },
  {
    id: '3', titulo: 'Lote Indumentaria Deportiva — 240 prendas mixtas', condicion: 'nuevo', categoria: 'Indumentaria',
    descripcion: 'Lote de ropa deportiva marca mixta (poleras, shorts, zapatillas talla 38–44). Comisado en Puerto Valparaíso por declaración incompleta. Incluye inventario detallado por talla y color.',
    imagen: 'https://images.unsplash.com/photo-1637666532931-b835a227b955?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    precioBase: 1800000, precioActual: 2100000, incrementoMinimo: 30000,
    fechaInicio: '2026-06-08T10:00', fechaFin: '2026-06-20T18:00',
    pujas: [
      { id: 'p4', monto: 1900000, postor: 'Usuario ***55', fecha: '2026-06-09T11:00' },
      { id: 'p5', monto: 2100000, postor: 'Usuario ***73', fecha: '2026-06-10T16:45' },
    ],
  },
  {
    id: '4', titulo: 'Motocicleta BMW R1250 GS 2021', condicion: 'semi-nuevo', categoria: 'Vehículos',
    descripcion: 'Motocicleta de aventura BMW R1250 GS, 12.000 km. Retenida en Aduana Los Libertadores por importación no regularizada. Buen estado general, con maletas laterales y baúl originales.',
    imagen: 'https://images.unsplash.com/photo-1550149550-33b46c745e03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    precioBase: 11000000, precioActual: 12500000, incrementoMinimo: 200000,
    fechaInicio: '2026-06-05T09:00', fechaFin: '2026-06-22T12:00',
    pujas: [
      { id: 'p6', monto: 11500000, postor: 'Usuario ***90', fecha: '2026-06-06T09:30' },
      { id: 'p7', monto: 12000000, postor: 'Usuario ***12', fecha: '2026-06-08T17:00' },
      { id: 'p8', monto: 12500000, postor: 'Usuario ***44', fecha: '2026-06-10T10:20' },
    ],
  },
  {
    id: '5', titulo: 'Equipos de Sonido Profesional — Lote 8 piezas', condicion: 'semi-nuevo', categoria: 'Electrónica',
    descripcion: '2 amplificadores QSC K12.2, 4 parlantes JBL EON615, 2 mesas de mezcla Yamaha MG16XU. Incautados en Aduana Iquique. Funcionamiento verificado por perito autorizado.',
    imagen: 'https://images.unsplash.com/photo-1609702847389-b8aec1b0b929?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    precioBase: 4500000, precioActual: 5800000, incrementoMinimo: 100000,
    fechaInicio: '2026-06-01T08:00', fechaFin: '2026-06-19T15:00',
    pujas: [
      { id: 'p9',  monto: 4700000, postor: 'Usuario ***67', fecha: '2026-06-02T10:00' },
      { id: 'p10', monto: 5200000, postor: 'Usuario ***33', fecha: '2026-06-05T14:00' },
      { id: 'p11', monto: 5800000, postor: 'Usuario ***91', fecha: '2026-06-08T09:45' },
    ],
  },
  {
    id: '6', titulo: 'Joyería de Plata y Oro — Lote 45 piezas certificadas', condicion: 'nuevo', categoria: 'Joyería',
    descripcion: 'Lote de joyería diversa: 18 anillos, 14 collares y 13 pulseras de plata 925 y oro 18K. Retenidos en Aduana Arica. Incluye certificados de autenticidad y avalúo pericial.',
    imagen: 'https://images.unsplash.com/photo-1633934542430-0905ccb5f050?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    precioBase: 6000000, precioActual: 6000000, incrementoMinimo: 150000,
    fechaInicio: '2026-06-16T09:00', fechaFin: '2026-06-30T18:00',
    pujas: [],
  },
];

const CATEGORIAS   = ['Todas', 'Vehículos', 'Electrónica', 'Indumentaria', 'Joyería', 'Otro'];
const CONDICIONES: { id: Condicion; label: string }[] = [{ id: 'nuevo', label: 'Nuevo' }, { id: 'semi-nuevo', label: 'Semi-nuevo' }, { id: 'usado', label: 'Usado' }];
const ORDENES: { id: OrdenKey; label: string; icon: React.ReactNode }[] = [
  { id: 'precio-desc',  label: 'Precio: Mayor → Menor', icon: <ArrowDownNarrowWide className="w-4 h-4" /> },
  { id: 'precio-asc',   label: 'Precio: Menor → Mayor', icon: <ArrowUpNarrowWide className="w-4 h-4" /> },
  { id: 'nombre-asc',   label: 'Nombre: A → Z',         icon: <AArrowDown className="w-4 h-4" /> },
  { id: 'nombre-desc',  label: 'Nombre: Z → A',         icon: <AArrowUp className="w-4 h-4" /> },
];

/* ══════════════════════════════════════════════════
   UTILS
══════════════════════════════════════════════════ */
const CLP = (n: number) => `$ ${n.toLocaleString('es-CL')}`;

function useCountdown(fechaFin: string) {
  const [remaining, setRemaining] = useState('');
  const [activa, setActiva] = useState(true);

  useEffect(() => {
    const calc = () => {
      const diff = new Date(fechaFin).getTime() - Date.now();
      if (diff <= 0) { setRemaining('Finalizada'); setActiva(false); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setRemaining(d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m`);
    };
    calc();
    const t = setInterval(calc, 30000);
    return () => clearInterval(t);
  }, [fechaFin]);

  return { remaining, activa };
}

const condicionBadge: Record<Condicion, { label: string; cls: string }> = {
  'nuevo':     { label: 'Nuevo',      cls: 'bg-green-100 text-green-700 border-green-200' },
  'semi-nuevo':{ label: 'Semi-nuevo', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  'usado':     { label: 'Usado',      cls: 'bg-gray-100 text-gray-600 border-gray-200' },
};

/* ══════════════════════════════════════════════════
   TARJETA DE SUBASTA
══════════════════════════════════════════════════ */
function TarjetaSubasta({ s, onDetalle }: { s: Subasta; onDetalle: () => void }) {
  const { remaining, activa } = useCountdown(s.fechaFin);
  const badge = condicionBadge[s.condicion];
  const yaInicio = new Date(s.fechaInicio) <= new Date();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:border-gray-200 transition-all group">
      {/* Imagen */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        <img src={s.imagen} alt={s.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

        {/* Badges superpuestos */}
        <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
          <span className={`text-[10px] font-semibold border rounded-full px-2.5 py-1 ${badge.cls}`}>{badge.label}</span>
          <span className="text-[10px] font-medium bg-white/90 text-gray-600 border border-gray-200 rounded-full px-2.5 py-1">{s.categoria}</span>
        </div>

        {/* Timer */}
        <div className={`absolute bottom-3 right-3 flex items-center gap-1.5 text-xs font-medium rounded-lg px-2.5 py-1.5 ${activa && yaInicio ? 'bg-[#1a5276] text-white' : !yaInicio ? 'bg-amber-500 text-white' : 'bg-gray-700 text-white'}`}>
          <Clock className="w-3.5 h-3.5" />
          {!yaInicio ? `Inicia: ${new Date(s.fechaInicio).toLocaleDateString('es-CL')}` : remaining}
        </div>

        {/* Sin imagen fallback */}
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 -z-10">
          <ImageIcon className="w-12 h-12 text-gray-300" />
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-[#1a5276] transition-colors">{s.titulo}</h3>
        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{s.descripcion}</p>

        {/* Precios */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400 uppercase tracking-wide">Precio base</span>
            <span className="text-xs text-gray-500">{CLP(s.precioBase)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400 uppercase tracking-wide">Puja actual</span>
            <span className="text-base font-bold text-[#1a5276]">{CLP(s.precioActual)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400 uppercase tracking-wide">Incremento mínimo</span>
            <span className="text-xs text-green-600 font-medium">+ {CLP(s.incrementoMinimo)}</span>
          </div>
        </div>

        {/* Pujas */}
        <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-3">
          <span>{s.pujas.length} puja{s.pujas.length !== 1 ? 's' : ''} realizadas</span>
          <span className={`font-medium ${activa && yaInicio ? 'text-green-600' : 'text-gray-400'}`}>
            {!yaInicio ? '⏳ Por iniciar' : activa ? '🟢 Activa' : '🔴 Cerrada'}
          </span>
        </div>

        <button
          onClick={onDetalle}
          className="w-full bg-[#1a5276] text-white text-sm font-medium py-2.5 rounded-xl hover:bg-[#143d5a] transition-colors flex items-center justify-center gap-2"
        >
          <Gavel className="w-4 h-4" />
          {activa && yaInicio ? 'Pujar ahora' : 'Ver detalle'}
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   MODAL DETALLE / PUJAR
══════════════════════════════════════════════════ */
function ModalDetalle({ s, rut, onClose, onPuja }: { s: Subasta; rut: string; onClose: () => void; onPuja: (id: string, monto: number) => void }) {
  const { remaining, activa } = useCountdown(s.fechaFin);
  const yaInicio = new Date(s.fechaInicio) <= new Date();
  const montoMin = s.precioActual + s.incrementoMinimo;
  const [monto, setMonto] = useState(montoMin);
  const [imgErr, setImgErr] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const pujar = () => {
    if (monto < montoMin) return;
    onPuja(s.id, monto);
    setEnviado(true);
    setTimeout(() => { setEnviado(false); setMonto(monto + s.incrementoMinimo); }, 2000);
  };

  const badge = condicionBadge[s.condicion];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Gavel className="w-5 h-5 text-[#1a5276]" />
            <h2 className="font-bold text-gray-800">Detalle de Subasta</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Imagen */}
          <div className="relative h-56 bg-gray-100 rounded-xl overflow-hidden">
            {!imgErr
              ? <img src={s.imagen} alt={s.titulo} className="w-full h-full object-cover" onError={() => setImgErr(true)} />
              : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-16 h-16 text-gray-300" /></div>
            }
            <div className="absolute top-3 left-3 flex gap-2">
              <span className={`text-[10px] font-semibold border rounded-full px-2.5 py-1 ${badge.cls}`}>{badge.label}</span>
              <span className="text-[10px] font-medium bg-white/90 text-gray-600 border border-gray-200 rounded-full px-2.5 py-1">{s.categoria}</span>
            </div>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-bold text-gray-800 mb-2">{s.titulo}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{s.descripcion}</p>
          </div>

          {/* Datos subasta */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Precio base',        val: CLP(s.precioBase),        color: 'text-gray-700' },
              { label: 'Puja más alta',       val: CLP(s.precioActual),      color: 'text-[#1a5276] font-bold' },
              { label: 'Incremento mínimo',   val: `+ ${CLP(s.incrementoMinimo)}`, color: 'text-green-600' },
              { label: 'Total pujas',         val: `${s.pujas.length} pujas`,color: 'text-gray-700' },
              { label: 'Inicio',              val: new Date(s.fechaInicio).toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' }), color: 'text-gray-700' },
              { label: 'Cierre',              val: new Date(s.fechaFin).toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' }), color: 'text-gray-700' },
            ].map(({ label, val, color }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
                <p className={`text-sm ${color}`}>{val}</p>
              </div>
            ))}
          </div>

          {/* Countdown */}
          <div className={`flex items-center justify-between p-3 rounded-xl ${activa && yaInicio ? 'bg-[#1a5276]/5 border border-[#1a5276]/20' : 'bg-gray-50 border border-gray-200'}`}>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className={`w-4 h-4 ${activa && yaInicio ? 'text-[#1a5276]' : 'text-gray-400'}`} />
              {!yaInicio ? 'Subasta por iniciar' : activa ? 'Tiempo restante' : 'Subasta finalizada'}
            </div>
            <span className={`font-bold text-sm ${activa && yaInicio ? 'text-[#1a5276]' : 'text-gray-500'}`}>{remaining}</span>
          </div>

          {/* Historial de pujas */}
          {s.pujas.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Historial de Pujas</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {[...s.pujas].reverse().map((p, i) => (
                  <div key={p.id} className={`flex items-center justify-between text-xs p-2.5 rounded-lg ${i === 0 ? 'bg-[#1a5276]/5 border border-[#1a5276]/20' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-2">
                      {i === 0 && <Star className="w-3.5 h-3.5 text-[#1a5276]" />}
                      <span className="text-gray-600">{p.postor}</span>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${i === 0 ? 'text-[#1a5276]' : 'text-gray-700'}`}>{CLP(p.monto)}</p>
                      <p className="text-gray-400">{new Date(p.fecha).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' })}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Formulario de puja */}
          {activa && yaInicio ? (
            <div className="border-t border-gray-100 pt-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Realizar Puja</p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">$</span>
                  <input
                    type="number" value={monto} min={montoMin} step={s.incrementoMinimo}
                    onChange={e => setMonto(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a5276]/20 focus:border-[#1a5276]"
                  />
                </div>
                <button onClick={pujar} disabled={monto < montoMin}
                  className="bg-[#1a5276] text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-[#143d5a] disabled:opacity-40 transition-colors flex items-center gap-2 flex-shrink-0">
                  <Gavel className="w-4 h-4" /> Pujar
                </button>
              </div>
              {monto < montoMin && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Monto mínimo: {CLP(montoMin)}
                </p>
              )}
              {enviado && (
                <div className="mt-2 flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  <CheckCircle2 className="w-4 h-4" /> ¡Puja registrada por {CLP(monto)}!
                </div>
              )}
              <p className="text-[10px] text-gray-400 mt-2">Puja mínima: {CLP(montoMin)} · Incremento: {CLP(s.incrementoMinimo)}</p>
            </div>
          ) : (
            <div className="border-t border-gray-100 pt-4 text-center text-sm text-gray-400">
              {!yaInicio ? '⏳ La subasta aún no ha comenzado.' : '🔴 Esta subasta ya cerró.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   MODAL NUEVA SUBASTA
══════════════════════════════════════════════════ */
function ModalNuevaSubasta({ onClose, onCreate }: { onClose: () => void; onCreate: (s: Subasta) => void }) {
  const [form, setForm] = useState({
    titulo: '', descripcion: '', condicion: 'nuevo' as Condicion, categoria: 'Otro',
    precioBase: '', incrementoMinimo: '', fechaInicio: '', fechaFin: '', imagen: '',
  });
  const [preview, setPreview] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const upd = (k: string, v: string) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const validar = () => {
    const e: Record<string, string> = {};
    if (!form.titulo.trim())         e.titulo = 'Requerido';
    if (!form.descripcion.trim())    e.descripcion = 'Requerido';
    if (!form.precioBase || isNaN(Number(form.precioBase)))           e.precioBase = 'Monto inválido';
    if (!form.incrementoMinimo || isNaN(Number(form.incrementoMinimo))) e.incrementoMinimo = 'Monto inválido';
    if (!form.fechaInicio)           e.fechaInicio = 'Requerido';
    if (!form.fechaFin)              e.fechaFin = 'Requerido';
    if (form.fechaInicio && form.fechaFin && form.fechaFin <= form.fechaInicio) e.fechaFin = 'Debe ser posterior al inicio';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const guardar = () => {
    if (!validar()) return;
    onCreate({
      id: crypto.randomUUID(),
      titulo: form.titulo, descripcion: form.descripcion,
      condicion: form.condicion, categoria: form.categoria,
      imagen: preview || `https://picsum.photos/seed/${Math.random()}/600/400`,
      precioBase: Number(form.precioBase), precioActual: Number(form.precioBase),
      incrementoMinimo: Number(form.incrementoMinimo),
      fechaInicio: form.fechaInicio, fechaFin: form.fechaFin, pujas: [],
    });
    onClose();
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const Campo2 = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
      {children}
      {error && <p className="mt-1 text-[11px] text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
    </div>
  );

  const inp = (extraClass = '') => `w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a5276]/20 focus:border-[#1a5276] transition-all ${extraClass}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="font-bold text-gray-800 flex items-center gap-2"><Plus className="w-5 h-5 text-[#1a5276]" /> Nueva Subasta</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-4">
          {/* Imagen */}
          <Campo2 label="Imagen del producto">
            <div
              onClick={() => fileRef.current?.click()}
              className={`h-40 rounded-xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center gap-2 transition-colors ${preview ? 'border-[#1a5276]/40' : 'border-gray-200 hover:border-[#1a5276]/40'}`}
              style={preview ? { backgroundImage: `url(${preview})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
            >
              {!preview && <>
                <Upload className="w-8 h-8 text-gray-300" />
                <p className="text-xs text-gray-400">Haz clic para subir imagen</p>
                <p className="text-[10px] text-gray-300">JPG, PNG, WEBP — máx. 5MB</p>
              </>}
              {preview && <div className="w-full h-full rounded-xl bg-black/30 flex items-center justify-center"><span className="text-white text-xs font-medium">Cambiar imagen</span></div>}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </Campo2>

          <Campo2 label="Título del producto *" error={errors.titulo}>
            <input value={form.titulo} onChange={e => upd('titulo', e.target.value)} placeholder="Ej: Camioneta Toyota 2019" className={inp(errors.titulo ? 'border-red-300' : 'border-gray-200')} />
          </Campo2>

          <Campo2 label="Descripción *" error={errors.descripcion}>
            <textarea value={form.descripcion} onChange={e => upd('descripcion', e.target.value)} placeholder="Describa el producto detalladamente..." rows={3} className={inp(errors.descripcion ? 'border-red-300 resize-none' : 'border-gray-200 resize-none')} />
          </Campo2>

          <div className="grid grid-cols-2 gap-4">
            <Campo2 label="Condición *">
              <select value={form.condicion} onChange={e => upd('condicion', e.target.value)} className={inp('border-gray-200 bg-white')}>
                {CONDICIONES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </Campo2>
            <Campo2 label="Categoría">
              <select value={form.categoria} onChange={e => upd('categoria', e.target.value)} className={inp('border-gray-200 bg-white')}>
                {CATEGORIAS.filter(c => c !== 'Todas').map(c => <option key={c}>{c}</option>)}
              </select>
            </Campo2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Campo2 label="Precio base ($) *" error={errors.precioBase}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">$</span>
                <input type="number" min="0" value={form.precioBase} onChange={e => upd('precioBase', e.target.value)} placeholder="0" className={inp('pl-7 ' + (errors.precioBase ? 'border-red-300' : 'border-gray-200'))} />
              </div>
            </Campo2>
            <Campo2 label="Incremento mínimo ($) *" error={errors.incrementoMinimo}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">+$</span>
                <input type="number" min="0" value={form.incrementoMinimo} onChange={e => upd('incrementoMinimo', e.target.value)} placeholder="0" className={inp('pl-8 ' + (errors.incrementoMinimo ? 'border-red-300' : 'border-gray-200'))} />
              </div>
            </Campo2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Campo2 label="Inicio de subasta *" error={errors.fechaInicio}>
              <input type="datetime-local" value={form.fechaInicio} onChange={e => upd('fechaInicio', e.target.value)} className={inp(errors.fechaInicio ? 'border-red-300' : 'border-gray-200')} />
            </Campo2>
            <Campo2 label="Fin de subasta *" error={errors.fechaFin}>
              <input type="datetime-local" value={form.fechaFin} onChange={e => upd('fechaFin', e.target.value)} className={inp(errors.fechaFin ? 'border-red-300' : 'border-gray-200')} />
            </Campo2>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 text-sm py-2.5 rounded-xl hover:bg-gray-50 transition-colors">Cancelar</button>
            <button onClick={guardar} className="flex-1 bg-[#1a5276] text-white text-sm font-medium py-2.5 rounded-xl hover:bg-[#143d5a] transition-colors flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Publicar subasta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════════════ */
interface Props { rut: string; onVolver: () => void }

export function Subastas({ rut, onVolver }: Props) {
  const [subastas, setSubastas]   = useState<Subasta[]>(SUBASTAS_INICIALES);
  const [detalle, setDetalle]     = useState<Subasta | null>(null);
  const [nuevaOpen, setNuevaOpen] = useState(false);
  const [busqueda, setBusqueda]   = useState('');
  const [orden, setOrden]         = useState<OrdenKey>('precio-desc');
  const [catFiltro, setCatFiltro] = useState('Todas');
  const [condFiltro, setCondFiltro] = useState<Condicion | 'todas'>('todas');
  const [ordenOpen, setOrdenOpen] = useState(false);

  const handlePuja = (id: string, monto: number) => {
    setSubastas(prev => prev.map(s => s.id !== id ? s : {
      ...s,
      precioActual: monto,
      pujas: [...s.pujas, { id: crypto.randomUUID(), monto, postor: `Usuario ***${rut.slice(-2)}`, fecha: new Date().toISOString() }],
    }));
    setDetalle(prev => prev?.id === id ? { ...prev, precioActual: monto, pujas: [...prev.pujas, { id: crypto.randomUUID(), monto, postor: `Usuario ***${rut.slice(-2)}`, fecha: new Date().toISOString() }] } : prev);
  };

  const lista = subastas
    .filter(s => {
      const matchQ   = !busqueda || s.titulo.toLowerCase().includes(busqueda.toLowerCase()) || s.descripcion.toLowerCase().includes(busqueda.toLowerCase());
      const matchCat = catFiltro === 'Todas' || s.categoria === catFiltro;
      const matchCond = condFiltro === 'todas' || s.condicion === condFiltro;
      return matchQ && matchCat && matchCond;
    })
    .sort((a, b) => {
      if (orden === 'precio-desc')  return b.precioActual - a.precioActual;
      if (orden === 'precio-asc')   return a.precioActual - b.precioActual;
      if (orden === 'nombre-asc')   return a.titulo.localeCompare(b.titulo);
      if (orden === 'nombre-desc')  return b.titulo.localeCompare(a.titulo);
      return 0;
    });

  const ordenActual = ORDENES.find(o => o.id === orden)!;

  return (
    <PageLayout titulo="Subastas Aduaneras" subtitulo="Bienes incautados y comisados disponibles para subasta" rut={rut} onVolver={onVolver}
      accion={
        <button onClick={() => setNuevaOpen(true)} className="flex items-center gap-1.5 bg-white text-[#1a5276] text-xs font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">
          <Plus className="w-4 h-4" /> Nueva subasta
        </button>
      }
    >
      {/* ── Barra de filtros ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 space-y-3">

        {/* Fila 1: búsqueda + orden */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar en subastas…"
              className="w-full pl-10 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a5276]/20 focus:border-[#1a5276]" />
          </div>

          {/* Selector de orden */}
          <div className="relative">
            <button onClick={() => setOrdenOpen(!ordenOpen)}
              className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 hover:border-gray-300 transition-colors bg-white whitespace-nowrap">
              <ArrowUpDown className="w-4 h-4 text-gray-400" />
              <span className="hidden sm:inline">{ordenActual.label}</span>
              <span className="sm:hidden">Ordenar</span>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${ordenOpen ? 'rotate-180' : ''}`} />
            </button>

            {ordenOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 min-w-[220px] py-1">
                {ORDENES.map(o => (
                  <button key={o.id} onClick={() => { setOrden(o.id); setOrdenOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-gray-50 transition-colors ${orden === o.id ? 'text-[#1a5276] font-medium bg-blue-50' : 'text-gray-600'}`}>
                    {o.icon} {o.label}
                    {orden === o.id && <CheckCircle2 className="w-4 h-4 ml-auto text-[#1a5276]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Fila 2: categoría + condición */}
        <div className="flex gap-3 flex-wrap">
          <div className="flex gap-1.5 flex-wrap">
            <span className="text-[10px] text-gray-400 self-center mr-1 font-medium uppercase tracking-wide">Categoría:</span>
            {CATEGORIAS.map(c => (
              <button key={c} onClick={() => setCatFiltro(c)}
                className={`px-3 py-1 rounded-full text-xs border transition-all ${catFiltro === c ? 'bg-[#1a5276] text-white border-[#1a5276]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                {c}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5 items-center">
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Condición:</span>
            <button onClick={() => setCondFiltro('todas')}
              className={`px-3 py-1 rounded-full text-xs border transition-all ${condFiltro === 'todas' ? 'bg-[#1a5276] text-white border-[#1a5276]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
              Todas
            </button>
            {CONDICIONES.map(c => (
              <button key={c.id} onClick={() => setCondFiltro(c.id)}
                className={`px-3 py-1 rounded-full text-xs border transition-all ${condFiltro === c.id ? 'bg-[#1a5276] text-white border-[#1a5276]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Resultado */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-gray-400">
          <strong className="text-gray-600">{lista.length}</strong> subasta{lista.length !== 1 ? 's' : ''} encontrada{lista.length !== 1 ? 's' : ''}
          {busqueda && <> para "<strong className="text-gray-600">{busqueda}</strong>"</>}
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <SlidersHorizontal className="w-3.5 h-3.5" /> {ordenActual.label}
        </div>
      </div>

      {lista.length === 0
        ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <Gavel className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium mb-1">Sin resultados</p>
            <p className="text-xs text-gray-400">Intente con otros filtros de búsqueda.</p>
          </div>
        )
        : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {lista.map(s => (
              <TarjetaSubasta key={s.id} s={s} onDetalle={() => setDetalle(s)} />
            ))}
          </div>
        )
      }

      {/* Modales */}
      {detalle && <ModalDetalle s={detalle} rut={rut} onClose={() => setDetalle(null)} onPuja={handlePuja} />}
      {nuevaOpen && <ModalNuevaSubasta onClose={() => setNuevaOpen(false)} onCreate={s => setSubastas(prev => [s, ...prev])} />}
    </PageLayout>
  );
}
