import { useState, useEffect } from 'react';
import {
  ArrowLeft, ChevronRight, CheckCircle2, Plane, User, MapPin,
  Package, Plus, Trash2, AlertCircle, FileText, Download, Printer,
  Shield, Info, Baby, CreditCard, Globe, PawPrint, Syringe, FileCheck,
  Save,
} from 'lucide-react';
import { validarRut, formatRut, MSG_RUT_INVALIDO, validarFechaNacimiento, validarFecha, calcularEdad, hoyISO, fechaHaceAños } from '../utils/rut';
import { imprimirDeclaracion, ahora } from '../utils/print';
import { guardarTramite } from '../utils/tramitesStore';
import { PAISES_MUNDO } from '../utils/countries';
import { DocumentScanner, type ScanStatus, type DatosEscaneados } from './ui/DocumentScanner';
import { DatePicker } from './ui/DatePicker';

/* ══════════════════════════════════════════════════  TIPOS  ══════════════════════════════════════════════════ */
type TipoDoc = 'rut' | 'pasaporte';

interface DatosPersonales {
  primerNombre: string; segundoNombre: string;
  apellidoPaterno: string; apellidoMaterno: string;
  tipoDoc: TipoDoc; documento: string;
  fechaNacimiento: string; nacionalidad: string;
}

interface Menor {
  id: string; primerNombre: string; segundoNombre: string;
  apellidoPaterno: string; apellidoMaterno: string;
  tipoDoc: TipoDoc; documento: string;
  fechaNacimiento: string; nacionalidad: string; parentesco: string;
  // Permiso notarial
  viajaConAmbosPadres: boolean;
  permisoNotarial: { notaria: string; folio: string; fecha: string; rutAutorizante: string; nombreAutorizante: string };
}

interface Mascota {
  id: string; nombre: string; especie: string; raza: string; color: string;
  sexo: string; fechaNacimiento: string;
  microchip: string;
  vacunaRabia: boolean; fechaVacunaRabia: string;
  otrasVacunas: string[];
  nroCertificadoSAG: string; paisProcedencia: string;
  tratamientoParasitos: boolean;
}

interface DatosViaje {
  origen: string; vuelo: string; fechaLlegada: string;
  motivoViaje: string; diasEstadia: string; aerolinea: string;
}

interface Articulo { id: string; descripcion: string; cantidad: string; valorUSD: string; pais: string }

const EXENTO_ADULTO = 500;
const EXENTO_MENOR  = 250;
const TASA          = 0.06;

const PASOS = [
  { id: 1, label: 'Titular',    icon: <User className="w-4 h-4" /> },
  { id: 2, label: 'Menores',   icon: <Baby className="w-4 h-4" /> },
  { id: 3, label: 'Mascotas',  icon: <PawPrint className="w-4 h-4" /> },
  { id: 4, label: 'Viaje',     icon: <Plane className="w-4 h-4" /> },
  { id: 5, label: 'Bienes',    icon: <Package className="w-4 h-4" /> },
  { id: 6, label: 'Revisión',  icon: <FileText className="w-4 h-4" /> },
  { id: 7, label: 'Listo',     icon: <CheckCircle2 className="w-4 h-4" /> },
];

const MOTIVOS    = ['Turismo', 'Negocios', 'Visita familiar', 'Estudio', 'Tránsito', 'Otro'];
const AEROLINEAS = ['LATAM', 'Sky Airline', 'JetSmart', 'American Airlines', 'Iberia', 'Air France', 'Lufthansa', 'Copa Airlines', 'Avianca', 'Delta', 'United', 'Emirates', 'KLM', 'Turkish Airlines', 'Otra'];
const PARENTESCOS = ['Hijo/a', 'Nieto/a', 'Sobrino/a', 'Menor bajo tutela legal', 'Otro'];
const ESPECIES    = ['Perro', 'Gato', 'Ave', 'Conejo', 'Hamster', 'Reptil', 'Pez ornamental', 'Otro'];
const VACUNAS_OPCIONALES = ['Distemper', 'Parvovirus', 'Leptospirosis', 'Hepatitis', 'Bordetella', 'Leucemia felina', 'Calicivirus', 'Panleucopenia'];

/* ══════════════════════════════════════════════════  HELPERS UI  ══════════════════════════════════════════════════ */
function Campo({ label, required, error, hint, children }: {
  label: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-[11px] text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3 flex-shrink-0" />{error}</p>}
      {hint && !error && <p className="mt-1 text-[10px] text-gray-400">{hint}</p>}
    </div>
  );
}

function Inp({ error, className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return (
    <input {...props} className={`w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all ${error ? 'border-red-300 bg-red-50 focus:ring-red-200' : 'border-gray-200 focus:ring-[#1a5276]/20 focus:border-[#1a5276]'} ${className}`} />
  );
}

function Sel({ error, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean }) {
  return (
    <select {...props} className={`w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 bg-white transition-all ${error ? 'border-red-300 bg-red-50 focus:ring-red-200' : 'border-gray-200 focus:ring-[#1a5276]/20 focus:border-[#1a5276]'}`}>
      {children}
    </select>
  );
}

function NavBotones({ onBack, onNext, nextLabel = 'Continuar', disabled = false }: { onBack?: () => void; onNext: () => void; nextLabel?: string; disabled?: boolean }) {
  return (
    <div className="flex justify-between pt-2">
      {onBack
        ? <button type="button" onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1.5 transition-colors"><ArrowLeft className="w-4 h-4" /> Volver</button>
        : <div />}
      <button type="button" onClick={onNext} disabled={disabled}
        className="bg-[#1a5276] text-white text-sm font-medium px-6 py-2.5 rounded-xl hover:bg-[#143d5a] disabled:opacity-40 transition-colors flex items-center gap-2">
        {nextLabel} <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function CampoDoc({ tipoDoc, documento, onTipoChange, onDocChange, errorDoc }: {
  tipoDoc: TipoDoc; documento: string;
  onTipoChange: (t: TipoDoc) => void; onDocChange: (v: string) => void; errorDoc?: string;
}) {
  return (
    <Campo label="Documento de identidad" required error={errorDoc}>
      <div className="flex gap-2">
        <div className="flex rounded-xl border border-gray-200 overflow-hidden flex-shrink-0">
          {(['rut', 'pasaporte'] as TipoDoc[]).map(t => (
            <button key={t} type="button" onClick={() => onTipoChange(t)}
              className={`px-3 py-2.5 text-xs font-medium transition-colors flex items-center gap-1 border-r last:border-r-0 border-gray-200 ${tipoDoc === t ? 'bg-[#1a5276] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
              {t === 'rut' ? <><CreditCard className="w-3.5 h-3.5" /> RUT</> : <><Globe className="w-3.5 h-3.5" /> Pasaporte</>}
            </button>
          ))}
        </div>
        <Inp
          value={documento}
          onChange={e => onDocChange(tipoDoc === 'rut' ? formatRut(e.target.value) : e.target.value.toUpperCase())}
          placeholder={tipoDoc === 'rut' ? '12.345.678-9' : 'Ej: AA123456'}
          maxLength={tipoDoc === 'rut' ? 12 : 20}
          className={tipoDoc === 'rut' ? 'font-mono' : ''}
          error={!!errorDoc}
        />
      </div>
      {tipoDoc === 'rut' && <p className="mt-1 text-[10px] text-gray-400">Ingrese el RUT con dígito verificador (0–9 o K)</p>}
    </Campo>
  );
}

/* ══════════════════════════════════════════════════
   PASO 1 — Datos del Titular
══════════════════════════════════════════════════ */
function PasoDatosPersonales({ data, onChange, onNext, scanStatus, onScan }: {
  data: DatosPersonales; onChange: (d: DatosPersonales) => void; onNext: () => void;
  scanStatus: ScanStatus; onScan: (d: DatosEscaneados) => void;
}) {
  const [err, setErr] = useState<Record<string, string>>({});
  const upd = (k: keyof DatosPersonales, v: string) => onChange({ ...data, [k]: v });

  const validar = () => {
    const e: Record<string, string> = {};
    if (!data.primerNombre.trim())    e.primerNombre    = 'El primer nombre es obligatorio';
    if (!data.apellidoPaterno.trim()) e.apellidoPaterno = 'El apellido paterno es obligatorio';
    if (!data.apellidoMaterno.trim()) e.apellidoMaterno = 'El apellido materno es obligatorio';
    if (!data.nacionalidad)           e.nacionalidad    = 'Seleccione la nacionalidad';

    if (data.tipoDoc === 'rut') {
      if (!validarRut(data.documento)) e.documento = MSG_RUT_INVALIDO;
    } else {
      if (!data.documento.trim()) e.documento = 'Ingrese el número de pasaporte';
    }

    const errFecha = validarFechaNacimiento(data.fechaNacimiento, 18);
    if (errFecha) e.fechaNacimiento = errFecha;

    setErr(e);
    return Object.keys(e).length === 0;
  };

  return (
    <div className="space-y-5">
      {/* Scanner de documento */}
      <div className="bg-[#1a5276]/5 border border-[#1a5276]/20 rounded-2xl p-4 space-y-3">
        <p className="text-xs font-semibold text-[#1a5276] dark:text-blue-400 flex items-center gap-2">
          <Info className="w-4 h-4" /> Escaneo de Documento (opcional)
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
          Puede escanear su cédula de identidad o pasaporte con la cámara para completar los datos automáticamente,
          o bien ingresarlos manualmente.
        </p>
        <DocumentScanner onScan={onScan} scanStatus={scanStatus} />
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-3 flex gap-2">
        <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
          Ingrese los datos <strong>exactamente como aparecen en su documento de viaje</strong>. El declarante debe ser mayor de 18 años.
        </p>
      </div>

      {/* Nombres */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Campo label="Primer Nombre" required error={err.primerNombre}>
          <Inp value={data.primerNombre} onChange={e => upd('primerNombre', e.target.value)} placeholder="Ej: María" error={!!err.primerNombre} />
        </Campo>
        <Campo label="Segundo Nombre" hint="Opcional">
          <Inp value={data.segundoNombre} onChange={e => upd('segundoNombre', e.target.value)} placeholder="Ej: José" />
        </Campo>
        <Campo label="Apellido Paterno" required error={err.apellidoPaterno}>
          <Inp value={data.apellidoPaterno} onChange={e => upd('apellidoPaterno', e.target.value)} placeholder="Ej: González" error={!!err.apellidoPaterno} />
        </Campo>
        <Campo label="Apellido Materno" required error={err.apellidoMaterno}>
          <Inp value={data.apellidoMaterno} onChange={e => upd('apellidoMaterno', e.target.value)} placeholder="Ej: Pérez" error={!!err.apellidoMaterno} />
        </Campo>
      </div>

      <CampoDoc tipoDoc={data.tipoDoc} documento={data.documento}
        onTipoChange={t => onChange({ ...data, tipoDoc: t, documento: '' })}
        onDocChange={v => upd('documento', v)} errorDoc={err.documento} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Campo label="Fecha de Nacimiento" required error={err.fechaNacimiento} hint="Debe ser mayor de 18 años">
          <Inp type="date" value={data.fechaNacimiento}
            onChange={e => upd('fechaNacimiento', e.target.value)}
            max={fechaHaceAños(18)} min="1900-01-01"
            error={!!err.fechaNacimiento} />
        </Campo>
        <Campo label="Nacionalidad" required error={err.nacionalidad}>
          <Sel value={data.nacionalidad} onChange={e => upd('nacionalidad', e.target.value)} error={!!err.nacionalidad}>
            <option value="">Seleccione país</option>
            {PAISES_MUNDO.map(p => <option key={p}>{p}</option>)}
          </Sel>
        </Campo>
      </div>

      <NavBotones onNext={() => validar() && onNext()} />
    </div>
  );
}

/* ══════════════════════════════════════════════════
   PASO 2 — Menores y Permiso Notarial
══════════════════════════════════════════════════ */
const MENOR_VACIO = (): Menor => ({
  id: crypto.randomUUID(), primerNombre: '', segundoNombre: '',
  apellidoPaterno: '', apellidoMaterno: '', tipoDoc: 'pasaporte',
  documento: '', fechaNacimiento: '', nacionalidad: '', parentesco: '',
  viajaConAmbosPadres: true,
  permisoNotarial: { notaria: '', folio: '', fecha: '', rutAutorizante: '', nombreAutorizante: '' },
});

function PasoMenores({ menores, onChange, onNext, onBack }: { menores: Menor[]; onChange: (m: Menor[]) => void; onNext: () => void; onBack: () => void }) {
  const [sinMenores, setSinMenores] = useState(menores.length === 0);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const agregar = () => { onChange([...menores, MENOR_VACIO()]); setSinMenores(false); };
  const eliminar = (id: string) => { const n = menores.filter(m => m.id !== id); onChange(n); if (!n.length) setSinMenores(true); };
  const updM = (id: string, patch: Partial<Menor>) => onChange(menores.map(m => m.id === id ? { ...m, ...patch } : m));
  const updN = (id: string, k: keyof Menor['permisoNotarial'], v: string) =>
    onChange(menores.map(m => m.id === id ? { ...m, permisoNotarial: { ...m.permisoNotarial, [k]: v } } : m));

  const validar = () => {
    if (sinMenores) { onNext(); return; }
    const e: Record<string, string> = {};
    menores.forEach(m => {
      if (!m.primerNombre.trim())    e[`${m.id}_pnombre`]  = 'Requerido';
      if (!m.apellidoPaterno.trim()) e[`${m.id}_apPaterno`]= 'Requerido';
      if (!m.apellidoMaterno.trim()) e[`${m.id}_apMaterno`]= 'Requerido';
      if (m.tipoDoc === 'rut' && !validarRut(m.documento)) e[`${m.id}_doc`] = MSG_RUT_INVALIDO;
      else if (m.tipoDoc === 'pasaporte' && !m.documento.trim()) e[`${m.id}_doc`] = 'Requerido';
      const ef = validarFechaNacimiento(m.fechaNacimiento, 0, 18);
      if (ef) e[`${m.id}_fecha`] = ef;
      if (!m.viajaConAmbosPadres) {
        const { valida, error } = validarFecha(m.permisoNotarial.fecha);
        if (!valida) e[`${m.id}_pnFecha`] = error || 'Fecha del permiso inválida';
        if (!m.permisoNotarial.notaria.trim()) e[`${m.id}_pnNotaria`]  = 'Requerido';
        if (!m.permisoNotarial.folio.trim())   e[`${m.id}_pnFolio`]    = 'Requerido';
        if (!validarRut(m.permisoNotarial.rutAutorizante)) e[`${m.id}_pnRut`] = MSG_RUT_INVALIDO;
        if (!m.permisoNotarial.nombreAutorizante.trim())   e[`${m.id}_pnNombre`] = 'Requerido';
      }
    });
    setErrores(e);
    if (!Object.keys(e).length) onNext();
  };

  return (
    <div className="space-y-5">
      <div onClick={() => { setSinMenores(!sinMenores); if (!sinMenores) onChange([]); }}
        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all select-none ${sinMenores ? 'border-[#1a5276] bg-[#1a5276]/5' : 'border-gray-200 hover:border-gray-300'}`}>
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${sinMenores ? 'border-[#1a5276] bg-[#1a5276]' : 'border-gray-300'}`}>
          {sinMenores && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>
        <p className="text-sm font-medium text-gray-700">No viajo con menores de edad</p>
      </div>

      {!sinMenores && menores.map((m, idx) => {
        const edad = calcularEdad(m.fechaNacimiento);
        return (
          <div key={m.id} className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-5">
            {/* Header menor */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#1a5276] flex items-center justify-center">
                  <Baby className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700">Menor {idx + 1}</p>
                  {edad !== null && <p className="text-[10px] text-gray-400">{edad} años · Franquicia USD {EXENTO_MENOR}</p>}
                </div>
              </div>
              <button type="button" onClick={() => eliminar(m.id)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>

            {/* Nombres */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Campo label="Primer Nombre" required error={errores[`${m.id}_pnombre`]}>
                <Inp value={m.primerNombre} onChange={e => updM(m.id, { primerNombre: e.target.value })} placeholder="Primer nombre" error={!!errores[`${m.id}_pnombre`]} />
              </Campo>
              <Campo label="Segundo Nombre" hint="Opcional">
                <Inp value={m.segundoNombre} onChange={e => updM(m.id, { segundoNombre: e.target.value })} placeholder="Segundo nombre" />
              </Campo>
              <Campo label="Apellido Paterno" required error={errores[`${m.id}_apPaterno`]}>
                <Inp value={m.apellidoPaterno} onChange={e => updM(m.id, { apellidoPaterno: e.target.value })} placeholder="Apellido paterno" error={!!errores[`${m.id}_apPaterno`]} />
              </Campo>
              <Campo label="Apellido Materno" required error={errores[`${m.id}_apMaterno`]}>
                <Inp value={m.apellidoMaterno} onChange={e => updM(m.id, { apellidoMaterno: e.target.value })} placeholder="Apellido materno" error={!!errores[`${m.id}_apMaterno`]} />
              </Campo>
            </div>

            <CampoDoc tipoDoc={m.tipoDoc} documento={m.documento}
              onTipoChange={t => updM(m.id, { tipoDoc: t, documento: '' })}
              onDocChange={v => updM(m.id, { documento: v })}
              errorDoc={errores[`${m.id}_doc`]} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Campo label="Fecha de Nacimiento" required error={errores[`${m.id}_fecha`]} hint="Debe ser menor de 18 años">
                <Inp type="date" value={m.fechaNacimiento} onChange={e => updM(m.id, { fechaNacimiento: e.target.value })}
                  max={hoyISO()} min="1900-01-01" error={!!errores[`${m.id}_fecha`]} />
              </Campo>
              <Campo label="Parentesco">
                <Sel value={m.parentesco} onChange={e => updM(m.id, { parentesco: e.target.value })}>
                  <option value="">Seleccionar</option>
                  {PARENTESCOS.map(p => <option key={p}>{p}</option>)}
                </Sel>
              </Campo>
            </div>

            <Campo label="Nacionalidad">
              <Sel value={m.nacionalidad} onChange={e => updM(m.id, { nacionalidad: e.target.value })}>
                <option value="">Seleccionar país</option>
                {PAISES_MUNDO.map(p => <option key={p}>{p}</option>)}
              </Sel>
            </Campo>

            {edad !== null && edad >= 18 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                Esta persona tiene {edad} años y no califica como menor. Elimínela de esta sección.
              </div>
            )}

            {/* ── Permiso Notarial ── */}
            <div className="border-t border-gray-200 pt-4">
              <p className="text-xs font-semibold text-gray-600 mb-3 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#1a5276]" /> Permiso Notarial
              </p>

              <div className="flex gap-3 mb-4">
                {[true, false].map(val => (
                  <button key={String(val)} type="button" onClick={() => updM(m.id, { viajaConAmbosPadres: val })}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-medium border-2 transition-all ${m.viajaConAmbosPadres === val ? 'border-[#1a5276] bg-[#1a5276]/5 text-[#1a5276]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                    {val ? '✔ Viaja con ambos padres' : '⚠ Viaja sin uno de los padres'}
                  </button>
                ))}
              </div>

              {!m.viajaConAmbosPadres && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-4">
                  <div className="flex gap-2">
                    <Shield className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800 leading-relaxed">
                      <strong>Permiso notarial obligatorio.</strong> Cuando un menor viaja sin uno de sus padres o tutores legales, se requiere autorización notarial vigente (Ley N° 16.618, Art. 49).
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Campo label="Nombre del padre/madre que autoriza" required error={errores[`${m.id}_pnNombre`]}>
                      <Inp value={m.permisoNotarial.nombreAutorizante}
                        onChange={e => updN(m.id, 'nombreAutorizante', e.target.value)}
                        placeholder="Nombre completo" error={!!errores[`${m.id}_pnNombre`]} />
                    </Campo>
                    <Campo label="RUT del autorizante" required error={errores[`${m.id}_pnRut`]}>
                      <Inp value={m.permisoNotarial.rutAutorizante}
                        onChange={e => updN(m.id, 'rutAutorizante', formatRut(e.target.value))}
                        placeholder="12.345.678-9" className="font-mono" error={!!errores[`${m.id}_pnRut`]} />
                    </Campo>
                    <Campo label="Notaría" required error={errores[`${m.id}_pnNotaria`]}>
                      <Inp value={m.permisoNotarial.notaria}
                        onChange={e => updN(m.id, 'notaria', e.target.value)}
                        placeholder="Ej: 15° Notaría de Santiago" error={!!errores[`${m.id}_pnNotaria`]} />
                    </Campo>
                    <Campo label="N° de Folio / Repertorio" required error={errores[`${m.id}_pnFolio`]}>
                      <Inp value={m.permisoNotarial.folio}
                        onChange={e => updN(m.id, 'folio', e.target.value)}
                        placeholder="Ej: 4521-2026" className="font-mono" error={!!errores[`${m.id}_pnFolio`]} />
                    </Campo>
                    <Campo label="Fecha del permiso notarial" required error={errores[`${m.id}_pnFecha`]}>
                      <Inp type="date" value={m.permisoNotarial.fecha}
                        onChange={e => updN(m.id, 'fecha', e.target.value)}
                        max={hoyISO()} min="2020-01-01" error={!!errores[`${m.id}_pnFecha`]} />
                    </Campo>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {!sinMenores && (
        <button type="button" onClick={agregar}
          className="w-full border-2 border-dashed border-gray-200 rounded-xl py-3 text-xs text-gray-400 hover:border-[#1a5276] hover:text-[#1a5276] transition-all flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Agregar otro menor
        </button>
      )}

      {!sinMenores && menores.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-1.5">
          <p className="text-xs font-semibold text-gray-600 mb-2">Franquicia total del grupo</p>
          <div className="flex justify-between text-xs text-gray-600"><span>Titular adulto</span><span>USD {EXENTO_ADULTO}</span></div>
          {menores.map((m, i) => (
            <div key={m.id} className="flex justify-between text-xs text-gray-600">
              <span>Menor {i + 1}{m.primerNombre ? ` — ${m.primerNombre}` : ''}</span><span>USD {EXENTO_MENOR}</span>
            </div>
          ))}
          <div className="border-t pt-2 flex justify-between text-xs font-semibold text-[#1a5276]">
            <span>Total franquicia</span><span>USD {EXENTO_ADULTO + menores.length * EXENTO_MENOR}</span>
          </div>
        </div>
      )}

      <NavBotones onBack={onBack} onNext={validar} />
    </div>
  );
}

/* ══════════════════════════════════════════════════
   PASO 3 — Mascotas (SAG Chile)
══════════════════════════════════════════════════ */
const MASCOTA_VACIA = (): Mascota => ({
  id: crypto.randomUUID(), nombre: '', especie: '', raza: '', color: '', sexo: '',
  fechaNacimiento: '', microchip: '', vacunaRabia: false, fechaVacunaRabia: '',
  otrasVacunas: [], nroCertificadoSAG: '', paisProcedencia: '', tratamientoParasitos: false,
});

function PasoMascotas({ mascotas, onChange, onNext, onBack }: { mascotas: Mascota[]; onChange: (m: Mascota[]) => void; onNext: () => void; onBack: () => void }) {
  const [sinMascotas, setSinMascotas] = useState(mascotas.length === 0);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const agregar = () => { onChange([...mascotas, MASCOTA_VACIA()]); setSinMascotas(false); };
  const eliminar = (id: string) => { const n = mascotas.filter(m => m.id !== id); onChange(n); if (!n.length) setSinMascotas(true); };
  const updM = (id: string, patch: Partial<Mascota>) => onChange(mascotas.map(m => m.id === id ? { ...m, ...patch } : m));
  const toggleVacuna = (id: string, v: string) => onChange(mascotas.map(m => m.id === id
    ? { ...m, otrasVacunas: m.otrasVacunas.includes(v) ? m.otrasVacunas.filter(x => x !== v) : [...m.otrasVacunas, v] }
    : m));

  const validar = () => {
    if (sinMascotas) { onNext(); return; }
    const e: Record<string, string> = {};
    mascotas.forEach(m => {
      if (!m.nombre.trim())   e[`${m.id}_nombre`]   = 'Requerido';
      if (!m.especie)         e[`${m.id}_especie`]  = 'Requerido';
      if (!m.microchip.trim()) e[`${m.id}_chip`]    = 'El número de microchip es obligatorio (SAG)';
      if (!m.vacunaRabia)     e[`${m.id}_rabia`]    = 'La vacuna antirrábica es obligatoria para ingresar a Chile';
      if (m.vacunaRabia && !m.fechaVacunaRabia) e[`${m.id}_fechaRabia`] = 'Indique la fecha de la vacuna';
      if (m.vacunaRabia && m.fechaVacunaRabia) {
        const { valida, error } = validarFecha(m.fechaVacunaRabia);
        if (!valida) e[`${m.id}_fechaRabia`] = error;
      }
      if (!m.paisProcedencia) e[`${m.id}_pais`]     = 'Requerido';
    });
    setErrores(e);
    if (!Object.keys(e).length) onNext();
  };

  return (
    <div className="space-y-5">
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex gap-2">
        <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700 leading-relaxed">
          El ingreso de mascotas a Chile es regulado por el <strong>SAG (Servicio Agrícola y Ganadero)</strong>.
          Se requiere microchip ISO, vacuna antirrábica vigente y certificado sanitario oficial.
        </p>
      </div>

      <div onClick={() => { setSinMascotas(!sinMascotas); if (!sinMascotas) onChange([]); }}
        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all select-none ${sinMascotas ? 'border-[#1a5276] bg-[#1a5276]/5' : 'border-gray-200 hover:border-gray-300'}`}>
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${sinMascotas ? 'border-[#1a5276] bg-[#1a5276]' : 'border-gray-300'}`}>
          {sinMascotas && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>
        <p className="text-sm font-medium text-gray-700">No viajo con mascotas</p>
      </div>

      {!sinMascotas && mascotas.map((m, idx) => (
        <div key={m.id} className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                <PawPrint className="w-4 h-4 text-white" />
              </div>
              <p className="text-xs font-semibold text-gray-700">Mascota {idx + 1}</p>
            </div>
            <button type="button" onClick={() => eliminar(m.id)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
          </div>

          {/* Datos básicos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Campo label="Nombre de la mascota" required error={errores[`${m.id}_nombre`]}>
              <Inp value={m.nombre} onChange={e => updM(m.id, { nombre: e.target.value })} placeholder="Ej: Max" error={!!errores[`${m.id}_nombre`]} />
            </Campo>
            <Campo label="Especie" required error={errores[`${m.id}_especie`]}>
              <Sel value={m.especie} onChange={e => updM(m.id, { especie: e.target.value })} error={!!errores[`${m.id}_especie`]}>
                <option value="">Seleccionar</option>
                {ESPECIES.map(e => <option key={e}>{e}</option>)}
              </Sel>
            </Campo>
            <Campo label="Raza">
              <Inp value={m.raza} onChange={e => updM(m.id, { raza: e.target.value })} placeholder="Ej: Labrador" />
            </Campo>
            <Campo label="Color / Pelaje">
              <Inp value={m.color} onChange={e => updM(m.id, { color: e.target.value })} placeholder="Ej: Dorado" />
            </Campo>
            <Campo label="Sexo">
              <Sel value={m.sexo} onChange={e => updM(m.id, { sexo: e.target.value })}>
                <option value="">Seleccionar</option>
                <option>Macho</option><option>Hembra</option>
              </Sel>
            </Campo>
            <Campo label="Fecha de Nacimiento">
              <Inp type="date" value={m.fechaNacimiento} onChange={e => updM(m.id, { fechaNacimiento: e.target.value })}
                max={hoyISO()} min="2000-01-01" />
            </Campo>
          </div>

          {/* Microchip */}
          <Campo label="N° de Microchip ISO 11784/11785" required error={errores[`${m.id}_chip`]}
            hint="15 dígitos según norma ISO. Obligatorio para ingresar a Chile.">
            <Inp value={m.microchip} onChange={e => updM(m.id, { microchip: e.target.value.replace(/\D/g, '').slice(0, 15) })}
              placeholder="000000000000000" className="font-mono tracking-widest" error={!!errores[`${m.id}_chip`]} />
            {m.microchip && <p className="text-[10px] text-gray-400 mt-0.5">{m.microchip.length}/15 dígitos</p>}
          </Campo>

          {/* País de procedencia */}
          <Campo label="País de Procedencia" required error={errores[`${m.id}_pais`]}>
            <Sel value={m.paisProcedencia} onChange={e => updM(m.id, { paisProcedencia: e.target.value })} error={!!errores[`${m.id}_pais`]}>
              <option value="">Seleccionar</option>
              {PAISES_MUNDO.map(p => <option key={p}>{p}</option>)}
            </Sel>
          </Campo>

          {/* Vacuna antirrábica */}
          <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-white">
            <p className="text-xs font-semibold text-gray-600 flex items-center gap-2"><Syringe className="w-4 h-4 text-[#1a5276]" /> Vacuna Antirrábica</p>
            <label className={`flex items-center gap-3 cursor-pointer p-3 rounded-xl border-2 transition-all ${m.vacunaRabia ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}
              onClick={() => updM(m.id, { vacunaRabia: !m.vacunaRabia })}>
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${m.vacunaRabia ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                {m.vacunaRabia && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
              </div>
              <span className="text-sm text-gray-700">Vacuna antirrábica vigente <span className="text-red-500">*</span></span>
            </label>
            {errores[`${m.id}_rabia`] && <p className="text-[11px] text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errores[`${m.id}_rabia`]}</p>}

            {m.vacunaRabia && (
              <Campo label="Fecha de la vacuna antirrábica" required error={errores[`${m.id}_fechaRabia`]}
                hint="Debe aplicarse con al menos 30 días de anticipación y no más de 12 meses antes del viaje">
                <Inp type="date" value={m.fechaVacunaRabia}
                  onChange={e => updM(m.id, { fechaVacunaRabia: e.target.value })}
                  max={hoyISO()} min="2023-01-01" error={!!errores[`${m.id}_fechaRabia`]} />
              </Campo>
            )}
          </div>

          {/* Otras vacunas */}
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-3 flex items-center gap-2"><Syringe className="w-4 h-4 text-gray-400" /> Otras Vacunas (opcional)</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {VACUNAS_OPCIONALES.map(v => (
                <label key={v} onClick={() => toggleVacuna(m.id, v)}
                  className={`flex items-center gap-2 cursor-pointer p-2.5 rounded-xl border text-xs transition-all ${m.otrasVacunas.includes(v) ? 'border-[#1a5276]/40 bg-[#1a5276]/5 text-[#1a5276]' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}>
                  <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${m.otrasVacunas.includes(v) ? 'bg-[#1a5276] border-[#1a5276]' : 'border-gray-300'}`}>
                    {m.otrasVacunas.includes(v) && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                  {v}
                </label>
              ))}
            </div>
          </div>

          {/* Tratamiento antiparasitario */}
          <label className={`flex items-center gap-3 cursor-pointer p-3 rounded-xl border-2 transition-all ${m.tratamientoParasitos ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
            onClick={() => updM(m.id, { tratamientoParasitos: !m.tratamientoParasitos })}>
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${m.tratamientoParasitos ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
              {m.tratamientoParasitos && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
            </div>
            <div>
              <p className="text-sm text-gray-700">Tratamiento antiparasitario interno y externo</p>
              <p className="text-[10px] text-gray-400">Recomendado por SAG dentro de los 10 días previos al viaje</p>
            </div>
          </label>

          {/* Certificado SAG */}
          <Campo label="N° Certificado Sanitario Oficial">
            <Inp value={m.nroCertificadoSAG} onChange={e => updM(m.id, { nroCertificadoSAG: e.target.value })}
              placeholder="Emitido por veterinario oficial del país de origen" className="font-mono" />
          </Campo>
        </div>
      ))}

      {!sinMascotas && (
        <button type="button" onClick={agregar}
          className="w-full border-2 border-dashed border-gray-200 rounded-xl py-3 text-xs text-gray-400 hover:border-[#1a5276] hover:text-[#1a5276] transition-all flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Agregar mascota
        </button>
      )}

      <NavBotones onBack={onBack} onNext={validar} />
    </div>
  );
}

/* ══════════════════════════════════════════════════
   PASO 4 — Viaje
══════════════════════════════════════════════════ */
function PasoViaje({ data, onChange, onNext, onBack }: { data: DatosViaje; onChange: (d: DatosViaje) => void; onNext: () => void; onBack: () => void }) {
  const [err, setErr] = useState<Record<string, string>>({});
  const upd = (k: keyof DatosViaje, v: string) => onChange({ ...data, [k]: v });
  const validar = () => {
    const e: Record<string, string> = {};
    if (!data.origen)       e.origen       = 'Requerido';
    if (!data.fechaLlegada) e.fechaLlegada = 'Requerido';
    else { const { valida, error } = validarFecha(data.fechaLlegada); if (!valida) e.fechaLlegada = error; }
    if (!data.motivoViaje)  e.motivoViaje  = 'Requerido';
    if (!data.diasEstadia || isNaN(+data.diasEstadia) || +data.diasEstadia < 1) e.diasEstadia = 'Ingrese número de días válido';
    setErr(e); return !Object.keys(e).length;
  };
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Campo label="País de Procedencia" required error={err.origen}>
          <Sel value={data.origen} onChange={e => upd('origen', e.target.value)} error={!!err.origen}>
            <option value="">Seleccione país</option>
            {PAISES_MUNDO.map(p => <option key={p}>{p}</option>)}
          </Sel>
        </Campo>
        <Campo label="Fecha de Llegada a Chile" required error={err.fechaLlegada}>
          <Inp type="date" value={data.fechaLlegada} onChange={e => upd('fechaLlegada', e.target.value)}
            min="2020-01-01" error={!!err.fechaLlegada} />
        </Campo>
        <Campo label="Aerolínea">
          <Sel value={data.aerolinea} onChange={e => upd('aerolinea', e.target.value)}>
            <option value="">Seleccionar</option>
            {AEROLINEAS.map(a => <option key={a}>{a}</option>)}
          </Sel>
        </Campo>
        <Campo label="N° de Vuelo">
          <Inp value={data.vuelo} onChange={e => upd('vuelo', e.target.value.toUpperCase())} placeholder="Ej: LA800" />
        </Campo>
        <Campo label="Motivo del Viaje" required error={err.motivoViaje}>
          <Sel value={data.motivoViaje} onChange={e => upd('motivoViaje', e.target.value)} error={!!err.motivoViaje}>
            <option value="">Seleccionar</option>
            {MOTIVOS.map(m => <option key={m}>{m}</option>)}
          </Sel>
        </Campo>
        <Campo label="Días de estadía en Chile" required error={err.diasEstadia}>
          <Inp type="number" min="1" max="365" value={data.diasEstadia} onChange={e => upd('diasEstadia', e.target.value)} placeholder="Ej: 15" error={!!err.diasEstadia} />
        </Campo>
      </div>
      <NavBotones onBack={onBack} onNext={() => validar() && onNext()} />
    </div>
  );
}

/* ══════════════════════════════════════════════════
   PASO 5 — Bienes
══════════════════════════════════════════════════ */
function PasoBienes({ articulos, menores, onChange, onNext, onBack }: { articulos: Articulo[]; menores: Menor[]; onChange: (a: Articulo[]) => void; onNext: () => void; onBack: () => void }) {
  const [sinBienes, setSinBienes] = useState(articulos.length === 0);
  const franquicia = EXENTO_ADULTO + menores.length * EXENTO_MENOR;
  const totalUSD   = articulos.reduce((s, a) => s + (parseFloat(a.valorUSD) || 0), 0);
  const excedente  = Math.max(0, totalUSD - franquicia);
  const arancel    = excedente * TASA;
  const agregar    = () => { onChange([...articulos, { id: crypto.randomUUID(), descripcion: '', cantidad: '1', valorUSD: '', pais: '' }]); setSinBienes(false); };
  const eliminar   = (id: string) => onChange(articulos.filter(a => a.id !== id));
  const upd        = (id: string, k: keyof Articulo, v: string) => onChange(articulos.map(a => a.id === id ? { ...a, [k]: v } : a));
  return (
    <div className="space-y-5">
      <div onClick={() => { setSinBienes(!sinBienes); if (!sinBienes) onChange([]); }}
        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all select-none ${sinBienes ? 'border-[#1a5276] bg-[#1a5276]/5' : 'border-gray-200 hover:border-gray-300'}`}>
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${sinBienes ? 'border-[#1a5276] bg-[#1a5276]' : 'border-gray-300'}`}>
          {sinBienes && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>
        <p className="text-sm font-medium text-gray-700">No traigo bienes que declarar</p>
      </div>

      {!sinBienes && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex gap-2">
            <Shield className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">Franquicia del grupo: <strong>USD {franquicia}</strong>. Excedente paga {(TASA * 100).toFixed(0)}% de arancel.</p>
          </div>
          {articulos.map((art, i) => (
            <div key={art.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-xs font-semibold text-gray-500 uppercase">Artículo {i + 1}</p>
                <button type="button" onClick={() => eliminar(art.id)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Campo label="Descripción" required><Inp value={art.descripcion} onChange={e => upd(art.id, 'descripcion', e.target.value)} placeholder="Ej: Cámara fotográfica" /></Campo>
                <Campo label="País de adquisición"><Sel value={art.pais} onChange={e => upd(art.id, 'pais', e.target.value)}><option value="">Seleccionar</option>{PAISES_MUNDO.map(p => <option key={p}>{p}</option>)}</Sel></Campo>
                <Campo label="Cantidad"><Inp type="number" min="1" value={art.cantidad} onChange={e => upd(art.id, 'cantidad', e.target.value)} /></Campo>
                <Campo label="Valor USD"><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">$</span><Inp value={art.valorUSD} onChange={e => upd(art.id, 'valorUSD', e.target.value)} placeholder="0.00" className="pl-7" /></div></Campo>
              </div>
            </div>
          ))}
          <button type="button" onClick={agregar} className="w-full border-2 border-dashed border-gray-200 rounded-xl py-3 text-xs text-gray-400 hover:border-[#1a5276] hover:text-[#1a5276] transition-all flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Agregar artículo
          </button>
          {articulos.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-xs text-gray-600"><span>Total declarado</span><span>USD {totalUSD.toFixed(2)}</span></div>
              <div className="flex justify-between text-xs text-gray-600"><span>Franquicia exenta</span><span className="text-green-600">− USD {Math.min(totalUSD, franquicia).toFixed(2)}</span></div>
              {excedente > 0
                ? <div className="flex justify-between text-xs font-semibold text-[#1a5276] bg-blue-50 rounded-lg px-3 py-2"><span>Arancel estimado (6%)</span><span>USD {arancel.toFixed(2)}</span></div>
                : totalUSD > 0 && <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2"><CheckCircle2 className="w-3.5 h-3.5" /> Dentro de franquicia</div>
              }
            </div>
          )}
        </div>
      )}
      <NavBotones onBack={onBack} onNext={onNext} />
    </div>
  );
}

/* ══════════════════════════════════════════════════
   PASO 6 — Revisión
══════════════════════════════════════════════════ */
function PasoRevision({ personal, menores, mascotas, viaje, articulos, onSubmit, onBack }: {
  personal: DatosPersonales; menores: Menor[]; mascotas: Mascota[];
  viaje: DatosViaje; articulos: Articulo[]; onSubmit: () => void; onBack: () => void;
}) {
  const [aceptado, setAceptado] = useState(false);
  const franquicia = EXENTO_ADULTO + menores.length * EXENTO_MENOR;
  const totalUSD   = articulos.reduce((s, a) => s + (parseFloat(a.valorUSD) || 0), 0);
  const excedente  = Math.max(0, totalUSD - franquicia);
  const nombreCompleto = [personal.primerNombre, personal.segundoNombre, personal.apellidoPaterno, personal.apellidoMaterno].filter(Boolean).join(' ');

  const Fila = ({ k, v }: { k: string; v: string }) => (
    <div><span className="text-[10px] text-gray-400 block">{k}</span><span className="text-xs text-gray-700 font-medium">{v || '—'}</span></div>
  );

  return (
    <div className="space-y-4">
      {/* Titular */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2"><User className="w-3.5 h-3.5" /> Titular</p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          <Fila k="Nombre completo" v={nombreCompleto} />
          <Fila k="Documento" v={`${personal.tipoDoc === 'rut' ? 'RUT' : 'Pasaporte'}: ${personal.documento}`} />
          <Fila k="Nacionalidad" v={personal.nacionalidad} />
          <Fila k="Fecha de nacimiento" v={personal.fechaNacimiento} />
        </div>
      </div>

      {/* Menores */}
      {menores.length > 0 && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2"><Baby className="w-3.5 h-3.5" /> Menores ({menores.length})</p>
          {menores.map((m, i) => (
            <div key={m.id} className="mb-3 pb-3 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0">
              <p className="text-xs font-medium text-gray-700 mb-1">{i + 1}. {[m.primerNombre, m.segundoNombre, m.apellidoPaterno, m.apellidoMaterno].filter(Boolean).join(' ')}</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <Fila k="Documento" v={`${m.tipoDoc === 'rut' ? 'RUT' : 'Pasaporte'}: ${m.documento}`} />
                <Fila k="Fecha nac." v={m.fechaNacimiento} />
                {!m.viajaConAmbosPadres && <Fila k="Permiso notarial" v={`${m.permisoNotarial.notaria} — Folio ${m.permisoNotarial.folio}`} />}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mascotas */}
      {mascotas.length > 0 && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2"><PawPrint className="w-3.5 h-3.5" /> Mascotas ({mascotas.length})</p>
          {mascotas.map((m, i) => (
            <div key={m.id} className="mb-3 pb-3 border-b border-gray-100 last:border-0 last:mb-0">
              <p className="text-xs font-medium text-gray-700 mb-1">{i + 1}. {m.nombre} — {m.especie}{m.raza ? ` (${m.raza})` : ''}</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <Fila k="Microchip" v={m.microchip} />
                <Fila k="Vacuna rabia" v={m.vacunaRabia ? `Sí (${m.fechaVacunaRabia})` : 'No'} />
                <Fila k="País procedencia" v={m.paisProcedencia} />
                <Fila k="Parásitos" v={m.tratamientoParasitos ? 'Tratado' : 'No declarado'} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Viaje */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2"><Plane className="w-3.5 h-3.5" /> Viaje</p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          <Fila k="Origen" v={viaje.origen} />
          <Fila k="Llegada" v={viaje.fechaLlegada} />
          <Fila k="Vuelo" v={`${viaje.aerolinea} ${viaje.vuelo}`.trim() || '—'} />
          <Fila k="Días estadía" v={viaje.diasEstadia ? `${viaje.diasEstadia} días` : '—'} />
        </div>
      </div>

      {/* Bienes */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-2"><Package className="w-3.5 h-3.5" /> Bienes</p>
        {articulos.length === 0 ? <p className="text-xs text-gray-500">Sin bienes declarados</p> : (
          <div className="space-y-1">
            {articulos.map(a => (
              <div key={a.id} className="flex justify-between text-xs text-gray-600">
                <span>{a.descripcion} × {a.cantidad}</span><span>USD {parseFloat(a.valorUSD).toFixed(2)}</span>
              </div>
            ))}
            {excedente > 0 && (
              <div className="flex justify-between text-xs font-semibold text-[#1a5276] bg-blue-50 rounded px-2 py-1.5 mt-2">
                <span>Arancel estimado (6%)</span><span>USD {(excedente * TASA).toFixed(2)}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Declaración jurada */}
      <label className="flex gap-3 cursor-pointer bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-[#1a5276]/30 transition-colors"
        onClick={() => setAceptado(!aceptado)}>
        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${aceptado ? 'bg-[#1a5276] border-[#1a5276]' : 'border-gray-300'}`}>
          {aceptado && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">
          <strong>Declaración Jurada:</strong> Declaro que toda la información, incluyendo datos de menores y mascotas, es fidedigna y completa.
          Proporcionar información falsa es delito sancionado por el Art. 168 de la Ordenanza de Aduanas.
        </p>
      </label>

      <NavBotones onBack={onBack} onNext={onSubmit} nextLabel="Enviar declaración" disabled={!aceptado} />
    </div>
  );
}

/* ══════════════════════════════════════════════════
   PASO 7 — Confirmación
══════════════════════════════════════════════════ */
function PasoConfirmacion({ folio, personal, menores, mascotas, viaje, articulos, onVolver }: {
  folio: string; personal: DatosPersonales; menores: Menor[]; mascotas: Mascota[];
  viaje: DatosViaje; articulos: Articulo[]; onVolver: () => void;
}) {
  const exportarPDF = () => {
    imprimirDeclaracion({
      folio,
      titulo: 'Declaración de Viajero / Turista',
      subtitulo: 'Servicio Nacional de Aduanas de Chile',
      fechaHora: ahora(),
      rut: personal.tipoDoc === 'rut' ? personal.documento : undefined,
      secciones: [
        {
          titulo: 'Datos del viajero',
          filas: [
            ['Nombre completo', `${personal.primerNombre} ${personal.segundoNombre} ${personal.apellidoPaterno} ${personal.apellidoMaterno}`.replace(/\s+/g, ' ').trim()],
            ['Documento', `${personal.tipoDoc === 'rut' ? 'RUT' : 'Pasaporte'}: ${personal.documento}`],
            ['Nacionalidad', personal.nacionalidad],
            ['Fecha de nacimiento', personal.fechaNacimiento],
          ],
        },
        {
          titulo: 'Datos del viaje',
          filas: [
            ['Origen', viaje.origen], ['Vuelo', viaje.vuelo],
            ['Fecha de llegada', viaje.fechaLlegada], ['Días de estadía', viaje.diasEstadia],
            ['Motivo del viaje', viaje.motivoViaje], ['Aerolínea', viaje.aerolinea],
          ],
        },
        ...(menores.length > 0 ? [{
          titulo: `Menores que viajan (${menores.length})`,
          filas: menores.map((m, i): [string, string] => [`Menor ${i + 1}`, `${m.primerNombre} ${m.apellidoPaterno} — ${m.tipoDoc === 'rut' ? 'RUT' : 'Pasaporte'} ${m.documento}`]),
        }] : []),
        ...(mascotas.length > 0 ? [{
          titulo: `Mascotas declaradas (${mascotas.length})`,
          filas: mascotas.map((m): [string, string] => [m.nombre || 'Mascota', `${m.especie}${m.raza ? ' · ' + m.raza : ''} — Microchip: ${m.microchip || 'N/A'}`]),
        }] : []),
        ...(articulos.length > 0 ? [{
          titulo: `Bienes declarados (${articulos.length})`,
          filas: articulos.map((a, i): [string, string] => [`Artículo ${i + 1}`, `${a.descripcion || '—'} (${a.cantidad || '1'} · USD ${a.valorUSD || '0'})`]),
        }] : []),
      ],
      notas: [
        'Diríjase al mesón de Aduanas con este folio y documentos.',
        ...(menores.length > 0 ? ['Presente los documentos de los menores y permisos notariales si aplica.'] : []),
        ...(mascotas.length > 0 ? ['Diríjase al mesón del SAG con el certificado sanitario y documentación de cada mascota.'] : []),
        'Si declaró bienes, pague aranceles en caja antes de retirar equipaje.',
      ],
    });
  };

  return (
    <div className="text-center py-4 space-y-5">
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="w-9 h-9 text-green-600" />
        </div>
      </div>
      <div>
        <h3 className="text-gray-800 font-bold mb-1">Declaración enviada</h3>
        <p className="text-sm text-gray-500">Grupo: 1 adulto{menores.length > 0 ? ` + ${menores.length} menor${menores.length > 1 ? 'es' : ''}` : ''}{mascotas.length > 0 ? ` + ${mascotas.length} mascota${mascotas.length > 1 ? 's' : ''}` : ''}.</p>
      </div>
      <div className="bg-[#1a5276]/5 border border-[#1a5276]/20 rounded-xl p-5">
        <p className="text-xs text-gray-500 mb-1">Número de folio</p>
        <p className="font-mono text-xl font-bold text-[#1a5276]">{folio}</p>
        <p className="text-xs text-gray-400 mt-1">Presente este folio al funcionario de Aduanas y SAG al arribar</p>
      </div>
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-left space-y-1">
        <p className="text-xs font-semibold text-amber-800 mb-2">Al llegar a Chile:</p>
        <p className="text-xs text-amber-700">1. Diríjase al mesón de <strong>Aduanas</strong> con este folio y documentos.</p>
        {menores.length > 0 && <p className="text-xs text-amber-700">2. Presente los documentos de los menores y permisos notariales si aplica.</p>}
        {mascotas.length > 0 && <p className="text-xs text-amber-700">3. Diríjase al mesón del <strong>SAG</strong> con el certificado sanitario y documentación de cada mascota.</p>}
        <p className="text-xs text-amber-700">{menores.length > 0 || mascotas.length > 0 ? '4.' : '2.'} Si declaró bienes, pague aranceles en caja antes de retirar equipaje.</p>
      </div>
      <div className="flex gap-3 justify-center">
        <button onClick={exportarPDF} className="flex items-center gap-2 text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 px-5 py-2.5 rounded-xl transition-colors"><Download className="w-4 h-4" /> PDF</button>
        <button onClick={exportarPDF} className="flex items-center gap-2 text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 px-5 py-2.5 rounded-xl transition-colors"><Printer className="w-4 h-4" /> Imprimir</button>
      </div>
      <button onClick={onVolver} className="text-sm text-[#1a5276] hover:underline">Volver al portal</button>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   COMPONENTE RAÍZ
══════════════════════════════════════════════════ */
const AUTOSAVE_KEY = 'aduanasync_turista_draft';

export function TramiteTurista({ rut, onVolver }: { rut: string; onVolver: () => void }) {
  const personalVacio: DatosPersonales = { primerNombre: '', segundoNombre: '', apellidoPaterno: '', apellidoMaterno: '', tipoDoc: 'rut', documento: rut, fechaNacimiento: '', nacionalidad: '' };

  const [paso, setPaso]             = useState(1);
  const [personal, setPersonal]     = useState<DatosPersonales>(personalVacio);
  const [menores, setMenores]       = useState<Menor[]>([]);
  const [mascotas, setMascotas]     = useState<Mascota[]>([]);
  const [viaje, setViaje]           = useState<DatosViaje>({ origen: '', vuelo: '', fechaLlegada: '', motivoViaje: '', diasEstadia: '', aerolinea: '' });
  const [articulos, setArticulos]   = useState<Articulo[]>([]);
  const [folio, setFolio]           = useState('');
  const [scanStatus, setScanStatus] = useState<ScanStatus>('none');
  const [draftoRestored, setDraftRestored] = useState(false);

  /* ── Restaurar borrador al montar ── */
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(AUTOSAVE_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d.personal) setPersonal({ ...personalVacio, ...d.personal });
        if (d.menores)  setMenores(d.menores);
        if (d.mascotas) setMascotas(d.mascotas);
        if (d.viaje)    setViaje(d.viaje);
        if (d.articulos)setArticulos(d.articulos);
        if (d.paso)     setPaso(d.paso);
        setDraftRestored(true);
        setTimeout(() => setDraftRestored(false), 4000);
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Autoguardar en sessionStorage ── */
  useEffect(() => {
    if (paso >= 7) { sessionStorage.removeItem(AUTOSAVE_KEY); return; }
    try {
      sessionStorage.setItem(AUTOSAVE_KEY, JSON.stringify({ paso, personal, menores, mascotas, viaje, articulos }));
    } catch {}
  }, [paso, personal, menores, mascotas, viaje, articulos]);

  /* ── Aplicar datos del scanner al personal ── */
  const handleScan = (datos: DatosEscaneados) => {
    setPersonal(prev => ({
      ...prev,
      primerNombre:    datos.primerNombre,
      segundoNombre:   datos.segundoNombre,
      apellidoPaterno: datos.apellidoPaterno,
      apellidoMaterno: datos.apellidoMaterno,
      tipoDoc:         datos.tipoDoc,
      documento:       datos.documento,
      fechaNacimiento: datos.fechaNacimiento,
      nacionalidad:    datos.nacionalidad,
    }));
    setScanStatus('scanned');
  };

  const enviar = () => {
    const num = `TUR-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const nombreCompleto = `${personal.primerNombre} ${personal.apellidoPaterno}`.trim() || 'Viajero';
    guardarTramite({
      numero: num,
      tipo: 'Declaración de Turista',
      descripcion: `Declaración de viajero — ${nombreCompleto}${menores.length ? ` + ${menores.length} menor(es)` : ''}${mascotas.length ? ` + ${mascotas.length} mascota(s)` : ''}`,
      estado: 'en_proceso',
      fechaIngreso: hoyISO(),
      fechaActualizacion: hoyISO(),
      aduana: viaje.origen ? `Aduana Internacional — proc. ${viaje.origen}` : 'Aduana Internacional',
      valorUSD: articulos.length
        ? String(articulos.reduce((acc, a) => acc + (parseFloat(a.valorUSD) || 0), 0))
        : '0',
      documentos: [
        `Documento de ${personal.tipoDoc === 'rut' ? 'identidad (RUT)' : 'viaje (Pasaporte)'}: ${personal.documento}`,
        ...(menores.length ? [`Documentación de ${menores.length} menor(es)`] : []),
        ...(mascotas.length ? [`Certificado sanitario SAG (${mascotas.length} mascota(s))`] : []),
        ...(articulos.length ? [`Declaración de ${articulos.length} bien(es)`] : []),
      ],
      pasos: [
        { label: 'Declaración enviada', completado: true, fecha: hoyISO(), descripcion: 'Declaración registrada en el sistema AduanaSync.' },
        { label: 'Revisión en punto de control', completado: false, fecha: null, descripcion: 'Pendiente de presentación del folio al arribar a Chile.' },
        { label: 'Cierre de trámite', completado: false, fecha: null, descripcion: 'Se cerrará una vez completado el control en frontera.' },
      ],
      rut,
    });
    setFolio(num);
    setPaso(7);
    sessionStorage.removeItem(AUTOSAVE_KEY);
  };
  const pct = ((paso - 1) / (PASOS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <header className="bg-[#1a5276] text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          {paso < 7 && (
            <button type="button" onClick={paso === 1 ? onVolver : () => setPaso(p => p - 1)} className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0">
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="flex-1">
            <p className="text-blue-200 text-[10px] uppercase tracking-wider">Trámite en Línea</p>
            <h1 className="font-bold text-sm flex items-center gap-2"><MapPin className="w-4 h-4" /> Declaración de Viajero / Turista</h1>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-blue-200 text-[10px]">RUT</p>
            <p className="text-xs font-mono">{rut}</p>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {paso < 7 && (
          <div className="mb-6">
            <div className="h-1.5 bg-gray-200 rounded-full mb-4 overflow-hidden">
              <div className="h-full bg-[#1a5276] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
            <div className="flex justify-between">
              {PASOS.map(p => (
                <div key={p.id} className={`flex flex-col items-center gap-1 transition-opacity ${p.id <= paso ? 'opacity-100' : 'opacity-25'}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${p.id < paso ? 'bg-green-500 text-white' : p.id === paso ? 'bg-[#1a5276] text-white' : 'bg-gray-200 text-gray-400'}`}>
                    {p.id < paso ? <CheckCircle2 className="w-4 h-4" /> : p.icon}
                  </div>
                  <span className={`text-[9px] hidden sm:block text-center leading-tight max-w-[55px] ${p.id === paso ? 'text-[#1a5276] font-semibold' : 'text-gray-400'}`}>{p.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Banner de borrador restaurado */}
        {draftoRestored && (
          <div className="mb-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
            <Save className="w-4 h-4 flex-shrink-0" />
            <span><strong>Borrador restaurado.</strong> Sus datos anteriores han sido recuperados automáticamente.</span>
          </div>
        )}

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 sm:p-6">
          {paso < 7 && (
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-gray-800 dark:text-gray-100 font-bold">{PASOS[paso - 1].label}</h2>
                <p className="text-xs text-gray-400 dark:text-gray-500">Paso {paso} de {PASOS.length - 1}</p>
              </div>
              {paso > 1 && paso < 7 && (
                <div className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-600">
                  <Save className="w-3 h-3" /> Guardado automáticamente
                </div>
              )}
            </div>
          )}
          {paso === 1 && <PasoDatosPersonales data={personal} onChange={d => { setPersonal(d); setScanStatus('manual'); }} onNext={() => setPaso(2)} scanStatus={scanStatus} onScan={handleScan} />}
          {paso === 2 && <PasoMenores menores={menores} onChange={setMenores} onNext={() => setPaso(3)} onBack={() => setPaso(1)} />}
          {paso === 3 && <PasoMascotas mascotas={mascotas} onChange={setMascotas} onNext={() => setPaso(4)} onBack={() => setPaso(2)} />}
          {paso === 4 && <PasoViaje data={viaje} onChange={setViaje} onNext={() => setPaso(5)} onBack={() => setPaso(3)} />}
          {paso === 5 && <PasoBienes articulos={articulos} menores={menores} onChange={setArticulos} onNext={() => setPaso(6)} onBack={() => setPaso(4)} />}
          {paso === 6 && <PasoRevision personal={personal} menores={menores} mascotas={mascotas} viaje={viaje} articulos={articulos} onSubmit={enviar} onBack={() => setPaso(5)} />}
          {paso === 7 && <PasoConfirmacion folio={folio} personal={personal} menores={menores} mascotas={mascotas} viaje={viaje} articulos={articulos} onVolver={onVolver} />}
        </div>
        {paso < 7 && <p className="text-center text-[10px] text-gray-400 dark:text-gray-600 mt-4">© 2026 Servicio Nacional de Aduanas de Chile</p>}
      </div>
    </div>
  );
}