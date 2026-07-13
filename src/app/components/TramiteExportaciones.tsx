import { useState } from 'react';
import { PackageCheck, User, Globe, Truck, FileCheck, CheckCircle2 } from 'lucide-react';
import { validarRut, formatRut, MSG_RUT_INVALIDO } from '../utils/rut';
import { PageLayout, IndicadorPasos } from './ui/PageLayout';
import { Campo, FInput, FSelect, FTextarea, NavBtns, InfoBox, TarjetaRevision, Confirmacion } from './ui/FormFields';

const PASOS = [
  { id: 1, label: 'Exportador',  icon: <User className="w-4 h-4" /> },
  { id: 2, label: 'Destino',     icon: <Globe className="w-4 h-4" /> },
  { id: 3, label: 'Mercancía',   icon: <PackageCheck className="w-4 h-4" /> },
  { id: 4, label: 'Transporte',  icon: <Truck className="w-4 h-4" /> },
  { id: 5, label: 'Revisión',    icon: <FileCheck className="w-4 h-4" /> },
];

const PAISES = ['Argentina', 'Bolivia', 'Brasil', 'China', 'Colombia', 'España', 'Estados Unidos', 'Francia', 'Alemania', 'Italia', 'Japón', 'México', 'Perú', 'Reino Unido', 'Otro'];
const PUERTOS = ['San Antonio', 'Valparaíso', 'Iquique', 'Antofagasta', 'Arica', 'Puerto Montt', 'Aeropuerto SCL', 'Paso Los Libertadores'];
const INCOTERMS = ['EXW', 'FCA', 'FOB', 'CFR', 'CIF', 'DAP', 'DDP'];

interface D1 { rut: string; nombre: string; giro: string; email: string; telefono: string }
interface D2 { paisDestino: string; ciudadDestino: string; importador: string; rutExtranjero: string }
interface D3 { descripcion: string; partida: string; cantidad: string; unidad: string; valorFOB: string; pesoKg: string; incoterm: string }
interface D4 { via: string; puerto: string; fechaEmbarque: string; transportista: string; nroBL: string }

interface Props { rut: string; onVolver: () => void }

export function TramiteExportaciones({ rut, onVolver }: Props) {
  const [paso, setPaso] = useState(1);
  const [folio, setFolio] = useState('');
  const [d1, setD1] = useState<D1>({ rut, nombre: '', giro: '', email: '', telefono: '' });
  const [d2, setD2] = useState<D2>({ paisDestino: '', ciudadDestino: '', importador: '', rutExtranjero: '' });
  const [d3, setD3] = useState<D3>({ descripcion: '', partida: '', cantidad: '', unidad: 'KG', valorFOB: '', pesoKg: '', incoterm: 'FOB' });
  const [d4, setD4] = useState<D4>({ via: '', puerto: '', fechaEmbarque: '', transportista: '', nroBL: '' });

  const [err1, setErr1] = useState<Partial<D1>>({});
  const [err2, setErr2] = useState<Partial<D2>>({});
  const [err3, setErr3] = useState<Partial<D3>>({});
  const [err4, setErr4] = useState<Partial<D4>>({});

  const v1 = () => { const e: Partial<D1> = {}; if (!validarRut(d1.rut)) e.rut = MSG_RUT_INVALIDO; if (!d1.nombre) e.nombre = 'Requerido'; if (!d1.email) e.email = 'Requerido'; setErr1(e); return !Object.keys(e).length; };
  const v2 = () => { const e: Partial<D2> = {}; if (!d2.paisDestino) e.paisDestino = 'Requerido'; if (!d2.importador) e.importador = 'Requerido'; setErr2(e); return !Object.keys(e).length; };
  const v3 = () => { const e: Partial<D3> = {}; if (!d3.descripcion) e.descripcion = 'Requerido'; if (!d3.partida) e.partida = 'Requerido'; if (!d3.valorFOB) e.valorFOB = 'Requerido'; if (!d3.cantidad) e.cantidad = 'Requerido'; setErr3(e); return !Object.keys(e).length; };
  const v4 = () => { const e: Partial<D4> = {}; if (!d4.via) e.via = 'Requerido'; if (!d4.puerto) e.puerto = 'Requerido'; if (!d4.fechaEmbarque) e.fechaEmbarque = 'Requerido'; setErr4(e); return !Object.keys(e).length; };

  const enviar = () => { setFolio(`EXP-2026-${Math.floor(10000 + Math.random() * 90000)}`); setPaso(6); };

  return (
    <PageLayout titulo="Declaración Única de Salida" subtitulo="DUS — Exportación de Mercancías" rut={rut} onVolver={onVolver}>
      {paso < 6 && <IndicadorPasos pasos={PASOS} actual={paso} />}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {paso < 6 && <div className="mb-6"><h2 className="text-gray-800 font-bold">{PASOS[paso - 1].label}</h2><p className="text-xs text-gray-400">Paso {paso} de {PASOS.length}</p></div>}

        {paso === 1 && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Campo label="RUT Exportador" required error={err1.rut}><FInput value={d1.rut} onChange={e => setD1({ ...d1, rut: formatRut(e.target.value) })} placeholder="12.345.678-9" className="font-mono" error={!!err1.rut} /></Campo>
              <Campo label="Nombre / Razón Social" required error={err1.nombre}><FInput value={d1.nombre} onChange={e => setD1({ ...d1, nombre: e.target.value })} placeholder="Empresa exportadora" error={!!err1.nombre} /></Campo>
            </div>
            <Campo label="Giro Comercial"><FInput value={d1.giro} onChange={e => setD1({ ...d1, giro: e.target.value })} placeholder="Ej: Exportación de vinos y licores" /></Campo>
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Correo Electrónico" required error={err1.email}><FInput type="email" value={d1.email} onChange={e => setD1({ ...d1, email: e.target.value })} placeholder="contacto@empresa.cl" error={!!err1.email} /></Campo>
              <Campo label="Teléfono"><FInput value={d1.telefono} onChange={e => setD1({ ...d1, telefono: e.target.value })} placeholder="+56 9 0000 0000" /></Campo>
            </div>
            <InfoBox>Para exportaciones superiores a USD 2.000 es obligatorio tramitar con un Agente de Aduana habilitado.</InfoBox>
            <NavBtns onNext={() => v1() && setPaso(2)} />
          </div>
        )}

        {paso === 2 && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Campo label="País de Destino" required error={err2.paisDestino}>
                <FSelect value={d2.paisDestino} onChange={e => setD2({ ...d2, paisDestino: e.target.value })} error={!!err2.paisDestino}>
                  <option value="">Seleccionar</option>
                  {PAISES.map(p => <option key={p}>{p}</option>)}
                </FSelect>
              </Campo>
              <Campo label="Ciudad de Destino"><FInput value={d2.ciudadDestino} onChange={e => setD2({ ...d2, ciudadDestino: e.target.value })} placeholder="Ej: Buenos Aires" /></Campo>
            </div>
            <Campo label="Nombre del Importador Extranjero" required error={err2.importador}><FInput value={d2.importador} onChange={e => setD2({ ...d2, importador: e.target.value })} placeholder="Empresa receptora de la mercancía" error={!!err2.importador} /></Campo>
            <Campo label="ID Fiscal Extranjero"><FInput value={d2.rutExtranjero} onChange={e => setD2({ ...d2, rutExtranjero: e.target.value })} placeholder="Número de identificación fiscal del país destino" /></Campo>
            <NavBtns onBack={() => setPaso(1)} onNext={() => v2() && setPaso(3)} />
          </div>
        )}

        {paso === 3 && (
          <div className="space-y-5">
            <Campo label="Descripción de la Mercancía" required error={err3.descripcion}><FTextarea value={d3.descripcion} onChange={e => setD3({ ...d3, descripcion: e.target.value })} placeholder="Descripción detallada de los bienes a exportar" error={!!err3.descripcion} /></Campo>
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Partida Arancelaria" required error={err3.partida}><FInput value={d3.partida} onChange={e => setD3({ ...d3, partida: e.target.value })} placeholder="Ej: 2204.21.00" error={!!err3.partida} /></Campo>
              <Campo label="INCOTERM"><FSelect value={d3.incoterm} onChange={e => setD3({ ...d3, incoterm: e.target.value })}>{INCOTERMS.map(i => <option key={i}>{i}</option>)}</FSelect></Campo>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Campo label="Cantidad" required error={err3.cantidad}><FInput type="number" min="1" value={d3.cantidad} onChange={e => setD3({ ...d3, cantidad: e.target.value })} error={!!err3.cantidad} /></Campo>
              <Campo label="Unidad"><FSelect value={d3.unidad} onChange={e => setD3({ ...d3, unidad: e.target.value })}>{['KG', 'TON', 'UNI', 'LT', 'M3', 'CJ'].map(u => <option key={u}>{u}</option>)}</FSelect></Campo>
              <Campo label="Peso Bruto (KG)"><FInput type="number" value={d3.pesoKg} onChange={e => setD3({ ...d3, pesoKg: e.target.value })} placeholder="0.00" /></Campo>
            </div>
            <Campo label="Valor FOB (USD)" required error={err3.valorFOB}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">USD</span>
                <FInput value={d3.valorFOB} onChange={e => setD3({ ...d3, valorFOB: e.target.value })} placeholder="0.00" className="pl-11" error={!!err3.valorFOB} />
              </div>
            </Campo>
            <NavBtns onBack={() => setPaso(2)} onNext={() => v3() && setPaso(4)} />
          </div>
        )}

        {paso === 4 && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Vía de Transporte" required error={err4.via}>
                <FSelect value={d4.via} onChange={e => setD4({ ...d4, via: e.target.value })} error={!!err4.via}>
                  <option value="">Seleccionar</option>
                  {['Marítimo', 'Aéreo', 'Terrestre', 'Ferroviario'].map(t => <option key={t}>{t}</option>)}
                </FSelect>
              </Campo>
              <Campo label="Puerto / Aduana de Salida" required error={err4.puerto}>
                <FSelect value={d4.puerto} onChange={e => setD4({ ...d4, puerto: e.target.value })} error={!!err4.puerto}>
                  <option value="">Seleccionar</option>
                  {PUERTOS.map(p => <option key={p}>{p}</option>)}
                </FSelect>
              </Campo>
            </div>
            <Campo label="Fecha Estimada de Embarque" required error={err4.fechaEmbarque}><FInput type="date" value={d4.fechaEmbarque} onChange={e => setD4({ ...d4, fechaEmbarque: e.target.value })} error={!!err4.fechaEmbarque} /></Campo>
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Transportista / Naviera"><FInput value={d4.transportista} onChange={e => setD4({ ...d4, transportista: e.target.value })} placeholder="Ej: CSAV, Sky Cargo" /></Campo>
              <Campo label="N° BL / AWB / Carta Porte"><FInput value={d4.nroBL} onChange={e => setD4({ ...d4, nroBL: e.target.value })} placeholder="Número de documento" /></Campo>
            </div>
            <NavBtns onBack={() => setPaso(3)} onNext={() => v4() && setPaso(5)} />
          </div>
        )}

        {paso === 5 && (
          <div className="space-y-4">
            <TarjetaRevision titulo="Exportador" icon={<User className="w-3.5 h-3.5" />} filas={[['RUT', d1.rut], ['Nombre', d1.nombre], ['Giro', d1.giro], ['Correo', d1.email]]} />
            <TarjetaRevision titulo="Destino" icon={<Globe className="w-3.5 h-3.5" />} filas={[['País destino', d2.paisDestino], ['Ciudad', d2.ciudadDestino], ['Importador', d2.importador]]} />
            <TarjetaRevision titulo="Mercancía" icon={<PackageCheck className="w-3.5 h-3.5" />} filas={[['Descripción', d3.descripcion], ['Partida', d3.partida], ['Cantidad', `${d3.cantidad} ${d3.unidad}`], ['Valor FOB', `USD ${d3.valorFOB}`], ['INCOTERM', d3.incoterm]]} />
            <TarjetaRevision titulo="Transporte" icon={<Truck className="w-3.5 h-3.5" />} filas={[['Vía', d4.via], ['Puerto', d4.puerto], ['Embarque', d4.fechaEmbarque], ['Transportista', d4.transportista]]} />
            <NavBtns onBack={() => setPaso(4)} onNext={enviar} nextLabel="Enviar declaración" />
          </div>
        )}

        {paso === 6 && (
          <Confirmacion folio={folio} tipo="Declaración Única de Salida (DUS)" pasos={['Presente los documentos en el módulo de exportaciones.', 'Espere la autorización de embarque (1–2 días hábiles).', 'Coordine el embarque con su transportista una vez autorizado.', 'El cierre de exportación se realiza automáticamente al partir la nave.']} onVolver={onVolver} />
        )}
      </div>
    </PageLayout>
  );
}
