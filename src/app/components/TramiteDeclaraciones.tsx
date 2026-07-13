import { useState } from 'react';
import { FileText, ArrowRightLeft, FileCheck, CheckCircle2, ChevronRight } from 'lucide-react';
import { PageLayout, IndicadorPasos } from './ui/PageLayout';
import { Campo, FInput, FSelect, FTextarea, NavBtns, InfoBox, TarjetaRevision, Confirmacion } from './ui/FormFields';

type TipoDecl = 'DIN' | 'DTI' | 'RECT' | null;

const TIPOS_DECL = [
  { id: 'DIN' as TipoDecl, label: 'Declaración de Ingreso (DIN)', desc: 'Para importaciones con pago de derechos.', icon: <FileText className="w-6 h-6" />, color: '#1a5276' },
  { id: 'DTI' as TipoDecl, label: 'Declaración de Tránsito Interno (DTI)', desc: 'Mercancías en tránsito por territorio nacional.', icon: <ArrowRightLeft className="w-6 h-6" />, color: '#6c3483' },
  { id: 'RECT' as TipoDecl, label: 'Rectificación de Declaración', desc: 'Corrija datos de una declaración ya presentada.', icon: <FileCheck className="w-6 h-6" />, color: '#c0392b' },
];

const PASOS = [
  { id: 1, label: 'Tipo',        icon: <FileText className="w-4 h-4" /> },
  { id: 2, label: 'Datos',       icon: <FileCheck className="w-4 h-4" /> },
  { id: 3, label: 'Mercancía',   icon: <ArrowRightLeft className="w-4 h-4" /> },
  { id: 4, label: 'Revisión',    icon: <CheckCircle2 className="w-4 h-4" /> },
];

const PUERTOS = ['Valparaíso', 'San Antonio', 'Iquique', 'Antofagasta', 'Arica', 'Puerto Montt', 'Aeropuerto SCL', 'Paso Los Libertadores', 'Paso Pehuenche'];
const REGIONES = ['Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama', 'Coquimbo', 'Valparaíso', 'Metropolitana', 'O\'Higgins', 'Maule', 'Ñuble', 'Biobío', 'La Araucanía', 'Los Ríos', 'Los Lagos', 'Aysén', 'Magallanes'];

interface Datos {
  nroFolio: string; fechaEmision: string; rutDeclarante: string;
  aduana: string; regimen: string; descripcion: string;
  partida: string; valorUSD: string; pesoKg: string;
  origenDestino: string; motivoRect: string;
}

interface Props { rut: string; onVolver: () => void }

export function TramiteDeclaraciones({ rut, onVolver }: Props) {
  const [paso, setPaso] = useState(1);
  const [tipo, setTipo] = useState<TipoDecl>(null);
  const [folio, setFolio] = useState('');
  const [datos, setDatos] = useState<Datos>({
    nroFolio: '', fechaEmision: '', rutDeclarante: rut,
    aduana: '', regimen: '', descripcion: '',
    partida: '', valorUSD: '', pesoKg: '',
    origenDestino: '', motivoRect: '',
  });
  const [errors, setErrors] = useState<Partial<Datos>>({});

  const upd = (k: keyof Datos, v: string) => setDatos(d => ({ ...d, [k]: v }));

  const validarPaso2 = () => {
    const e: Partial<Datos> = {};
    if (!datos.aduana) e.aduana = 'Requerido';
    if (!datos.regimen) e.regimen = 'Requerido';
    if (tipo === 'RECT' && !datos.nroFolio) e.nroFolio = 'Requerido';
    setErrors(e); return !Object.keys(e).length;
  };
  const validarPaso3 = () => {
    const e: Partial<Datos> = {};
    if (!datos.descripcion) e.descripcion = 'Requerido';
    if (!datos.partida) e.partida = 'Requerido';
    if (!datos.valorUSD) e.valorUSD = 'Requerido';
    setErrors(e); return !Object.keys(e).length;
  };

  const enviar = () => { setFolio(`DEC-2026-${Math.floor(10000 + Math.random() * 90000)}`); setPaso(5); };

  const tipoLabel = TIPOS_DECL.find(t => t.id === tipo)?.label ?? '';

  return (
    <PageLayout titulo="Declaraciones Aduaneras" subtitulo="DIN, DTI y Rectificaciones" rut={rut} onVolver={onVolver}>
      {paso > 1 && paso < 5 && <IndicadorPasos pasos={PASOS} actual={paso} />}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {paso > 1 && paso < 5 && <div className="mb-6"><h2 className="text-gray-800 font-bold">{PASOS[paso - 1].label}</h2><p className="text-xs text-gray-400">Paso {paso} de {PASOS.length}</p></div>}

        {/* PASO 1 — Seleccionar tipo */}
        {paso === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-gray-800 font-bold mb-1">Seleccione el tipo de declaración</h2>
              <p className="text-xs text-gray-400">Elija el trámite que desea realizar</p>
            </div>
            <div className="space-y-3">
              {TIPOS_DECL.map(t => (
                <button key={t.id!} onClick={() => setTipo(t.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${tipo === t.id ? 'border-[#1a5276] bg-[#1a5276]/5' : 'border-gray-100 hover:border-gray-200'}`}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: t.color }}>
                    {t.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{t.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{t.desc}</p>
                  </div>
                  {tipo === t.id && <CheckCircle2 className="w-5 h-5 text-[#1a5276] ml-auto flex-shrink-0" />}
                </button>
              ))}
            </div>
            <div className="flex justify-end">
              <button disabled={!tipo} onClick={() => tipo && setPaso(2)}
                className="bg-[#1a5276] text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-[#143d5a] disabled:opacity-40 transition-colors flex items-center gap-2">
                Continuar <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* PASO 2 — Datos generales */}
        {paso === 2 && (
          <div className="space-y-5">
            {tipo === 'RECT' && (
              <Campo label="N° de Folio a Rectificar" required error={errors.nroFolio}>
                <FInput value={datos.nroFolio} onChange={e => upd('nroFolio', e.target.value)} placeholder="Ej: DEC-2026-00123" error={!!errors.nroFolio} />
              </Campo>
            )}
            <div className="grid grid-cols-2 gap-4">
              <Campo label="RUT Declarante"><FInput value={datos.rutDeclarante} disabled className="bg-gray-50 text-gray-500" /></Campo>
              <Campo label="Fecha de Emisión"><FInput type="date" value={datos.fechaEmision} onChange={e => upd('fechaEmision', e.target.value)} /></Campo>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Aduana de Tramitación" required error={errors.aduana}>
                <FSelect value={datos.aduana} onChange={e => upd('aduana', e.target.value)} error={!!errors.aduana}>
                  <option value="">Seleccionar</option>
                  {PUERTOS.map(p => <option key={p}>{p}</option>)}
                </FSelect>
              </Campo>
              <Campo label="Régimen Aduanero" required error={errors.regimen}>
                <FSelect value={datos.regimen} onChange={e => upd('regimen', e.target.value)} error={!!errors.regimen}>
                  <option value="">Seleccionar</option>
                  {['Importación definitiva', 'Importación temporal', 'Tránsito interno', 'Reexportación', 'Zona franca'].map(r => <option key={r}>{r}</option>)}
                </FSelect>
              </Campo>
            </div>
            {tipo === 'RECT' && (
              <Campo label="Motivo de la Rectificación">
                <FTextarea value={datos.motivoRect} onChange={e => upd('motivoRect', e.target.value)} placeholder="Describa el error a corregir y el dato correcto" />
              </Campo>
            )}
            <InfoBox>La aduana de tramitación debe corresponder al punto de ingreso o salida de la mercancía.</InfoBox>
            <NavBtns onBack={() => setPaso(1)} onNext={() => validarPaso2() && setPaso(3)} />
          </div>
        )}

        {/* PASO 3 — Mercancía */}
        {paso === 3 && (
          <div className="space-y-5">
            <Campo label="Descripción de la Mercancía" required error={errors.descripcion}>
              <FTextarea value={datos.descripcion} onChange={e => upd('descripcion', e.target.value)} placeholder="Descripción detallada según documentos comerciales" error={!!errors.descripcion} />
            </Campo>
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Partida Arancelaria" required error={errors.partida}>
                <FInput value={datos.partida} onChange={e => upd('partida', e.target.value)} placeholder="Ej: 8471.30.00" error={!!errors.partida} />
              </Campo>
              <Campo label="País Origen / Destino">
                <FInput value={datos.origenDestino} onChange={e => upd('origenDestino', e.target.value)} placeholder="Ej: China" />
              </Campo>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Valor CIF (USD)" required error={errors.valorUSD}>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">USD</span>
                  <FInput value={datos.valorUSD} onChange={e => upd('valorUSD', e.target.value)} placeholder="0.00" className="pl-11" error={!!errors.valorUSD} />
                </div>
              </Campo>
              <Campo label="Peso Bruto (KG)">
                <FInput type="number" value={datos.pesoKg} onChange={e => upd('pesoKg', e.target.value)} placeholder="0.00" />
              </Campo>
            </div>
            <NavBtns onBack={() => setPaso(2)} onNext={() => validarPaso3() && setPaso(4)} />
          </div>
        )}

        {/* PASO 4 — Revisión */}
        {paso === 4 && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Tipo de Declaración</p>
              <p className="text-sm font-semibold text-[#1a5276]">{tipoLabel}</p>
            </div>
            <TarjetaRevision titulo="Datos Generales" icon={<FileText className="w-3.5 h-3.5" />} filas={[
              ['RUT Declarante', datos.rutDeclarante],
              ['Aduana', datos.aduana],
              ['Régimen', datos.regimen],
              ['Fecha emisión', datos.fechaEmision],
              ...(tipo === 'RECT' ? [['Folio rectificado', datos.nroFolio] as [string, string]] : []),
            ]} />
            <TarjetaRevision titulo="Mercancía" icon={<ArrowRightLeft className="w-3.5 h-3.5" />} filas={[
              ['Descripción', datos.descripcion],
              ['Partida', datos.partida],
              ['Valor CIF', `USD ${datos.valorUSD}`],
              ['Peso', datos.pesoKg ? `${datos.pesoKg} KG` : '—'],
              ['Origen/Destino', datos.origenDestino],
            ]} />
            <NavBtns onBack={() => setPaso(3)} onNext={enviar} nextLabel="Enviar declaración" />
          </div>
        )}

        {paso === 5 && (
          <Confirmacion folio={folio} tipo={tipoLabel} pasos={['El funcionario de Aduanas revisará su declaración.', 'Se le notificará por correo el resultado del aforo.', 'En caso de rectificación, la corrección quedará registrada en el expediente original.']} onVolver={onVolver} />
        )}
      </div>
    </PageLayout>
  );
}
