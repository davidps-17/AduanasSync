import { useState } from 'react';
import { Eye, EyeOff, ExternalLink, AlertCircle, CheckCircle2, Loader2, Info } from 'lucide-react';
import { validarRut, formatRut, calcularDV } from '../utils/rut';

interface Props { onLogin: (rut: string) => void }

/**
 * Feedback visual del RUT:
 * • VERDE   → RUT válido (módulo 11 ✓)
 * • ROJO    → DV incorrecto o formato inválido
 * • GRIS    → Incompleto (menos de 8 caracteres)
 *
 * Nota técnica: El RUT 11.111.111-1 ES matemáticamente válido según Módulo 11
 * (suma=32, 32%11=10, 11-10=1 → DV=1). No se rechaza porque cumple el algoritmo.
 */
export function LoginForm({ onLogin }: Props) {
  const [rut,       setRut]       = useState('');
  const [clave,     setClave]     = useState('');
  const [showClave, setShowClave] = useState(false);
  const [rutError,  setRutError]  = useState('');
  const [loading,   setLoading]   = useState(false);

  /* Estado de validación RUT */
  const rutLimpio = rut.replace(/[^0-9kK]/g, '');
  const rutCompleto = rutLimpio.length >= 8;   // mínimo 7 cuerpo + 1 DV
  const rutValido   = rutCompleto && validarRut(rut);
  const dvEsperado  = rutCompleto ? calcularDV(rutLimpio.slice(0, -1)) : null;
  const dvIngresado = rutCompleto ? rutLimpio.slice(-1).toUpperCase() : null;

  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRut(e.target.value);
    setRut(formatted);
    setRutError('');
  };

  const handleRutBlur = () => {
    if (rut.length > 0 && !validarRut(rut)) {
      setRutError(
        dvEsperado
          ? `DV incorrecto. Para este número el DV correcto es "${dvEsperado}", no "${dvIngresado}".`
          : 'RUT inválido. Verifique el número y el dígito verificador.'
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validarRut(rut)) {
      setRutError(dvEsperado
        ? `DV incorrecto. El dígito verificador correcto para este número es "${dvEsperado}".`
        : 'RUT inválido. No se puede continuar.');
      return;
    }
    if (!clave.trim()) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(rut); }, 900);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>

      {/* ── RUT ── */}
      <div>
        <label htmlFor="rut" className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1.5">
          RUT <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            id="rut" type="text" value={rut}
            onChange={handleRutChange} onBlur={handleRutBlur}
            placeholder="12.345.678-9"
            maxLength={12} autoComplete="username" inputMode="numeric"
            className={[
              'w-full px-4 py-3 pr-10 border-2 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 transition-all',
              'dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500',
              rutError    ? 'border-red-400 bg-red-50 focus:ring-red-200 dark:border-red-600 dark:bg-red-900/20'
              : rutValido ? 'border-green-400 bg-green-50 focus:ring-green-200 dark:border-green-600 dark:bg-green-900/20'
              :             'border-gray-200 dark:border-gray-600 focus:ring-[#1a5276]/20 focus:border-[#1a5276]',
            ].join(' ')}
          />
          {/* Indicador de estado */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rutError   && <AlertCircle   className="w-5 h-5 text-red-500" />}
            {rutValido  && <CheckCircle2  className="w-5 h-5 text-green-500" />}
          </div>
        </div>

        {/* Mensaje de error con DV esperado */}
        {rutError && (
          <p className="mt-1.5 text-[11px] text-red-600 dark:text-red-400 flex items-start gap-1.5 leading-relaxed">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            {rutError}
          </p>
        )}

        {/* Confirmación válido */}
        {rutValido && !rutError && (
          <p className="mt-1.5 text-[11px] text-green-600 dark:text-green-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            RUT válido — DV "{dvIngresado}" verificado por Módulo 11
          </p>
        )}

        {/* Ayuda inline */}
        {!rut && (
          <p className="mt-1 text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
            <Info className="w-3 h-3" /> Formato: 12.345.678-9 · El DV puede ser 0–9 ó K
          </p>
        )}
      </div>

      {/* ── Clave Única ── */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="clave" className="block text-xs font-medium text-gray-600 dark:text-gray-300">
            Clave Única <span className="text-red-500">*</span>
          </label>
          <span className="inline-flex items-center gap-1 text-[10px] text-[#1a5276] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded px-2 py-0.5">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Servicio del Estado
          </span>
        </div>
        <div className="relative">
          <input
            id="clave" type={showClave ? 'text' : 'password'}
            value={clave} onChange={e => setClave(e.target.value)}
            placeholder="Su Clave Única" autoComplete="current-password"
            className="w-full px-4 py-3 pr-12 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5276]/20 focus:border-[#1a5276] dark:focus:border-blue-500 transition-all"
            required
          />
          <button type="button" onClick={() => setShowClave(!showClave)}
            tabIndex={-1} aria-label={showClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1">
            {showClave ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        <p className="mt-1.5 text-[10px] text-gray-400 dark:text-gray-500">
          Gestionada por el{' '}
          <a href="https://claveunica.gob.cl" target="_blank" rel="noopener noreferrer"
            className="text-[#1a5276] dark:text-blue-400 hover:underline inline-flex items-center gap-0.5">
            Registro Civil <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </p>
      </div>

      {/* ── Botón ── */}
      <button
        type="submit"
        disabled={loading || !rutValido || !clave.trim()}
        className="w-full bg-[#1a5276] text-white py-3.5 px-4 rounded-xl font-semibold text-sm hover:bg-[#143d5a] disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm min-h-[52px]"
      >
        {loading
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Verificando…</>
          : 'Ingresar con Clave Única'
        }
      </button>

      <div className="text-center">
        <a href="https://claveunica.gob.cl" target="_blank" rel="noopener noreferrer"
          className="text-xs text-[#1a5276] dark:text-blue-400 hover:underline inline-flex items-center gap-1">
          ¿Problemas con su Clave Única? <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </form>
  );
}
