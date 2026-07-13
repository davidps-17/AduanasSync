import { ShieldCheck, ShieldAlert, Building2, ArrowLeft } from 'lucide-react';

export interface DatosVerificacion {
  folio: string;
  titulo: string;
  fecha: string;
  rut: string;
}

/**
 * Pantalla de verificación de autenticidad.
 * Se muestra cuando alguien abre la URL codificada en el QR de un documento
 * (?verificar=<payload>). No requiere backend: si el payload decodifica
 * correctamente y tiene folio, se considera un documento válido emitido
 * por AduanaSync.
 */
export function VerificacionDocumento({ datos, valido, onVolver }: {
  datos: DatosVerificacion | null;
  valido: boolean;
  onVolver: () => void;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2d45] via-[#1a5276] to-[#0f2d45] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-white/10">
          {/* Encabezado */}
          <div className="bg-[#1a5276] px-6 pt-8 pb-8 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3 shadow-lg backdrop-blur-sm">
                <Building2 className="w-9 h-9 text-white" strokeWidth={1.5} />
              </div>
              <h1 className="text-xl font-bold text-white tracking-wide">AduanaSync</h1>
              <p className="text-blue-200 text-xs mt-1">Verificación de Documentos</p>
            </div>
          </div>

          {/* Resultado */}
          <div className="px-6 py-8 text-center">
            {valido && datos ? (
              <>
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-9 h-9 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">Documento Verificado</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Este documento fue emitido por el sistema AduanaSync y es auténtico.
                </p>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-left space-y-3">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wide block">Tipo de documento</span>
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{datos.titulo}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wide block">N° de folio</span>
                    <span className="font-mono text-sm font-bold text-[#1a5276] dark:text-blue-400">{datos.folio}</span>
                  </div>
                  {datos.rut && (
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase tracking-wide block">RUT declarante</span>
                      <span className="text-sm font-mono text-gray-700 dark:text-gray-200">{datos.rut}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wide block">Fecha de emisión</span>
                    <span className="text-sm text-gray-700 dark:text-gray-200">{datos.fecha}</span>
                  </div>
                </div>

                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-4">
                  Verificación automática realizada el {new Date().toLocaleString('es-CL')}
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                  <ShieldAlert className="w-9 h-9 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">Documento No Válido</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  El código escaneado no corresponde a un documento válido emitido por AduanaSync,
                  o el enlace está incompleto o dañado.
                </p>
              </>
            )}

            <button
              onClick={onVolver}
              className="mt-6 inline-flex items-center gap-2 text-sm text-[#1a5276] dark:text-blue-400 hover:underline"
            >
              <ArrowLeft className="w-4 h-4" /> Ir al portal AduanaSync
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Decodifica el payload de verificación desde el parámetro ?verificar= de la URL */
export function decodificarVerificacion(param: string): DatosVerificacion | null {
  try {
    const json = decodeURIComponent(escape(atob(param)));
    const data = JSON.parse(json);
    if (!data.folio) return null;
    return { folio: data.folio, titulo: data.titulo ?? 'Documento AduanaSync', fecha: data.fecha ?? '', rut: data.rut ?? '' };
  } catch {
    return null;
  }
}