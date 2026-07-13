/**
 * DocumentScanner — Escáner de documento de identidad mediante cámara.
 * Simula captura + OCR extrayendo datos del documento.
 * Compatible con: desktop, mobile, tablet y tótems de autoservicio.
 *
 * Estados visuales:
 *  🟢 "Documento validado mediante escaneo"
 *  🟡 "Datos ingresados manualmente"
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, X, ScanLine, CheckCircle2, AlertCircle, RotateCcw, Loader2, Scan } from 'lucide-react';

export type ScanStatus = 'manual' | 'scanned' | 'none';

export interface DatosEscaneados {
  primerNombre: string;
  segundoNombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  tipoDoc: 'rut' | 'pasaporte';
  documento: string;
  fechaNacimiento: string;
  nacionalidad: string;
  fechaVencimiento?: string;
}

interface Props {
  onScan: (datos: DatosEscaneados) => void;
  scanStatus: ScanStatus;
  disabled?: boolean;
}

type Step = 'idle' | 'camera' | 'processing' | 'review' | 'error';

/* Datos OCR simulados (en producción vendría de un servicio de OCR real) */
const MOCK_SCANS: DatosEscaneados[] = [
  { primerNombre: 'María', segundoNombre: 'Gabriela', apellidoPaterno: 'González', apellidoMaterno: 'Pérez', tipoDoc: 'rut', documento: '12.345.678-5', fechaNacimiento: '1985-03-15', nacionalidad: 'Chile', fechaVencimiento: '2028-12-31' },
  { primerNombre: 'Carlos', segundoNombre: '', apellidoPaterno: 'Rodríguez', apellidoMaterno: 'Fuentes', tipoDoc: 'rut', documento: '15.678.901-7', fechaNacimiento: '1990-07-22', nacionalidad: 'Chile' },
  { primerNombre: 'Ana', segundoNombre: 'Lucía', apellidoPaterno: 'Martínez', apellidoMaterno: 'Silva', tipoDoc: 'pasaporte', documento: 'AA987654', fechaNacimiento: '1978-11-08', nacionalidad: 'Argentina' },
];

export function DocumentScanner({ onScan, scanStatus, disabled }: Props) {
  const [step, setStep]             = useState<Step>('idle');
  const [hasCamera, setHasCamera]   = useState(true);
  const [preview, setPreview]       = useState<string | null>(null);
  const [resultado, setResultado]   = useState<DatosEscaneados | null>(null);
  const [progress, setProgress]     = useState(0);
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  /* Iniciar cámara */
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setStep('camera');
      setHasCamera(true);
    } catch {
      setHasCamera(false);
      setStep('error');
    }
  }, []);

  /* Detener cámara */
  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  /* Cerrar modal */
  const cerrar = useCallback(() => {
    stopCamera();
    setStep('idle');
    setPreview(null);
    setResultado(null);
    setProgress(0);
  }, [stopCamera]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  /* Capturar frame del video */
  const capturar = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current;
    const c = canvasRef.current;
    c.width  = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext('2d')?.drawImage(v, 0, 0);
    setPreview(c.toDataURL('image/jpeg', 0.85));
    stopCamera();
    setStep('processing');
    simularOCR();
  };

  /* Simular procesamiento OCR (2.5 segundos con barra de progreso) */
  const simularOCR = () => {
    setProgress(0);
    const duracion = 2500;
    const intervalo = 50;
    let elapsed = 0;
    const t = setInterval(() => {
      elapsed += intervalo;
      setProgress(Math.min(100, Math.round((elapsed / duracion) * 100)));
      if (elapsed >= duracion) {
        clearInterval(t);
        const datos = MOCK_SCANS[Math.floor(Math.random() * MOCK_SCANS.length)];
        setResultado(datos);
        setStep('review');
      }
    }, intervalo);
  };

  /* Confirmar datos escaneados */
  const confirmar = () => {
    if (resultado) { onScan(resultado); cerrar(); }
  };

  /* Badge de estado de escaneo */
  const StatusBadge = () => {
    if (scanStatus === 'scanned') return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-full px-3 py-1">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        Documento validado por escaneo
      </span>
    );
    if (scanStatus === 'manual') return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-full px-3 py-1">
        <span className="w-2 h-2 rounded-full bg-amber-400" />
        Datos ingresados manualmente
      </span>
    );
    return null;
  };

  return (
    <>
      {/* Botón + badge de estado */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={disabled}
          onClick={startCamera}
          className={[
            'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border-2',
            'min-h-[44px]', // táctil
            disabled
              ? 'border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed'
              : 'border-[#1a5276] dark:border-blue-600 text-[#1a5276] dark:text-blue-400 hover:bg-[#1a5276] dark:hover:bg-blue-900 hover:text-white active:scale-95',
          ].join(' ')}
        >
          <Camera className="w-4 h-4" />
          <Scan className="w-4 h-4 -ml-1" />
          Escanear documento
        </button>
        <StatusBadge />
      </div>

      {/* ── Modal ── */}
      {step !== 'idle' && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">

            {/* Cabecera */}
            <div className="bg-[#1a5276] dark:bg-[#0f2030] px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold flex items-center gap-2"><ScanLine className="w-5 h-5" /> Escáner de Documento</h3>
                <p className="text-blue-200 text-xs mt-0.5">
                  {step === 'camera'     && 'Enfoque su documento y presione Capturar'}
                  {step === 'processing' && 'Procesando imagen…'}
                  {step === 'review'     && 'Verifique los datos extraídos'}
                  {step === 'error'      && 'Cámara no disponible'}
                </p>
              </div>
              <button type="button" onClick={cerrar} className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="p-5">

              {/* ── Cámara activa ── */}
              {step === 'camera' && (
                <div className="space-y-4">
                  <div className="relative rounded-2xl overflow-hidden bg-black aspect-video">
                    <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                    <canvas ref={canvasRef} className="hidden" />
                    {/* Marco de escáner */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="relative w-4/5 h-3/5">
                        {/* Esquinas animadas */}
                        {['top-0 left-0 border-t-4 border-l-4', 'top-0 right-0 border-t-4 border-r-4', 'bottom-0 left-0 border-b-4 border-l-4', 'bottom-0 right-0 border-b-4 border-r-4'].map((cls, i) => (
                          <div key={i} className={`absolute w-8 h-8 border-white rounded-sm ${cls}`} />
                        ))}
                        {/* Línea de escaneo animada */}
                        <div className="absolute inset-x-0 top-1/2 h-0.5 bg-green-400 opacity-80 animate-pulse" />
                      </div>
                    </div>
                    {/* Overlay oscuro en bordes */}
                    <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 60%, rgba(0,0,0,0.5) 100%)' }} />
                  </div>
                  <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                    Coloque el documento dentro del marco · Pasaporte o Cédula de Identidad
                  </p>
                  <button type="button" onClick={capturar}
                    className="w-full bg-[#1a5276] text-white py-4 rounded-2xl font-bold text-base hover:bg-[#143d5a] transition-colors flex items-center justify-center gap-3 min-h-[56px]">
                    <Camera className="w-6 h-6" /> Capturar
                  </button>
                </div>
              )}

              {/* ── Procesando OCR ── */}
              {step === 'processing' && (
                <div className="space-y-5 py-4">
                  {preview && (
                    <div className="rounded-2xl overflow-hidden aspect-video">
                      <img src={preview} alt="Documento capturado" className="w-full h-full object-cover opacity-60" />
                    </div>
                  )}
                  <div className="text-center space-y-3">
                    <Loader2 className="w-10 h-10 text-[#1a5276] dark:text-blue-400 animate-spin mx-auto" />
                    <p className="text-gray-700 dark:text-gray-200 font-semibold">Analizando documento con OCR…</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Extrayendo nombres, fechas y número de documento</p>
                  </div>
                  <div>
                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#1a5276] to-blue-400 rounded-full transition-all duration-100" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-right text-[10px] text-gray-400 mt-1">{progress}%</p>
                  </div>
                </div>
              )}

              {/* ── Revisión de datos extraídos ── */}
              {step === 'review' && resultado && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <p className="text-sm text-green-700 dark:text-green-400 font-medium">Documento leído correctamente. Verifique los datos antes de confirmar.</p>
                  </div>

                  {preview && (
                    <div className="rounded-xl overflow-hidden h-28">
                      <img src={preview} alt="Documento capturado" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      ['Primer nombre',    resultado.primerNombre],
                      ['Segundo nombre',   resultado.segundoNombre || '—'],
                      ['Apellido paterno', resultado.apellidoPaterno],
                      ['Apellido materno', resultado.apellidoMaterno],
                      ['Tipo documento',   resultado.tipoDoc === 'rut' ? 'RUT' : 'Pasaporte'],
                      ['N° Documento',     resultado.documento],
                      ['F. Nacimiento',    resultado.fechaNacimiento],
                      ['Nacionalidad',     resultado.nacionalidad],
                      ...(resultado.fechaVencimiento ? [['Vencimiento', resultado.fechaVencimiento]] as [string,string][] : []),
                    ].map(([k, v]) => (
                      <div key={k} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">{k}</p>
                        <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 font-mono">{v}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button type="button" onClick={() => { setStep('camera'); setPreview(null); startCamera(); }}
                      className="flex-1 flex items-center justify-center gap-2 border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 py-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors min-h-[52px]">
                      <RotateCcw className="w-4 h-4" /> Volver a escanear
                    </button>
                    <button type="button" onClick={confirmar}
                      className="flex-1 bg-[#1a5276] text-white py-3 rounded-2xl font-bold hover:bg-[#143d5a] transition-colors flex items-center justify-center gap-2 min-h-[52px]">
                      <CheckCircle2 className="w-5 h-5" /> Confirmar datos
                    </button>
                  </div>
                </div>
              )}

              {/* ── Error: sin cámara ── */}
              {step === 'error' && (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-9 h-9 text-red-500 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-gray-800 dark:text-gray-100 font-semibold mb-1">Cámara no disponible</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      No fue posible acceder a la cámara. Verifique que el navegador tenga permisos de cámara,
                      o ingrese los datos manualmente.
                    </p>
                  </div>
                  <button type="button" onClick={cerrar}
                    className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-6 py-3 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    Ingresar manualmente
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
