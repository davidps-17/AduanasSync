import { useState } from 'react';
import { Building2, ShieldAlert, CheckCircle2, Sun, Moon } from 'lucide-react';
import { LoginForm } from './components/LoginForm';
import { Dashboard } from './components/Dashboard';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

function ThemeToggle() {
  const { isDark, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
      className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-colors backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/40"
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}

function AppInner() {
  const [session, setSession] = useState<{ rut: string } | null>(null);

  if (session) {
    return <Dashboard rut={session.rut} onLogout={() => setSession(null)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2d45] via-[#1a5276] to-[#0f2d45] dark:from-[#050d15] dark:via-[#0d2438] dark:to-[#050d15] flex items-center justify-center p-4 sm:p-6 relative">
      <ThemeToggle />
      <div className="w-full max-w-md">

        {/* ── Advertencia — PROMINENTE Y VISIBLE ARRIBA ── */}
        <div className="mb-4 bg-amber-400 border-2 border-amber-300 rounded-2xl p-4 flex gap-3 shadow-xl">
          <ShieldAlert className="w-6 h-6 text-amber-900 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-900 font-bold text-sm">⚠ Acceso Restringido</p>
            <p className="text-amber-800 text-xs mt-0.5 leading-relaxed">
              Sistema exclusivo para operadores y funcionarios autorizados del Servicio Nacional de Aduanas de Chile.
              El acceso no autorizado está sancionado por la ley.
            </p>
          </div>
        </div>

        {/* ── Tarjeta principal ── */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-white/10">

          {/* Header azul */}
          <div className="bg-[#1a5276] px-6 pt-8 pb-12 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4 shadow-lg backdrop-blur-sm">
                <Building2 className="w-11 h-11 text-white" strokeWidth={1.5} />
              </div>
              <h1 className="text-3xl font-bold text-white tracking-wide">AduanaSync</h1>
              <p className="text-blue-200 text-sm mt-1">Sistema de Gestión Aduanera</p>
              <p className="text-blue-300 text-xs mt-0.5">Servicio Nacional de Aduanas de Chile</p>
            </div>
          </div>

          {/* Formulario — solapado sobre el header */}
          <div className="px-6 pb-6 -mt-5">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-5 mb-4">
              <h2 className="text-gray-800 dark:text-gray-100 font-semibold text-sm mb-4">Iniciar sesión</h2>
              <LoginForm onLogin={(rut) => setSession({ rut })} />
            </div>

            {/* Features — solo desktop */}
            <div className="hidden sm:grid grid-cols-3 gap-2 mb-4">
              {[
                'Trámites 100% en línea',
                'Conexión SSL cifrada',
                'Disponible 24/7',
              ].map(f => (
                <div key={f} className="flex items-center gap-1.5 text-[10px] text-blue-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                  {f}
                </div>
              ))}
            </div>

            <p className="text-center text-[10px] text-blue-300/70">
              © 2026 Servicio Nacional de Aduanas de Chile — AduanaSync v2.1
            </p>
          </div>
        </div>

        {/* Links */}
        <div className="mt-4 flex justify-center gap-4 text-[10px] text-blue-200/60">
          <a href="#" className="hover:text-white transition-colors">aduana.cl</a>
          <span>·</span>
          <a href="#" className="hover:text-white transition-colors">Términos de uso</a>
          <span>·</span>
          <a href="#" className="hover:text-white transition-colors">Contacto</a>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}
