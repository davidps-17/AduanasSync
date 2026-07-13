import { useState } from 'react';
import { Globe, Building2, User, ClipboardList, FileCheck, CheckCircle2 } from 'lucide-react';
import { validarRut, formatRut, MSG_RUT_INVALIDO } from '../utils/rut';
import { PageLayout, IndicadorPasos } from './ui/PageLayout';
import { Campo, FInput, FSelect, FTextarea, NavBtns, InfoBox, TarjetaRevision, Confirmacion } from './ui/FormFields';

const PASOS = [
  { id: 1, label: 'Empresa',        icon: <Building2 className="w-4 h-4" /> },
  { id: 2, label: 'Representante',  icon: <User className="w-4 h-4" /> },
  { id: 3, label: 'Operaciones',    icon: <Globe className="w-4 h-4" /> },
  { id: 4, label: 'Documentos',     icon: <ClipboardList className="w-4 h-4" /> },
  { id: 5, label: 'Revisión',       icon: <FileCheck className="w-4 h-4" /> },
];

const REGIONES = ['Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama', 'Coquimbo', 'Valparaíso', 'Metropolitana', 'O\'Higgins', 'Maule', 'Biobío', 'La Araucanía', 'Los Lagos', 'Magallanes'];
const RUBROS = ['Minería', 'Agricultura y alimentos', 'Manufactura industrial', 'Tecnología y electrónica', 'Textil y confección', 'Químicos y farmacéutica', 'Madera y celulosa', 'Energía', 'Retail y comercio', 'Otro'];
const TIPOS_OP = ['Importador', 'Exportador', 'Importador y Exportador', 'Agente de Aduana', 'Despachador de Aduana', 'Operador Logístico'];

interface D1 { rut: string; razonSocial: string; giro: string; rubro: string; region: string; direccion: string; email: string; telefono: string }
interface D2 { nombreRep: string; rutRep: string; cargoRep: string; emailRep: string; telefonoRep: string }
interface D3 { tipoOp: string; volumenAnual: string; paisesOp: string; mercanciasPrincipales: string; requiereAgente: string }
interface D4 { escritura: boolean; rut_emp: boolean; inicio_actividades: boolean; patente: boolean; poder: boolean }

const DOCS: Record<keyof D4, string> = {
  escritura: 'Escritura de Constitución de Sociedad',
  rut_emp: 'Copia RUT Empresa (SII)',
  inicio_actividades: 'Inicio de Actividades ante SII',
  patente: 'Patente Comercial Municipal',
  poder: 'Poder Notarial del Representante Legal',
};

interface Props { rut: string; onVolver: () => void }

export function TramiteOperadorComercio({ rut, onVolver }: Props) {
  const [paso, setPaso] = useState(1);
  const [folio, setFolio] = useState('');
  const [d1, setD1] = useState<D1>({ rut, razonSocial: '', giro: '', rubro: '', region: '', direccion: '', email: '', telefono: '' });
  const [d2, setD2] = useState<D2>({ nombreRep: '', rutRep: '', cargoRep: '', emailRep: '', telefonoRep: '' });
  const [d3, setD3] = useState<D3>({ tipoOp: '', volumenAnual: '', paisesOp: '', mercanciasPrincipales: '', requiereAgente: 'No' });
  const [d4, setD4] = useState<D4>({ escritura: false, rut_emp: false, inicio_actividades: false, patente: false, poder: false });

  const [e1, setE1] = useState<Partial<D1>>({});
  const [e2, setE2] = useState<Partial<D2>>({});
  const [e3, setE3] = useState<Partial<D3>>({});

  const v1 = () => {
    const e: Partial<D1> = {};
    if (!d1.razonSocial) e.razonSocial = 'Requerido';
    if (!d1.giro)        e.giro        = 'Requerido';
    if (!d1.region)      e.region      = 'Requerido';
    if (!d1.email)       e.email       = 'Requerido';
    if (!validarRut(d1.rut)) e.rut     = MSG_RUT_INVALIDO;
    setE1(e); return !Object.keys(e).length;
  };
  const v2 = () => {
    const e: Partial<D2> = {};
    if (!d2.nombreRep)           e.nombreRep = 'Requerido';
    if (!validarRut(d2.rutRep))  e.rutRep    = MSG_RUT_INVALIDO;
    if (!d2.cargoRep)            e.cargoRep  = 'Requerido';
    setE2(e); return !Object.keys(e).length;
  };
  const v3 = () => { const e: Partial<D3> = {}; if (!d3.tipoOp) e.tipoOp = 'Requerido'; setE3(e); return !Object.keys(e).length; };

  const enviar = () => { setFolio(`OCE-2026-${Math.floor(10000 + Math.random() * 90000)}`); setPaso(6); };

  const docsMarcados = (Object.keys(d4) as (keyof D4)[]).filter(k => d4[k]).length;

  return (
    <PageLayout titulo="Registro Operador Comercio Exterior" subtitulo="Inscripción y habilitación para operar en Aduanas" rut={rut} onVolver={onVolver}>
      {paso < 6 && <IndicadorPasos pasos={PASOS} actual={paso} />}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {paso < 6 && <div className="mb-6"><h2 className="text-gray-800 font-bold">{PASOS[paso - 1].label}</h2><p className="text-xs text-gray-400">Paso {paso} de {PASOS.length}</p></div>}

        {/* PASO 1 */}
        {paso === 1 && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Campo label="RUT Empresa" required error={e1.rut}>
                <FInput value={d1.rut} onChange={ev => setD1({ ...d1, rut: formatRut(ev.target.value) })} placeholder="12.345.678-9" className="font-mono" error={!!e1.rut} />
              </Campo>
              <Campo label="Razón Social" required error={e1.razonSocial}><FInput value={d1.razonSocial} onChange={e => setD1({ ...d1, razonSocial: e.target.value })} placeholder="Nombre legal de la empresa" error={!!e1.razonSocial} /></Campo>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Giro Comercial" required error={e1.giro}><FInput value={d1.giro} onChange={e => setD1({ ...d1, giro: e.target.value })} placeholder="Giro registrado en SII" error={!!e1.giro} /></Campo>
              <Campo label="Rubro">
                <FSelect value={d1.rubro} onChange={e => setD1({ ...d1, rubro: e.target.value })}>
                  <option value="">Seleccionar</option>
                  {RUBROS.map(r => <option key={r}>{r}</option>)}
                </FSelect>
              </Campo>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Región" required error={e1.region}>
                <FSelect value={d1.region} onChange={e => setD1({ ...d1, region: e.target.value })} error={!!e1.region}>
                  <option value="">Seleccionar</option>
                  {REGIONES.map(r => <option key={r}>{r}</option>)}
                </FSelect>
              </Campo>
              <Campo label="Correo Electrónico" required error={e1.email}><FInput type="email" value={d1.email} onChange={e => setD1({ ...d1, email: e.target.value })} placeholder="contacto@empresa.cl" error={!!e1.email} /></Campo>
            </div>
            <Campo label="Dirección Comercial"><FInput value={d1.direccion} onChange={e => setD1({ ...d1, direccion: e.target.value })} placeholder="Calle, número, ciudad" /></Campo>
            <InfoBox>El RUT debe tener inicio de actividades activo ante el SII en el giro de importaciones o exportaciones.</InfoBox>
            <NavBtns onNext={() => v1() && setPaso(2)} />
          </div>
        )}

        {/* PASO 2 */}
        {paso === 2 && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Nombre Completo" required error={e2.nombreRep}><FInput value={d2.nombreRep} onChange={e => setD2({ ...d2, nombreRep: e.target.value })} placeholder="Nombre del representante legal" error={!!e2.nombreRep} /></Campo>
              <Campo label="RUT Representante" required error={e2.rutRep}><FInput value={d2.rutRep} onChange={e => setD2({ ...d2, rutRep: formatRut(e.target.value) })} placeholder="12.345.678-9" className="font-mono" error={!!e2.rutRep} /></Campo>
            </div>
            <Campo label="Cargo" required error={e2.cargoRep}><FInput value={d2.cargoRep} onChange={e => setD2({ ...d2, cargoRep: e.target.value })} placeholder="Ej: Gerente General, Director" error={!!e2.cargoRep} /></Campo>
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Correo Electrónico"><FInput type="email" value={d2.emailRep} onChange={e => setD2({ ...d2, emailRep: e.target.value })} placeholder="rep@empresa.cl" /></Campo>
              <Campo label="Teléfono"><FInput value={d2.telefonoRep} onChange={e => setD2({ ...d2, telefonoRep: e.target.value })} placeholder="+56 9 0000 0000" /></Campo>
            </div>
            <InfoBox>El representante legal debe estar facultado mediante escritura pública o poder notarial para actuar ante el Servicio Nacional de Aduanas.</InfoBox>
            <NavBtns onBack={() => setPaso(1)} onNext={() => v2() && setPaso(3)} />
          </div>
        )}

        {/* PASO 3 */}
        {paso === 3 && (
          <div className="space-y-5">
            <Campo label="Tipo de Operación" required error={e3.tipoOp}>
              <FSelect value={d3.tipoOp} onChange={e => setD3({ ...d3, tipoOp: e.target.value })} error={!!e3.tipoOp}>
                <option value="">Seleccionar</option>
                {TIPOS_OP.map(t => <option key={t}>{t}</option>)}
              </FSelect>
            </Campo>
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Volumen Anual Estimado (USD)">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">USD</span>
                  <FInput value={d3.volumenAnual} onChange={e => setD3({ ...d3, volumenAnual: e.target.value })} placeholder="0" className="pl-11" />
                </div>
              </Campo>
              <Campo label="¿Requiere Agente de Aduana?">
                <FSelect value={d3.requiereAgente} onChange={e => setD3({ ...d3, requiereAgente: e.target.value })}>
                  {['No', 'Sí'].map(v => <option key={v}>{v}</option>)}
                </FSelect>
              </Campo>
            </div>
            <Campo label="Países con los que Opera">
              <FInput value={d3.paisesOp} onChange={e => setD3({ ...d3, paisesOp: e.target.value })} placeholder="Ej: China, Estados Unidos, Brasil" />
            </Campo>
            <Campo label="Mercancías Principales">
              <FTextarea value={d3.mercanciasPrincipales} onChange={e => setD3({ ...d3, mercanciasPrincipales: e.target.value })} placeholder="Describa los tipos de mercancías que habitualmente importa o exporta" />
            </Campo>
            <NavBtns onBack={() => setPaso(2)} onNext={() => v3() && setPaso(4)} />
          </div>
        )}

        {/* PASO 4 */}
        {paso === 4 && (
          <div className="space-y-5">
            <InfoBox color="amber">Marque los documentos que adjuntará. Todos deben estar vigentes y legibles. Puede presentarlos en formato digital (PDF) o en las oficinas de Aduanas.</InfoBox>
            <div className="space-y-2">
              {(Object.keys(d4) as (keyof D4)[]).map(k => (
                <label key={k} onClick={() => setD4({ ...d4, [k]: !d4[k] })}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${d4[k] ? 'border-[#1a5276] bg-[#1a5276]/5' : 'border-gray-100 hover:border-gray-200'}`}>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${d4[k] ? 'bg-[#1a5276] border-[#1a5276]' : 'border-gray-300'}`}>
                    {d4[k] && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <span className="text-sm text-gray-700">{DOCS[k]}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-400">{docsMarcados} de {Object.keys(d4).length} documentos marcados</p>
            <NavBtns onBack={() => setPaso(3)} onNext={() => setPaso(5)} />
          </div>
        )}

        {/* PASO 5 */}
        {paso === 5 && (
          <div className="space-y-4">
            <TarjetaRevision titulo="Datos de la Empresa" icon={<Building2 className="w-3.5 h-3.5" />} filas={[['RUT', d1.rut], ['Razón Social', d1.razonSocial], ['Giro', d1.giro], ['Región', d1.region], ['Correo', d1.email]]} />
            <TarjetaRevision titulo="Representante Legal" icon={<User className="w-3.5 h-3.5" />} filas={[['Nombre', d2.nombreRep], ['RUT', d2.rutRep], ['Cargo', d2.cargoRep], ['Correo', d2.emailRep]]} />
            <TarjetaRevision titulo="Tipo de Operación" icon={<Globe className="w-3.5 h-3.5" />} filas={[['Tipo', d3.tipoOp], ['Volumen anual', d3.volumenAnual ? `USD ${d3.volumenAnual}` : '—'], ['Países', d3.paisesOp]]} />
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Documentos</p>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(d4) as (keyof D4)[]).filter(k => d4[k]).map(k => (
                  <span key={k} className="text-xs bg-green-100 text-green-700 border border-green-200 rounded-full px-3 py-1">{DOCS[k]}</span>
                ))}
                {!docsMarcados && <span className="text-xs text-gray-400">Sin documentos marcados</span>}
              </div>
            </div>
            <NavBtns onBack={() => setPaso(4)} onNext={enviar} nextLabel="Enviar solicitud" />
          </div>
        )}

        {paso === 6 && (
          <Confirmacion folio={folio} tipo="Solicitud de Registro como Operador de Comercio Exterior" pasos={['Su solicitud será revisada en un plazo de 5–10 días hábiles.', 'Recibirá un correo con el resultado de la evaluación.', 'Si es aprobado, quedará habilitado para operar en el sistema AduanaSync.', 'En caso de observaciones, deberá subsanar los antecedentes indicados.']} onVolver={onVolver} />
        )}
      </div>
    </PageLayout>
  );
}
