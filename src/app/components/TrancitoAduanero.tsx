import { useState } from 'react';
import { ArrowRightLeft, MapPin, Package, FileText, CheckCircle2, ChevronRight } from 'lucide-react';
import { PageLayout, IndicadorPasos } from './ui/PageLayout';
import { Campo, FInput, FSelect, FTextarea, NavBtns, InfoBox, TarjetaRevision, Confirmacion } from './ui/FormFields';

type TipoTransito = 'interno' | 'internacional' | 'cabotaje' | null;

const TIPOS_TRANSITO = [
  { id: 'interno' as TipoTransito,       label: 'Tránsito Interno (DTI)',       desc: 'Mercancías extranjeras que cruzan el territorio nacional hacia otro punto.', color: '#6c3483' },
  { id: 'internacional' as TipoTransito, label: 'Tránsito Internacional',       desc: 'Mercancías en tránsito entre dos países usando Chile como paso.', color: '#1a5276' },
  { id: 'cabotaje' as TipoTransito,      label: 'Cabotaje Aduanero',            desc: 'Transporte de mercancías en régimen suspensivo entre puertos chilenos.', color: '#1e8449' },
];

const PASOS = [
  { id: 1, label: 'Tipo',        icon: <ArrowRightLeft className="w-4 h-4" /> },
  { id: 2, label: 'Ruta',        icon: <MapPin className="w-4 h-4" /> },
  { id: 3, label: 'Mercancía',   icon: <Package className="w-4 h-4" /> },
  { id: 4, label: 'Revisión',    icon: <FileText className="w-4 h-4" /> },
];

const ADUANAS = ['Aduanas Valparaíso', 'Aduanas San Antonio', 'Aduanas Iquique', 'Aduanas Antofagasta', 'Aduanas Arica', 'Aduanas Paso Los Libertadores', 'Aduanas Puerto Montt', 'Aduanas SCL (Aéreo)'];
const TRANSPORTES = ['Marítimo', 'Aéreo', 'Terrestre', 'Ferroviario', 'Multimodal'];

interface Ruta { aduana_origen: string; aduana_destino: string; via: string; fechaInicio: string; fechaVencimiento: string; responsable: string; rutResponsable: string }
interface Mercancias { descripcion: string; partida: string; cantidad: string; pesoKg: string; valorCIF: string; nroDocumento: string }

interface Props { rut: string; onVolver: () => void }

export function TrancitoAduanero({ rut, onVolver }: Props) {
  const [paso, setPaso]   = useState(1);
  const [tipo, setTipo]   = useState<TipoTransito>(null);
  const [folio, setFolio] = useState('');
  const [ruta, setRuta]   = useState<Ruta>({ aduana_origen: '', aduana_destino: '', via: '', fechaInicio: '', fechaVencimiento: '', responsable: '', rutResponsable: rut });
  const [mercancias, setMercancias] = useState<Mercancias>({ descripcion: '', partida: '', cantidad: '', pesoKg: '', valorCIF: '', nroDocumento: '' });
  const [eR, setER] = useState<Partial<Ruta>>({});
  const [eM, setEM] = useState<Partial<Mercancias>>({});

  const vR = () => { const e: Partial<Ruta> = {}; if (!ruta.aduana_origen) e.aduana_origen = 'Requerido'; if (!ruta.aduana_destino) e.aduana_destino = 'Requerido'; if (!ruta.via) e.via = 'Requerido'; if (!ruta.fechaInicio) e.fechaInicio = 'Requerido'; setER(e); return !Object.keys(e).length; };
  const vM = () => { const e: Partial<Mercancias> = {}; if (!mercancias.descripcion) e.descripcion = 'Requerido'; if (!mercancias.partida) e.partida = 'Requerido'; if (!mercancias.valorCIF) e.valorCIF = 'Requerido'; setEM(e); return !Object.keys(e).length; };

  const tipoInfo = TIPOS_TRANSITO.find(t => t.id === tipo);
  const enviar   = () => { setFolio(`DTI-2026-${Math.floor(10000 + Math.random() * 90000)}`); setPaso(5); };

  return (
    <PageLayout titulo="Tránsito Aduanero" subtitulo="DTI y tránsito internacional de mercancías" rut={rut} onVolver={onVolver}>
      {paso > 1 && paso < 5 && <IndicadorPasos pasos={PASOS} actual={paso} />}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {paso > 1 && paso < 5 && <div className="mb-6"><h2 className="text-gray-800 font-bold">{PASOS[paso - 1].label}</h2><p className="text-xs text-gray-400">Paso {paso} de {PASOS.length}</p></div>}

        {paso === 1 && (
          <div className="space-y-5">
            <div><h2 className="text-gray-800 font-bold mb-1">Tipo de Tránsito</h2><p className="text-xs text-gray-400">Seleccione el régimen de tránsito correspondiente</p></div>
            <div className="space-y-3">
              {TIPOS_TRANSITO.map(t => (
                <button key={t.id!} onClick={() => setTipo(t.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${tipo === t.id ? 'border-[#1a5276] bg-[#1a5276]/5' : 'border-gray-100 hover:border-gray-200'}`}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: t.color }}>
                    <ArrowRightLeft className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{t.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{t.desc}</p>
                  </div>
                  {tipo === t.id && <CheckCircle2 className="w-5 h-5 text-[#1a5276] flex-shrink-0" />}
                </button>
              ))}
            </div>
            <div className="flex justify-end">
              <button disabled={!tipo} onClick={() => tipo && setPaso(2)} className="bg-[#1a5276] text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-[#143d5a] disabled:opacity-40 transition-colors flex items-center gap-2">
                Continuar <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {paso === 2 && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Aduana de Origen" required error={eR.aduana_origen}>
                <FSelect value={ruta.aduana_origen} onChange={e => setRuta({ ...ruta, aduana_origen: e.target.value })} error={!!eR.aduana_origen}>
                  <option value="">Seleccionar</option>
                  {ADUANAS.map(a => <option key={a}>{a}</option>)}
                </FSelect>
              </Campo>
              <Campo label="Aduana de Destino" required error={eR.aduana_destino}>
                <FSelect value={ruta.aduana_destino} onChange={e => setRuta({ ...ruta, aduana_destino: e.target.value })} error={!!eR.aduana_destino}>
                  <option value="">Seleccionar</option>
                  {ADUANAS.map(a => <option key={a}>{a}</option>)}
                </FSelect>
              </Campo>
            </div>
            <Campo label="Vía de Transporte" required error={eR.via}>
              <FSelect value={ruta.via} onChange={e => setRuta({ ...ruta, via: e.target.value })} error={!!eR.via}>
                <option value="">Seleccionar</option>
                {TRANSPORTES.map(t => <option key={t}>{t}</option>)}
              </FSelect>
            </Campo>
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Fecha de Inicio" required error={eR.fechaInicio}>
                <FInput type="date" value={ruta.fechaInicio} onChange={e => setRuta({ ...ruta, fechaInicio: e.target.value })} error={!!eR.fechaInicio} />
              </Campo>
              <Campo label="Fecha de Vencimiento del Plazo">
                <FInput type="date" value={ruta.fechaVencimiento} onChange={e => setRuta({ ...ruta, fechaVencimiento: e.target.value })} />
              </Campo>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Responsable del Tránsito">
                <FInput value={ruta.responsable} onChange={e => setRuta({ ...ruta, responsable: e.target.value })} placeholder="Nombre del responsable" />
              </Campo>
              <Campo label="RUT Responsable">
                <FInput value={ruta.rutResponsable} onChange={e => setRuta({ ...ruta, rutResponsable: e.target.value })} placeholder="12.345.678-9" className="font-mono" />
              </Campo>
            </div>
            <InfoBox color="amber">El tránsito aduanero implica responsabilidad sobre los derechos suspendidos. El incumplimiento del plazo genera cobro de aranceles más multas.</InfoBox>
            <NavBtns onBack={() => setPaso(1)} onNext={() => vR() && setPaso(3)} />
          </div>
        )}

        {paso === 3 && (
          <div className="space-y-5">
            <Campo label="Descripción de la Mercancía" required error={eM.descripcion}>
              <FTextarea value={mercancias.descripcion} onChange={e => setMercancias({ ...mercancias, descripcion: e.target.value })} placeholder="Descripción detallada de los bienes en tránsito" error={!!eM.descripcion} />
            </Campo>
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Partida Arancelaria" required error={eM.partida}>
                <FInput value={mercancias.partida} onChange={e => setMercancias({ ...mercancias, partida: e.target.value })} placeholder="Ej: 8471.30.00" error={!!eM.partida} />
              </Campo>
              <Campo label="N° Documento de Transporte">
                <FInput value={mercancias.nroDocumento} onChange={e => setMercancias({ ...mercancias, nroDocumento: e.target.value })} placeholder="BL, AWB o carta porte" className="font-mono" />
              </Campo>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Campo label="Cantidad">
                <FInput type="number" min="1" value={mercancias.cantidad} onChange={e => setMercancias({ ...mercancias, cantidad: e.target.value })} placeholder="0" />
              </Campo>
              <Campo label="Peso (KG)">
                <FInput type="number" value={mercancias.pesoKg} onChange={e => setMercancias({ ...mercancias, pesoKg: e.target.value })} placeholder="0.00" />
              </Campo>
              <Campo label="Valor CIF (USD)" required error={eM.valorCIF}>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">$</span>
                  <FInput value={mercancias.valorCIF} onChange={e => setMercancias({ ...mercancias, valorCIF: e.target.value })} placeholder="0.00" className="pl-7" error={!!eM.valorCIF} />
                </div>
              </Campo>
            </div>
            <NavBtns onBack={() => setPaso(2)} onNext={() => vM() && setPaso(4)} />
          </div>
        )}

        {paso === 4 && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Régimen</p>
              <p className="text-sm font-semibold text-[#1a5276]">{tipoInfo?.label}</p>
            </div>
            <TarjetaRevision titulo="Ruta" icon={<MapPin className="w-3.5 h-3.5" />} filas={[['Origen', ruta.aduana_origen], ['Destino', ruta.aduana_destino], ['Vía', ruta.via], ['Inicio', ruta.fechaInicio], ['Vencimiento', ruta.fechaVencimiento], ['Responsable', ruta.responsable]]} />
            <TarjetaRevision titulo="Mercancía" icon={<Package className="w-3.5 h-3.5" />} filas={[['Descripción', mercancias.descripcion], ['Partida', mercancias.partida], ['Cantidad', mercancias.cantidad], ['Peso', mercancias.pesoKg ? `${mercancias.pesoKg} KG` : '—'], ['Valor CIF', `USD ${mercancias.valorCIF}`]]} />
            <NavBtns onBack={() => setPaso(3)} onNext={enviar} nextLabel="Solicitar tránsito" />
          </div>
        )}

        {paso === 5 && <Confirmacion folio={folio} tipo={tipoInfo?.label ?? 'Tránsito Aduanero'} pasos={['El funcionario de Aduanas autorizará el tránsito en el punto de origen.', 'La mercancía debe llegar a destino dentro del plazo autorizado.', 'Al llegar, preséntese en la aduana de destino para el cierre del tránsito.']} onVolver={onVolver} />}
      </div>
    </PageLayout>
  );
}
