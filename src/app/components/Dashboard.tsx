import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Building2, LogOut, Bell, Search, ChevronRight,
  Package, PackageCheck, FileText, CreditCard, ClipboardList,
  User, Globe, HelpCircle, Clock, CheckCircle2, AlertTriangle,
  Plane, Ship, Truck, ArrowRightLeft, Sun, Moon,
  Monitor, Maximize2, Timer,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { listarTramites, formatearFechaCorta, EVENTO_ACTUALIZACION, type TramiteGuardado } from '../utils/tramitesStore';
import { TramiteTurista }          from './TramiteTurista';
import { TramiteImportaciones }    from './TramiteImportaciones';
import { TramiteExportaciones }    from './TramiteExportaciones';
import { TramiteDeclaraciones }    from './TramiteDeclaraciones';
import { TramiteOperadorComercio } from './TramiteOperadorComercio';
import { PagoAranceles }           from './PagoAranceles';
import { Permisos }                from './Permisos';
import { ManifiestoAereo }         from './ManifiestoAereo';
import { ManifiestoMaritimo }      from './ManifiestoMaritimo';
import { ManifiestoTerrestre }     from './ManifiestoTerrestre';
import { TrancitoAduanero }        from './TrancitoAduanero';
import { Subastas }                from './Subastas';
import { AduanaInforma }           from './AduanaInforma';
import { ActividadDetalle }        from './ActividadDetalle';
import { Normativas }              from './Normativas';
import { AcuerdosTratados }        from './AcuerdosTratados';
import { ImportadorExportador }    from './ImportadorExportador';
import { EstadisticasCOMEX }       from './EstadisticasCOMEX';
import { SearchResults }           from './SearchResults';
import { VerTodos }                from './VerTodos';
import { TodaActividad }           from './TodaActividad';
import { CentroAyuda }             from './CentroAyuda';

type Vista =
  | 'dashboard'
  | 'busqueda'
  | 'ver-todos'
  | 'mis-tramites'
  | 'centro-ayuda'
  | 'turista'
  | 'importaciones'
  | 'exportaciones'
  | 'declaraciones'
  | 'operador-comercio'
  | 'pago-aranceles'
  | 'permisos'
  | 'manifiesto-aereo'
  | 'manifiesto-maritimo'
  | 'manifiesto-terrestre'
  | 'transito'
  | 'subastas'
  | 'normativas'
  | 'acuerdos'
  | 'importador-exportador'
  | 'estadisticas-comex'
  | 'aduana-informa'
  | 'actividad-detalle';

type EstadoKey = 'en_proceso' | 'completado' | 'alerta' | 'pendiente';
const estadoConfig: Record<EstadoKey, { label: string; dot: string; textColor: string }> = {
  en_proceso: { label: 'En proceso',        dot: 'bg-blue-500',   textColor: 'text-blue-500' },
  completado:  { label: 'Completado',        dot: 'bg-green-500',  textColor: 'text-green-500' },
  alerta:      { label: 'Requiere atención', dot: 'bg-red-400',    textColor: 'text-red-400' },
  pendiente:   { label: 'Pendiente de pago', dot: 'bg-amber-400',  textColor: 'text-amber-400' },
};

const actividad = [
  { num: 'IMP-2026-00431', tipo: 'Importación',          estado: 'en_proceso' as EstadoKey, fecha: 'Hoy' },
  { num: 'EXP-2026-00187', tipo: 'Exportación',          estado: 'completado' as EstadoKey, fecha: '06/06' },
  { num: 'DEC-2026-00892', tipo: 'Declaración aduanera', estado: 'alerta'     as EstadoKey, fecha: '08/06' },
  { num: 'PAG-2026-00054', tipo: 'Pago aranceles',       estado: 'pendiente'  as EstadoKey, fecha: '09/06' },
  { num: 'PER-2026-00312', tipo: 'Permiso sanitario',    estado: 'en_proceso' as EstadoKey, fecha: '05/06' },
  { num: 'MAE-2026-00178', tipo: 'Manifiesto aéreo',     estado: 'completado' as EstadoKey, fecha: '04/06' },
  { num: 'MAR-2026-00095', tipo: 'Manifiesto marítimo',  estado: 'en_proceso' as EstadoKey, fecha: '03/06' },
  { num: 'TRA-2026-00061', tipo: 'Tránsito aduanero',    estado: 'alerta'     as EstadoKey, fecha: '02/06' },
  { num: 'OPC-2026-00047', tipo: 'Operador de comercio', estado: 'completado' as EstadoKey, fecha: '01/06' },
  { num: 'TUR-2026-00583', tipo: 'Declaración de Turista', estado: 'completado' as EstadoKey, fecha: '30/05' },
  { num: 'PAG-2026-00039', tipo: 'Pago aranceles',       estado: 'pendiente'  as EstadoKey, fecha: '29/05' },
  { num: 'IMP-2026-00398', tipo: 'Importación',          estado: 'completado' as EstadoKey, fecha: '27/05' },
];

const navLinks = ['Normativas', 'Acuerdos y Tratados', 'Importador Exportador', 'Estadísticas COMEX', 'Trámites en Línea', 'Aduana Informa', 'Subastas', 'Centro de Ayuda'];

interface DashboardProps { rut: string; onLogout: () => void }

export function Dashboard({ rut, onLogout }: DashboardProps) {
  const [vista, setVista]       = useState<Vista>('dashboard');
  const [navActivo, setNavActivo] = useState('Trámites en Línea');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputVal, setInputVal] = useState('');
  const [actividadNumero, setActividadNumero] = useState('');
  const { isDark, toggle: toggleTheme } = useTheme();

  /* ── Trámites reales enviados por el usuario (guardados en localStorage) ── */
  const [tramitesReales, setTramitesReales] = useState<TramiteGuardado[]>(() => listarTramites(rut));

  useEffect(() => {
    const sync = () => setTramitesReales(listarTramites(rut));
    sync();
    window.addEventListener(EVENTO_ACTUALIZACION, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENTO_ACTUALIZACION, sync);
      window.removeEventListener('storage', sync);
    };
  }, [rut]);

  /* ── Modo Tótem / Kiosk ── */
  const [kiosk, setKiosk]             = useState(false);
  const [inactividad, setInactividad] = useState(300); // 5 minutos
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetInactividad = useCallback(() => setInactividad(300), []);

  useEffect(() => {
    if (!kiosk) { if (timerRef.current) clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => {
      setInactividad(t => {
        if (t <= 1) { onLogout(); return 300; }
        return t - 1;
      });
    }, 1000);
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(e => document.addEventListener(e, resetInactividad));
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      events.forEach(e => document.removeEventListener(e, resetInactividad));
    };
  }, [kiosk, onLogout, resetInactividad]);

  const toggleKiosk = () => {
    if (!kiosk && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else if (kiosk && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
    setKiosk(k => !k);
    resetInactividad();
  };

  const formatTimer = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const ir = (v: Vista) => { resetInactividad(); setVista(v); };
  const volver = () => { resetInactividad(); setVista('dashboard'); };

  /* ── Actividad Reciente: trámites reales primero, luego los de demostración ── */
  const actividadCombinada = [
    ...tramitesReales.map(t => ({
      num: t.numero, tipo: t.tipo, estado: t.estado,
      fecha: formatearFechaCorta(t.fechaIngreso),
    })),
    ...actividad,
  ];

  /* Conteo por estado para los badges de arriba (se actualiza solo con cada trámite nuevo) */
  const conteo = actividadCombinada.reduce((acc, a) => {
    acc[a.estado] = (acc[a.estado] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    setVista('busqueda');
  };

  const handleNavLink = (link: string) => {
    setNavActivo(link);
    if      (link === 'Centro de Ayuda')         ir('centro-ayuda');
    else if (link === 'Trámites en Línea')       ir('ver-todos');
    else if (link === 'Subastas')                ir('subastas');
    else if (link === 'Normativas')              ir('normativas');
    else if (link === 'Acuerdos y Tratados')     ir('acuerdos');
    else if (link === 'Importador Exportador')   ir('importador-exportador');
    else if (link === 'Estadísticas COMEX')      ir('estadisticas-comex');
    else if (link === 'Aduana Informa')          ir('aduana-informa');
  };

  /* ── Vistas externas ── */
  if (vista === 'turista')             return <TramiteTurista          rut={rut} onVolver={volver} />;
  if (vista === 'importaciones')       return <TramiteImportaciones    rut={rut} onVolver={volver} />;
  if (vista === 'exportaciones')       return <TramiteExportaciones    rut={rut} onVolver={volver} />;
  if (vista === 'declaraciones')       return <TramiteDeclaraciones    rut={rut} onVolver={volver} />;
  if (vista === 'operador-comercio')   return <TramiteOperadorComercio rut={rut} onVolver={volver} />;
  if (vista === 'pago-aranceles')      return <PagoAranceles           rut={rut} onVolver={volver} />;
  if (vista === 'permisos')            return <Permisos                rut={rut} onVolver={volver} />;
  if (vista === 'manifiesto-aereo')    return <ManifiestoAereo         rut={rut} onVolver={volver} />;
  if (vista === 'manifiesto-maritimo') return <ManifiestoMaritimo      rut={rut} onVolver={volver} />;
  if (vista === 'manifiesto-terrestre')return <ManifiestoTerrestre     rut={rut} onVolver={volver} />;
  if (vista === 'transito')            return <TrancitoAduanero        rut={rut} onVolver={volver} />;
  if (vista === 'subastas')              return <Subastas              rut={rut} onVolver={volver} />;
  if (vista === 'normativas')            return <Normativas            rut={rut} onVolver={volver} />;
  if (vista === 'acuerdos')             return <AcuerdosTratados      rut={rut} onVolver={volver} />;
  if (vista === 'importador-exportador') return <ImportadorExportador  rut={rut} onVolver={volver} />;
  if (vista === 'estadisticas-comex')   return <EstadisticasCOMEX     rut={rut} onVolver={volver} />;
  if (vista === 'aduana-informa')       return <AduanaInforma          rut={rut} onVolver={volver} />;
  if (vista === 'actividad-detalle')    return <ActividadDetalle numero={actividadNumero} rut={rut} onVolver={volver} />;
  if (vista === 'busqueda')            return <SearchResults query={searchQuery} rut={rut} onVolver={volver} />;
  if (vista === 'ver-todos')           return <VerTodos                rut={rut} onVolver={volver} onSeleccionar={(v) => ir(v as Vista)} />;
  if (vista === 'mis-tramites')        return <TodaActividad           rut={rut} actividad={actividadCombinada} onVerDetalle={(n) => { setActividadNumero(n); ir('actividad-detalle'); }} onVolver={volver} />;
  if (vista === 'centro-ayuda')        return <CentroAyuda             rut={rut} onVolver={volver} />;

  /* ── Dashboard ── */
  return (
    <div className={`min-h-screen bg-[#f5f6f8] dark:bg-gray-950 transition-colors ${kiosk ? 'kiosk-mode' : ''}`}>

      {/* ── Banner inactividad (modo tótem) ── */}
      {kiosk && inactividad <= 60 && (
        <div className="fixed top-0 inset-x-0 z-50 bg-red-600 text-white text-center py-3 flex items-center justify-center gap-3 shadow-lg">
          <Timer className="w-5 h-5 animate-pulse" />
          <span className="font-bold">Sesión se cerrará en {formatTimer(inactividad)} por inactividad</span>
          <button onClick={resetInactividad} className="bg-white text-red-600 font-bold px-4 py-1 rounded-lg text-sm hover:bg-red-50 transition-colors">
            Continuar
          </button>
        </div>
      )}

      {/* Navbar */}
      <header className="bg-[#1a5276] dark:bg-[#0f2030] sticky top-0 z-20 transition-colors">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-6 h-14">
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-none">AduanaSync</p>
                <p className="text-blue-300 text-[10px] leading-none mt-0.5">Servicio Nacional de Aduanas</p>
              </div>
            </div>

            {/* Buscador */}
            <form className="flex-1 max-w-md" onSubmit={e => { e.preventDefault(); handleSearch(inputVal); }}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-300" />
                <input
                  value={inputVal}
                  onChange={e => setInputVal(e.target.value)}
                  placeholder="Busca aquí la información que necesitas…"
                  className="w-full bg-white/10 text-white placeholder-blue-300 text-xs rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:bg-white/20 transition-colors"
                />
              </div>
            </form>

            <div className="ml-auto flex items-center gap-2">
              {/* Modo Tótem */}
              <button onClick={toggleKiosk} title={kiosk ? 'Salir del modo tótem' : 'Activar modo tótem'}
                className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs ${kiosk ? 'bg-green-500/20 text-green-300' : 'hover:bg-white/15 text-white'}`}>
                <Monitor className="w-4 h-4" />
                {kiosk && <span className="hidden sm:inline text-[10px]">{formatTimer(inactividad)}</span>}
              </button>

              {/* Toggle de tema claro / oscuro */}
              <button
                onClick={toggleTheme}
                aria-label={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
                title={isDark ? 'Tema claro' : 'Tema oscuro'}
                className="relative p-2 hover:bg-white/15 rounded-lg transition-colors flex items-center gap-1.5 text-xs text-white"
              >
                {isDark
                  ? <><Sun  className="w-4 h-4 text-yellow-300" /><span className="hidden sm:inline text-yellow-300">Claro</span></>
                  : <><Moon className="w-4 h-4 text-blue-200"   /><span className="hidden sm:inline text-blue-200">Oscuro</span></>
                }
              </button>

              <button className="relative p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                <Bell className="w-4 h-4 text-white" />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-400 rounded-full" />
              </button>
              <div className="hidden sm:block text-right">
                <p className="text-white text-xs font-medium">RUT {rut}</p>
                <p className="text-blue-300 text-[10px]">Sesión activa</p>
              </div>
              <button onClick={onLogout} className="flex items-center gap-1.5 text-xs text-white bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-lg transition-colors">
                <LogOut className="w-3.5 h-3.5" /> Salir
              </button>
            </div>
          </div>
        </div>

        {/* Nav secundario */}
        <div className="bg-[#143d5a]">
          <div className="max-w-7xl mx-auto px-6 flex overflow-x-auto">
            {navLinks.map(link => (
              <button key={link} onClick={() => handleNavLink(link)}
                className={`px-4 py-2.5 text-[11px] font-medium whitespace-nowrap border-b-2 transition-colors ${navActivo === link ? 'border-white text-white' : 'border-transparent text-blue-300 hover:text-white'}`}>
                {link}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* Bienvenida */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-gray-800 dark:text-gray-100 font-bold">Portal Aduanero</h1>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 capitalize">
              {new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { icon: <Clock className="w-3.5 h-3.5" />,        label: `${conteo.en_proceso || 0} en proceso`,   color: 'text-blue-600 bg-blue-50 border-blue-100' },
              { icon: <CheckCircle2 className="w-3.5 h-3.5" />, label: `${conteo.completado || 0} completados`,  color: 'text-green-600 bg-green-50 border-green-100' },
              { icon: <AlertTriangle className="w-3.5 h-3.5" />,label: `${conteo.alerta || 0} alerta${(conteo.alerta || 0) === 1 ? '' : 's'}`, color: 'text-red-600 bg-red-50 border-red-100' },
            ].map(({ icon, label, color }) => (
              <div key={label} className={`flex items-center gap-1.5 text-xs border rounded-lg px-3 py-1.5 ${color}`}>
                {icon} {label}
              </div>
            ))}
          </div>
        </div>

        {/* Grid principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Columna izquierda */}
          <div className="lg:col-span-2 space-y-6">

            {/* Perfil usuario */}
            <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">¿Qué tipo de usuario eres?</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Viajero / Turista',          icon: <User className="w-5 h-5" />,    color: '#c0392b', vista: 'turista' as Vista },
                  { label: 'Operador Comercio Exterior',  icon: <Globe className="w-5 h-5" />,   color: '#1a5276', vista: 'operador-comercio' as Vista },
                  { label: 'Centro de Ayuda',             icon: <HelpCircle className="w-5 h-5" />, color: '#6b7280', vista: 'centro-ayuda' as Vista },
                ].map(p => (
                  <button key={p.label} onClick={() => ir(p.vista)}
                    className="flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-center group">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: p.color }}>{p.icon}</div>
                    <span className="text-xs text-gray-600 dark:text-gray-300 group-hover:text-[#1a5276] dark:group-hover:text-blue-400 font-medium leading-tight transition-colors">{p.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Servicios */}
            <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Trámites en Línea</p>
                <button onClick={() => ir('ver-todos')} className="text-xs text-[#1a5276] dark:text-blue-400 hover:underline flex items-center gap-0.5">
                  Ver todos <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { icon: <Package className="w-5 h-5" />,        label: 'Importaciones',       sub: 'DIN, aforos, retiro',      color: '#1a5276', vista: 'importaciones' },
                  { icon: <PackageCheck className="w-5 h-5" />,   label: 'Exportaciones',       sub: 'DUS, embarque',            color: '#1e8449', vista: 'exportaciones' },
                  { icon: <FileText className="w-5 h-5" />,       label: 'Declaraciones',       sub: 'Ingreso, tránsito, salida',color: '#6c3483', vista: 'declaraciones' },
                  { icon: <CreditCard className="w-5 h-5" />,     label: 'Pago de Aranceles',   sub: 'Ad valorem, IVA',          color: '#b7950b', vista: 'pago-aranceles' },
                  { icon: <ClipboardList className="w-5 h-5" />,  label: 'Permisos',            sub: 'Origen, depósito',         color: '#c0392b', vista: 'permisos' },
                  { icon: <Plane className="w-5 h-5" />,          label: 'Manif. Aéreo',        sub: 'Carga aérea',              color: '#0e6db5', vista: 'manifiesto-aereo' },
                  { icon: <Ship className="w-5 h-5" />,           label: 'Manif. Marítimo',     sub: 'Carga marítima',           color: '#0e7a6e', vista: 'manifiesto-maritimo' },
                  { icon: <Truck className="w-5 h-5" />,          label: 'Manif. Terrestre',    sub: 'Carga terrestre',          color: '#7a5c0e', vista: 'manifiesto-terrestre' },
                  { icon: <ArrowRightLeft className="w-5 h-5" />, label: 'Tránsito',            sub: 'DTI, zonas francas',       color: '#5a0e7a', vista: 'transito' },
                ] as { icon: React.ReactNode; label: string; sub: string; color: string; vista: string | null }[]).map(s => (
                  <button key={s.label}
                    onClick={() => s.vista && ir(s.vista as Vista)}
                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-left group">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: s.color + '20', color: s.color }}>
                      {s.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-200 group-hover:text-[#1a5276] dark:group-hover:text-blue-400 truncate transition-colors">{s.label}</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">{s.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Columna derecha */}
          <div className="space-y-4">

            {/* Actividad */}
            <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Actividad Reciente</p>
              <div className="space-y-2">
                {actividadCombinada.slice(0, 10).map(a => {
                  const cfg = estadoConfig[a.estado];
                  return (
                    <button key={a.num}
                      onClick={() => { setActividadNumero(a.num); ir('actividad-detalle'); }}
                      className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors text-left group">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-mono text-gray-700 group-hover:text-[#1a5276] transition-colors">{a.num}</p>
                        <p className="text-[10px] text-gray-400">{a.tipo}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[10px] text-gray-400">{a.fecha}</p>
                        <p className={`text-[10px] font-medium ${cfg.textColor}`}>{cfg.label}</p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#1a5276] flex-shrink-0 transition-colors" />
                    </button>
                  );
                })}
              </div>
              <button onClick={() => ir('mis-tramites')} className="mt-3 w-full text-xs text-[#1a5276] hover:underline flex items-center justify-center gap-1">
                Ver todos los trámites <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </section>

            {/* Acceso rápido */}
            <section className="bg-[#1a5276] rounded-2xl p-5 text-white">
              <p className="text-xs font-semibold text-blue-200 uppercase tracking-wider mb-3">Acceso Rápido</p>
              <div className="space-y-2">
                {[
                  { label: 'Nueva declaración',        vista: 'declaraciones'    as Vista },
                  { label: 'Importar mercancías',       vista: 'importaciones'    as Vista },
                  { label: 'Exportar mercancías',        vista: 'exportaciones'    as Vista },
                  { label: 'Pagar aranceles',            vista: 'pago-aranceles'   as Vista },
                  { label: 'Solicitar permiso',          vista: 'permisos'         as Vista },
                  { label: 'Registrarse como Operador',  vista: 'operador-comercio'as Vista },
                ].map(a => (
                  <button key={a.label} onClick={() => ir(a.vista)}
                    className="w-full text-left text-xs py-2 px-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-between">
                    {a.label} <ChevronRight className="w-3.5 h-3.5 text-blue-300" />
                  </button>
                ))}
              </div>
            </section>

            {/* Ayuda */}
            <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">¿Necesitas ayuda?</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">Consulta normativas, guías de usuario y preguntas frecuentes.</p>
              <button onClick={() => ir('centro-ayuda')} className="w-full text-xs font-medium text-[#1a5276] dark:text-blue-400 border border-[#1a5276] dark:border-blue-600 rounded-lg py-2 hover:bg-[#1a5276] dark:hover:bg-blue-900 hover:text-white transition-colors">
                Ir al Centro de Ayuda
              </button>
            </section>
          </div>
        </div>

        <p className="text-center text-[10px] text-gray-300">© 2026 Servicio Nacional de Aduanas de Chile — AduanaSync v2.1</p>
      </main>
    </div>
  );
}