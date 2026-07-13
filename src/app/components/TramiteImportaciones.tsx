import { useState } from 'react';
import { Package, User, Truck, FileCheck, CheckCircle2 } from 'lucide-react';
import { validarRut, formatRut, MSG_RUT_INVALIDO } from '../utils/rut';
import { PageLayout, IndicadorPasos } from './ui/PageLayout';
import { Campo, FInput, FSelect, NavBtns, InfoBox, TarjetaRevision, Confirmacion } from './ui/FormFields';

const PASOS = [
  { id: 1, label: 'Importador',  icon: <User className="w-4 h-4" /> },
  { id: 2, label: 'Mercancía',   icon: <Package className="w-4 h-4" /> },
  { id: 3, label: 'Transporte',  icon: <Truck className="w-4 h-4" /> },
  { id: 4, label: 'Documentos',  icon: <FileCheck className="w-4 h-4" /> },
  { id: 5, label: 'Revisión',    icon: <CheckCircle2 className="w-4 h-4" /> },
];

const PAISES = ['Argentina', 'Bolivia', 'Brasil', 'China', 'Colombia', 'España', 'Estados Unidos', 'Francia', 'Alemania', 'Italia', 'Japón', 'México', 'Perú', 'Otro'];
const PUERTOS = ['Valparaíso', 'San Antonio', 'Iquique', 'Antofagasta', 'Arica', 'Puerto Montt', 'Aeropuerto SCL', 'Paso Los Libertadores'];
const TRANSPORTES = ['Marítimo', 'Aéreo', 'Terrestre', 'Ferroviario', 'Multimodal'];

interface D1 { rut: string; nombre: string; giro: string; direccion: string; agente: string }
interface D2 { descripcion: string; partida: string; cantidad: string; unidad: string; pesoKg: string; valorFOB: string; paisOrigen: string }
interface D3 { transporte: string; puerto: string; fechaEstimada: string; naviera: string; nroBL: string }
interface D4 { factura: boolean; packingList: boolean; conocimiento: boolean; seguro: boolean; origen: boolean }

const DOCS_LABELS: Record<keyof D4, string> = {
  factura: 'Factura Comercial',
  packingList: 'Packing List',
  conocimiento: 'Conocimiento de Embarque (B/L)',
  seguro: 'Póliza de Seguro',
  origen: 'Certificado de Origen',
};

interface Props { rut: string; onVolver: () => void }

export function TramiteImportaciones({ rut, onVolver }: Props) {
  const [paso, setPaso] = useState(1);
  const [folio, setFolio] = useState('');
  const [d1, setD1] = useState<D1>({ rut, nombre: '', giro: '', direccion: '', agente: '' });
  const [d2, setD2] = useState<D2>({ descripcion: '', partida: '', cantidad: '', unidad: 'KG', pesoKg: '', valorFOB: '', paisOrigen: '' });
  const [d3, setD3] = useState<D3>({ transporte: '', puerto: '', fechaEstimada: '', naviera: '', nroBL: '' });
  const [d4, setD4] = useState<D4>({ factura: false, packingList: false, conocimiento: false, seguro: false, origen: false });

  const [err1, setErr1] = useState<Partial<D1>>({});
  const [err2, setErr2] = useState<Partial<D2>>({});
  const [err3, setErr3] = useState<Partial<D3>>({});

  const val1 = () => {
    const e: Partial<D1> = {};
    if (!validarRut(d1.rut))    e.rut       = MSG_RUT_INVALIDO;
    if (!d1.nombre.trim())      e.nombre    = 'Requerido';
    if (!d1.giro.trim())        e.giro      = 'Requerido';
    if (!d1.direccion.trim())   e.direccion = 'Requerido';
    setErr1(e); return !Object.keys(e).length;
  };
  const val2 = () => {
    const e: Partial<D2> = {};
    if (!d2.descripcion.trim()) e.descripcion = 'Requerido';
    if (!d2.partida.trim())     e.partida     = 'Requerido';
    if (!d2.cantidad)           e.cantidad    = 'Requerido';
    if (!d2.valorFOB)           e.valorFOB    = 'Requerido';
    if (!d2.paisOrigen)         e.paisOrigen  = 'Requerido';
    setErr2(e); return !Object.keys(e).length;
  };
  const val3 = () => {
    const e: Partial<D3> = {};
    if (!d3.transporte)     e.transporte     = 'Requerido';
    if (!d3.puerto)         e.puerto         = 'Requerido';
    if (!d3.fechaEstimada)  e.fechaEstimada  = 'Requerido';
    setErr3(e); return !Object.keys(e).length;
  };

  const enviar = () => { setFolio(`IMP-2026-${Math.floor(10000 + Math.random() * 90000)}`); setPaso(6); };

  const docsMarcados = (Object.keys(d4) as (keyof D4)[]).filter(k => d4[k]).length;

  return (
    <PageLayout titulo="Declaración de Importación" subtitulo="DIN — Pago Electrónico de Derechos" rut={rut} onVolver={onVolver}>
      {paso < 6 && <IndicadorPasos pasos={PASOS} actual={paso} />}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {paso < 6 && (
          <div className="mb-6">
            <h2 className="text-gray-800 font-bold">{PASOS[paso - 1].label}</h2>
            <p className="text-xs text-gray-400">Paso {paso} de {PASOS.length}</p>
          </div>
        )}

        {/* PASO 1 */}
        {paso === 1 && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Campo label="RUT del Importador" required error={err1.rut}>
                <FInput value={d1.rut} onChange={e => setD1({ ...d1, rut: formatRut(e.target.value) })} placeholder="12.345.678-9" className="font-mono" error={!!err1.rut} />
              </Campo>
              <Campo label="Nombre o Razón Social" required error={err1.nombre}>
                <FInput value={d1.nombre} onChange={e => setD1({ ...d1, nombre: e.target.value })} placeholder="Empresa o persona natural" error={!!err1.nombre} />
              </Campo>
            </div>
            <Campo label="Giro Comercial" required error={err1.giro}>
              <FInput value={d1.giro} onChange={e => setD1({ ...d1, giro: e.target.value })} placeholder="Ej: Importación de maquinaria industrial" error={!!err1.giro} />
            </Campo>
            <Campo label="Dirección" required error={err1.direccion}>
              <FInput value={d1.direccion} onChange={e => setD1({ ...d1, direccion: e.target.value })} placeholder="Calle, número, ciudad, región" error={!!err1.direccion} />
            </Campo>
            <Campo label="Agente de Aduana (RUT)">
              <FInput value={d1.agente} onChange={e => setD1({ ...d1, agente: e.target.value })} placeholder="Opcional — RUT del agente habilitado" />
            </Campo>
            <InfoBox>Para importaciones superiores a USD 1.000 es obligatorio tramitar a través de un Agente de Aduana habilitado.</InfoBox>
            <NavBtns onNext={() => val1() && setPaso(2)} />
          </div>
        )}

        {/* PASO 2 */}
        {paso === 2 && (
          <div className="space-y-5">
            <Campo label="Descripción de la Mercancía" required error={err2.descripcion}>
              <FInput value={d2.descripcion} onChange={e => setD2({ ...d2, descripcion: e.target.value })} placeholder="Descripción detallada de los bienes" error={!!err2.descripcion} />
            </Campo>
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Partida Arancelaria" required error={err2.partida}>
                <FInput value={d2.partida} onChange={e => setD2({ ...d2, partida: e.target.value })} placeholder="Ej: 8479.89.90" error={!!err2.partida} />
              </Campo>
              <Campo label="País de Origen" required error={err2.paisOrigen}>
                <FSelect value={d2.paisOrigen} onChange={e => setD2({ ...d2, paisOrigen: e.target.value })} error={!!err2.paisOrigen}>
                  <option value="">Seleccionar</option>
                  {PAISES.map(p => <option key={p}>{p}</option>)}
                </FSelect>
              </Campo>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Campo label="Cantidad" required error={err2.cantidad}>
                <FInput type="number" min="1" value={d2.cantidad} onChange={e => setD2({ ...d2, cantidad: e.target.value })} placeholder="0" error={!!err2.cantidad} />
              </Campo>
              <Campo label="Unidad">
                <FSelect value={d2.unidad} onChange={e => setD2({ ...d2, unidad: e.target.value })}>
                  {['KG', 'TON', 'UNI', 'LT', 'M3', 'M2'].map(u => <option key={u}>{u}</option>)}
                </FSelect>
              </Campo>
              <Campo label="Peso Bruto (KG)">
                <FInput type="number" value={d2.pesoKg} onChange={e => setD2({ ...d2, pesoKg: e.target.value })} placeholder="0.00" />
              </Campo>
            </div>
            <Campo label="Valor FOB (USD)" required error={err2.valorFOB}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">USD</span>
                <FInput value={d2.valorFOB} onChange={e => setD2({ ...d2, valorFOB: e.target.value })} placeholder="0.00" className="pl-11" error={!!err2.valorFOB} />
              </div>
            </Campo>
            <NavBtns onBack={() => setPaso(1)} onNext={() => val2() && setPaso(3)} />
          </div>
        )}

        {/* PASO 3 */}
        {paso === 3 && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Vía de Transporte" required error={err3.transporte}>
                <FSelect value={d3.transporte} onChange={e => setD3({ ...d3, transporte: e.target.value })} error={!!err3.transporte}>
                  <option value="">Seleccionar</option>
                  {TRANSPORTES.map(t => <option key={t}>{t}</option>)}
                </FSelect>
              </Campo>
              <Campo label="Puerto / Aduana de Ingreso" required error={err3.puerto}>
                <FSelect value={d3.puerto} onChange={e => setD3({ ...d3, puerto: e.target.value })} error={!!err3.puerto}>
                  <option value="">Seleccionar</option>
                  {PUERTOS.map(p => <option key={p}>{p}</option>)}
                </FSelect>
              </Campo>
            </div>
            <Campo label="Fecha Estimada de Llegada" required error={err3.fechaEstimada}>
              <FInput type="date" value={d3.fechaEstimada} onChange={e => setD3({ ...d3, fechaEstimada: e.target.value })} error={!!err3.fechaEstimada} />
            </Campo>
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Transportista / Naviera">
                <FInput value={d3.naviera} onChange={e => setD3({ ...d3, naviera: e.target.value })} placeholder="Ej: CSAV, LATAM Cargo" />
              </Campo>
              <Campo label="N° BL / AWB / Carta Porte">
                <FInput value={d3.nroBL} onChange={e => setD3({ ...d3, nroBL: e.target.value })} placeholder="Número de documento" />
              </Campo>
            </div>
            <NavBtns onBack={() => setPaso(2)} onNext={() => val3() && setPaso(4)} />
          </div>
        )}

        {/* PASO 4 */}
        {paso === 4 && (
          <div className="space-y-5">
            <InfoBox color="amber">Marque los documentos que adjuntará a esta declaración. Los documentos marcados deberán ser presentados físicamente o cargados digitalmente al momento del aforo.</InfoBox>
            <div className="space-y-2">
              {(Object.keys(d4) as (keyof D4)[]).map(k => (
                <label key={k} onClick={() => setD4({ ...d4, [k]: !d4[k] })}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${d4[k] ? 'border-[#1a5276] bg-[#1a5276]/5' : 'border-gray-100 hover:border-gray-200'}`}>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${d4[k] ? 'bg-[#1a5276] border-[#1a5276]' : 'border-gray-300'}`}>
                    {d4[k] && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <span className="text-sm text-gray-700">{DOCS_LABELS[k]}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-400">{docsMarcados} de {Object.keys(d4).length} documentos marcados</p>
            <NavBtns onBack={() => setPaso(3)} onNext={() => setPaso(5)} />
          </div>
        )}

        {/* PASO 5 — Revisión */}
        {paso === 5 && (
          <div className="space-y-4">
            <TarjetaRevision titulo="Datos del Importador" icon={<User className="w-3.5 h-3.5" />} filas={[['RUT', d1.rut], ['Nombre', d1.nombre], ['Giro', d1.giro], ['Dirección', d1.direccion]]} />
            <TarjetaRevision titulo="Mercancía" icon={<Package className="w-3.5 h-3.5" />} filas={[['Descripción', d2.descripcion], ['Partida', d2.partida], ['País Origen', d2.paisOrigen], ['Cantidad', `${d2.cantidad} ${d2.unidad}`], ['Peso', d2.pesoKg ? `${d2.pesoKg} KG` : '—'], ['Valor FOB', `USD ${d2.valorFOB}`]]} />
            <TarjetaRevision titulo="Transporte" icon={<Truck className="w-3.5 h-3.5" />} filas={[['Vía', d3.transporte], ['Puerto', d3.puerto], ['Fecha estimada', d3.fechaEstimada], ['BL/AWB', d3.nroBL]]} />
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Documentos</p>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(d4) as (keyof D4)[]).filter(k => d4[k]).map(k => (
                  <span key={k} className="text-xs bg-green-100 text-green-700 border border-green-200 rounded-full px-3 py-1">{DOCS_LABELS[k]}</span>
                ))}
                {!docsMarcados && <span className="text-xs text-gray-400">Sin documentos marcados</span>}
              </div>
            </div>
            <NavBtns onBack={() => setPaso(4)} onNext={enviar} nextLabel="Enviar declaración" />
          </div>
        )}

        {paso === 6 && (
          <Confirmacion folio={folio} tipo="Declaración de Importación (DIN)" pasos={['Espere la asignación de aforo (1–3 días hábiles).', 'Presente los documentos requeridos en el módulo de Aduanas.', 'Realice el pago de derechos una vez liquidada la declaración.', 'Retire su mercancía con el comprobante de pago.']} onVolver={onVolver} />
        )}
      </div>
    </PageLayout>
  );
}
