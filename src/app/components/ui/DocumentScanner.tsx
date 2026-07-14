/**
 * DocumentScanner — Escáner de documento de identidad mediante cámara.
 * Usa Tesseract.js (OCR real, corre en el navegador, sin backend) para leer
 * el texto de la foto capturada, e intenta extraer RUT/fecha de nacimiento
 * mediante patrones. El resultado queda en campos EDITABLES para que la
 * persona corrija lo que el OCR no haya leído bien (los carnets chilenos
 * tienen texto pequeño y fondo con diseño, así que no siempre es perfecto).
 *
 * Estados visuales:
 *  🟢 "Documento validado mediante escaneo"
 *  🟡 "Datos ingresados manualmente"
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { createWorker } from 'tesseract.js';
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

const VACIO: DatosEscaneados = {
  primerNombre: '', segundoNombre: '', apellidoPaterno: '', apellidoMaterno: '',
  tipoDoc: 'rut', documento: '', fechaNacimiento: '', nacionalidad: 'Chile',
};

/* Meses en español para fechas tipo "15 MAR 1985" en cédulas chilenas */
const MESES: Record<string, string> = {
  ENE: '01', FEB: '02', MAR: '03', ABR: '04', MAY: '05', JUN: '06',
  JUL: '07', AGO: '08', SEP: '09', SET: '09', OCT: '10', NOV: '11', DIC: '12',
};

/** Intenta extraer RUT, fecha de nacimiento y otros datos del texto crudo del OCR */
function parsearTexto(textoCrudo: string): DatosEscaneados {
  const texto = textoCrudo.toUpperCase();
  const datos: DatosEscaneados = { ...VACIO };

  // RUT chileno: 1-2 dígitos, puntos opcionales, guion, dígito verificador (0-9 o K)
  const rut = texto.match(/\b(\d{1,2}\.?\d{3}\.?\d{3}[-–]\s?[\dK])\b/);
  if (rut) {
    datos.tipoDoc = 'rut';
    datos.documento = rut[1].replace(/\s/g, '').replace('–', '-');
  } else {
    // Fallback: patrón típico de N° de pasaporte (letras + dígitos)
    const pas = texto.match(/\b([A-Z]{1,2}\d{6,8})\b/);
    if (pas) { datos.tipoDoc = 'pasaporte'; datos.documento = pas[1]; }
  }

  // Fecha numérica DD-MM-AAAA / DD/MM/AAAA
  const fechaNum = texto.match(/\b(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})\b/);
  // Fecha con mes en texto, ej "15 MAR 1985"
  const fechaMes = texto.match(/\b(\d{1,2})\s+([A-Z]{3,4})\.?\s+(\d{4})\b/);

  if (fechaNum) {
    const [, d, m, y] = fechaNum;
    datos.fechaNacimiento = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  } else if (fechaMes) {
    const [, d, mesTxt, y] = fechaMes;
    const mes = MESES[mesTxt.slice(0, 3)];
    if (mes) datos.fechaNacimiento = `${y}-${mes}-${d.padStart(2, '0')}`;
  }

  // Nacionalidad: si el texto no menciona claramente Chile y parece pasaporte,
  // se deja en blanco para que la persona la complete.
  if (!/CHILE/.test(texto) && datos.tipoDoc === 'pasaporte') {
    datos.nacionalidad = '';
  }

  return datos;
}

export function DocumentScanner({ onScan, scanStatus, disabled }: Props) {
  const [step, setStep]             = useState<Step>('idle');
  const [hasCamera, setHasCamera]   = useState(true);
  const [preview, setPreview]       = useState<string | null>(null);
  const [resultado, setResultado]   = useState<DatosEscaneados | null>(null);
  const [progress, setProgress]     = useState(0);
  const [ocrError, setOcrError]     = useState('');
  const [camaraLista, setCamaraLista] = useState(false);
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  /* Iniciar cámara: solo pide el stream y cambia de paso.
     El stream se conecta al <video> en el useEffect de abajo,
     una vez que el elemento ya está montado en el DOM. */
  const startCamera = useCallback(async () => {
    try {
      setCamaraLista(false);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      setHasCamera(true);
      setStep('camera');
    } catch {
      setHasCamera(false);
      setStep('error');
    }
  }, []);

  /* Conectar el stream al <video> apenas el paso 'camera' esté montado */
  useEffect(() => {
    if (step === 'camera' && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [step]);

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
    setOcrError('');
    setCamaraLista(false);
  }, [stopCamera]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  /* Capturar frame del video */
  const capturar = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current;
    if (!v.videoWidth || !v.videoHeight) {
      // La cámara aún no tiene un frame real listo — evita capturar una imagen negra/vacía
      return;
    }
    const c = canvasRef.current;
    c.width  = v.videoWidth;
    c.height = v.videoHeight;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(v, 0, 0);

    // Vista previa: el frame completo, tal cual lo ve la persona
    const previewUrl = c.toDataURL('image/jpeg', 0.92);
    setPreview(previewUrl);
    stopCamera();
    setStep('processing');

    // Para el OCR: recortar solo la zona del marco guía (mismo 80%x60% centrado
    // que se muestra en pantalla) para no confundir al lector con el fondo del
    // carnet/mesa, y aplicar escala de grises + contraste sobre ese recorte.
    const cw = Math.round(c.width * 0.8);
    const ch = Math.round(c.height * 0.6);
    const cx = Math.round((c.width - cw) / 2);
    const cy = Math.round((c.height - ch) / 2);

    const recorte = document.createElement('canvas');
    recorte.width = cw;
    recorte.height = ch;
    const rctx = recorte.getContext('2d');
    if (!rctx) { procesarOCR(previewUrl); return; }
    rctx.drawImage(c, cx, cy, cw, ch, 0, 0, cw, ch);

    const frame = rctx.getImageData(0, 0, cw, ch);
    const px = frame.data;
    const contraste = 1.35;
    for (let i = 0; i < px.length; i += 4) {
      const gris = px[i] * 0.299 + px[i + 1] * 0.587 + px[i + 2] * 0.114;
      const ajustado = Math.min(255, Math.max(0, (gris - 128) * contraste + 128));
      px[i] = px[i + 1] = px[i + 2] = ajustado;
    }
    rctx.putImageData(frame, 0, 0);

    const ocrUrl = recorte.toDataURL('image/jpeg', 0.95);
    procesarOCR(ocrUrl);
  };

  /* OCR real con Tesseract.js sobre la foto capturada */
  const procesarOCR = async (imagen: string) => {
    setProgress(0);
    setOcrError('');
    try {
      const worker = await createWorker(['spa'], undefined, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });
      await worker.setParameters({ tessedit_pageseg_mode: '11' as any }); // PSM.SPARSE_TEXT: texto disperso, ideal para carnets
      const { data } = await worker.recognize(imagen);
      await worker.terminate();

      const parseado = parsearTexto(data.text || '');
      setResultado(parseado);
      setStep('review');
    } catch (e) {
      setOcrError('No se pudo procesar la imagen. Intente con mejor luz o ingrese los datos manualmente.');
      setResultado({ ...VACIO });
      setStep('review');
    }
  };

  /* Confirmar datos (ya revisados/corregidos) */
  const confirmar = () => {
    if (resultado) { onScan(resultado); cerrar(); }
  };

  /* Actualizar un campo del resultado durante la revisión */
  const actualizarCampo = (campo: keyof DatosEscaneados, valor: string) => {
    setResultado(r => r ? { ...r, [campo]: valor } : r);
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

  const campoInput = (label: string, campo: keyof DatosEscaneados) => (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
      <label className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1 block">{label}</label>
      <input
        value={(resultado?.[campo] as string) ?? ''}
        onChange={e => actualizarCampo(campo, e.target.value)}
        className="w-full text-xs font-semibold text-gray-800 dark:text-gray-100 font-mono bg-transparent focus:outline-none border-b border-transparent focus:border-[#1a5276] dark:focus:border-blue-500"
      />
    </div>
  );

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
                  {step === 'processing' && 'Leyendo texto con OCR…'}
                  {step === 'review'     && 'Verifique y corrija los datos si es necesario'}
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
                    <video ref={videoRef} onLoadedMetadata={() => setCamaraLista(true)} className="w-full h-full object-cover" playsInline muted />
                    <canvas ref={canvasRef} className="hidden" />
                    {!camaraLista && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                      </div>
                    )}
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
                    Coloque el documento dentro del marco, bien iluminado y enfocado · Cédula o Pasaporte
                  </p>
                  <button type="button" onClick={capturar} disabled={!camaraLista}
                    className="w-full bg-[#1a5276] text-white py-4 rounded-2xl font-bold text-base hover:bg-[#143d5a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-3 min-h-[56px]">
                    <Camera className="w-6 h-6" /> {camaraLista ? 'Capturar' : 'Iniciando cámara…'}
                  </button>
                </div>
              )}

              {/* ── Procesando OCR real ── */}
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
                    <p className="text-xs text-gray-400 dark:text-gray-500">Extrayendo RUT, fecha y nombre desde la imagen</p>
                  </div>
                  <div>
                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#1a5276] to-blue-400 rounded-full transition-all duration-100" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-right text-[10px] text-gray-400 mt-1">{progress}%</p>
                  </div>
                </div>
              )}

              {/* ── Revisión de datos extraídos (editables) ── */}
              {step === 'review' && resultado && (
                <div className="space-y-4">
                  {ocrError ? (
                    <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                      <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">{ocrError}</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                      <p className="text-sm text-green-700 dark:text-green-400 font-medium">Imagen procesada. Revise y corrija los campos antes de confirmar.</p>
                    </div>
                  )}

                  {preview && (
                    <div className="rounded-xl overflow-hidden h-28">
                      <img src={preview} alt="Documento capturado" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    {campoInput('Primer nombre', 'primerNombre')}
                    {campoInput('Segundo nombre', 'segundoNombre')}
                    {campoInput('Apellido paterno', 'apellidoPaterno')}
                    {campoInput('Apellido materno', 'apellidoMaterno')}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                      <label className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1 block">Tipo documento</label>
                      <select
                        value={resultado.tipoDoc}
                        onChange={e => actualizarCampo('tipoDoc', e.target.value)}
                        className="w-full text-xs font-semibold text-gray-800 dark:text-gray-100 bg-transparent focus:outline-none"
                      >
                        <option value="rut">RUT</option>
                        <option value="pasaporte">Pasaporte</option>
                      </select>
                    </div>
                    {campoInput('N° Documento', 'documento')}
                    {campoInput('F. Nacimiento (AAAA-MM-DD)', 'fechaNacimiento')}
                    {campoInput('Nacionalidad', 'nacionalidad')}
                  </div>

                  <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center">
                    El OCR puede no leer todo con exactitud — corrija cualquier campo tocándolo antes de confirmar.
                  </p>

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