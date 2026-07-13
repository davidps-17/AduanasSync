import { useState } from 'react';
import { ClipboardList, FileCheck, User, CheckCircle2, ChevronRight, Award, Warehouse, Clock, Stamp } from 'lucide-react';
import { PageLayout, IndicadorPasos } from './ui/PageLayout';
import { Campo, FInput, FSelect, FTextarea, NavBtns, InfoBox, TarjetaRevision, Confirmacion } from './ui/FormFields';

type TipoPermiso = 'origen' | 'deposito' | 'temporal' | 'visacion' | null;

const TIPOS = [
  { id: 'origen'   as TipoPermiso, label: 'Certificado de Origen',         desc: 'Acredita el origen de mercancías para exportación.', icon: <Award className="w-6 h-6" />,     color: '#1e8449' },
  { id: 'deposito' as TipoPermiso, label: 'Depósito Aduanero',             desc: 'Autorización para almacenar mercancías en depósito.', icon: <Warehouse className="w-6 h-6" />, color: '#1a5276' },
  { id: 'temporal' as TipoPermiso, label: 'Importación Temporal',          desc: 'Ingreso de bienes sin pago de arancel por tiempo limitado.', icon: <Clock className="w-6 h-6" />, color: '#b7950b' },
  { id: 'visacion' as TipoPermiso, label: 'Visación de Documentos',        desc: 'Certificación oficial de documentos de comercio exterior.', icon: <Stamp className="w-6 h-6" />, color: '#c0392b' },
];

const PASOS = [
  { id: 1, label: 'Tipo',         icon: <ClipboardList className="w-4 h-4" /> },
  { id: 2, label: 'Solicitante',  icon: <User className="w-4 h-4" /> },
  { id: 3, label: 'Detalle',      icon: <FileCheck className="w-4 h-4" /> },
  { id: 4, label: 'Revisión',     icon: <CheckCircle2 className="w-4 h-4" /> },
];

const PAISES = ['Argentina', 'Bolivia', 'Brasil', 'China', 'Colombia', 'España', 'Estados Unidos', 'Francia', 'Alemania', 'Japón', 'México', 'Perú', 'Otro'];
const ACUERDOS = ['TLC Chile-EE.UU.', 'TLC Chile-UE', 'TLC Chile-China', 'TLC Chile-Japón', 'Acuerdo P4', 'SGP', 'Sin acuerdo preferencial'];

interface Sol { nombre: string; rut: string; cargo: string; email: string; empresa: string }
interface Det { paisDestino: string; acuerdo: string; descripcion: string; partida: string; valorFOB: string; plazo: string; motivo: string; nroDoc: string }

interface Props { rut: string; onVolver: () => void }

export function Permisos({ rut, onVolver }: Props) {
  const [paso, setPaso]   = useState(1);
  const [tipo, setTipo]   = useState<TipoPermiso>(null);
  const [folio, setFolio] = useState('');
  const [sol, setSol]     = useState<Sol>({ nombre: '', rut, cargo: '', email: '', empresa: '' });
  const [det, setDet]     = useState<Det>({ paisDestino: '', acuerdo: '', descripcion: '', partida: '', valorFOB: '', plazo: '', motivo: '', nroDoc: '' });
  const [eS, setES]       = useState<Partial<Sol>>({});
  const [eD, setED]       = useState<Partial<Det>>({});

  const vS = () => { const e: Partial<Sol> = {}; if (!sol.nombre) e.nombre = 'Requerido'; if (!sol.email) e.email = 'Requerido'; if (!sol.empresa) e.empresa = 'Requerido'; setES(e); return !Object.keys(e).length; };
  const vD = () => { const e: Partial<Det> = {}; if (!det.descripcion) e.descripcion = 'Requerido'; if (!det.partida) e.partida = 'Requerido'; setED(e); return !Object.keys(e).length; };

  const tipoInfo = TIPOS.find(t => t.id === tipo);
  const enviar   = () => { setFolio(`PER-2026-${Math.floor(10000 + Math.random() * 90000)}`); setPaso(5); };

  return (
    <PageLayout titulo="Permisos y Certificados" subtitulo="Solicitud de autorizaciones aduaneras" rut={rut} onVolver={onVolver}>
      {paso > 1 && paso < 5 && <IndicadorPasos pasos={PASOS} actual={paso} />}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {paso > 1 && paso < 5 && <div className="mb-6"><h2 className="text-gray-800 font-bold">{PASOS[paso - 1].label}</h2><p className="text-xs text-gray-400">Paso {paso} de {PASOS.length}</p></div>}

        {/* PASO 1 */}
        {paso === 1 && (
          <div className="space-y-5">
            <div><h2 className="text-gray-800 font-bold mb-1">Seleccione el tipo de permiso</h2><p className="text-xs text-gray-400">Elija la certificación o autorización requerida</p></div>
            <div className="space-y-3">
              {TIPOS.map(t => (
                <button key={t.id!} onClick={() => setTipo(t.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${tipo === t.id ? 'border-[#1a5276] bg-[#1a5276]/5' : 'border-gray-100 hover:border-gray-200'}`}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: t.color }}>{t.icon}</div>
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

        {/* PASO 2 */}
        {paso === 2 && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Nombre Completo" required error={eS.nombre}><FInput value={sol.nombre} onChange={e => setSol({ ...sol, nombre: e.target.value })} placeholder="Nombre del solicitante" error={!!eS.nombre} /></Campo>
              <Campo label="RUT"><FInput value={sol.rut} disabled className="bg-gray-50 text-gray-500" /></Campo>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Empresa / Razón Social" required error={eS.empresa}><FInput value={sol.empresa} onChange={e => setSol({ ...sol, empresa: e.target.value })} placeholder="Nombre de la empresa" error={!!eS.empresa} /></Campo>
              <Campo label="Cargo"><FInput value={sol.cargo} onChange={e => setSol({ ...sol, cargo: e.target.value })} placeholder="Ej: Jefe de Importaciones" /></Campo>
            </div>
            <Campo label="Correo Electrónico" required error={eS.email}><FInput type="email" value={sol.email} onChange={e => setSol({ ...sol, email: e.target.value })} placeholder="correo@empresa.cl" error={!!eS.email} /></Campo>
            <NavBtns onBack={() => setPaso(1)} onNext={() => vS() && setPaso(3)} />
          </div>
        )}

        {/* PASO 3 — según tipo */}
        {paso === 3 && (
          <div className="space-y-5">
            <Campo label="Descripción de la Mercancía" required error={eD.descripcion}><FTextarea value={det.descripcion} onChange={e => setDet({ ...det, descripcion: e.target.value })} placeholder="Descripción detallada" error={!!eD.descripcion} /></Campo>
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Partida Arancelaria" required error={eD.partida}><FInput value={det.partida} onChange={e => setDet({ ...det, partida: e.target.value })} placeholder="Ej: 8471.30.00" error={!!eD.partida} /></Campo>
              <Campo label="Valor FOB (USD)">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">USD</span>
                  <FInput value={det.valorFOB} onChange={e => setDet({ ...det, valorFOB: e.target.value })} placeholder="0.00" className="pl-11" />
                </div>
              </Campo>
            </div>

            {tipo === 'origen' && (
              <div className="grid grid-cols-2 gap-4">
                <Campo label="País Destino">
                  <FSelect value={det.paisDestino} onChange={e => setDet({ ...det, paisDestino: e.target.value })}>
                    <option value="">Seleccionar</option>
                    {PAISES.map(p => <option key={p}>{p}</option>)}
                  </FSelect>
                </Campo>
                <Campo label="Acuerdo Comercial">
                  <FSelect value={det.acuerdo} onChange={e => setDet({ ...det, acuerdo: e.target.value })}>
                    <option value="">Seleccionar</option>
                    {ACUERDOS.map(a => <option key={a}>{a}</option>)}
                  </FSelect>
                </Campo>
              </div>
            )}

            {tipo === 'temporal' && (
              <Campo label="Plazo de Permanencia">
                <FSelect value={det.plazo} onChange={e => setDet({ ...det, plazo: e.target.value })}>
                  <option value="">Seleccionar</option>
                  {['30 días', '60 días', '90 días', '6 meses', '1 año'].map(p => <option key={p}>{p}</option>)}
                </FSelect>
              </Campo>
            )}

            {tipo === 'visacion' && (
              <Campo label="Número de Documento a Visar">
                <FInput value={det.nroDoc} onChange={e => setDet({ ...det, nroDoc: e.target.value })} placeholder="N° de factura, BL u otro" />
              </Campo>
            )}

            {tipo === 'deposito' && (
              <Campo label="Motivo del Depósito">
                <FTextarea value={det.motivo} onChange={e => setDet({ ...det, motivo: e.target.value })} placeholder="Explique el motivo de solicitud de depósito aduanero" />
              </Campo>
            )}

            <InfoBox>El plazo de resolución es de 3–5 días hábiles. Se le notificará por correo electrónico.</InfoBox>
            <NavBtns onBack={() => setPaso(2)} onNext={() => vD() && setPaso(4)} />
          </div>
        )}

        {/* PASO 4 */}
        {paso === 4 && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Tipo de Permiso</p>
              <p className="text-sm font-semibold text-[#1a5276]">{tipoInfo?.label}</p>
            </div>
            <TarjetaRevision titulo="Solicitante" icon={<User className="w-3.5 h-3.5" />} filas={[['Nombre', sol.nombre], ['RUT', sol.rut], ['Empresa', sol.empresa], ['Correo', sol.email]]} />
            <TarjetaRevision titulo="Mercancía" icon={<FileCheck className="w-3.5 h-3.5" />} filas={[['Descripción', det.descripcion], ['Partida', det.partida], ['Valor FOB', det.valorFOB ? `USD ${det.valorFOB}` : '—'], ['País destino', det.paisDestino], ['Acuerdo', det.acuerdo]]} />
            <NavBtns onBack={() => setPaso(3)} onNext={enviar} nextLabel="Enviar solicitud" />
          </div>
        )}

        {paso === 5 && <Confirmacion folio={folio} tipo={tipoInfo?.label ?? 'Permiso aduanero'} pasos={['Su solicitud será evaluada en 3–5 días hábiles.', 'Recibirá notificación por correo con el resultado.', 'Si es aprobada, el documento estará disponible en su perfil para descarga.']} onVolver={onVolver} />}
      </div>
    </PageLayout>
  );
}
