import { useState } from 'react';
import { Truck, Package, FileText, Plus, Trash2 } from 'lucide-react';
import { PageLayout, IndicadorPasos } from './ui/PageLayout';
import { Campo, FInput, FSelect, NavBtns, InfoBox, TarjetaRevision, Confirmacion } from './ui/FormFields';

const PASOS = [
  { id: 1, label: 'Vehículo',    icon: <Truck className="w-4 h-4" /> },
  { id: 2, label: 'Carga',       icon: <Package className="w-4 h-4" /> },
  { id: 3, label: 'Revisión',    icon: <FileText className="w-4 h-4" /> },
];

const PASOS_FRONTERIZOS = ['Paso Los Libertadores', 'Paso Pehuenche', 'Paso Pino Hachado', 'Paso Cardenal Samoré', 'Paso Jama (Atacama)', 'Paso Colchane', 'Paso Chungara', 'Paso Sico', 'Otro'];
const TIPOS_VEHICULO    = ['Camión simple', 'Camión articulado (18 ruedas)', 'Tracto-camión', 'Furgón', 'Camioneta de carga', 'Vehículo especial'];
const PAISES_ORIGEN     = ['Argentina', 'Bolivia', 'Perú', 'Brasil', 'Paraguay', 'Uruguay'];

interface Vehiculo { patente: string; tipo: string; patenteRemolque: string; conductor: string; rutConductor: string; pasoFronterizo: string; paisProcedencia: string; fechaCruce: string; transportista: string }
interface Carga { id: string; descripcion: string; cantidad: string; pesoKg: string; precinto: string; peligrosa: boolean }

interface Props { rut: string; onVolver: () => void }

export function ManifiestoTerrestre({ rut, onVolver }: Props) {
  const [paso, setPaso]   = useState(1);
  const [folio, setFolio] = useState('');
  const [vehiculo, setVehiculo] = useState<Vehiculo>({ patente: '', tipo: '', patenteRemolque: '', conductor: '', rutConductor: '', pasoFronterizo: '', paisProcedencia: '', fechaCruce: '', transportista: '' });
  const [cargas, setCargas] = useState<Carga[]>([{ id: '1', descripcion: '', cantidad: '', pesoKg: '', precinto: '', peligrosa: false }]);
  const [eVe, setEVe] = useState<Partial<Vehiculo>>({});

  const vVe = () => { const e: Partial<Vehiculo> = {}; if (!vehiculo.patente) e.patente = 'Requerido'; if (!vehiculo.tipo) e.tipo = 'Requerido'; if (!vehiculo.pasoFronterizo) e.pasoFronterizo = 'Requerido'; if (!vehiculo.fechaCruce) e.fechaCruce = 'Requerido'; if (!vehiculo.conductor) e.conductor = 'Requerido'; setEVe(e); return !Object.keys(e).length; };

  const addCarga = () => setCargas(c => [...c, { id: crypto.randomUUID(), descripcion: '', cantidad: '', pesoKg: '', precinto: '', peligrosa: false }]);
  const delCarga = (id: string) => setCargas(c => c.filter(x => x.id !== id));
  const updCarga = (id: string, k: keyof Carga, v: string | boolean) => setCargas(c => c.map(x => x.id === id ? { ...x, [k]: v } : x));

  const pesoTotal = cargas.reduce((s, c) => s + (parseFloat(c.pesoKg) || 0), 0);
  const enviar = () => { setFolio(`MTR-2026-${Math.floor(10000 + Math.random() * 90000)}`); setPaso(4); };

  return (
    <PageLayout titulo="Manifiesto Terrestre de Carga" subtitulo="Declaración de carga por paso fronterizo" rut={rut} onVolver={onVolver}>
      {paso < 4 && <IndicadorPasos pasos={PASOS} actual={paso} />}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {paso < 4 && <div className="mb-6"><h2 className="text-gray-800 font-bold">{PASOS[paso - 1].label}</h2><p className="text-xs text-gray-400">Paso {paso} de {PASOS.length}</p></div>}

        {paso === 1 && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Patente del Vehículo" required error={eVe.patente}>
                <FInput value={vehiculo.patente} onChange={e => setVehiculo({ ...vehiculo, patente: e.target.value.toUpperCase() })} placeholder="Ej: BCHG45" className="font-mono" error={!!eVe.patente} />
              </Campo>
              <Campo label="Tipo de Vehículo" required error={eVe.tipo}>
                <FSelect value={vehiculo.tipo} onChange={e => setVehiculo({ ...vehiculo, tipo: e.target.value })} error={!!eVe.tipo}>
                  <option value="">Seleccionar</option>
                  {TIPOS_VEHICULO.map(t => <option key={t}>{t}</option>)}
                </FSelect>
              </Campo>
            </div>
            <Campo label="Patente del Remolque / Acoplado">
              <FInput value={vehiculo.patenteRemolque} onChange={e => setVehiculo({ ...vehiculo, patenteRemolque: e.target.value.toUpperCase() })} placeholder="Ej: RDKL21 (si aplica)" className="font-mono" />
            </Campo>
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Nombre del Conductor" required error={eVe.conductor}>
                <FInput value={vehiculo.conductor} onChange={e => setVehiculo({ ...vehiculo, conductor: e.target.value })} placeholder="Nombre completo" error={!!eVe.conductor} />
              </Campo>
              <Campo label="RUT / Pasaporte Conductor">
                <FInput value={vehiculo.rutConductor} onChange={e => setVehiculo({ ...vehiculo, rutConductor: e.target.value })} placeholder="12.345.678-9" className="font-mono" />
              </Campo>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Paso Fronterizo" required error={eVe.pasoFronterizo}>
                <FSelect value={vehiculo.pasoFronterizo} onChange={e => setVehiculo({ ...vehiculo, pasoFronterizo: e.target.value })} error={!!eVe.pasoFronterizo}>
                  <option value="">Seleccionar</option>
                  {PASOS_FRONTERIZOS.map(p => <option key={p}>{p}</option>)}
                </FSelect>
              </Campo>
              <Campo label="País de Procedencia">
                <FSelect value={vehiculo.paisProcedencia} onChange={e => setVehiculo({ ...vehiculo, paisProcedencia: e.target.value })}>
                  <option value="">Seleccionar</option>
                  {PAISES_ORIGEN.map(p => <option key={p}>{p}</option>)}
                </FSelect>
              </Campo>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Fecha de Cruce" required error={eVe.fechaCruce}>
                <FInput type="date" value={vehiculo.fechaCruce} onChange={e => setVehiculo({ ...vehiculo, fechaCruce: e.target.value })} error={!!eVe.fechaCruce} />
              </Campo>
              <Campo label="Empresa Transportista">
                <FInput value={vehiculo.transportista} onChange={e => setVehiculo({ ...vehiculo, transportista: e.target.value })} placeholder="Razón social de la empresa" />
              </Campo>
            </div>
            <InfoBox>El manifiesto terrestre debe presentarse al llegar al paso fronterizo. El funcionario de Aduanas verificará la carga y los documentos.</InfoBox>
            <NavBtns onNext={() => vVe() && setPaso(2)} />
          </div>
        )}

        {paso === 2 && (
          <div className="space-y-4">
            {cargas.map((c, i) => (
              <div key={c.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Partida de carga {i + 1}</p>
                  {cargas.length > 1 && <button onClick={() => delCarga(c.id)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Campo label="Descripción de la carga">
                    <FInput value={c.descripcion} onChange={e => updCarga(c.id, 'descripcion', e.target.value)} placeholder="Ej: Muebles de madera" />
                  </Campo>
                  <Campo label="Cantidad (bultos/piezas)">
                    <FInput type="number" min="1" value={c.cantidad} onChange={e => updCarga(c.id, 'cantidad', e.target.value)} placeholder="0" />
                  </Campo>
                  <Campo label="Peso Bruto (KG)">
                    <FInput type="number" value={c.pesoKg} onChange={e => updCarga(c.id, 'pesoKg', e.target.value)} placeholder="0.00" />
                  </Campo>
                  <Campo label="N° Precinto">
                    <FInput value={c.precinto} onChange={e => updCarga(c.id, 'precinto', e.target.value)} placeholder="Número de precinto" className="font-mono" />
                  </Campo>
                </div>
                <label className="flex items-center gap-2 cursor-pointer" onClick={() => updCarga(c.id, 'peligrosa', !c.peligrosa)}>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${c.peligrosa ? 'bg-red-500 border-red-500' : 'border-gray-300'}`}>
                    {c.peligrosa && <span className="text-white text-[10px] font-bold">!</span>}
                  </div>
                  <span className="text-xs text-gray-600">Carga peligrosa / HAZMAT</span>
                </label>
              </div>
            ))}

            <button onClick={addCarga} className="w-full border-2 border-dashed border-gray-200 rounded-xl py-3 text-xs text-gray-400 hover:border-[#1a5276] hover:text-[#1a5276] transition-all flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Agregar partida
            </button>

            <div className="bg-[#1a5276]/5 border border-[#1a5276]/20 rounded-xl p-4 flex justify-between">
              <span className="text-xs text-gray-600">Peso total declarado</span>
              <span className="font-bold text-[#1a5276]">{pesoTotal.toLocaleString('es-CL')} KG</span>
            </div>

            <NavBtns onBack={() => setPaso(1)} onNext={() => setPaso(3)} />
          </div>
        )}

        {paso === 3 && (
          <div className="space-y-4">
            <TarjetaRevision titulo="Datos del Vehículo" icon={<Truck className="w-3.5 h-3.5" />} filas={[['Patente', vehiculo.patente], ['Tipo', vehiculo.tipo], ['Remolque', vehiculo.patenteRemolque], ['Conductor', vehiculo.conductor], ['Paso fronterizo', vehiculo.pasoFronterizo], ['Fecha cruce', vehiculo.fechaCruce]]} />
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Partidas de carga ({cargas.length})</p>
              {cargas.map((c, i) => (
                <div key={c.id} className="flex justify-between text-xs text-gray-600 border-b border-gray-100 py-1.5">
                  <span>{i + 1}. {c.descripcion || 'Sin descripción'} {c.peligrosa ? '⚠️' : ''}</span>
                  <span>{c.pesoKg || 0} KG</span>
                </div>
              ))}
              <div className="flex justify-between text-xs font-semibold text-[#1a5276] pt-2"><span>Total</span><span>{pesoTotal} KG</span></div>
            </div>
            <NavBtns onBack={() => setPaso(2)} onNext={enviar} nextLabel="Enviar manifiesto" />
          </div>
        )}

        {paso === 4 && <Confirmacion folio={folio} tipo="Manifiesto Terrestre de Carga" pasos={['Presente este folio al funcionario en el paso fronterizo.', 'La inspección física tomará entre 30 y 90 minutos.', 'El vehículo quedará habilitado para cruzar una vez aprobada la revisión.']} onVolver={onVolver} />}
      </div>
    </PageLayout>
  );
}
