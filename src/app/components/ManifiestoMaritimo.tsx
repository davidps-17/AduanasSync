import { useState } from 'react';
import { Ship, Package, FileText, Plus, Trash2 } from 'lucide-react';
import { PageLayout, IndicadorPasos } from './ui/PageLayout';
import { Campo, FInput, FSelect, NavBtns, InfoBox, TarjetaRevision, Confirmacion } from './ui/FormFields';

const PASOS = [
  { id: 1, label: 'Nave',       icon: <Ship className="w-4 h-4" /> },
  { id: 2, label: 'Carga',      icon: <Package className="w-4 h-4" /> },
  { id: 3, label: 'Revisión',   icon: <FileText className="w-4 h-4" /> },
];

const PUERTOS = ['Valparaíso', 'San Antonio', 'Iquique', 'Antofagasta', 'Arica', 'Puerto Montt', 'Talcahuano', 'Punta Arenas'];
const TIPOS_CONTENEDOR = ['20\' GP', '40\' GP', '40\' HC', '20\' RF (refrigerado)', '40\' RF', 'Granel', 'Carga suelta', 'RoRo'];
const PAISES_BANDERA = ['Chile', 'Panamá', 'Liberia', 'Marshall Islands', 'Bahamas', 'Grecia', 'Noruega', 'Singapur', 'Hong Kong'];

interface Nave { nombre: string; imo: string; bandera: string; naviera: string; puertoCarga: string; fechaETA: string; horaETA: string; agente: string; viaje: string }
interface Contenedor { id: string; nro: string; tipo: string; descripcion: string; pesoKg: string; precinto: string; peligroso: boolean }

interface Props { rut: string; onVolver: () => void }

export function ManifiestoMaritimo({ rut, onVolver }: Props) {
  const [paso, setPaso]   = useState(1);
  const [folio, setFolio] = useState('');
  const [nave, setNave]   = useState<Nave>({ nombre: '', imo: '', bandera: '', naviera: '', puertoCarga: '', fechaETA: '', horaETA: '', agente: '', viaje: '' });
  const [contenedores, setContenedores] = useState<Contenedor[]>([{ id: '1', nro: '', tipo: '', descripcion: '', pesoKg: '', precinto: '', peligroso: false }]);
  const [eN, setEN] = useState<Partial<Nave>>({});

  const vN = () => { const e: Partial<Nave> = {}; if (!nave.nombre) e.nombre = 'Requerido'; if (!nave.imo) e.imo = 'Requerido'; if (!nave.puertoCarga) e.puertoCarga = 'Requerido'; if (!nave.fechaETA) e.fechaETA = 'Requerido'; setEN(e); return !Object.keys(e).length; };

  const add = () => setContenedores(c => [...c, { id: crypto.randomUUID(), nro: '', tipo: '', descripcion: '', pesoKg: '', precinto: '', peligroso: false }]);
  const del = (id: string) => setContenedores(c => c.filter(x => x.id !== id));
  const upd = (id: string, k: keyof Contenedor, v: string | boolean) => setContenedores(c => c.map(x => x.id === id ? { ...x, [k]: v } : x));

  const pesoTotal = contenedores.reduce((s, c) => s + (parseFloat(c.pesoKg) || 0), 0);
  const enviar = () => { setFolio(`MMR-2026-${Math.floor(10000 + Math.random() * 90000)}`); setPaso(4); };

  return (
    <PageLayout titulo="Manifiesto Marítimo de Carga" subtitulo="Declaración de carga marítima internacional" rut={rut} onVolver={onVolver}>
      {paso < 4 && <IndicadorPasos pasos={PASOS} actual={paso} />}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {paso < 4 && <div className="mb-6"><h2 className="text-gray-800 font-bold">{PASOS[paso - 1].label}</h2><p className="text-xs text-gray-400">Paso {paso} de {PASOS.length}</p></div>}

        {paso === 1 && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Nombre de la Nave" required error={eN.nombre}>
                <FInput value={nave.nombre} onChange={e => setNave({ ...nave, nombre: e.target.value.toUpperCase() })} placeholder="Ej: CSAV MUNDUS" error={!!eN.nombre} />
              </Campo>
              <Campo label="N° IMO" required error={eN.imo}>
                <FInput value={nave.imo} onChange={e => setNave({ ...nave, imo: e.target.value })} placeholder="7 dígitos" className="font-mono" error={!!eN.imo} />
              </Campo>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Bandera">
                <FSelect value={nave.bandera} onChange={e => setNave({ ...nave, bandera: e.target.value })}>
                  <option value="">Seleccionar</option>
                  {PAISES_BANDERA.map(p => <option key={p}>{p}</option>)}
                </FSelect>
              </Campo>
              <Campo label="Naviera / Armador">
                <FInput value={nave.naviera} onChange={e => setNave({ ...nave, naviera: e.target.value })} placeholder="Ej: CSAV, Hapag-Lloyd" />
              </Campo>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Puerto de Descarga" required error={eN.puertoCarga}>
                <FSelect value={nave.puertoCarga} onChange={e => setNave({ ...nave, puertoCarga: e.target.value })} error={!!eN.puertoCarga}>
                  <option value="">Seleccionar</option>
                  {PUERTOS.map(p => <option key={p}>{p}</option>)}
                </FSelect>
              </Campo>
              <Campo label="N° de Viaje">
                <FInput value={nave.viaje} onChange={e => setNave({ ...nave, viaje: e.target.value })} placeholder="Ej: 2026-015N" className="font-mono" />
              </Campo>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Fecha ETA" required error={eN.fechaETA}>
                <FInput type="date" value={nave.fechaETA} onChange={e => setNave({ ...nave, fechaETA: e.target.value })} error={!!eN.fechaETA} />
              </Campo>
              <Campo label="Hora ETA">
                <FInput type="time" value={nave.horaETA} onChange={e => setNave({ ...nave, horaETA: e.target.value })} />
              </Campo>
            </div>
            <Campo label="Agente Naviero">
              <FInput value={nave.agente} onChange={e => setNave({ ...nave, agente: e.target.value })} placeholder="Nombre del agente naviero en Chile" />
            </Campo>
            <InfoBox>El manifiesto de carga debe presentarse 24 horas antes del arribo de la nave al puerto.</InfoBox>
            <NavBtns onNext={() => vN() && setPaso(2)} />
          </div>
        )}

        {paso === 2 && (
          <div className="space-y-4">
            {contenedores.map((c, i) => (
              <div key={c.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Unidad de carga {i + 1}</p>
                  {contenedores.length > 1 && <button onClick={() => del(c.id)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Campo label="N° Contenedor / Bulto">
                    <FInput value={c.nro} onChange={e => upd(c.id, 'nro', e.target.value.toUpperCase())} placeholder="MSCU7821034" className="font-mono" />
                  </Campo>
                  <Campo label="Tipo">
                    <FSelect value={c.tipo} onChange={e => upd(c.id, 'tipo', e.target.value)}>
                      <option value="">Seleccionar</option>
                      {TIPOS_CONTENEDOR.map(t => <option key={t}>{t}</option>)}
                    </FSelect>
                  </Campo>
                  <Campo label="Descripción de la carga">
                    <FInput value={c.descripcion} onChange={e => upd(c.id, 'descripcion', e.target.value)} placeholder="Descripción general" />
                  </Campo>
                  <Campo label="Peso Bruto (KG)">
                    <FInput type="number" value={c.pesoKg} onChange={e => upd(c.id, 'pesoKg', e.target.value)} placeholder="0.00" />
                  </Campo>
                </div>
                <div className="flex items-center gap-4">
                  <Campo label="N° Precinto">
                    <FInput value={c.precinto} onChange={e => upd(c.id, 'precinto', e.target.value)} placeholder="Número de precinto" className="font-mono" />
                  </Campo>
                  <label className="flex items-center gap-2 cursor-pointer mt-5 flex-shrink-0" onClick={() => upd(c.id, 'peligroso', !c.peligroso)}>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${c.peligroso ? 'bg-red-500 border-red-500' : 'border-gray-300'}`}>
                      {c.peligroso && <span className="text-white text-[10px] font-bold">!</span>}
                    </div>
                    <span className="text-xs text-gray-600">Carga peligrosa (IMDG)</span>
                  </label>
                </div>
              </div>
            ))}

            <button onClick={add} className="w-full border-2 border-dashed border-gray-200 rounded-xl py-3 text-xs text-gray-400 hover:border-[#1a5276] hover:text-[#1a5276] transition-all flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Agregar unidad de carga
            </button>

            <div className="bg-[#1a5276]/5 border border-[#1a5276]/20 rounded-xl p-4 flex justify-between">
              <span className="text-xs text-gray-600">Peso total declarado</span>
              <span className="font-bold text-[#1a5276]">{pesoTotal.toLocaleString('es-CL')} KG</span>
            </div>

            {contenedores.some(c => c.peligroso) && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs text-red-700">
                ⚠️ Ha marcado carga peligrosa. Debe adjuntar el Documento de Transporte de Mercancías Peligrosas (IMDG) al momento de la presentación.
              </div>
            )}

            <NavBtns onBack={() => setPaso(1)} onNext={() => setPaso(3)} />
          </div>
        )}

        {paso === 3 && (
          <div className="space-y-4">
            <TarjetaRevision titulo="Datos de la Nave" icon={<Ship className="w-3.5 h-3.5" />} filas={[['Nombre', nave.nombre], ['IMO', nave.imo], ['Bandera', nave.bandera], ['Puerto descarga', nave.puertoCarga], ['ETA', `${nave.fechaETA} ${nave.horaETA}`], ['Agente', nave.agente]]} />
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2"><Package className="w-3.5 h-3.5" /> Unidades de Carga ({contenedores.length})</p>
              {contenedores.map((c, i) => (
                <div key={c.id} className="flex justify-between text-xs text-gray-600 border-b border-gray-100 py-1.5">
                  <span>{i + 1}. {c.nro || '—'} · {c.tipo} {c.peligroso ? '⚠️' : ''}</span>
                  <span>{c.pesoKg || 0} KG</span>
                </div>
              ))}
              <div className="flex justify-between text-xs font-semibold text-[#1a5276] pt-2">
                <span>Total</span><span>{pesoTotal} KG</span>
              </div>
            </div>
            <NavBtns onBack={() => setPaso(2)} onNext={enviar} nextLabel="Enviar manifiesto" />
          </div>
        )}

        {paso === 4 && <Confirmacion folio={folio} tipo="Manifiesto Marítimo de Carga" pasos={['El manifiesto será revisado por la Capitanía de Puerto.', 'La autorización de descarga se emitirá 2 hrs antes del atraque.', 'Coordine la recepción de carga con la empresa portuaria asignada.']} onVolver={onVolver} />}
      </div>
    </PageLayout>
  );
}
