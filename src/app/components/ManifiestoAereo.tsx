import { useState } from 'react';
import { Plane, Package, FileText, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { PageLayout, IndicadorPasos } from './ui/PageLayout';
import { Campo, FInput, FSelect, NavBtns, InfoBox, TarjetaRevision, Confirmacion } from './ui/FormFields';

const PASOS = [
  { id: 1, label: 'Vuelo',      icon: <Plane className="w-4 h-4" /> },
  { id: 2, label: 'Carga',      icon: <Package className="w-4 h-4" /> },
  { id: 3, label: 'Revisión',   icon: <FileText className="w-4 h-4" /> },
];

const AEROLINEAS = ['LATAM Cargo', 'Sky Cargo', 'JetSmart Cargo', 'Lufthansa Cargo', 'Emirates SkyCargo', 'FedEx', 'DHL Express', 'UPS Airlines', 'Otra'];
const AEROPUERTOS_ORIGEN = ['SCL — Arturo Merino Benítez', 'ANF — Cerro Moreno', 'IQQ — Diego Aracena', 'ARI — Chacalluta', 'PMC — Tepual', 'Otro internacional'];
const TIPOS_CARGA = ['Carga general', 'Carga peligrosa', 'Perecederos', 'Animales vivos', 'Valija diplomática', 'Carga oversized', 'Courier / Express'];

interface Bulto { id: string; descripcion: string; cantidad: string; pesoKg: string; tipoCarga: string; awb: string }
interface Vuelo { aerolinea: string; nroVuelo: string; origen: string; fechaLlegada: string; horaLlegada: string; agente: string }

interface Props { rut: string; onVolver: () => void }

export function ManifiestoAereo({ rut, onVolver }: Props) {
  const [paso, setPaso]   = useState(1);
  const [folio, setFolio] = useState('');
  const [vuelo, setVuelo] = useState<Vuelo>({ aerolinea: '', nroVuelo: '', origen: '', fechaLlegada: '', horaLlegada: '', agente: '' });
  const [bultos, setBultos] = useState<Bulto[]>([{ id: '1', descripcion: '', cantidad: '', pesoKg: '', tipoCarga: '', awb: '' }]);
  const [eV, setEV] = useState<Partial<Vuelo>>({});

  const vV = () => { const e: Partial<Vuelo> = {}; if (!vuelo.aerolinea) e.aerolinea = 'Requerido'; if (!vuelo.nroVuelo) e.nroVuelo = 'Requerido'; if (!vuelo.origen) e.origen = 'Requerido'; if (!vuelo.fechaLlegada) e.fechaLlegada = 'Requerido'; setEV(e); return !Object.keys(e).length; };

  const addBulto = () => setBultos(b => [...b, { id: crypto.randomUUID(), descripcion: '', cantidad: '', pesoKg: '', tipoCarga: '', awb: '' }]);
  const delBulto = (id: string) => setBultos(b => b.filter(x => x.id !== id));
  const updBulto = (id: string, k: keyof Bulto, v: string) => setBultos(b => b.map(x => x.id === id ? { ...x, [k]: v } : x));

  const pesoTotal = bultos.reduce((s, b) => s + (parseFloat(b.pesoKg) || 0), 0);
  const enviar = () => { setFolio(`MAE-2026-${Math.floor(10000 + Math.random() * 90000)}`); setPaso(4); };

  return (
    <PageLayout titulo="Manifiesto Aéreo de Carga" subtitulo="Declaración de carga aérea internacional" rut={rut} onVolver={onVolver}>
      {paso < 4 && <IndicadorPasos pasos={PASOS} actual={paso} />}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {paso < 4 && <div className="mb-6"><h2 className="text-gray-800 font-bold">{PASOS[paso - 1].label}</h2><p className="text-xs text-gray-400">Paso {paso} de {PASOS.length}</p></div>}

        {paso === 1 && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Aerolínea" required error={eV.aerolinea}>
                <FSelect value={vuelo.aerolinea} onChange={e => setVuelo({ ...vuelo, aerolinea: e.target.value })} error={!!eV.aerolinea}>
                  <option value="">Seleccionar</option>
                  {AEROLINEAS.map(a => <option key={a}>{a}</option>)}
                </FSelect>
              </Campo>
              <Campo label="N° de Vuelo" required error={eV.nroVuelo}>
                <FInput value={vuelo.nroVuelo} onChange={e => setVuelo({ ...vuelo, nroVuelo: e.target.value.toUpperCase() })} placeholder="Ej: LA800" error={!!eV.nroVuelo} />
              </Campo>
            </div>
            <Campo label="Aeropuerto de Origen" required error={eV.origen}>
              <FSelect value={vuelo.origen} onChange={e => setVuelo({ ...vuelo, origen: e.target.value })} error={!!eV.origen}>
                <option value="">Seleccionar aeropuerto</option>
                {AEROPUERTOS_ORIGEN.map(a => <option key={a}>{a}</option>)}
              </FSelect>
            </Campo>
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Fecha de Llegada" required error={eV.fechaLlegada}>
                <FInput type="date" value={vuelo.fechaLlegada} onChange={e => setVuelo({ ...vuelo, fechaLlegada: e.target.value })} error={!!eV.fechaLlegada} />
              </Campo>
              <Campo label="Hora de Llegada">
                <FInput type="time" value={vuelo.horaLlegada} onChange={e => setVuelo({ ...vuelo, horaLlegada: e.target.value })} />
              </Campo>
            </div>
            <Campo label="Agente de Carga (RUT o nombre)">
              <FInput value={vuelo.agente} onChange={e => setVuelo({ ...vuelo, agente: e.target.value })} placeholder="Agente de carga responsable" />
            </Campo>
            <InfoBox>El manifiesto debe presentarse al menos 4 horas antes del aterrizaje de la aeronave.</InfoBox>
            <NavBtns onNext={() => vV() && setPaso(2)} />
          </div>
        )}

        {paso === 2 && (
          <div className="space-y-4">
            {bultos.map((b, i) => (
              <div key={b.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Partida {i + 1}</p>
                  {bultos.length > 1 && <button onClick={() => delBulto(b.id)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Campo label="AWB / Guía aérea">
                    <FInput value={b.awb} onChange={e => updBulto(b.id, 'awb', e.target.value)} placeholder="Ej: 045-12345678" className="font-mono" />
                  </Campo>
                  <Campo label="Tipo de carga">
                    <FSelect value={b.tipoCarga} onChange={e => updBulto(b.id, 'tipoCarga', e.target.value)}>
                      <option value="">Seleccionar</option>
                      {TIPOS_CARGA.map(t => <option key={t}>{t}</option>)}
                    </FSelect>
                  </Campo>
                  <Campo label="Descripción">
                    <FInput value={b.descripcion} onChange={e => updBulto(b.id, 'descripcion', e.target.value)} placeholder="Descripción de la carga" />
                  </Campo>
                  <Campo label="Cantidad (bultos)">
                    <FInput type="number" min="1" value={b.cantidad} onChange={e => updBulto(b.id, 'cantidad', e.target.value)} placeholder="0" />
                  </Campo>
                </div>
                <Campo label="Peso Bruto (KG)">
                  <FInput type="number" value={b.pesoKg} onChange={e => updBulto(b.id, 'pesoKg', e.target.value)} placeholder="0.00" />
                </Campo>
              </div>
            ))}

            <button onClick={addBulto} className="w-full border-2 border-dashed border-gray-200 rounded-xl py-3 text-xs text-gray-400 hover:border-[#1a5276] hover:text-[#1a5276] transition-all flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Agregar partida de carga
            </button>

            <div className="bg-[#1a5276]/5 border border-[#1a5276]/20 rounded-xl p-4 flex justify-between items-center">
              <span className="text-xs text-gray-600">Peso total declarado</span>
              <span className="font-bold text-[#1a5276]">{pesoTotal.toLocaleString('es-CL')} KG</span>
            </div>

            <NavBtns onBack={() => setPaso(1)} onNext={() => setPaso(3)} />
          </div>
        )}

        {paso === 3 && (
          <div className="space-y-4">
            <TarjetaRevision titulo="Datos del Vuelo" icon={<Plane className="w-3.5 h-3.5" />} filas={[['Aerolínea', vuelo.aerolinea], ['N° Vuelo', vuelo.nroVuelo], ['Origen', vuelo.origen], ['Fecha llegada', vuelo.fechaLlegada], ['Hora', vuelo.horaLlegada], ['Agente', vuelo.agente]]} />
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2"><Package className="w-3.5 h-3.5" /> Partidas de Carga ({bultos.length})</p>
              <div className="space-y-2">
                {bultos.map((b, i) => (
                  <div key={b.id} className="flex justify-between text-xs text-gray-600 border-b border-gray-100 pb-2">
                    <span>{i + 1}. {b.descripcion || 'Sin descripción'} — {b.tipoCarga}</span>
                    <span className="font-medium">{b.pesoKg || 0} KG</span>
                  </div>
                ))}
                <div className="flex justify-between text-xs font-semibold text-[#1a5276] pt-1">
                  <span>Total</span><span>{pesoTotal} KG</span>
                </div>
              </div>
            </div>
            <NavBtns onBack={() => setPaso(2)} onNext={enviar} nextLabel="Enviar manifiesto" />
          </div>
        )}

        {paso === 4 && <Confirmacion folio={folio} tipo="Manifiesto Aéreo de Carga" pasos={['El manifiesto será procesado por el área de Aduanas del aeropuerto.', 'Recibirá confirmación antes del aterrizaje de la aeronave.', 'Coordine la entrega de la carga con el agente designado.']} onVolver={onVolver} />}
      </div>
    </PageLayout>
  );
}
