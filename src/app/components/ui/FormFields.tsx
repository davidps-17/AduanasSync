import { AlertCircle, ArrowLeft, ChevronRight, Info, CheckCircle2, Download, Printer } from 'lucide-react';

/* ── Campos ── */
export function Campo({ label, required, error, children }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-[11px] text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
    </div>
  );
}

export function FInput({ error, className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return (
    <input {...props} className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all ${error ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-[#1a5276]/20 focus:border-[#1a5276]'} ${className}`} />
  );
}

export function FSelect({ error, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean }) {
  return (
    <select {...props} className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 bg-white transition-all ${error ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-[#1a5276]/20 focus:border-[#1a5276]'}`}>
      {children}
    </select>
  );
}

export function FTextarea({ error, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }) {
  return (
    <textarea {...props} rows={3} className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all resize-none ${error ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-[#1a5276]/20 focus:border-[#1a5276]'}`} />
  );
}

export function NavBtns({ onBack, onNext, nextLabel = 'Continuar', disabled = false }: {
  onBack?: () => void; onNext: () => void; nextLabel?: string; disabled?: boolean;
}) {
  return (
    <div className="flex justify-between pt-2">
      {onBack
        ? <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1.5 transition-colors"><ArrowLeft className="w-4 h-4" /> Volver</button>
        : <div />}
      <button onClick={onNext} disabled={disabled} className="bg-[#1a5276] text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-[#143d5a] disabled:opacity-40 transition-colors flex items-center gap-2">
        {nextLabel} <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

export function InfoBox({ children, color = 'blue' }: { children: React.ReactNode; color?: 'blue' | 'amber' | 'green' }) {
  const map = { blue: 'bg-blue-50 border-blue-100 text-blue-700', amber: 'bg-amber-50 border-amber-100 text-amber-800', green: 'bg-green-50 border-green-100 text-green-700' };
  return (
    <div className={`border rounded-xl p-4 flex gap-3 ${map[color]}`}>
      <Info className="w-4 h-4 flex-shrink-0 mt-0.5 opacity-70" />
      <div className="text-xs leading-relaxed">{children}</div>
    </div>
  );
}

export function TarjetaRevision({ titulo, icon, filas }: { titulo: string; icon: React.ReactNode; filas: [string, string][] }) {
  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">{icon} {titulo}</p>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        {filas.map(([k, v]) => (
          <div key={k}><span className="text-[10px] text-gray-400 block">{k}</span><span className="text-xs text-gray-700 font-medium">{v || '—'}</span></div>
        ))}
      </div>
    </div>
  );
}

export function Confirmacion({ folio, tipo, pasos, onVolver }: { folio: string; tipo: string; pasos: string[]; onVolver: () => void }) {
  return (
    <div className="text-center py-4 space-y-6">
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="w-9 h-9 text-green-600" />
        </div>
      </div>
      <div>
        <h3 className="text-gray-800 font-bold mb-1">Trámite enviado exitosamente</h3>
        <p className="text-sm text-gray-500">{tipo} registrado en el sistema aduanero.</p>
      </div>
      <div className="bg-[#1a5276]/5 border border-[#1a5276]/20 rounded-xl p-5">
        <p className="text-xs text-gray-500 mb-1">Número de folio</p>
        <p className="font-mono text-lg font-bold text-[#1a5276]">{folio}</p>
        <p className="text-xs text-gray-400 mt-2">Guarde este número para seguimiento</p>
      </div>
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-left">
        <p className="text-xs font-semibold text-amber-800 mb-2">Próximos pasos:</p>
        {pasos.map((p, i) => <p key={i} className="text-xs text-amber-700">{i + 1}. {p}</p>)}
      </div>
      <div className="flex gap-3 justify-center">
        <button className="flex items-center gap-2 text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 px-5 py-2.5 rounded-lg transition-colors"><Download className="w-4 h-4" /> Descargar PDF</button>
        <button className="flex items-center gap-2 text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 px-5 py-2.5 rounded-lg transition-colors"><Printer className="w-4 h-4" /> Imprimir</button>
      </div>
      <button onClick={onVolver} className="text-sm text-[#1a5276] hover:underline">Volver al portal principal</button>
    </div>
  );
}
