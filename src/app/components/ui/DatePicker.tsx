/**
 * DatePicker — Selección de fecha SOLO mediante calendario.
 * No se permite escritura manual. Completamente accesible en móvil, tablet y tótem.
 */
import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, X } from 'lucide-react';

const DIAS_SEMANA = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];
const MESES_ES   = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
];

interface DatePickerProps {
  value: string;          // YYYY-MM-DD  (vacío = sin valor)
  onChange: (v: string) => void;
  min?: string;           // YYYY-MM-DD  límite inferior
  max?: string;           // YYYY-MM-DD  límite superior
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
}

/* Convierte "YYYY-MM-DD" en Date local (mediodía para evitar saltos de zona horaria) */
function parseISO(s: string): Date | null {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(s + 'T12:00:00');
  return isNaN(d.getTime()) ? null : d;
}

function toISO(d: Date): string {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear()
      && a.getMonth()    === b.getMonth()
      && a.getDate()     === b.getDate();
}

export function DatePicker({ value, onChange, min, max, placeholder = 'Seleccione fecha', error, disabled }: DatePickerProps) {
  const selected = parseISO(value);
  const initial  = selected ?? new Date();

  const [open,      setOpen]      = useState(false);
  const [viewYear,  setViewYear]  = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());
  const [yearMode,  setYearMode]  = useState(false);
  const ref    = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  /* Sincronizar vista con value externo */
  useEffect(() => {
    if (selected) { setViewYear(selected.getFullYear()); setViewMonth(selected.getMonth()); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  /* Cerrar al clic externo */
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false); setYearMode(false);
      }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  /* Scroll al año seleccionado en el selector de años */
  useEffect(() => {
    if (yearMode && listRef.current) {
      const sel = listRef.current.querySelector('[data-selected="true"]');
      sel?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [yearMode]);

  const minD = parseISO(min ?? '');
  const maxD = parseISO(max ?? '');

  const isDisabled = (d: Date): boolean => {
    const t = d.getTime();
    if (minD) { const m = new Date(minD); m.setHours(0,0,0,0); if (t < m.getTime()) return true; }
    if (maxD) { const m = new Date(maxD); m.setHours(23,59,59,999); if (t > m.getTime()) return true; }
    return false;
  };

  /* Construye la grilla del mes (Lun = columna 0) */
  const buildGrid = (): (Date | null)[] => {
    const first = new Date(viewYear, viewMonth, 1);
    const last  = new Date(viewYear, viewMonth + 1, 0);
    const startDow = (first.getDay() + 6) % 7; // Sun=0 → Lun=0
    const cells: (Date | null)[] = Array(startDow).fill(null);
    for (let d = 1; d <= last.getDate(); d++) cells.push(new Date(viewYear, viewMonth, d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  };

  const prevMonth = () => viewMonth === 0  ? (setViewMonth(11), setViewYear(y => y - 1)) : setViewMonth(m => m - 1);
  const nextMonth = () => viewMonth === 11 ? (setViewMonth(0),  setViewYear(y => y + 1)) : setViewMonth(m => m + 1);

  const selectDay = (d: Date) => { onChange(toISO(d)); setOpen(false); setYearMode(false); };
  const clearDate = (e: React.MouseEvent) => { e.stopPropagation(); onChange(''); };

  const today = new Date(); today.setHours(0, 0, 0, 0);

  const displayLabel = selected
    ? selected.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  /* Años disponibles (desde 1900 hasta maxDate o +10 años) */
  const maxYear = maxD ? maxD.getFullYear() : new Date().getFullYear() + 5;
  const minYear = minD ? minD.getFullYear() : 1900;
  const years   = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);

  return (
    <div className="relative" ref={ref}>
      {/* ───────── Botón trigger ───────── */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && (setOpen(o => !o), setYearMode(false))}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={[
          'w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl border-2 text-left',
          'transition-all focus:outline-none focus:ring-2 select-none min-h-[48px]',
          disabled
            ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-600'
            : error
            ? 'border-red-400 bg-red-50 focus:ring-red-300 dark:border-red-600 dark:bg-red-900/20'
            : open
            ? 'border-[#1a5276] ring-2 ring-[#1a5276]/30 bg-white dark:bg-gray-800 dark:border-[#4a8ab8]'
            : 'border-gray-300 bg-white hover:border-[#1a5276] dark:border-gray-600 dark:bg-gray-800 dark:hover:border-[#4a8ab8]',
        ].join(' ')}
      >
        {/* Icono calendario — alta visibilidad */}
        <div className={[
          'flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center',
          error
            ? 'bg-red-100 dark:bg-red-900/40'
            : value
            ? 'bg-[#1a5276] dark:bg-[#2a6090]'
            : 'bg-gray-100 dark:bg-gray-700',
        ].join(' ')}>
          <CalendarDays className={`w-5 h-5 ${value && !error ? 'text-white' : error ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-300'}`} />
        </div>

        <span className={`flex-1 ${displayLabel ? 'text-gray-800 dark:text-gray-100 font-medium' : 'text-gray-400 dark:text-gray-500'}`}>
          {displayLabel || placeholder}
        </span>

        {/* Botón limpiar */}
        {value && !disabled && (
          <button
            type="button"
            onMouseDown={clearDate}
            aria-label="Limpiar fecha"
            className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 hover:bg-red-100 dark:bg-gray-700 dark:hover:bg-red-900/40 flex items-center justify-center transition-colors"
          >
            <X className="w-3.5 h-3.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400" />
          </button>
        )}
      </button>

      {/* ───────── Panel calendario ───────── */}
      {open && (
        <div
          role="dialog"
          aria-label="Selector de fecha"
          className="absolute top-full left-0 z-[200] mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden w-[340px] max-w-[95vw]"
        >
          {/* Cabecera */}
          <div className="bg-[#1a5276] dark:bg-[#0f2d45] px-4 py-3 flex items-center justify-between">
            {yearMode ? (
              <>
                <span className="text-white font-semibold text-sm">Seleccionar año</span>
                <button type="button" onClick={() => setYearMode(false)}
                  className="text-blue-200 hover:text-white text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors">
                  ← Volver
                </button>
              </>
            ) : (
              <>
                <button type="button" onClick={prevMonth} aria-label="Mes anterior"
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors">
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>

                <button type="button" onClick={() => setYearMode(true)}
                  className="flex flex-col items-center hover:bg-white/10 rounded-xl px-4 py-1.5 transition-colors">
                  <span className="text-white font-bold text-base leading-none">{MESES_ES[viewMonth]}</span>
                  <span className="text-blue-200 text-sm mt-0.5">{viewYear}</span>
                </button>

                <button type="button" onClick={nextMonth} aria-label="Mes siguiente"
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors">
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              </>
            )}
          </div>

          {/* Selector de año */}
          {yearMode ? (
            <div ref={listRef} className="max-h-72 overflow-y-auto p-3 grid grid-cols-4 gap-1.5">
              {years.map(y => (
                <button key={y} type="button" data-selected={y === viewYear}
                  onClick={() => { setViewYear(y); setYearMode(false); }}
                  className={[
                    'py-2.5 text-sm font-medium rounded-xl transition-colors',
                    y === viewYear
                      ? 'bg-[#1a5276] text-white dark:bg-[#2a6090]'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-[#1a5276]/10 dark:hover:bg-white/10',
                  ].join(' ')}>
                  {y}
                </button>
              ))}
            </div>
          ) : (
            <>
              {/* Cabeceras días semana */}
              <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-3 py-2">
                {DIAS_SEMANA.map(d => (
                  <div key={d} className="text-center text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{d}</div>
                ))}
              </div>

              {/* Grilla de días */}
              <div className="grid grid-cols-7 gap-1 p-3">
                {buildGrid().map((day, i) => {
                  if (!day) return <div key={i} aria-hidden />;
                  const dis = isDisabled(day);
                  const sel = selected ? sameDay(day, selected) : false;
                  const tod = sameDay(day, today);
                  return (
                    <button key={i} type="button" disabled={dis} onClick={() => selectDay(day)}
                      aria-label={day.toLocaleDateString('es-CL')}
                      aria-pressed={sel}
                      className={[
                        'aspect-square rounded-xl text-sm font-medium transition-all flex items-center justify-center',
                        'min-h-[40px]', // accesible en táctil
                        sel
                          ? 'bg-[#1a5276] dark:bg-[#2a6090] text-white shadow-md scale-110 z-10 relative'
                          : tod
                          ? 'ring-2 ring-[#1a5276] dark:ring-[#4a8ab8] text-[#1a5276] dark:text-[#4a8ab8] font-bold'
                          : dis
                          ? 'text-gray-200 dark:text-gray-700 cursor-not-allowed'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-[#1a5276]/10 dark:hover:bg-white/10 hover:text-[#1a5276] dark:hover:text-white cursor-pointer',
                      ].join(' ')}>
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>

              {/* Pie: acciones rápidas */}
              <div className="flex items-center justify-between px-4 pb-3 pt-1 border-t border-gray-100 dark:border-gray-700">
                <button type="button" disabled={isDisabled(today)}
                  onClick={() => { if (!isDisabled(today)) selectDay(today); }}
                  className="text-xs font-semibold text-[#1a5276] dark:text-[#4a8ab8] hover:underline disabled:opacity-40 disabled:no-underline">
                  Hoy
                </button>
                {value && (
                  <button type="button" onClick={() => onChange('')}
                    className="text-xs text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                    Limpiar
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
