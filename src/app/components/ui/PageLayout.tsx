import { ArrowLeft, Building2, CheckCircle2 } from 'lucide-react';

interface PageLayoutProps {
  titulo: string;
  subtitulo?: string;
  rut?: string;
  onVolver: () => void;
  children: React.ReactNode;
  accion?: React.ReactNode;
}

export function PageLayout({ titulo, subtitulo, rut, onVolver, children, accion }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <header className="bg-[#1a5276] text-white">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={onVolver} className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <p className="text-blue-200 text-[10px] uppercase tracking-wider leading-none">AduanaSync</p>
            <h1 className="font-bold text-sm leading-tight mt-0.5">{titulo}</h1>
            {subtitulo && <p className="text-blue-300 text-[10px] mt-0.5">{subtitulo}</p>}
          </div>
          {rut && (
            <div className="text-right hidden sm:block">
              <p className="text-blue-200 text-[10px]">RUT</p>
              <p className="text-xs font-mono">{rut}</p>
            </div>
          )}
          {accion}
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}

interface PasoInfo { id: number; label: string; icon: React.ReactNode }

export function IndicadorPasos({ pasos, actual }: { pasos: PasoInfo[]; actual: number }) {
  const pct = ((actual - 1) / (pasos.length - 1)) * 100;
  return (
    <div className="mb-8">
      <div className="h-1 bg-gray-200 rounded-full mb-5 overflow-hidden">
        <div className="h-full bg-[#1a5276] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between">
        {pasos.map((p) => (
          <div key={p.id} className={`flex flex-col items-center gap-1 ${p.id <= actual ? 'opacity-100' : 'opacity-30'}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors ${
              p.id < actual ? 'bg-green-500 text-white' : p.id === actual ? 'bg-[#1a5276] text-white' : 'bg-gray-200 text-gray-400'
            }`}>
              {p.id < actual ? <CheckCircle2 className="w-4 h-4" /> : p.icon}
            </div>
            <span className={`text-[10px] hidden sm:block text-center leading-tight max-w-[70px] ${p.id === actual ? 'text-[#1a5276] font-semibold' : 'text-gray-400'}`}>
              {p.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
